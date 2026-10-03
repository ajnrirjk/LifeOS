import {
  ChatMessage,
  ChatChannel,
  DiscordServer,
  ChatUser,
  ActiveChatMember,
  UserStatusType
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
  // Fellowship Global Channels
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
    lastMessage: 'Welcome to Discord-styled Fellowship! Real-time across all tabs & devices.',
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
    topic: 'Instant sync sandbox — test multi-tab & mobile messaging here',
    type: 'text',
    emoji: '⚡',
    createdAt: 1790900000000,
    lastMessage: 'Send a message here from your phone or incognito tab to test live sync!',
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
    id: 'msg_seed_1',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Welcome everyone to the new Discord-styled Fellowship Community! 🕊️\n\n"Let us consider how to stir up one another to love and good works, not neglecting to meet together... but encouraging one another." — **Hebrews 10:24-25**',
    senderId: 'pastor_david',
    senderName: 'Pastor David',
    senderRole: 'Pastor',
    senderRoleColor: '#F59E0B',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 5,
    reactions: { '🙏': ['Pastor David', 'Sister Sarah'], '❤️': ['Brother Marcus', 'Sister Sarah'] },
    embed: {
      title: '📖 Welcome to Fellowship Hub',
      description: 'A Discord-styled sanctuary built right into LifeOS. Chat in real time, share Bible verses with rich embeds, post church notes, and pray together across all your devices.',
      color: '#10B981',
      author: 'Fellowship Ministry',
      footer: 'Grace and Peace be with you all',
    }
  },
  {
    id: 'msg_seed_2',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Glory to God! The new interface feels so fast and clean. Love having separate study rooms and prayer chains here. ✨',
    senderId: 'sister_sarah',
    senderName: 'Sister Sarah',
    senderRole: 'Moderator',
    senderRoleColor: '#8B5CF6',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 3,
    reactions: { '🙌': ['Pastor David', 'Sister Sarah', 'Brother Marcus'] },
  },
  {
    id: 'msg_seed_3',
    channelId: 'prayer-chain',
    serverId: 'server_fellowship',
    text: 'Please pray for my mother as she undergoes surgery this week. Standing firm on Jehovah Rapha for full restoration! 🙏',
    senderId: 'brother_marcus',
    senderName: 'Deacon Marcus',
    senderRole: 'Deacon',
    senderRoleColor: '#3B82F6',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 2,
    reactions: { '🙏': ['Pastor David', 'Sister Sarah'] },
    attachment: {
      type: 'verse',
      title: 'Jeremiah 30:17',
      content: '“For I will restore health to you, and your wounds I will heal, declares the LORD.”',
      reference: 'Jeremiah 30:17 (ESV)'
    }
  }
];

export const DEFAULT_MEMBERS: ActiveChatMember[] = [
  {
    id: 'pastor_david',
    name: 'Pastor David',
    discriminator: '0001',
    isGoogleUser: true,
    status: 'online',
    customStatus: 'Preaching Christ Crucified ✝️',
    role: 'Pastor',
    roleColor: '#F59E0B',
    lastSeen: Date.now(),
  },
  {
    id: 'sister_sarah',
    name: 'Sister Sarah',
    discriminator: '0002',
    isGoogleUser: true,
    status: 'online',
    customStatus: 'Rejoicing always in the Lord! ✨',
    role: 'Moderator',
    roleColor: '#8B5CF6',
    lastSeen: Date.now(),
  },
  {
    id: 'brother_marcus',
    name: 'Deacon Marcus',
    discriminator: '0003',
    isGoogleUser: true,
    status: 'idle',
    customStatus: 'In prayer room 🙏',
    role: 'Deacon',
    roleColor: '#3B82F6',
    lastSeen: Date.now() - 120000,
  },
  {
    id: 'sister_hannah',
    name: 'Hannah Grace',
    discriminator: '0004',
    isGoogleUser: true,
    status: 'offline',
    customStatus: 'Reading Psalms 23',
    role: 'Worship Leader',
    roleColor: '#EC4899',
    lastSeen: Date.now() - 86400000,
  }
];

const CLOUD_RELAY_TOPIC = 'lifeos_discord_v3';
const CLOUD_RELAY_URL = `https://ntfy.sh/${CLOUD_RELAY_TOPIC}`;

type DiscordEventListener = (event: { type: string; data: any }) => void;

class DiscordChatService {
  private cloudEventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<DiscordEventListener> = new Set();
  private syncInterval: any = null;
  public currentUser: ChatUser = {
    id: 'guest_user',
    name: 'Believer in Christ',
    discriminator: '7777',
    isGoogleUser: false,
    status: 'online',
    role: 'Believer',
    roleColor: '#10B981',
  };

