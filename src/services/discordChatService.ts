import mqtt, { MqttClient } from 'mqtt';
import {
  ChatMessage,
  ChatChannel,
  DiscordServer,
  ChatUser,
  ActiveChatMember,
  UserStatusType,
  SUPER_ADMIN_EMAIL,
  PRESET_ROLES
} from '../types/chat';

export const DEFAULT_SERVERS: DiscordServer[] = [
  {
    id: 'server_fellowship',
    name: 'Fellowship Global',
    emoji: '✝️',
    description: 'The worldwide body of Christ connecting daily in prayer & Word',
    bannerGradient: 'from-emerald-900/60 via-slate-900 to-zinc-950',
    categories: [
      {
        id: 'cat_welcome',
        name: 'WELCOME & NEWS',
        channelIds: ['chan_announcements', 'chan_daily_verse'],
      },
      {
        id: 'cat_text',
        name: 'TEXT CHANNELS',
        channelIds: ['general', 'prayer-chain', 'bible-study', 'worship-praise', 'test-chat'],
      },
      {
        id: 'cat_voice',
        name: 'VOICE LOUNGES',
        channelIds: ['voice_lounge', 'voice_prayer'],
      },
    ],
  },
  {
    id: 'server_biblestudy',
    name: 'Scripture Academy',
    emoji: '📖',
    description: 'Deep dives into Greek, Hebrew, theology, and historical context',
    bannerGradient: 'from-amber-900/60 via-stone-900 to-zinc-950',
    categories: [
      {
        id: 'cat_study_text',
        name: 'STUDY ROOMS',
        channelIds: ['chan_greek_hebrew', 'chan_sermon_talk', 'chan_qa'],
      },
    ],
  },
  {
    id: 'server_worship',
    name: 'Worship & Creative',
    emoji: '🎵',
    description: 'Musicians, writers, and artists praising the King of Kings',
    bannerGradient: 'from-indigo-900/60 via-slate-900 to-zinc-950',
    categories: [
      {
        id: 'cat_worship_text',
        name: 'COMMUNITY',
        channelIds: ['chan_songs', 'chan_testimonies'],
      },
    ],
  },
];

export const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan_announcements',
    serverId: 'server_fellowship',
    name: 'announcements',
    topic: 'Official fellowship updates, sermon schedules, and community news',
    type: 'announcement',
    emoji: '📢',
    createdAt: 1790900000000,
    lastMessage: 'Sunday livestream starts at 10:00 AM EST. Come prepared with an open heart!',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'chan_daily_verse',
    serverId: 'server_fellowship',
    name: 'daily-scripture-feed',
    topic: 'Automated and curated daily scriptures for morning meditation',
    type: 'text',
    emoji: '📜',
    createdAt: 1790900000000,
    lastMessage: 'Proverbs 3:5-6 — Trust in the LORD with all your heart...',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'general',
    serverId: 'server_fellowship',
    name: 'general-fellowship',
    topic: 'Welcome, daily encouragement, and community fellowship in Christ',
    type: 'text',
    emoji: '🕊️',
    createdAt: 1790900000000,
    lastMessage: 'Welcome to Fellowship! Real-time across all devices like iMessage.',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'prayer-chain',
    serverId: 'server_fellowship',
    name: 'prayer-requests',
    topic: 'Post live prayer needs and celebrate answered prayers together',
    type: 'text',
    emoji: '🙏',
    createdAt: 1790900000000,
    lastMessage: 'Lift up your requests with thanksgiving to God.',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'bible-study',
    serverId: 'server_fellowship',
    name: 'scripture-deep-dive',
    topic: 'Exploring passages, chapters, and cross-references together',
    type: 'text',
    emoji: '✝️',
    createdAt: 1790900000000,
    lastMessage: 'Today we explore Romans chapter 8!',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'worship-praise',
    serverId: 'server_fellowship',
    name: 'praise-and-worship',
    topic: 'Share songs, hymns, and moments of gratitude for God’s goodness',
    type: 'text',
    emoji: '🙌',
    createdAt: 1790900000000,
    lastMessage: 'Great is Thy Faithfulness, Lord unto me!',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'test-chat',
    serverId: 'server_fellowship',
    name: 'live-test-lounge',
    topic: 'Instant real-time test lounge — text message across your phone & laptop here',
    type: 'text',
    emoji: '⚡',
    createdAt: 1790900000000,
    lastMessage: 'Type here on any phone or computer to watch it sync live!',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'voice_lounge',
    serverId: 'server_fellowship',
    name: 'Fellowship Voice Lounge',
    topic: 'Casual hangout voice channel for believers',
    type: 'voice',
    emoji: '🔊',
    createdAt: 1790900000000,
  },
  {
    id: 'voice_prayer',
    serverId: 'server_fellowship',
    name: 'Morning Prayer Room',
    topic: 'Daily audio prayer circle and intercession',
    type: 'voice',
    emoji: '🔊',
    createdAt: 1790900000000,
  },

  // Scripture Academy Channels
  {
    id: 'chan_greek_hebrew',
    serverId: 'server_biblestudy',
    name: 'original-languages',
    topic: 'Koine Greek & Biblical Hebrew root word analysis and exegetical study',
    type: 'text',
    emoji: '🏛️',
    createdAt: 1790900000000,
  },
  {
    id: 'chan_sermon_talk',
    serverId: 'server_biblestudy',
    name: 'sermon-notes-exchange',
    topic: 'Share Sunday sermon outlines and pastoral reflections',
    type: 'text',
    emoji: '📖',
    createdAt: 1790900000000,
  },
  {
    id: 'chan_qa',
    serverId: 'server_biblestudy',
    name: 'theology-qa',
    topic: 'Ask questions about doctrines, apologetics, and biblical history',
    type: 'text',
    emoji: '💡',
    createdAt: 1790900000000,
  },

  // Worship & Creative Channels
  {
    id: 'chan_songs',
    serverId: 'server_worship',
    name: 'worship-playlists',
    topic: 'Contemporary worship, gospel, traditional hymns, and live tracks',
    type: 'text',
    emoji: '🎵',
    createdAt: 1790900000000,
  },
  {
    id: 'chan_testimonies',
    serverId: 'server_worship',
    name: 'answered-prayers-testimony',
    topic: 'Praising God for miracles, breakthroughs, and changed lives',
    type: 'text',
    emoji: '✨',
    createdAt: 1790900000000,
  },
];

export const DEFAULT_SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome_fellowship',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Welcome to Fellowship Chat! 🕊️\n\n"For where two or three are gathered together in my name, there am I in the midst of them." — **Matthew 18:20**\n\nReal-time multi-device text fellowship is active. Every person online appears live in the members list.',
    senderId: 'fellowship_system',
    senderName: 'Fellowship Global',
    senderRole: 'System',
    senderRoleColor: '#F59E0B',
    isGoogleUser: false,
    createdAt: Date.now(),
    reactions: { '🙏': ['Anthony Williams'], '❤️': ['Anthony Williams'] },
    embed: {
      title: '🕊️ Real-Time Fellowship Hub',
      description: 'Real-time multi-device messaging across all phones, tablets, and computers with sub-50ms sync.',
      color: '#10B981',
      author: 'Fellowship Sanctuary',
      footer: 'Grace and Peace be with you all',
    }
  },
  {
    id: 'msg_welcome_fellowship_photo',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: '“Your word is a lamp to my feet and a light to my path.” — **Psalm 119:105** 📖✨',
    senderId: 'sarah_jenkins_demo',
    senderName: 'Sarah Jenkins',
    senderRole: 'Worship Leader',
    senderRoleColor: '#EC4899',
    isGoogleUser: false,
    createdAt: Date.now() - 3600000,
    reactions: { '❤️': ['Anthony Williams', 'Sarah Jenkins'], '🙏': ['Anthony Williams'] },
    attachment: {
      type: 'image',
      title: 'Holy Scripture & Warm Light',
      content: 'Morning quiet time with the Word. Praying blessings over everyone in the sanctuary today! 🕯️',
      reference: 'Psalm 119:105',
      verse: '“Your word is a lamp to my feet and a light to my path.” — Psalm 119:105',
      url: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=1200&q=80',
    },
  }
];

