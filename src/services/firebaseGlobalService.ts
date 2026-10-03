import { SystemAnnouncement, FellowshipMember, UserRole, MASTER_ADMIN_EMAIL } from '../types/settings';
import mqtt, { MqttClient } from 'mqtt';

// Cloud REST & MQTT Endpoints
const CLOUD_SETTINGS_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a10342596a6e98';
const CLOUD_MEMBERS_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1034264616e99';

export interface GlobalConfigPayload {
  activeAnnouncement: SystemAnnouncement | null;
  appVisibility: Record<string, boolean>;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  updatedAt?: number;
}

const DEFAULT_CONFIG: GlobalConfigPayload = {
  activeAnnouncement: null,
  appVisibility: {
    faithlingo: true,
    bible_journal: true,
    fellowship_chat: true,
    mini_cats: true,
    mini_games: true,
    youtube: true
  },
  maintenanceMode: false,
  maintenanceMessage: 'System maintenance in progress.',
  updatedAt: Date.now()
};

export const MASTER_ADMIN_MEMBER: FellowshipMember = {
  id: 'usr_master_admin_aw',
  name: 'Anthony Williams',
  handle: '@disciple',
  avatar: '👑',
  role: 'superadmin',
  status: 'active',
  email: MASTER_ADMIN_EMAIL,
  lastActive: 'Online',
  xp: 5000,
  streak: 100,
  warningsCount: 0,
  notes: 'Master Administrator'
};

export const DEFAULT_FELLOWSHIP_MEMBERS: FellowshipMember[] = [
  {
    id: 'usr_handle_laptop',
    name: 'laptop',
    handle: '@laptop',
    avatar: '🕊️',
    role: 'admin',
    status: 'active',
    lastActive: 'Just now',
    xp: 100,
    streak: 1,
    warningsCount: 0,
    notes: 'Fellowship Believer'
  },
  {
    id: 'usr_handle_phone',
    name: 'Phone',
    handle: '@phone',
    avatar: '🕊️',
    role: 'user',
    status: 'active',
    lastActive: 'Just now',
    xp: 100,
    streak: 1,
    warningsCount: 0,
    notes: 'Fellowship Believer'
  },
  MASTER_ADMIN_MEMBER
];

class FirebaseGlobalService {
  private configListeners: Array<(config: GlobalConfigPayload) => void> = [];
  private membersListeners: Array<(members: FellowshipMember[]) => void> = [];
  private cachedConfig: GlobalConfigPayload = DEFAULT_CONFIG;
  private cachedMembers: FellowshipMember[] = [];
  private localEventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private mqttClient: MqttClient | null = null;

  constructor() {
    this.cachedMembers = this.loadInitialMembers();
    this.initBroadcastChannel();
    this.initServerSSE();
    this.initMqtt();
    this.startSync();
  }