  public serversCache: DiscordServer[] = DEFAULT_SERVERS;
  public channelsCache: ChatChannel[] = DEFAULT_CHANNELS;
  public messagesCache: ChatMessage[] = [];
  public membersCache: ActiveChatMember[] = DEFAULT_MEMBERS;

  constructor() {
    this.initCaches();
    this.initBroadcastChannel();
    this.initCloudRelay();
    this.fetchCloudHistory();
    this.initVisibilitySync();

    // Regular rapid background sync interval (2s)
    this.syncInterval = setInterval(() => {
      this.fetchCloudHistory();
    }, 2000);
  }

  private initCaches() {
    try {
      const savedUser = localStorage.getItem('lifeos_discord_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch {}

    try {
      const savedMsgs = localStorage.getItem('lifeos_discord_messages');
      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messagesCache = parsed;
        } else {
          this.messagesCache = DEFAULT_SEED_MESSAGES;
        }
      } else {
        this.messagesCache = DEFAULT_SEED_MESSAGES;
      }
    } catch {
      this.messagesCache = DEFAULT_SEED_MESSAGES;
    }

    try {
      const savedChans = localStorage.getItem('lifeos_discord_channels');
      if (savedChans) {
        const parsed = JSON.parse(savedChans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.channelsCache = parsed;
        }
      }
    } catch {}
  }