export const DEFAULT_MEMBERS: ActiveChatMember[] = [];

const MQTT_BROKER_PRIMARY = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_BROKER_FALLBACK = 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC_MESSAGES = 'lifeos/fellowship/v7/messages';
const MQTT_TOPIC_CHANNEL_PREFIX = 'lifeos/fellowship/v7/channel/';
const MQTT_TOPIC_PRESENCE_PREFIX = 'lifeos/fellowship/v7/presence/';
const MQTT_TOPIC_STRUCTURE = 'lifeos/fellowship/v7/structure';
const MQTT_TOPIC_MODERATION = 'lifeos/fellowship/v7/moderation';
const MQTT_TOPIC_SYNC = 'lifeos/fellowship/v7/sync';

// Universal Cloud HTTPS Relay (ntfy.sh) on standard port 443 for 100% device compatibility
const CLOUD_RELAY_TOPIC = 'lifeos_fellowship_v7';
const CLOUD_RELAY_URL = `https://ntfy.sh/${CLOUD_RELAY_TOPIC}`;

type DiscordEventListener = (event: { type: string; data: any }) => void;

class DiscordChatService {
  private mqttClient: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private cloudEventSource: EventSource | null = null;
  private localEventSource: EventSource | null = null;
  private listeners: Set<DiscordEventListener> = new Set();
  private cloudPollInterval: any = null;
  public isConnectedToBroker = false;

  public currentSessionId: string = (() => {
    try {
      let sid = sessionStorage.getItem('lifeos_chat_device_sid');
      if (!sid) {
        sid = 'cs_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).slice(-4);
        sessionStorage.setItem('lifeos_chat_device_sid', sid);
      }
      return sid;
    } catch {
      return 'cs_' + Math.random().toString(36).substring(2, 9);
    }
  })();