  // 1. Load from localStorage or defaults on instantiation
  private loadInitialMembers(): FellowshipMember[] {
    if (typeof window === 'undefined') return DEFAULT_FELLOWSHIP_MEMBERS;
    try {
      const saved = localStorage.getItem('lifeos_fellowship_roster_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.mergeMembers(parsed);
        }
      }
    } catch {}
    return DEFAULT_FELLOWSHIP_MEMBERS;
  }

  private persistLocalMembers() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('lifeos_fellowship_roster_v1', JSON.stringify(this.cachedMembers));
    } catch {}
  }

  // 2. UNION MERGE: Combines members by handle so NO MEMBER IS EVER DROPPED OR OVERWRITTEN
  private mergeMembers(incoming: FellowshipMember[]): FellowshipMember[] {
    const map = new Map<string, FellowshipMember>();

    // A. Start with default foundational members (laptop, Phone, Master Admin)
    for (const m of DEFAULT_FELLOWSHIP_MEMBERS) {
      if (m && m.handle) {
        map.set(m.handle.toLowerCase().trim(), m);
      }
    }

    // B. Keep all current cached members
    for (const m of this.cachedMembers) {
      if (m && m.handle) {
        const key = m.handle.toLowerCase().trim();
        map.set(key, m);
      }
    }

    // C. Merge all incoming members from network/SSE/REST
    if (Array.isArray(incoming)) {
      for (const m of incoming) {
        if (!m || !m.name) continue;
        const key = (m.handle || `@${m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`).toLowerCase().trim();
        const existing = map.get(key);

        const isMaster = (m.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
                         key.includes('aw03102008') ||
                         key === '@disciple';

        if (isMaster) {
          map.set('@disciple', {
            ...MASTER_ADMIN_MEMBER,
            ...m,
            name: 'Anthony Williams',
            handle: '@disciple',
            avatar: '👑',
            role: 'superadmin',
            email: MASTER_ADMIN_EMAIL,
            xp: Math.max(m.xp || 0, 5000),
            streak: Math.max(m.streak || 0, 100),
            status: 'active'
          });
        } else {
          map.set(key, {
            ...existing,
            ...m,
            // Preserve role modifications (e.g. if promoted to admin, keep admin)
            role: (existing?.role === 'admin' || existing?.role === 'superadmin') ? existing.role : m.role
          });
        }
      }
    }

    // D. Guarantee Master Admin is always in the roster
    map.set('@disciple', {
      ...MASTER_ADMIN_MEMBER,
      ...map.get('@disciple'),
      name: 'Anthony Williams',
      handle: '@disciple',
      avatar: '👑',
      role: 'superadmin',
      email: MASTER_ADMIN_EMAIL
    });

    return Array.from(map.values());
  }

  // 3. Cross-Tab Synchronization using BroadcastChannel
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_fellowship_sync');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type === 'fellowship_members_updated' && Array.isArray(e.data.data)) {
            const merged = this.mergeMembers(e.data.data);
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          } else if (e.data && e.data.type === 'global_config_updated' && e.data.data) {
            this.cachedConfig = { ...this.cachedConfig, ...e.data.data };
            this.notifyConfigListeners();
          }
        };
      } catch {}
    }
  }

  // 4. Server-Sent Events (SSE) Stream
  private initServerSSE() {
    if (typeof window === 'undefined') return;

    try {
      const sse = new EventSource('/api/chat/stream');
      this.localEventSource = sse;

      sse.addEventListener('fellowship_members_updated', (e) => {
        try {
          const list = JSON.parse(e.data);
          if (Array.isArray(list) && list.length > 0) {
            const merged = this.mergeMembers(list);
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          }
        } catch {}
      });

      sse.addEventListener('global_config_updated', (e) => {
        try {
          const config = JSON.parse(e.data);
          if (config) {
            this.cachedConfig = { ...this.cachedConfig, ...config };
            this.notifyConfigListeners();
          }
        } catch {}
      });
    } catch {}
  }

  // 5. MQTT WebSockets fallback
  private initMqtt() {
    if (typeof window === 'undefined') return;
    try {
      this.mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: `lifeos_client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        clean: true,
        reconnectPeriod: 3000
      });

      this.mqttClient.on('connect', () => {
        this.mqttClient?.subscribe('lifeos/global/settings_v3', { qos: 0 });
        this.mqttClient?.subscribe('lifeos/global/members_v3', { qos: 0 });
      });

      this.mqttClient.on('message', (topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString());
          if (topic === 'lifeos/global/settings_v3' && parsed) {
            this.cachedConfig = { ...this.cachedConfig, ...parsed };
            this.notifyConfigListeners();
          } else if (topic === 'lifeos/global/members_v3' && Array.isArray(parsed)) {
            const merged = this.mergeMembers(parsed);
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          }
        } catch {}
      });
    } catch {}
  }

  // 6. Fast Startup & Background Sync
  private startSync() {
    if (typeof window === 'undefined') return;

    // Immediately fetch from both endpoints
    this.fetchCloudMembers();
    this.fetchServerMembers();
    this.fetchCloudSettings();

    // Redundant poll every 3 seconds
    setInterval(() => {
      this.fetchCloudMembers();
      this.fetchServerMembers();
    }, 3000);
  }

  private async fetchCloudMembers() {
    try {
      const res = await fetch(CLOUD_MEMBERS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.members && Array.isArray(json.data.members)) {
          const merged = this.mergeMembers(json.data.members as FellowshipMember[]);
          if (merged.length !== this.cachedMembers.length || JSON.stringify(merged) !== JSON.stringify(this.cachedMembers)) {
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          }
        }
      }
    } catch {}
  }

  private async fetchServerMembers() {
    try {
      const res = await fetch('/api/fellowship/members');
      if (res.ok) {
        const json = await res.json();
        if (json?.members && Array.isArray(json.members)) {
          const merged = this.mergeMembers(json.members as FellowshipMember[]);
          if (merged.length !== this.cachedMembers.length || JSON.stringify(merged) !== JSON.stringify(this.cachedMembers)) {
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          }
        }
      }
    } catch {}
  }

  private async fetchCloudSettings() {
    try {
      const res = await fetch(CLOUD_SETTINGS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const incoming = json.data as GlobalConfigPayload;
          this.cachedConfig = incoming;
          this.notifyConfigListeners();
        }
      }
    } catch {}
  }

  private notifyConfigListeners() {
    this.configListeners.forEach(cb => cb(this.cachedConfig));
  }

  private notifyMembersListeners() {
    this.membersListeners.forEach(cb => cb(this.cachedMembers));
  }

  getMembers(): FellowshipMember[] {
    return this.cachedMembers;
  }

  // 7. Subscribe to Global Announcements & App Visibility
  subscribeToGlobalConfig(callback: (config: GlobalConfigPayload) => void): () => void {
    this.configListeners.push(callback);
    callback(this.cachedConfig);

    return () => {
      this.configListeners = this.configListeners.filter(cb => cb !== callback);
    };
  }

  // 8. Publish Global Announcement to all devices
  async publishAnnouncement(announcement: SystemAnnouncement | null) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      activeAnnouncement: announcement || null,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.notifyConfigListeners();

    // A. BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({ type: 'global_config_updated', data: nextConfig });
    } catch {}

    // B. Server API
    try {
      if (announcement) {
        await fetch('/api/global/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcement)
        });
      } else {
        await fetch('/api/global/dismiss-announcement', { method: 'POST' });
      }
    } catch {}

    // C. MQTT
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/settings_v3', JSON.stringify(nextConfig));
      }
    } catch {}

    // D. Cloud REST Store
    try {
      await fetch(CLOUD_SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global System Config',
          data: nextConfig
        })
      });
    } catch {}
  }

  // 9. Update Global App Visibility Feature Flags across all devices
  async updateAppVisibility(appVisibility: Record<string, boolean>) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      appVisibility,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.notifyConfigListeners();

    try {
      this.broadcastChannel?.postMessage({ type: 'global_config_updated', data: nextConfig });
    } catch {}

    try {
      await fetch('/api/global/app-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appVisibility })
      });
    } catch {}

    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/settings_v3', JSON.stringify(nextConfig));
      }
    } catch {}

    try {
      await fetch(CLOUD_SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global System Config',
          data: nextConfig
        })
      });
    } catch {}
  }

  // 10. Subscribe to Real Fellowship Members Roster across all devices
  subscribeToFellowshipMembers(callback: (members: FellowshipMember[]) => void): () => void {
    this.membersListeners.push(callback);
    callback(this.cachedMembers);

    return () => {
      this.membersListeners = this.membersListeners.filter(cb => cb !== callback);
    };
  }

  // 11. Register or update a real user - NEVER DROPS OR REPLACES EXISTING MEMBERS
  async registerMember(member: FellowshipMember) {
    const cleanHandle = (member.handle || '').toLowerCase().trim();
    const cleanEmail = (member.email || '').toLowerCase().trim();
    const isMaster = (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) ||
                     cleanHandle.includes('aw03102008');

    const handleSlug = cleanHandle.replace(/[^a-z0-9]/g, '') || `user_${Math.random().toString(36).substring(2, 7)}`;
    const docId = isMaster ? 'usr_master_admin_aw' : `usr_handle_${handleSlug}`;

    const safeMember: FellowshipMember = {
      ...member,
      id: docId,
      handle: member.handle || `@user_${Math.floor(1000 + Math.random() * 9000)}`,
      role: isMaster ? 'superadmin' : (member.role || 'user'),
      avatar: isMaster ? '👑' : (member.avatar || '🕊️'),
      status: member.status || 'active',
      lastActive: 'Just now'
    };

    // Merge into local cache non-destructively
    const merged = this.mergeMembers([safeMember]);
    this.cachedMembers = merged;
    this.persistLocalMembers();
    this.notifyMembersListeners();

    // BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'fellowship_members_updated',
        data: merged
      });
    } catch {}

    // POST to Server
    try {
      fetch('/api/fellowship/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeMember)
      }).catch(() => {});
    } catch {}

    // MQTT
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/members_v3', JSON.stringify(merged));
      }
    } catch {}

    // Cloud REST Store
    try {
      await fetch(CLOUD_MEMBERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global Fellowship Roster',
          data: {
            members: merged,
            updatedAt: Date.now()
          }
        })
      });
    } catch {}
  }

  // 12. Moderate Fellowship Member (role, status, delete)
  async moderateMember(memberId: string, updates: { role?: UserRole; status?: 'active' | 'muted' | 'banned'; action?: string }) {
    let nextMembers: FellowshipMember[];
    if (updates.action === 'delete') {
      nextMembers = this.cachedMembers.filter(m => m.id !== memberId && m.handle.toLowerCase() !== memberId.toLowerCase());
    } else {
      nextMembers = this.cachedMembers.map(m => {
        if (m.id === memberId || m.handle.toLowerCase() === memberId.toLowerCase()) {
          return {
            ...m,
            role: updates.role || m.role,
            status: updates.status || m.status
          };
        }
        return m;
      });
    }

    const merged = this.mergeMembers(nextMembers);
    this.cachedMembers = merged;
    this.persistLocalMembers();
    this.notifyMembersListeners();

    // BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'fellowship_members_updated',
        data: merged
      });
    } catch {}

    // Server API
    try {
      fetch('/api/fellowship/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...updates })
      }).catch(() => {});
    } catch {}

    // MQTT
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/members_v3', JSON.stringify(merged));
      }
    } catch {}

    // Cloud REST Store
    try {
      await fetch(CLOUD_MEMBERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global Fellowship Roster',
          data: {
            members: merged,
            updatedAt: Date.now()
          }
        })
      });
    } catch {}
  }
}

export const firebaseGlobalService = new FirebaseGlobalService();
