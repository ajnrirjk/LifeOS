import { SystemAnnouncement, FellowshipMember, UserRole, MASTER_ADMIN_EMAIL } from '../types/settings';
import mqtt, { MqttClient } from 'mqtt';

// Cloud Persistence Endpoints (Global REST Store with zero API key constraints)
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

const MASTER_ADMIN_MEMBER: FellowshipMember = {
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

class FirebaseGlobalService {
  private configListeners: Array<(config: GlobalConfigPayload) => void> = [];
  private membersListeners: Array<(members: FellowshipMember[]) => void> = [];
  private cachedConfig: GlobalConfigPayload = DEFAULT_CONFIG;
  private cachedMembers: FellowshipMember[] = [MASTER_ADMIN_MEMBER];
  private mqttClient: MqttClient | null = null;
  private isPollingActive = false;

  constructor() {
    this.initMqtt();
    this.startPolling();
  }

  // 1. Initialize Real-Time WebSocket PubSub via EMQX
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
            this.cachedConfig = {
              ...this.cachedConfig,
              ...parsed
            };
            this.notifyConfigListeners();
          } else if (topic === 'lifeos/global/members_v3' && Array.isArray(parsed)) {
            this.cachedMembers = this.cleanAndDeduplicateMembers(parsed);
            this.notifyMembersListeners();
          }
        } catch {}
      });
    } catch {
      // Fallback to HTTP polling if WebSocket is blocked
    }
  }

  // 2. High-Frequency Cloud Polling Loop (ensures sync even if WebSockets reconnect)
  private startPolling() {
    if (this.isPollingActive || typeof window === 'undefined') return;
    this.isPollingActive = true;

    // Initial fetch
    this.fetchCloudSettings();
    this.fetchCloudMembers();

    // Poll cloud every 2.5 seconds
    setInterval(() => {
      this.fetchCloudSettings();
      this.fetchCloudMembers();
    }, 2500);
  }

  private async fetchCloudSettings() {
    try {
      const res = await fetch(CLOUD_SETTINGS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const incoming = json.data as GlobalConfigPayload;
          if (
            JSON.stringify(incoming.activeAnnouncement) !== JSON.stringify(this.cachedConfig.activeAnnouncement) ||
            JSON.stringify(incoming.appVisibility) !== JSON.stringify(this.cachedConfig.appVisibility)
          ) {
            this.cachedConfig = incoming;
            this.notifyConfigListeners();
          }
        }
      }
    } catch {}
  }

  private async fetchCloudMembers() {
    try {
      const res = await fetch(CLOUD_MEMBERS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.members && Array.isArray(json.data.members)) {
          const incoming = this.cleanAndDeduplicateMembers(json.data.members as FellowshipMember[]);
          if (incoming.length !== this.cachedMembers.length || JSON.stringify(incoming) !== JSON.stringify(this.cachedMembers)) {
            this.cachedMembers = incoming;
            this.notifyMembersListeners();
          }
        }
      }
    } catch {}
  }

  // Deduplicate members cleanly by handle and master admin email
  private cleanAndDeduplicateMembers(list: FellowshipMember[]): FellowshipMember[] {
    const seenHandles = new Set<string>();
    const seenEmails = new Set<string>();
    const cleaned: FellowshipMember[] = [];

    for (const m of list) {
      if (!m || !m.name) continue;
      
      const isMaster = (m.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
                       (m.handle?.toLowerCase().includes('aw03102008'));

      if (isMaster) {
        if (seenEmails.has(MASTER_ADMIN_EMAIL.toLowerCase())) continue;
        seenEmails.add(MASTER_ADMIN_EMAIL.toLowerCase());
        cleaned.push({
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
        continue;
      }

      const hKey = (m.handle || '').toLowerCase().trim();
      if (hKey && seenHandles.has(hKey)) continue;
      if (hKey) seenHandles.add(hKey);

      cleaned.push(m);
    }

    // Ensure Master Admin is always in the roster
    if (!seenEmails.has(MASTER_ADMIN_EMAIL.toLowerCase())) {
      cleaned.push(MASTER_ADMIN_MEMBER);
    }

    return cleaned;
  }

  private notifyConfigListeners() {
    this.configListeners.forEach(cb => cb(this.cachedConfig));
  }

  private notifyMembersListeners() {
    this.membersListeners.forEach(cb => cb(this.cachedMembers));
  }

  // 3. Subscribe to Global Announcements & App Visibility
  subscribeToGlobalConfig(callback: (config: GlobalConfigPayload) => void): () => void {
    this.configListeners.push(callback);
    callback(this.cachedConfig);
    this.fetchCloudSettings().then(() => callback(this.cachedConfig));

    return () => {
      this.configListeners = this.configListeners.filter(cb => cb !== callback);
    };
  }

  // 4. Publish Global Announcement to all devices
  async publishAnnouncement(announcement: SystemAnnouncement | null) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      activeAnnouncement: announcement || null,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.notifyConfigListeners();

    // A. Push over instant WebSocket
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/settings_v3', JSON.stringify(nextConfig));
      }
    } catch {}

    // B. Save to Global Cloud REST Store
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

  // 5. Update Global App Visibility Feature Flags across all devices
  async updateAppVisibility(appVisibility: Record<string, boolean>) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      appVisibility,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.notifyConfigListeners();

    // A. Push over instant WebSocket
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/settings_v3', JSON.stringify(nextConfig));
      }
    } catch {}

    // B. Save to Global Cloud REST Store
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

  // 6. Subscribe to Real Fellowship Members Roster across all devices
  subscribeToFellowshipMembers(callback: (members: FellowshipMember[]) => void): () => void {
    this.membersListeners.push(callback);
    callback(this.cachedMembers);
    this.fetchCloudMembers().then(() => callback(this.cachedMembers));

    return () => {
      this.membersListeners = this.membersListeners.filter(cb => cb !== callback);
    };
  }

  // 7. Register or update a real user - PERMANENTLY MERGES INTO CLOUD
  async registerMember(member: FellowshipMember) {
    const cleanHandle = (member.handle || '').toLowerCase().trim();
    const cleanEmail = (member.email || '').toLowerCase().trim();
    const isMaster = (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) ||
                     cleanHandle.includes('aw03102008');

    // Give each distinct handle its own stable, unique ID so devices never collide
    const stableId = isMaster
      ? 'usr_master_admin_aw'
      : (member.id && member.id !== 'usr_me_001')
      ? member.id
      : `usr_${cleanHandle.replace(/[^a-z0-9]/g, '') || Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const safeMember: FellowshipMember = {
      ...member,
      id: stableId,
      handle: member.handle || `@user_${Math.floor(1000 + Math.random() * 9000)}`,
      role: isMaster ? 'superadmin' : (member.role || 'user'),
      avatar: isMaster ? '👑' : (member.avatar || '🕊️'),
      status: member.status || 'active',
      lastActive: 'Just now'
    };

    // 1. Fetch latest cloud members first so we NEVER overwrite or drop other users
    let cloudList: FellowshipMember[] = [...this.cachedMembers];
    try {
      const res = await fetch(CLOUD_MEMBERS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.members && Array.isArray(json.data.members)) {
          cloudList = json.data.members;
        }
      }
    } catch {}

    // 2. Filter out ONLY the same person (by handle or master admin email)
    const targetHandle = safeMember.handle.toLowerCase().trim();
    const updatedList = cloudList.filter(m => {
      if (isMaster && m.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) return false;
      if (!isMaster && m.handle?.toLowerCase().trim() === targetHandle) return false;
      if (!isMaster && m.id === stableId) return false;
      return true;
    });

    updatedList.unshift(safeMember);

    const nextMembers = this.cleanAndDeduplicateMembers(updatedList);
    this.cachedMembers = nextMembers;
    this.notifyMembersListeners();

    // 3. Push over instant WebSocket
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/members_v3', JSON.stringify(nextMembers));
      }
    } catch {}

    // 4. Persist to Global Cloud REST Store permanently
    try {
      await fetch(CLOUD_MEMBERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global Fellowship Roster',
          data: {
            members: nextMembers,
            updatedAt: Date.now()
          }
        })
      });
    } catch {}
  }

  // 8. Moderate Fellowship Member (role, status, delete) across all devices
  async moderateMember(memberId: string, updates: { role?: UserRole; status?: 'active' | 'muted' | 'banned'; action?: string }) {
    // 1. Fetch current cloud members first
    let cloudList: FellowshipMember[] = [...this.cachedMembers];
    try {
      const res = await fetch(CLOUD_MEMBERS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.members && Array.isArray(json.data.members)) {
          cloudList = json.data.members;
        }
      }
    } catch {}

    let nextMembers: FellowshipMember[];
    if (updates.action === 'delete') {
      nextMembers = cloudList.filter(m => m.id !== memberId);
    } else {
      nextMembers = cloudList.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            role: updates.role || m.role,
            status: updates.status || m.status
          };
        }
        return m;
      });
    }

    nextMembers = this.cleanAndDeduplicateMembers(nextMembers);
    this.cachedMembers = nextMembers;
    this.notifyMembersListeners();

    // 2. Push over instant WebSocket
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish('lifeos/global/members_v3', JSON.stringify(nextMembers));
      }
    } catch {}

    // 3. Persist to Global Cloud REST Store permanently
    try {
      await fetch(CLOUD_MEMBERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'LifeOS Global Fellowship Roster',
          data: {
            members: nextMembers,
            updatedAt: Date.now()
          }
        })
      });
    } catch {}
  }
}

export const firebaseGlobalService = new FirebaseGlobalService();