  private saveCaches() {
    try {
      localStorage.setItem('lifeos_discord_messages', JSON.stringify(this.messagesCache));
      localStorage.setItem('lifeos_discord_channels', JSON.stringify(this.channelsCache));
      localStorage.setItem('lifeos_discord_user', JSON.stringify(this.currentUser));
    } catch {}
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_discord_sync_v3');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type) {
            this.handleIncoming(e.data.type, e.data.data, false);
          }
        };
      } catch {}
    }
  }

  private initVisibilitySync() {
    if (typeof window === 'undefined') return;
    window.addEventListener('focus', () => this.fetchCloudHistory());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fetchCloudHistory();
      }
    });
  }

  // Fetch past messages stored in the cloud relay
  public async fetchCloudHistory() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch(`${CLOUD_RELAY_URL}/json?poll=1&since=all`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      let hasNew = false;

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

            if (payload && payload.type && payload.data) {
              if (payload.type === 'message') {
                const msg: ChatMessage = payload.data;
                if (msg && msg.id && msg.text) {
                  if (!this.messagesCache.some(m => m.id === msg.id)) {
                    this.messagesCache.push(msg);
                    hasNew = true;
                    // Update channel preview
                    const chan = this.channelsCache.find(c => c.id === msg.channelId);
                    if (chan && (!chan.lastMessageTime || msg.createdAt > chan.lastMessageTime)) {
                      chan.lastMessage = msg.text;
                      chan.lastMessageTime = msg.createdAt;
                    }
                  }
                }
              } else if (payload.type === 'reaction') {
                const { messageId, reactions } = payload.data;
                this.messagesCache = this.messagesCache.map(m =>
                  m.id === messageId ? { ...m, reactions } : m
                );
                hasNew = true;
              } else if (payload.type === 'delete_message') {
                const { messageId } = payload.data;
                this.messagesCache = this.messagesCache.filter(m => m.id !== messageId);
                hasNew = true;
              } else if (payload.type === 'pin_message') {
                const { messageId, pinned } = payload.data;
                this.messagesCache = this.messagesCache.map(m =>
                  m.id === messageId ? { ...m, pinned } : m
                );
                hasNew = true;
              }
            }
          }
        } catch {}
      }

      if (hasNew) {
        this.saveCaches();
        this.emit({ type: 'sync_all', data: this.messagesCache });
      }
    } catch {}
  }

  private initCloudRelay() {
    if (typeof window === 'undefined') return;
    try {
      if (this.cloudEventSource) {
        try { this.cloudEventSource.close(); } catch {}
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
              this.handleIncoming(payload.type, payload.data, false);
            }
          }
        } catch {}
      };

      sse.onerror = () => {
        this.fetchCloudHistory();
      };
    } catch {}
  }

  private handleIncoming(type: string, data: any, shouldBroadcast = true) {
    if (type === 'message') {
      const msg: ChatMessage = data;
      if (!msg || !msg.id || !msg.text) return;
      const exists = this.messagesCache.some(m => m.id === msg.id);
      if (!exists) {
        this.messagesCache.push(msg);
        // Update channel last message
        const chan = this.channelsCache.find(c => c.id === msg.channelId);
        if (chan) {
          chan.lastMessage = msg.text;
          chan.lastMessageTime = msg.createdAt;
        }
        this.saveCaches();
        this.emit({ type: 'message', data: msg });
      }
    } else if (type === 'reaction') {
      const { messageId, reactions } = data;
      this.messagesCache = this.messagesCache.map(m =>
        m.id === messageId ? { ...m, reactions } : m
      );
      this.saveCaches();
      this.emit({ type: 'reaction', data });
    } else if (type === 'delete_message') {
      const { messageId } = data;
      this.messagesCache = this.messagesCache.filter(m => m.id !== messageId);
      this.saveCaches();
      this.emit({ type: 'delete_message', data });
    } else if (type === 'pin_message') {
      const { messageId, pinned } = data;
      this.messagesCache = this.messagesCache.map(m =>
        m.id === messageId ? { ...m, pinned } : m
      );
      this.saveCaches();
      this.emit({ type: 'pin_message', data });
    } else if (type === 'typing' || type === 'presence' || type === 'user_status') {
      this.emit({ type, data });
    }

    if (shouldBroadcast) {
      // 1. Broadcast locally to other tabs
      try {
        this.broadcastChannel?.postMessage({ type, data });
      } catch {}

      // 2. Broadcast persistent events to cloud relay
      if (type === 'message' || type === 'reaction' || type === 'delete_message' || type === 'pin_message') {
        try {
          fetch(CLOUD_RELAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data }),
          }).catch(() => {});
        } catch {}
      }
    }
  }

  public subscribe(listener: DiscordEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: { type: string; data: any }) {
    this.listeners.forEach(l => {
      try { l(event); } catch {}
    });
  }

  // User & Profile management
  public setCurrentUser(user: Partial<ChatUser>) {
    this.currentUser = {
      ...this.currentUser,
      ...user,
    };
    this.saveCaches();
    this.handleIncoming('user_status', { user: this.currentUser }, true);
  }

  public setUserStatus(status: UserStatusType, customStatus?: string) {
    this.currentUser.status = status;
    if (customStatus !== undefined) {
      this.currentUser.customStatus = customStatus;
    }
    this.saveCaches();
    this.handleIncoming('user_status', { user: this.currentUser }, true);
  }

  // Get messages for a channel
  public getMessages(channelId: string): ChatMessage[] {
    return this.messagesCache
      .filter(m => m.channelId === channelId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // Send a message (with reply, embed, verse, or attachments)
  public async sendMessage(payload: {
    channelId: string;
    serverId: string;
    text: string;
    replyTo?: ChatMessage['replyTo'];
    attachment?: ChatMessage['attachment'];
    embed?: ChatMessage['embed'];
  }): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: payload.channelId,
      serverId: payload.serverId,
      text: payload.text.trim(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderPhoto: this.currentUser.photoURL,
      senderEmail: this.currentUser.email,
      senderRole: this.currentUser.role || 'Believer',
      senderRoleColor: this.currentUser.roleColor || '#10B981',
      isGoogleUser: this.currentUser.isGoogleUser,
      createdAt: Date.now(),
      reactions: {},
      replyTo: payload.replyTo,
      attachment: payload.attachment,
      embed: payload.embed,
    };

    this.handleIncoming('message', newMsg, true);
    return newMsg;
  }

  // Toggle emoji reaction on a message
  public toggleReaction(messageId: string, emoji: string) {
    const msg = this.messagesCache.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    const userList = currentReactions[emoji] || [];
    const myName = this.currentUser.name;

    if (userList.includes(myName)) {
      currentReactions[emoji] = userList.filter(u => u !== myName);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...userList, myName];
    }

    const update = { messageId, reactions: currentReactions, channelId: msg.channelId };
    this.handleIncoming('reaction', update, true);
  }

  // Pin / Unpin message
  public togglePin(messageId: string) {
    const msg = this.messagesCache.find(m => m.id === messageId);
    if (!msg) return;
    const newPinned = !msg.pinned;
    this.handleIncoming('pin_message', { messageId, pinned: newPinned, channelId: msg.channelId }, true);
  }

  // Delete message
  public deleteMessage(messageId: string) {
    const msg = this.messagesCache.find(m => m.id === messageId);
    if (!msg) return;
    this.handleIncoming('delete_message', { messageId, channelId: msg.channelId }, true);
  }

  // Typing broadcast
  public sendTyping(channelId: string, isTyping: boolean) {
    this.handleIncoming('typing', {
      channelId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      isTyping,
      timestamp: Date.now()
    }, true);
  }
}

export const discordChatService = new DiscordChatService();