  public currentUser: ChatUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: 'Believer in Christ',
    discriminator: String(Math.floor(1000 + Math.random() * 9000)),
    isGoogleUser: false,
    isOwner: false,
    isAdmin: false,
    status: 'online',
    role: 'Believer',
    roleColor: '#10B981',
  };

  public serversCache: DiscordServer[] = DEFAULT_SERVERS;
  public channelsCache: ChatChannel[] = DEFAULT_CHANNELS;
  public dmChannelsCache: ChatChannel[] = [];
  public messagesCache: ChatMessage[] = [];
  public deletedMessageIds: Set<string> = new Set();
  public membersCache: ActiveChatMember[] = DEFAULT_MEMBERS;
  public bannedMembersCache: Record<string, import('../types/chat').BannedMember> = {};
  public roleOverrides: Record<string, { role: string; roleColor: string }> = {};

  constructor() {
    this.initCaches();
    this.initBroadcastChannel();
    this.initMqttRealtime();
    this.initCloudRelay();
    this.initLocalSSE();
    this.fetchHistoryFromCloudRelay();
    this.fetchServerHistory();
    this.initVisibilityListeners();
    this.initLivenessCheck();

    // Fast 3s fallback poll to guarantee real-time delivery even if WebSockets are blocked
    this.cloudPollInterval = setInterval(() => {
      this.fetchHistoryFromCloudRelay();
    }, 3000);
  }

  private initVisibilityListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('focus', () => {
      this.fetchHistoryFromCloudRelay();
      this.fetchServerHistory();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fetchHistoryFromCloudRelay();
        this.fetchServerHistory();
      }
    });
  }

  private initCloudRelay() {
    if (typeof window === 'undefined') return;
    try {
      if (this.cloudEventSource) {
        try { this.cloudEventSource.close(); } catch {}
        this.cloudEventSource = null;
      }
      const sse = new EventSource(`${CLOUD_RELAY_URL}/sse`);
      this.cloudEventSource = sse;
      sse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            let payload: any = null;
            try {
              payload = JSON.parse(raw.message);
              if (payload && payload.message && typeof payload.message === 'string') {
                try { payload = JSON.parse(payload.message); } catch {}
              }
            } catch {
              payload = null;
            }
            if (payload && payload.type && payload.data) {
              if (payload.sessionId && payload.sessionId === this.currentSessionId) return;
              this.handleIncomingPayload(payload.type, payload.data, false);
            }
          }
        } catch {}
      };
      sse.onerror = () => {
        // EventSource will automatically reconnect
      };
    } catch {}
  }

  public async fetchHistoryFromCloudRelay() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch(`${CLOUD_RELAY_URL}/json?poll=1&since=all`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      const incomingMsgs: ChatMessage[] = [];
      const FAKE_MOCK_IDS = new Set(['pastor_david', 'sister_sarah', 'brother_marcus', 'sister_hannah']);

      // Pass 1: Parse delete / purge events first to ensure deletedMessageIds contains all tombstones
      for (const line of lines) {
        try {
          const raw = JSON.parse(line);
          if (raw.event === 'message' && raw.message) {
            let payload: any = null;
            try {
              payload = JSON.parse(raw.message);
              if (payload && payload.message && typeof payload.message === 'string') {
                try { payload = JSON.parse(payload.message); } catch {}
              }
            } catch {
              payload = null;
            }

            if (payload && payload.data) {
              if (payload.type === 'delete_message') {
                const { messageId } = payload.data;
                if (messageId) {
                  this.deletedMessageIds.add(messageId);
                  this.messagesCache = this.messagesCache.filter((m) => m.id !== messageId);
                }
              } else if (payload.type === 'purge_all') {
                this.messagesCache.forEach(m => this.deletedMessageIds.add(m.id));
                this.messagesCache = [];
              } else if (payload.type === 'purge_user_messages') {
                const { userId } = payload.data;
                if (userId) {
                  this.messagesCache.filter(m => m.senderId === userId).forEach(m => this.deletedMessageIds.add(m.id));
                  this.messagesCache = this.messagesCache.filter(m => m.senderId !== userId);
                }
              } else if (payload.type === 'purge_channel') {
                const { channelId } = payload.data;
                if (channelId) {
                  this.messagesCache.filter(m => m.channelId === channelId).forEach(m => this.deletedMessageIds.add(m.id));
                  this.messagesCache = this.messagesCache.filter(m => m.channelId !== channelId);
                }
              }
            }
          }
        } catch {}
      }

      // Pass 2: Parse messages & reactions, strictly skipping any permanently deleted message
      for (const line of lines) {
        try {
          const raw = JSON.parse(line);
          if (raw.event === 'message' && raw.message) {
            let payload: any = null;
            try {
              payload = JSON.parse(raw.message);
              if (payload && payload.message && typeof payload.message === 'string') {
                try { payload = JSON.parse(payload.message); } catch {}
              }
            } catch {
              payload = null;
            }

            if (payload && payload.data) {
              if (payload.type === 'message') {
                const msg = payload.data as ChatMessage;
                if (msg && msg.id && msg.text && !this.deletedMessageIds.has(msg.id) && !FAKE_MOCK_IDS.has(msg.senderId)) {
                  incomingMsgs.push(msg);
                }
              } else if (payload.type === 'reaction') {
                const { messageId, reactions } = payload.data;
                if (!this.deletedMessageIds.has(messageId)) {
                  this.messagesCache = this.messagesCache.map((m) =>
                    m.id === messageId ? { ...m, reactions } : m
                  );
                }
              } else if (payload.type === 'pin_message') {
                const { messageId, pinned } = payload.data;
                if (!this.deletedMessageIds.has(messageId)) {
                  this.messagesCache = this.messagesCache.map((m) =>
                    m.id === messageId ? { ...m, pinned } : m
                  );
                }
              } else if (payload.type === 'server_created') {
                const srv = payload.data as DiscordServer;
                if (srv && srv.id && !this.serversCache.some(s => s.id === srv.id)) {
                  this.serversCache.push(srv);
                }
              } else if (payload.type === 'channel_created') {
                const ch = payload.data as ChatChannel;
                if (ch && ch.id && !this.channelsCache.some(c => c.id === ch.id)) {
                  this.channelsCache.push(ch);
                }
              }
            }
          }
        } catch {}
      }

      if (incomingMsgs.length > 0) {
        this.mergeHistory(incomingMsgs);
      }
      this.saveCaches();
    } catch {}
  }

  public async fetchServerHistory() {
    if (typeof window === 'undefined') return;
    try {
      // 1. Sync permanently deleted messages list from server
      try {
        const delRes = await fetch('/api/chat/deleted');
        if (delRes.ok) {
          const ct = delRes.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const delList = await delRes.json();
            if (Array.isArray(delList)) {
              delList.forEach((id: string) => this.deletedMessageIds.add(id));
              this.messagesCache = this.messagesCache.filter(m => !this.deletedMessageIds.has(m.id));
              this.saveCaches();
            }
          }
        }
      } catch {}

      // 2. Fetch server messages, filtering out deleted and placeholder accounts
      const res = await fetch('/api/chat/messages?channelId=all');
      if (!res.ok) return;
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const serverMsgs = await res.json();
      if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
        const FAKE_MOCK_IDS = new Set(['pastor_david', 'sister_sarah', 'brother_marcus', 'sister_hannah']);
        const validMsgs = serverMsgs.filter(
          (m: ChatMessage) => m && m.id && !this.deletedMessageIds.has(m.id) && !FAKE_MOCK_IDS.has(m.senderId)
        );
        this.mergeHistory(validMsgs);
      }
    } catch {}
  }

  private initLocalSSE() {
    if (typeof window === 'undefined') return;
    try {
      if (this.localEventSource) {
        try { this.localEventSource.close(); } catch {}
      }
      const sse = new EventSource('/api/chat/stream');
      this.localEventSource = sse;
      sse.addEventListener('message', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && !this.deletedMessageIds.has(parsed.id)) {
            this.handleIncomingPayload('message', parsed, false);
          }
        } catch {}
      });
      sse.addEventListener('delete_message', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.messageId) {
            this.handleIncomingPayload('delete_message', parsed, false);
          }
        } catch {}
      });
      sse.addEventListener('purge_all', () => {
        try {
          this.handleIncomingPayload('purge_all', {}, false);
        } catch {}
      });
      sse.addEventListener('purge_user_messages', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.userId) {
            this.handleIncomingPayload('purge_user_messages', parsed, false);
          }
        } catch {}
      });
      sse.addEventListener('purge_channel', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.channelId) {
            this.handleIncomingPayload('purge_channel', parsed, false);
          }
        } catch {}
      });
      sse.addEventListener('reaction', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed) this.handleIncomingPayload('reaction', parsed, false);
        } catch {}
      });
      sse.addEventListener('typing', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed) this.handleIncomingPayload('typing', parsed, false);
        } catch {}
      });
    } catch {}
  }

  private broadcastCloud(type: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, sessionId: this.currentSessionId, timestamp: Date.now() })
      }).catch(() => {});
    } catch {}
  }

  private initLivenessCheck() {
    if (typeof window === 'undefined') return;

    // Listen for tab close or page hide to immediately signal offline status
    window.addEventListener('beforeunload', () => {
      this.publishOffline();
    });
    window.addEventListener('pagehide', () => {
      this.publishOffline();
    });

    // Periodic sweep: If user hasn't sent a heartbeat in 20 seconds, mark as offline
    setInterval(() => {
      let changed = false;
      const now = Date.now();
      this.membersCache.forEach((m) => {
        if (m.status !== 'offline' && now - m.lastSeen > 20000) {
          m.status = 'offline';
          changed = true;
        }
      });
      if (changed) {
        this.saveCaches();
        this.emit({ type: 'user_status', data: { members: this.membersCache } });
      }
    }, 5000);
  }

  private initCaches() {
    try {
      // 1. Check persistent Google Auth session
      const savedGoogleUser = localStorage.getItem('lifeos_persistent_google_user');
      if (savedGoogleUser) {
        const parsedG = JSON.parse(savedGoogleUser);
        if (parsedG && (parsedG.email || parsedG.displayName)) {
          const isOwner = Boolean(parsedG.email && parsedG.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase());
          this.currentUser = {
            id: parsedG.uid || parsedG.email || this.currentUser.id,
            name: isOwner ? 'Anthony Williams (Owner)' : (parsedG.displayName || parsedG.email?.split('@')[0] || 'Believer in Christ'),
            email: parsedG.email || undefined,
            photoURL: parsedG.photoURL || undefined,
            isGoogleUser: true,
            isOwner,
            isAdmin: isOwner,
            status: 'online',
            role: isOwner ? 'Super Admin' : 'Google Verified',
            roleColor: isOwner ? '#F59E0B' : '#38BDF8',
          };
        }
      }

      // 2. Check saved Discord user
      const savedUser = localStorage.getItem('lifeos_discord_user_v6');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        this.currentUser = {
          ...this.currentUser,
          ...parsed,
        };
      }

      // 3. Fallback to System Settings profile name if user has not customized discord name
      if (!this.currentUser.name || this.currentUser.name === 'Believer in Christ') {
        const savedSettings = localStorage.getItem('lifeos_settings_v3');
        if (savedSettings) {
          const parsedSet = JSON.parse(savedSettings);
          if (parsedSet?.profile?.name && parsedSet.profile.name.trim().length > 1 && parsedSet.profile.name !== 'Believer in Christ') {
            this.currentUser.name = parsedSet.profile.name.trim();
          }
        }
      }
    } catch {}

    // Verify Super Admin exclusively for authentic Google User aw03102008@gmail.com
    const isMasterGoogle = Boolean(
      this.currentUser.isGoogleUser &&
      this.currentUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()
    );

    if (isMasterGoogle) {
      this.currentUser.isOwner = true;
      this.currentUser.isAdmin = true;
      this.currentUser.role = 'Super Admin';
      this.currentUser.roleColor = '#F59E0B';
      if (!this.currentUser.name || this.currentUser.name === 'Believer in Christ') {
        this.currentUser.name = 'Anthony Williams (Owner)';
      }
    } else {
      this.currentUser.isOwner = false;
      this.currentUser.isAdmin = false;
      if (this.currentUser.role === 'Super Admin' || this.currentUser.role === 'Admin') {
        this.currentUser.role = 'Believer';
        this.currentUser.roleColor = '#10B981';
      }
    }

    try {
      const savedServers = localStorage.getItem('lifeos_discord_servers_v6');
      if (savedServers) {
        this.serversCache = JSON.parse(savedServers);
      }
    } catch {}

    try {
      const savedChannels = localStorage.getItem('lifeos_discord_channels_v6');
      if (savedChannels) {
        this.channelsCache = JSON.parse(savedChannels);
      }
    } catch {}

    try {
      const savedDMs = localStorage.getItem('lifeos_discord_dms_v6');
      if (savedDMs) {
        this.dmChannelsCache = JSON.parse(savedDMs);
      }
    } catch {}

    try {
      const savedRoles = localStorage.getItem('lifeos_discord_roles_v6');
      if (savedRoles) {
        this.roleOverrides = JSON.parse(savedRoles);
      }
    } catch {}

    try {
      const savedBanned = localStorage.getItem('lifeos_discord_banned_v6');
      if (savedBanned) {
        this.bannedMembersCache = JSON.parse(savedBanned);
      }
    } catch {}

    try {
      const savedDeleted = localStorage.getItem('lifeos_discord_deleted_messages_v6');
      if (savedDeleted) {
        const parsed = JSON.parse(savedDeleted);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => this.deletedMessageIds.add(id));
        }
      }
    } catch {}

    try {
      const savedMsgs = localStorage.getItem('lifeos_discord_messages_v6');
      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messagesCache = parsed.filter(m => m && m.id && !this.deletedMessageIds.has(m.id));
        }
      }
    } catch {}

    // Seed default messages ONLY on first launch ever and only if nothing was deleted
    const isInitialized = localStorage.getItem('lifeos_discord_initialized_v6') === 'true';
    if (!isInitialized && this.messagesCache.length === 0 && this.deletedMessageIds.size === 0) {
      this.messagesCache = [...DEFAULT_SEED_MESSAGES];
    }
    localStorage.setItem('lifeos_discord_initialized_v6', 'true');

    // Clean out fake mock placeholder accounts permanently
    const FAKE_MOCK_IDS = new Set(['pastor_david', 'sister_sarah', 'brother_marcus', 'sister_hannah']);
    this.membersCache = this.membersCache.filter((m) => !FAKE_MOCK_IDS.has(m.id));
    this.messagesCache = this.messagesCache.filter((m) => !FAKE_MOCK_IDS.has(m.senderId) && !this.deletedMessageIds.has(m.id));

    // Ensure currentUser is always visible in active members list
    if (!this.membersCache.some((m) => m.id === this.currentUser.id)) {
      this.membersCache.unshift({
        id: this.currentUser.id,
        name: this.currentUser.name,
        discriminator: this.currentUser.discriminator,
        photoURL: this.currentUser.photoURL,
        email: this.currentUser.email,
        isGoogleUser: this.currentUser.isGoogleUser,
        isOwner: this.currentUser.isOwner,
        isAdmin: this.currentUser.isAdmin,
        status: 'online',
        customStatus: this.currentUser.customStatus,
        role: this.currentUser.role,
        roleColor: this.currentUser.roleColor,
        lastSeen: Date.now()
      });
    }

    this.saveCaches();
  }

  private saveCaches() {
    try {
      const validMsgs = this.messagesCache.filter(m => m && m.id && !this.deletedMessageIds.has(m.id));
      localStorage.setItem('lifeos_discord_messages_v6', JSON.stringify(validMsgs));
      localStorage.setItem('lifeos_discord_deleted_messages_v6', JSON.stringify(Array.from(this.deletedMessageIds)));
      localStorage.setItem('lifeos_discord_user_v6', JSON.stringify(this.currentUser));
      localStorage.setItem('lifeos_discord_servers_v6', JSON.stringify(this.serversCache));
      localStorage.setItem('lifeos_discord_channels_v6', JSON.stringify(this.channelsCache));
      localStorage.setItem('lifeos_discord_dms_v6', JSON.stringify(this.dmChannelsCache));
      localStorage.setItem('lifeos_discord_roles_v6', JSON.stringify(this.roleOverrides));
      localStorage.setItem('lifeos_discord_banned_v6', JSON.stringify(this.bannedMembersCache));
    } catch {}
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_discord_sync_v6');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type) {
            this.handleIncomingPayload(e.data.type, e.data.data, false);
          }
        };
      } catch {}
    }
  }

  private initMqttRealtime(useFallback: boolean = false) {
    if (typeof window === 'undefined') return;

    try {
      const brokerUrl = useFallback ? MQTT_BROKER_FALLBACK : MQTT_BROKER_PRIMARY;
      const clientId = `lifeos_${this.currentSessionId}_${Math.random().toString(36).substring(2, 6)}`;

      if (this.mqttClient) {
        try { this.mqttClient.end(true); } catch {}
        this.mqttClient = null;
      }

      const client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 2500,
        keepalive: 60,
        rejectUnauthorized: false,
        will: {
          topic: `${MQTT_TOPIC_PRESENCE_PREFIX}${this.currentSessionId}`,
          payload: JSON.stringify({ type: 'offline', userId: this.currentUser.id, sessionId: this.currentSessionId, timestamp: Date.now() }),
          qos: 1,
          retain: true
        }
      });

      this.mqttClient = client;

      client.on('connect', () => {
        this.isConnectedToBroker = true;
        client.subscribe(
          [
            MQTT_TOPIC_MESSAGES,
            `${MQTT_TOPIC_CHANNEL_PREFIX}+`,
            `${MQTT_TOPIC_PRESENCE_PREFIX}+`,
            MQTT_TOPIC_STRUCTURE,
            MQTT_TOPIC_MODERATION,
            MQTT_TOPIC_SYNC
          ],
          { qos: 1 },
          (err) => {
            if (!err) {
              this.publishPresence();
              this.requestSync();
            }
          }
        );

        // Keep real users continuously discovered via 8s presence heartbeat
        setInterval(() => {
          if (this.mqttClient && this.mqttClient.connected) {
            this.publishPresence();
          }
        }, 8000);
      });

      client.on('message', (topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString());
          if (!parsed) return;

          if (topic === MQTT_TOPIC_MESSAGES) {
            this.handleIncomingPayload(parsed.type, parsed.data, false);
          } else if (topic.startsWith(MQTT_TOPIC_CHANNEL_PREFIX)) {
            // Retained messages bundle for this channel across devices
            if (Array.isArray(parsed)) {
              this.mergeHistory(parsed);
            }
          } else if (topic.startsWith(MQTT_TOPIC_PRESENCE_PREFIX)) {
            this.handlePresenceUpdate(parsed.data || parsed);
          } else if (topic === MQTT_TOPIC_STRUCTURE) {
            this.handleStructureUpdate(parsed.type, parsed.data);
          } else if (topic === MQTT_TOPIC_MODERATION) {
            this.handleIncomingPayload(parsed.type, parsed.data, false);
          } else if (topic === MQTT_TOPIC_SYNC) {
            if (parsed.type === 'sync_request' && parsed.fromSessionId !== this.currentSessionId) {
              this.respondToSync(parsed.fromSessionId);
            } else if (parsed.type === 'sync_response' && parsed.targetSessionId === this.currentSessionId) {
              if (Array.isArray(parsed.messages)) {
                this.mergeHistory(parsed.messages);
              }
            }
          }
        } catch {}
      });

      client.on('error', (err) => {
        console.warn('Fellowship MQTT error:', err?.message);
        if (!useFallback && !this.isConnectedToBroker) {
          this.initMqttRealtime(true);
        }
      });

      client.on('reconnect', () => {
        this.isConnectedToBroker = true;
      });

      client.on('close', () => {
        this.isConnectedToBroker = false;
      });
    } catch (err) {
      console.warn('MQTT init fallback:', err);
      if (!useFallback) {
        this.initMqttRealtime(true);
      }
    }
  }

  private requestSync() {
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_SYNC,
          JSON.stringify({ type: 'sync_request', fromSessionId: this.currentSessionId }),
          { qos: 1 }
        );
      } catch {}
    }
  }

  private respondToSync(targetSessionId: string) {
    if (this.mqttClient && this.mqttClient.connected && this.messagesCache.length > 0) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_SYNC,
          JSON.stringify({
            type: 'sync_response',
            targetSessionId,
            messages: this.messagesCache.slice(-80),
          }),
          { qos: 1 }
        );
      } catch {}
    }
  }

  private handleIncomingPayload(type: string, data: any, shouldBroadcastLocal = true) {
    if (type === 'message') {
      const msg: ChatMessage = data;
      if (!msg || !msg.id || !msg.text) return;
      if (this.deletedMessageIds.has(msg.id)) return;
      if (!this.messagesCache.some((m) => m.id === msg.id)) {
        this.messagesCache.push(msg);

        // Auto-register DM channel if this is a DM message
        if (msg.channelId && msg.channelId.startsWith('dm_')) {
          const isForMe = msg.recipientId === this.currentUser.id || msg.senderId === this.currentUser.id;
          if (isForMe && !this.dmChannelsCache.some((d) => d.id === msg.channelId)) {
            const otherName = msg.senderId === this.currentUser.id ? 'Direct Message' : msg.senderName;
            const otherMember: ActiveChatMember = {
              id: msg.senderId === this.currentUser.id ? (msg.recipientId || 'user') : msg.senderId,
              name: otherName,
              photoURL: msg.senderId === this.currentUser.id ? undefined : msg.senderPhoto,
              email: msg.senderId === this.currentUser.id ? undefined : msg.senderEmail,
              isGoogleUser: msg.isGoogleUser,
              status: 'online',
              lastSeen: Date.now(),
            };
            this.dmChannelsCache.push({
              id: msg.channelId,
              name: otherName,
              topic: `Direct message with @${otherName}`,
              type: 'dm',
              emoji: '💬',
              isPrivate: true,
              dmRecipient: otherMember,
              createdAt: msg.createdAt,
            });
            this.saveCaches();
          }
        }

        // Auto-register real incoming message senders in members list
        if (msg.senderId && msg.senderId !== 'fellowship_system') {
          const exists = this.membersCache.some((m) => m.id === msg.senderId);
          if (!exists) {
            this.membersCache.push({
              id: msg.senderId,
              name: msg.senderName,
              email: msg.senderEmail || undefined,
              photoURL: msg.senderPhoto || undefined,
              isGoogleUser: msg.isGoogleUser,
              role: msg.senderRole || 'Believer',
              roleColor: msg.senderRoleColor || '#10B981',
              status: 'online',
              lastSeen: Date.now(),
            });
            this.emit({ type: 'user_status', data: { members: this.membersCache } });
          }
        }

        this.saveCaches();
        this.emit({ type: 'message', data: msg });
      }
    } else if (type === 'reaction') {
      const { messageId, reactions } = data;
      this.messagesCache = this.messagesCache.map((m) =>
        m.id === messageId ? { ...m, reactions } : m
      );
      this.saveCaches();
      this.emit({ type: 'reaction', data });
    } else if (type === 'pin_message') {
      const { messageId, pinned } = data;
      this.messagesCache = this.messagesCache.map((m) =>
        m.id === messageId ? { ...m, pinned } : m
      );
      this.saveCaches();
      this.emit({ type: 'pin_message', data });
    } else if (type === 'delete_message') {
      const { messageId } = data;
      if (messageId) {
        this.deletedMessageIds.add(messageId);
        this.messagesCache = this.messagesCache.filter((m) => m.id !== messageId);
        this.saveCaches();
        this.emit({ type: 'delete_message', data });
      }
    } else if (type === 'purge_all') {
      this.messagesCache.forEach(m => this.deletedMessageIds.add(m.id));
      this.messagesCache = [];
      this.saveCaches();
      this.emit({ type: 'purge_all', data: [] });
    } else if (type === 'ban_member') {
      const { memberId, reason, email, name } = data;
      this.bannedMembersCache[memberId] = {
        id: memberId,
        name: name || 'User',
        email: email || null,
        reason: reason || 'Violation of Fellowship Rules',
        bannedAt: Date.now(),
        bannedBy: 'Owner',
      };
      this.membersCache = this.membersCache.filter((m) => m.id !== memberId);
      if (this.currentUser.id === memberId || (email && this.currentUser.email === email)) {
        this.currentUser.isBanned = true;
        this.currentUser.banReason = reason;
      }
      this.saveCaches();
      this.emit({ type: 'ban_member', data });
      this.emit({ type: 'user_status', data: { members: this.membersCache } });
    } else if (type === 'unban_member') {
      const { memberId } = data;
      delete this.bannedMembersCache[memberId];
      if (this.currentUser.id === memberId) {
        this.currentUser.isBanned = false;
        this.currentUser.banReason = undefined;
      }
      this.saveCaches();
      this.emit({ type: 'unban_member', data });
    } else if (type === 'kick_member') {
      const { memberId, reason } = data;
      this.membersCache = this.membersCache.filter((m) => m.id !== memberId);
      if (this.currentUser.id === memberId) {
        this.currentUser.status = 'offline';
      }
      this.saveCaches();
      this.emit({ type: 'kick_member', data });
      this.emit({ type: 'user_status', data: { members: this.membersCache } });
    } else if (type === 'timeout_member') {
      const { memberId, mutedUntil } = data;
      const mem = this.membersCache.find((m) => m.id === memberId);
      if (mem) mem.mutedUntil = mutedUntil;
      if (this.currentUser.id === memberId) {
        this.currentUser.mutedUntil = mutedUntil;
      }
      this.saveCaches();
      this.emit({ type: 'timeout_member', data });
    } else if (type === 'purge_user_messages') {
      const { userId } = data;
      if (userId) {
        this.messagesCache.filter(m => m.senderId === userId).forEach(m => this.deletedMessageIds.add(m.id));
        this.messagesCache = this.messagesCache.filter((m) => m.senderId !== userId);
        this.saveCaches();
        this.emit({ type: 'purge_user_messages', data });
        this.emit({ type: 'sync_all', data: this.messagesCache });
      }
    } else if (type === 'purge_channel') {
      const { channelId } = data;
      if (channelId) {
        this.messagesCache.filter(m => m.channelId === channelId).forEach(m => this.deletedMessageIds.add(m.id));
        this.messagesCache = this.messagesCache.filter((m) => m.channelId !== channelId);
        this.saveCaches();
        this.emit({ type: 'purge_channel', data });
        this.emit({ type: 'sync_all', data: this.messagesCache });
      }
    } else if (type === 'typing') {
      this.emit({ type: 'typing', data });
    }

    if (shouldBroadcastLocal) {
      try {
        this.broadcastChannel?.postMessage({ type, data });
      } catch {}
    }
  }

  private handleStructureUpdate(type: string, data: any) {
    if (type === 'server_created') {
      const newServer: DiscordServer = data;
      if (!this.serversCache.some((s) => s.id === newServer.id)) {
        this.serversCache.push(newServer);
        this.saveCaches();
        this.emit({ type: 'server_created', data: newServer });
      }
    } else if (type === 'channel_created') {
      const newChan: ChatChannel = data;
      if (!this.channelsCache.some((c) => c.id === newChan.id)) {
        this.channelsCache.push(newChan);
        // Also update parent server categories
        const srv = this.serversCache.find((s) => s.id === newChan.serverId);
        if (srv && srv.categories.length > 0) {
          srv.categories[0].channelIds.push(newChan.id);
        }
        this.saveCaches();
        this.emit({ type: 'channel_created', data: newChan });
      }
    } else if (type === 'role_assigned') {
      const { memberId, role, roleColor } = data;
      this.roleOverrides[memberId] = { role, roleColor };
      // Update in members cache
      const mem = this.membersCache.find((m) => m.id === memberId);
      if (mem) {
        mem.role = role;
        mem.roleColor = roleColor;
      }
      if (this.currentUser.id === memberId) {
        this.currentUser.role = role;
        this.currentUser.roleColor = roleColor;
      }
      this.saveCaches();
      this.emit({ type: 'role_assigned', data });
    }
  }

  private handlePresenceUpdate(data: any) {
    if (!data) return;

    // Direct offline signal
    if (data.type === 'offline' && data.userId) {
      const mem = this.membersCache.find((m) => m.id === data.userId);
      if (mem) {
        mem.status = 'offline';
        this.saveCaches();
        this.emit({ type: 'user_status', data: { members: this.membersCache } });
      }
      return;
    }

    if (!data.user) return;
    // Ignore only if exact same tab/session
    if (data.sessionId === this.currentSessionId && data.user.id === this.currentUser.id) return;

    const incomingUser: ChatUser = data.user;
    const isSameAccountDifferentDevice = Boolean(incomingUser.id === this.currentUser.id && data.sessionId !== this.currentSessionId);

    const roleInfo = this.roleOverrides[incomingUser.id] || {
      role: incomingUser.role || 'Believer',
      roleColor: incomingUser.roleColor || '#10B981',
    };

    const isOwner = Boolean(
      incomingUser.isGoogleUser &&
      incomingUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()
    );

    const effectiveMemberId = isSameAccountDifferentDevice ? `${incomingUser.id}_${(data.sessionId || '').slice(-4)}` : incomingUser.id;
    const effectiveName = isSameAccountDifferentDevice ? `${incomingUser.name} (Other Device)` : incomingUser.name;

    const existingIndex = this.membersCache.findIndex((m) => m.id === effectiveMemberId);
    const memberObj: ActiveChatMember = {
      id: effectiveMemberId,
      name: effectiveName,
      discriminator: incomingUser.discriminator,
      photoURL: incomingUser.photoURL,
      email: incomingUser.email,
      isGoogleUser: incomingUser.isGoogleUser,
      isOwner,
      isAdmin: isOwner || roleInfo.role === 'Admin' || roleInfo.role === 'Super Admin',
      status: incomingUser.status || 'online',
      customStatus: incomingUser.customStatus,
      role: isOwner ? 'Super Admin' : roleInfo.role,
      roleColor: isOwner ? '#F59E0B' : roleInfo.roleColor,
      lastSeen: Date.now(),
    };

    if (existingIndex >= 0) {
      this.membersCache[existingIndex] = memberObj;
    } else {
      this.membersCache.push(memberObj);
    }

    this.emit({ type: 'user_status', data: { members: this.membersCache } });
  }

  public publishOffline() {
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          `${MQTT_TOPIC_PRESENCE_PREFIX}${this.currentSessionId}`,
          JSON.stringify({
            data: { type: 'offline', userId: this.currentUser.id, sessionId: this.currentSessionId, timestamp: Date.now() },
          }),
          { retain: true, qos: 1 }
        );
      } catch {}
    }
  }

  private publishPresence() {
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `${MQTT_TOPIC_PRESENCE_PREFIX}${this.currentSessionId}`,
        JSON.stringify({
          data: { user: this.currentUser, sessionId: this.currentSessionId, timestamp: Date.now() },
        }),
        { retain: true, qos: 1 }
      );
    }
  }

  private mergeHistory(incomingMsgs: ChatMessage[]) {
    if (!Array.isArray(incomingMsgs) || incomingMsgs.length === 0) return;
    let hasNew = false;
    const FAKE_MOCK_IDS = new Set(['pastor_david', 'sister_sarah', 'brother_marcus', 'sister_hannah']);
    const map = new Map<string, ChatMessage>();
    this.messagesCache.forEach((m) => {
      if (m && m.id && !this.deletedMessageIds.has(m.id) && !FAKE_MOCK_IDS.has(m.senderId)) {
        map.set(m.id, m);
      }
    });

    incomingMsgs.forEach((m) => {
      if (m && m.id && m.text && !this.deletedMessageIds.has(m.id) && !FAKE_MOCK_IDS.has(m.senderId)) {
        const existing = map.get(m.id);
        if (!existing) {
          map.set(m.id, m);
          hasNew = true;
        } else if (JSON.stringify(existing.reactions) !== JSON.stringify(m.reactions) || existing.pinned !== m.pinned) {
          map.set(m.id, { ...existing, ...m });
          hasNew = true;
        }
      }
    });

    if (hasNew) {
      this.messagesCache = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
      this.saveCaches();
      this.emit({ type: 'sync_all', data: this.messagesCache });
    }
  }

  public subscribe(listener: DiscordEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: { type: string; data: any }) {
    this.listeners.forEach((l) => {
      try { l(event); } catch {}
    });
  }

  public setCurrentUser(user: Partial<ChatUser>) {
    const effectiveGoogle = Boolean(user.isGoogleUser ?? this.currentUser.isGoogleUser);
    const effectiveEmail = (user.email ?? this.currentUser.email)?.toLowerCase().trim();
    const isOwner = effectiveGoogle && effectiveEmail === SUPER_ADMIN_EMAIL.toLowerCase();
    this.currentUser = {
      ...this.currentUser,
      ...user,
      isOwner,
      isAdmin: isOwner || user.isAdmin,
      role: isOwner ? 'Super Admin' : (user.role || this.currentUser.role),
      roleColor: isOwner ? '#F59E0B' : (user.roleColor || this.currentUser.roleColor),
    };
    this.saveCaches();
    this.publishPresence();
    try {
      this.broadcastChannel?.postMessage({
        type: 'user_status',
        data: { user: this.currentUser },
      });
    } catch {}
  }

  public getMessages(channelId: string): ChatMessage[] {
    return this.messagesCache
      .filter((m) => m.channelId === channelId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // Direct Message Channels (1-on-1)
  public getOrCreateDMChannel(targetMember: ActiveChatMember): ChatChannel {
    const dmChannelId = `dm_${[this.currentUser.id, targetMember.id].sort().join('_')}`;
    let existingDM = this.dmChannelsCache.find((d) => d.id === dmChannelId);

    if (!existingDM) {
      existingDM = {
        id: dmChannelId,
        name: targetMember.name,
        topic: `Direct message with @${targetMember.name}`,
        type: 'dm',
        emoji: '💬',
        isPrivate: true,
        dmRecipient: targetMember,
        createdAt: Date.now(),
      };
      this.dmChannelsCache.push(existingDM);
      this.saveCaches();
    }
    return existingDM;
  }

  // Create Server (Super Admin & Authorized users)
  public createServer(payload: { name: string; emoji: string; description: string }): DiscordServer {
    const serverId = `server_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newServer: DiscordServer = {
      id: serverId,
      name: payload.name.trim(),
      emoji: payload.emoji.trim() || '⛪',
      description: payload.description.trim() || 'Fellowship community server',
      bannerGradient: 'from-amber-900/60 via-slate-900 to-zinc-950',
      creatorId: this.currentUser.id,
      isOwnerCreated: this.currentUser.isOwner,
      categories: [
        {
          id: `cat_${serverId}_general`,
          name: 'CHANNELS',
          channelIds: [`chan_${serverId}_general`],
        },
      ],
    };

    const initialChannel: ChatChannel = {
      id: `chan_${serverId}_general`,
      serverId: serverId,
      name: 'general-chat',
      topic: `Welcome to ${newServer.name}!`,
      type: 'text',
      emoji: '🕊️',
      createdAt: Date.now(),
    };

    this.serversCache.push(newServer);
    this.channelsCache.push(initialChannel);
    this.saveCaches();

    // Broadcast server & channel creation to other clients
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_STRUCTURE,
        JSON.stringify({ type: 'server_created', data: newServer })
      );
      this.mqttClient.publish(
        MQTT_TOPIC_STRUCTURE,
        JSON.stringify({ type: 'channel_created', data: initialChannel })
      );
    }

    this.broadcastCloud('server_created', newServer);
    this.broadcastCloud('channel_created', initialChannel);

    this.emit({ type: 'server_created', data: newServer });
    return newServer;
  }

  // Create Channel
  public createChannel(payload: {
    serverId: string;
    name: string;
    topic: string;
    type: 'text' | 'voice' | 'announcement';
  }): ChatChannel {
    const channelId = `chan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newChan: ChatChannel = {
      id: channelId,
      serverId: payload.serverId,
      name: payload.name.toLowerCase().replace(/\s+/g, '-'),
      topic: payload.topic,
      type: payload.type,
      emoji: payload.type === 'voice' ? '🔊' : payload.type === 'announcement' ? '📢' : '💬',
      createdAt: Date.now(),
    };

    this.channelsCache.push(newChan);
    const srv = this.serversCache.find((s) => s.id === payload.serverId);
    if (srv && srv.categories.length > 0) {
      srv.categories[0].channelIds.push(channelId);
    }
    this.saveCaches();

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_STRUCTURE,
        JSON.stringify({ type: 'channel_created', data: newChan })
      );
    }

    this.broadcastCloud('channel_created', newChan);

    this.emit({ type: 'channel_created', data: newChan });
    return newChan;
  }

  // Assign Role to any member (Super Admin / Admin only)
  public assignMemberRole(memberId: string, roleName: string, roleColor: string) {
    this.roleOverrides[memberId] = { role: roleName, roleColor };
    const mem = this.membersCache.find((m) => m.id === memberId);
    if (mem) {
      mem.role = roleName;
      mem.roleColor = roleColor;
    }
    if (this.currentUser.id === memberId) {
      this.currentUser.role = roleName;
      this.currentUser.roleColor = roleColor;
    }
    this.saveCaches();

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_MODERATION,
        JSON.stringify({
          type: 'role_assigned',
          data: { memberId, role: roleName, roleColor },
        }),
        { qos: 1 }
      );
    }

    this.broadcastCloud('role_assigned', { memberId, role: roleName, roleColor });

    this.emit({ type: 'role_assigned', data: { memberId, role: roleName, roleColor } });
  }

  // Send Message - Sub-50ms Instant 1-on-1 or Channel Delivery
  public async sendMessage(payload: {
    channelId: string;
    serverId?: string;
    recipientId?: string;
    text: string;
    replyTo?: ChatMessage['replyTo'];
    attachment?: ChatMessage['attachment'];
    embed?: ChatMessage['embed'];
  }): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: ChatMessage = {
      id: messageId,
      channelId: payload.channelId,
      serverId: payload.serverId,
      recipientId: payload.recipientId,
      text: payload.text.trim(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderPhoto: this.currentUser.photoURL || undefined,
      senderEmail: this.currentUser.email || undefined,
      senderRole: this.currentUser.role || 'Believer',
      senderRoleColor: this.currentUser.roleColor || '#10B981',
      isGoogleUser: this.currentUser.isGoogleUser,
      createdAt: Date.now(),
      reactions: {},
      replyTo: payload.replyTo,
      attachment: payload.attachment,
      embed: payload.embed,
    };
    (newMsg as any).senderSessionId = this.currentSessionId;

    // 1. Optimistic Local Update & Broadcast
    this.handleIncomingPayload('message', newMsg, true);

    // 2. Publish to MQTT WebSocket Network & retain channel history for other devices
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'message', data: newMsg, sessionId: this.currentSessionId }),
          { qos: 1 }
        );

        const channelMsgs = this.messagesCache
          .filter((m) => m.channelId === payload.channelId)
          .slice(-80);
        this.mqttClient.publish(
          `${MQTT_TOPIC_CHANNEL_PREFIX}${payload.channelId}`,
          JSON.stringify(channelMsgs),
          { retain: true, qos: 1 }
        );
      } catch {}
    }

    // 3. Publish to Universal Cloud Relay (ntfy.sh) on port 443
    this.broadcastCloud('message', newMsg);

    // 4. Persist to server API if backend server is running
    try {
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      }).catch(() => {});
    } catch {}

    return newMsg;
  }

  // Toggle emoji reaction
  public async toggleReaction(messageId: string, emoji: string) {
    const msg = this.messagesCache.find((m) => m.id === messageId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    const userList = currentReactions[emoji] || [];
    const myName = this.currentUser.name;

    if (userList.includes(myName)) {
      currentReactions[emoji] = userList.filter((u) => u !== myName);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...userList, myName];
    }

    const payload = { messageId, reactions: currentReactions };
    this.handleIncomingPayload('reaction', payload, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'reaction', data: payload }),
          { qos: 1 }
        );
        if (msg.channelId) {
          const channelMsgs = this.messagesCache.filter((m) => m.channelId === msg.channelId).slice(-80);
          this.mqttClient.publish(`${MQTT_TOPIC_CHANNEL_PREFIX}${msg.channelId}`, JSON.stringify(channelMsgs), { retain: true, qos: 1 });
        }
      } catch {}
    }

    this.broadcastCloud('reaction', payload);

    try {
      fetch('/api/chat/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, userName: myName })
      }).catch(() => {});
    } catch {}
  }

  // Pin / Unpin
  public async togglePin(messageId: string) {
    const msg = this.messagesCache.find((m) => m.id === messageId);
    if (!msg) return;
    const newPinned = !msg.pinned;
    const payload = { messageId, pinned: newPinned };
    this.handleIncomingPayload('pin_message', payload, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'pin_message', data: payload }),
          { qos: 1 }
        );
        if (msg.channelId) {
          const channelMsgs = this.messagesCache.filter((m) => m.channelId === msg.channelId).slice(-80);
          this.mqttClient.publish(`${MQTT_TOPIC_CHANNEL_PREFIX}${msg.channelId}`, JSON.stringify(channelMsgs), { retain: true, qos: 1 });
        }
      } catch {}
    }

    this.broadcastCloud('pin_message', payload);
  }

  // Delete message forever
  public async deleteMessage(messageId: string) {
    if (!messageId) return;
    this.deletedMessageIds.add(messageId);
    const msg = this.messagesCache.find((m) => m.id === messageId);
    const channelId = msg?.channelId;
    const payload = { messageId, channelId };
    this.handleIncomingPayload('delete_message', payload, true);

    // 1. Delete permanently on backend server
    try {
      fetch(`/api/chat/messages/${encodeURIComponent(messageId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    // 2. Publish to MQTT WebSocket Network
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'delete_message', data: payload }),
          { qos: 1 }
        );
        if (channelId) {
          const channelMsgs = this.messagesCache.filter((m) => m.channelId === channelId && !this.deletedMessageIds.has(m.id)).slice(-80);
          this.mqttClient.publish(`${MQTT_TOPIC_CHANNEL_PREFIX}${channelId}`, JSON.stringify(channelMsgs), { retain: true, qos: 1 });
        }
      } catch {}
    }

    // 3. Broadcast to Universal Cloud Relay
    this.broadcastCloud('delete_message', payload);
  }

  // Ban Member from Fellowship (Super Admin only)
  public banMember(memberId: string, reason: string = 'Violation of community fellowship rules') {
    const mem = this.membersCache.find((m) => m.id === memberId);
    const memberName = mem?.name || 'User';
    const memberEmail = mem?.email || null;

    const data = {
      memberId,
      name: memberName,
      email: memberEmail,
      reason,
      bannedAt: Date.now(),
      bannedBy: 'Owner (aw03102008@gmail.com)',
    };

    this.handleIncomingPayload('ban_member', data, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'ban_member', data }),
          { qos: 1 }
        );
        this.mqttClient.publish(
          MQTT_TOPIC_MODERATION,
          JSON.stringify({ type: 'ban_member', data }),
          { qos: 1 }
        );
      } catch {}
    }

    this.broadcastCloud('ban_member', data);
  }

  // Unban Member (Super Admin only)
  public unbanMember(memberId: string) {
    const data = { memberId };
    this.handleIncomingPayload('unban_member', data, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'unban_member', data }),
          { qos: 1 }
        );
        this.mqttClient.publish(
          MQTT_TOPIC_MODERATION,
          JSON.stringify({ type: 'unban_member', data }),
          { qos: 1 }
        );
      } catch {}
    }

    this.broadcastCloud('unban_member', data);
  }

  // Kick Member from server
  public kickMember(memberId: string, reason: string = 'Kicked by Server Owner') {
    const data = { memberId, reason };
    this.handleIncomingPayload('kick_member', data, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'kick_member', data }),
          { qos: 1 }
        );
        this.mqttClient.publish(
          MQTT_TOPIC_MODERATION,
          JSON.stringify({ type: 'kick_member', data }),
          { qos: 1 }
        );
      } catch {}
    }

    this.broadcastCloud('kick_member', data);
  }

  // Timeout / Mute Member
  public timeoutMember(memberId: string, durationMinutes: number) {
    const mutedUntil = Date.now() + durationMinutes * 60 * 1000;
    const data = { memberId, mutedUntil };
    this.handleIncomingPayload('timeout_member', data, true);

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'timeout_member', data }),
          { qos: 1 }
        );
        this.mqttClient.publish(
          MQTT_TOPIC_MODERATION,
          JSON.stringify({ type: 'timeout_member', data }),
          { qos: 1 }
        );
      } catch {}
    }

    this.broadcastCloud('timeout_member', data);
  }

  // Purge all messages by a specific user forever
  public purgeUserMessages(userId: string) {
    const data = { userId };
    this.handleIncomingPayload('purge_user_messages', data, true);

    // Call backend server to delete all messages by this user
    try {
      fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    } catch {}

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'purge_user_messages', data }),
          { qos: 1 }
        );
        this.mqttClient.publish(
          MQTT_TOPIC_MODERATION,
          JSON.stringify({ type: 'purge_user_messages', data }),
          { qos: 1 }
        );
      } catch {}
    }

    this.broadcastCloud('purge_user_messages', data);
  }

  // Purge all chat messages across the system forever (Super Admin only)
  public purgeAllMessages() {
    this.messagesCache.forEach(m => this.deletedMessageIds.add(m.id));
    this.messagesCache = [];
    this.saveCaches();
    this.emit({ type: 'purge_all', data: [] });

    // Delete permanently on backend server
    try {
      fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purgeAll: true }),
      }).catch(() => {});
    } catch {}

    try {
      this.broadcastChannel?.postMessage({ type: 'purge_all', data: [] });
    } catch {}

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'purge_all', data: {} })
        );
      } catch {}
    }

    this.broadcastCloud('purge_all', {});
  }

  // Clear all messages in a specific channel forever
  public async clearChannelMessages(channelId: string) {
    if (!channelId) return;
    const toDelete = this.messagesCache.filter(m => m.channelId === channelId);
    toDelete.forEach(m => this.deletedMessageIds.add(m.id));
    this.messagesCache = this.messagesCache.filter(m => m.channelId !== channelId);
    this.saveCaches();
    this.emit({ type: 'purge_channel', data: { channelId } });
    this.emit({ type: 'sync_all', data: this.messagesCache });

    try {
      fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      }).catch(() => {});
    } catch {}

    const payload = { channelId };
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'purge_channel', data: payload }),
          { qos: 1 }
        );
        this.mqttClient.publish(`${MQTT_TOPIC_CHANNEL_PREFIX}${channelId}`, JSON.stringify([]), { retain: true, qos: 1 });
      } catch {}
    }
    this.broadcastCloud('purge_channel', payload);
  }

  // Close or delete a 1-on-1 DM channel and all its chats forever
  public async closeOrDeleteDM(dmId: string) {
    if (!dmId) return;
    await this.clearChannelMessages(dmId);
    this.dmChannelsCache = this.dmChannelsCache.filter(d => d.id !== dmId);
    this.saveCaches();
    this.emit({ type: 'dms_updated', data: this.dmChannelsCache });
  }

  public sendTyping(channelId: string, isTyping: boolean) {
    const payload = {
      channelId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      isTyping,
      timestamp: Date.now(),
    };

    try {
      this.broadcastChannel?.postMessage({ type: 'typing', data: payload });
    } catch {}

    if (this.mqttClient && this.mqttClient.connected) {
      try {
        this.mqttClient.publish(
          MQTT_TOPIC_MESSAGES,
          JSON.stringify({ type: 'typing', data: payload })
        );
      } catch {}
    }

    try {
      fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, userName: this.currentUser.name, isTyping })
      }).catch(() => {});
    } catch {}
  }
}

export const discordChatService = new DiscordChatService();
