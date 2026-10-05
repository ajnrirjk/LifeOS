import { SystemAnnouncement, FellowshipMember, UserRole, MASTER_ADMIN_EMAIL } from '../types/settings';
import mqtt, { MqttClient } from 'mqtt';

// Cloud Relays & MQTT Topics for Universal Multi-Device Synchronization
const CLOUD_CONFIG_RELAY = 'https://ntfy.sh/lifeos_global_config_v2';
const CLOUD_MEMBERS_RELAY = 'https://ntfy.sh/lifeos_fellowship_v2';
const MQTT_TOPIC_SETTINGS = 'lifeos/global/settings_v7';
const MQTT_TOPIC_MAINTENANCE = 'lifeos/global/maintenance_v7';
const MQTT_TOPIC_MEMBERS = 'lifeos/global/members_v7';
const MQTT_BROKER_PRIMARY = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_BROKER_FALLBACK = 'wss://broker.hivemq.com:8884/mqtt';

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
    faith_meet: true,
    mini_cats: true,
    mini_games: true,
    youtube: true
  },
  maintenanceMode: false,
  maintenanceMessage: 'System maintenance in progress. Master Admin access only.',
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
  private cloudConfigSSE: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private mqttClient: MqttClient | null = null;

  constructor() {
    this.cachedConfig = this.loadInitialConfig();
    this.cachedMembers = this.loadInitialMembers();
    this.initBroadcastChannel();
    this.initServerSSE();
    this.initCloudSSE();
    this.initMqtt();
    this.startSync();
  }

  // 1. Load Initial State from localStorage
  private loadInitialConfig(): GlobalConfigPayload {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const saved = localStorage.getItem('lifeos_global_config_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_CONFIG, ...parsed };
        }
      }
    } catch {}
    return DEFAULT_CONFIG;
  }

  private persistLocalConfig() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('lifeos_global_config_cache', JSON.stringify(this.cachedConfig));
    } catch {}
  }

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

  // 2. UNION MERGE for Fellowship Members
  private mergeMembers(incoming: FellowshipMember[]): FellowshipMember[] {
    const map = new Map<string, FellowshipMember>();

    for (const m of DEFAULT_FELLOWSHIP_MEMBERS) {
      if (m && m.handle) {
        map.set(m.handle.toLowerCase().trim(), m);
      }
    }

    for (const m of this.cachedMembers) {
      if (m && m.handle) {
        map.set(m.handle.toLowerCase().trim(), m);
      }
    }

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
            role: (existing?.role === 'admin' || existing?.role === 'superadmin') ? existing.role : m.role
          });
        }
      }
    }

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
            this.persistLocalConfig();
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
            this.persistLocalConfig();
            this.notifyConfigListeners();
          }
        } catch {}
      });
    } catch {}
  }

  // 5. Cloud SSE Stream for Instant Push across all internet devices
  private initCloudSSE() {
    if (typeof window === 'undefined') return;

    try {
      if (this.cloudConfigSSE) {
        try { this.cloudConfigSSE.close(); } catch {}
      }

      const sse = new EventSource(`${CLOUD_CONFIG_RELAY}/sse`);
      this.cloudConfigSSE = sse;

      sse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            const payload = JSON.parse(raw.message);
            if (payload && payload.type === 'config_update' && payload.data) {
              const incoming = payload.data as GlobalConfigPayload;
              this.applyIncomingConfig(incoming);
            }
          }
        } catch {}
      };

      sse.onerror = () => {
        // EventSource automatically reconnects on error
      };
    } catch {}
  }

  // 6. MQTT WebSockets Connection with Retained Message Support
  private initMqtt(useFallback: boolean = false) {
    if (typeof window === 'undefined') return;
    try {
      const brokerUrl = useFallback ? MQTT_BROKER_FALLBACK : MQTT_BROKER_PRIMARY;
      const clientId = `lifeos_global_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (this.mqttClient) {
        try { this.mqttClient.end(true); } catch {}
        this.mqttClient = null;
      }

      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 2500,
        keepalive: 60,
        rejectUnauthorized: false
      });

      this.mqttClient.on('connect', () => {
        this.mqttClient?.subscribe([MQTT_TOPIC_SETTINGS, MQTT_TOPIC_MAINTENANCE, MQTT_TOPIC_MEMBERS], { qos: 1 });
      });

      this.mqttClient.on('error', (err) => {
        console.warn('Global MQTT error:', err?.message);
        if (!useFallback && !this.mqttClient?.connected) {
          this.initMqtt(true);
        }
      });

      this.mqttClient.on('message', (topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString());
          if (topic === MQTT_TOPIC_SETTINGS && parsed) {
            this.applyIncomingConfig(parsed);
          } else if (topic === MQTT_TOPIC_MAINTENANCE && parsed) {
            this.applyIncomingConfig({
              maintenanceMode: parsed.maintenanceMode,
              maintenanceMessage: parsed.maintenanceMessage,
              updatedAt: parsed.updatedAt
            });
          } else if (topic === MQTT_TOPIC_MEMBERS && Array.isArray(parsed)) {
            const merged = this.mergeMembers(parsed);
            this.cachedMembers = merged;
            this.persistLocalMembers();
            this.notifyMembersListeners();
          }
        } catch {}
      });
    } catch (err) {
      if (!useFallback) {
        this.initMqtt(true);
      }
    }
  }

  private applyIncomingConfig(incoming: Partial<GlobalConfigPayload>) {
    if (!incoming) return;
    const isNewer = !incoming.updatedAt || !this.cachedConfig.updatedAt || (incoming.updatedAt >= this.cachedConfig.updatedAt - 1000);
    if (!isNewer) return;

    this.cachedConfig = {
      ...this.cachedConfig,
      ...incoming,
      activeAnnouncement: incoming.activeAnnouncement !== undefined ? incoming.activeAnnouncement : this.cachedConfig.activeAnnouncement,
      maintenanceMode: incoming.maintenanceMode !== undefined ? incoming.maintenanceMode : this.cachedConfig.maintenanceMode,
      maintenanceMessage: incoming.maintenanceMessage || this.cachedConfig.maintenanceMessage,
      appVisibility: incoming.appVisibility ? { ...this.cachedConfig.appVisibility, ...incoming.appVisibility } : this.cachedConfig.appVisibility,
      updatedAt: Math.max(incoming.updatedAt || 0, this.cachedConfig.updatedAt || 0, Date.now())
    };

    this.persistLocalConfig();
    this.notifyConfigListeners();
  }

  // 7. Periodic Sync and Tab-Focus Refresh
  private startSync() {
    if (typeof window === 'undefined') return;

    this.fetchCloudConfig();
    this.fetchServerConfig();
    this.fetchServerMembers();

    setInterval(() => {
      this.fetchCloudConfig();
      this.fetchServerConfig();
      this.fetchServerMembers();
    }, 2500);

    window.addEventListener('focus', () => {
      this.fetchCloudConfig();
      this.fetchServerConfig();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fetchCloudConfig();
        this.fetchServerConfig();
      }
    });
  }

  private async fetchCloudConfig() {
    try {
      const res = await fetch(`${CLOUD_CONFIG_RELAY}/json?poll=1&since=all`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const raw = JSON.parse(line);
          if (raw.event === 'message' && raw.message) {
            const payload = JSON.parse(raw.message);
            if (payload && payload.type === 'config_update' && payload.data) {
              this.applyIncomingConfig(payload.data);
            }
          }
        } catch {}
      }
    } catch {}
  }

  private async fetchServerConfig() {
    try {
      const res = await fetch('/api/global/config', { cache: 'no-store', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const config = await res.json();
        if (config && typeof config === 'object') {
          this.applyIncomingConfig(config);
        }
      }
    } catch {}
  }

  private async fetchServerMembers() {
    try {
      const res = await fetch('/api/fellowship/members', { cache: 'no-store', signal: AbortSignal.timeout(1500) });
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

  private notifyConfigListeners() {
    this.configListeners.forEach(cb => {
      try { cb(this.cachedConfig); } catch {}
    });
  }

  private notifyMembersListeners() {
    this.membersListeners.forEach(cb => {
      try { cb(this.cachedMembers); } catch {}
    });
  }

  getMembers(): FellowshipMember[] {
    return this.cachedMembers;
  }

  getGlobalConfig(): GlobalConfigPayload {
    return this.cachedConfig;
  }

  subscribeToGlobalConfig(callback: (config: GlobalConfigPayload) => void): () => void {
    this.configListeners.push(callback);
    callback(this.cachedConfig);

    return () => {
      this.configListeners = this.configListeners.filter(cb => cb !== callback);
    };
  }

  // 8. Publish Maintenance Mode / Lockdown Across ALL Devices
  async publishMaintenanceMode(enabled: boolean, message?: string) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      maintenanceMode: enabled,
      maintenanceMessage: message || this.cachedConfig.maintenanceMessage || 'System maintenance in progress. Master Admin access only.',
      updatedAt: Date.now()
    };

    this.cachedConfig = nextConfig;
    this.persistLocalConfig();
    this.notifyConfigListeners();

    // A. BroadcastChannel for instant cross-tab sync
    try {
      this.broadcastChannel?.postMessage({ type: 'global_config_updated', data: nextConfig });
    } catch {}

    // B. MQTT Retained Publication (Delivered instantly to all online & newly connecting devices)
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(MQTT_TOPIC_SETTINGS, JSON.stringify(nextConfig), { retain: true, qos: 1 });
        this.mqttClient.publish(MQTT_TOPIC_MAINTENANCE, JSON.stringify({
          maintenanceMode: enabled,
          maintenanceMessage: nextConfig.maintenanceMessage,
          updatedAt: nextConfig.updatedAt
        }), { retain: true, qos: 1 });
      }
    } catch {}

    // C. Universal Cloud Relay
    try {
      fetch(CLOUD_CONFIG_RELAY, {
        method: 'POST',
        headers: {
          'Title': enabled ? 'LifeOS Emergency Lockdown Enabled' : 'LifeOS Lockdown Disabled',
          'Priority': 'urgent',
          'Tags': enabled ? 'lock,warning' : 'unlock,white_check_mark'
        },
        body: JSON.stringify({
          type: 'config_update',
          data: nextConfig,
          timestamp: Date.now()
        }),
        signal: AbortSignal.timeout(1500)
      }).catch(() => {});
    } catch {}

    // D. Server API
    try {
      fetch('/api/global/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: enabled,
          maintenanceMessage: nextConfig.maintenanceMessage
        }),
        signal: AbortSignal.timeout(1500)
      }).catch(() => {});
    } catch {}
  }

  // 9. Publish Global Announcement Across All Devices
  async publishAnnouncement(announcement: SystemAnnouncement | null) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      activeAnnouncement: announcement || null,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.persistLocalConfig();
    this.notifyConfigListeners();

    try {
      this.broadcastChannel?.postMessage({ type: 'global_config_updated', data: nextConfig });
    } catch {}

    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(MQTT_TOPIC_SETTINGS, JSON.stringify(nextConfig), { retain: true, qos: 1 });
      }
    } catch {}

    try {
      fetch(CLOUD_CONFIG_RELAY, {
        method: 'POST',
        headers: {
          'Title': announcement ? `Announcement: ${announcement.title}` : 'Announcement Dismissed',
          'Tags': 'mega,loudspeaker'
        },
        body: JSON.stringify({
          type: 'config_update',
          data: nextConfig,
          timestamp: Date.now()
        }),
        signal: AbortSignal.timeout(1500)
      }).catch(() => {});
    } catch {}

    try {
      if (announcement) {
        fetch('/api/global/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcement),
          signal: AbortSignal.timeout(1500)
        }).catch(() => {});
      } else {
        fetch('/api/global/dismiss-announcement', { method: 'POST', signal: AbortSignal.timeout(1500) }).catch(() => {});
      }
    } catch {}
  }

  // 10. Update Global App Visibility Feature Flags
  async updateAppVisibility(appVisibility: Record<string, boolean>) {
    const nextConfig: GlobalConfigPayload = {
      ...this.cachedConfig,
      appVisibility,
      updatedAt: Date.now()
    };
    this.cachedConfig = nextConfig;
    this.persistLocalConfig();
    this.notifyConfigListeners();

    try {
      this.broadcastChannel?.postMessage({ type: 'global_config_updated', data: nextConfig });
    } catch {}

    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(MQTT_TOPIC_SETTINGS, JSON.stringify(nextConfig), { retain: true, qos: 1 });
      }
    } catch {}

    try {
      await fetch(CLOUD_CONFIG_RELAY, {
        method: 'POST',
        headers: { 'Title': 'LifeOS Feature Flags Updated' },
        body: JSON.stringify({
          type: 'config_update',
          data: nextConfig,
          timestamp: Date.now()
        })
      });
    } catch {}

    try {
      await fetch('/api/global/app-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appVisibility })
      });
    } catch {}
  }

  // 11. Fellowship Members Subscription & Registration
  subscribeToFellowshipMembers(callback: (members: FellowshipMember[]) => void): () => void {
    this.membersListeners.push(callback);
    callback(this.cachedMembers);

    return () => {
      this.membersListeners = this.membersListeners.filter(cb => cb !== callback);
    };
  }

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

    const merged = this.mergeMembers([safeMember]);
    this.cachedMembers = merged;
    this.persistLocalMembers();
    this.notifyMembersListeners();

    try {
      this.broadcastChannel?.postMessage({
        type: 'fellowship_members_updated',
        data: merged
      });
    } catch {}

    try {
      fetch('/api/fellowship/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeMember)
      }).catch(() => {});
    } catch {}

    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(MQTT_TOPIC_MEMBERS, JSON.stringify(merged), { retain: true, qos: 1 });
      }
    } catch {}
  }

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

    try {
      this.broadcastChannel?.postMessage({
        type: 'fellowship_members_updated',
        data: merged
      });
    } catch {}

    try {
      fetch('/api/fellowship/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...updates })
      }).catch(() => {});
    } catch {}

    try {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(MQTT_TOPIC_MEMBERS, JSON.stringify(merged), { retain: true, qos: 1 });
      }
    } catch {}
  }
}

export const firebaseGlobalService = new FirebaseGlobalService();
