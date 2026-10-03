import { ChatMessage, ChatChannel, ChatUser, ActiveChatMember } from '../types/chat';

export const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'general-fellowship',
    topic: 'Welcome, daily encouragement, and community fellowship in Christ',
    emoji: '🕊️',
    createdAt: 1790900000000,
    lastMessage: 'Welcome to Fellowship Chat! Let us encourage one another.',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'sermon-discussion',
    name: 'sermon-discussion',
    topic: 'Discussing Sunday sermons, preacher insights, and notes',
    emoji: '📖',
    createdAt: 1790900000000,
    lastMessage: 'Discuss Sunday sermons and insights together.',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'prayer-chain',
    name: 'prayer-chain',
    topic: 'Post live prayer requests and celebrate answered prayers together',
    emoji: '🙏',
    createdAt: 1790900000000,
    lastMessage: 'Post prayer requests and pray for one another.',
    lastMessageTime: 1790900000000,
  },
  {
    id: 'bible-study',
    name: 'scripture-deep-dive',
    topic: 'Daily Bible questions, Greek/Hebrew word study, and verses',
    emoji: '📜',
    createdAt: 1790900000000,
    lastMessage: 'Dig deeper into God’s living Word.',
    lastMessageTime: 1790900000000,
  },
];

export const DEFAULT_SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_seed_1',
    channelId: 'general',
    text: 'Welcome beloved brothers and sisters to Fellowship Chat! "Let us consider how to stir up one another to love and good works, not neglecting to meet together... but encouraging one another." — Hebrews 10:24-25 🕊️',
    senderId: 'pastor_david',
    senderName: 'Pastor David',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 4,
    reactions: { '🙏': ['Pastor David'], '❤️': ['Sister Sarah'] },
  },
  {
    id: 'msg_seed_2',
    channelId: 'general',
    text: 'Amen Pastor! Blessed to connect with everyone here across all devices and communities. May God’s peace fill everyone today! ✨',
    senderId: 'sister_sarah',
    senderName: 'Sister Sarah',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 2,
    reactions: { '🙌': ['Pastor David', 'Brother Marcus'] },
  },
  {
    id: 'msg_seed_3',
    channelId: 'prayer-chain',
    text: 'Please pray for my mother who is undergoing surgery this Thursday. Believing God for full healing and peace for our family! 🙏',
    senderId: 'brother_marcus',
    senderName: 'Deacon Marcus',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 3,
    reactions: { '🙏': ['Pastor David', 'Sister Sarah'] },
  }
];

const CLOUD_RELAY_TOPIC = 'lifeos_fellowship_v2';
const CLOUD_RELAY_URL = `https://ntfy.sh/${CLOUD_RELAY_TOPIC}`;

type ChatEventListener = (event: { type: string; data: any }) => void;

class ChatService {
  private localEventSource: EventSource | null = null;
  private cloudEventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<ChatEventListener> = new Set();
  private pollInterval: any = null;
  private heartbeatInterval: any = null;
  private currentUser: ChatUser | null = null;

  // In-memory + localStorage Cache
  private channelsCache: ChatChannel[] = [];
  private messagesCache: ChatMessage[] = [];

  constructor() {
    this.initCaches();
    this.initBroadcastChannel();
    this.initCloudRelay();
    this.initLocalSSE();

    // Background sync check every 3.5 seconds
    this.pollInterval = setInterval(() => {
      this.listeners.forEach(cb => cb({ type: 'poll_tick', data: Date.now() }));
    }, 3500);
  }

  private initCaches() {
    try {
      const savedChannels = localStorage.getItem('lifeos_fellowship_channels_cache');
      if (savedChannels) {
        this.channelsCache = JSON.parse(savedChannels);
      } else {
        this.channelsCache = DEFAULT_CHANNELS;
      }
    } catch {
      this.channelsCache = DEFAULT_CHANNELS;
    }

    try {
      const savedMsgs = localStorage.getItem('lifeos_fellowship_messages_cache');
      if (savedMsgs) {
        this.messagesCache = JSON.parse(savedMsgs);
      } else {
        this.messagesCache = DEFAULT_SEED_MESSAGES;
      }
    } catch {
      this.messagesCache = DEFAULT_SEED_MESSAGES;
    }
  }

  private saveCaches() {
    try {
      localStorage.setItem('lifeos_fellowship_channels_cache', JSON.stringify(this.channelsCache));
      localStorage.setItem('lifeos_fellowship_messages_cache', JSON.stringify(this.messagesCache));
    } catch {}
  }

  // Cross-Tab instant sync using BroadcastChannel
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_fellowship_sync');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type) {
            this.handleIncomingEvent(e.data.type, e.data.data, false);
          }
        };
      } catch {}
    }
  }

  // Universal Cloud Relay using ntfy.sh for Cross-Device & Vercel sync
  private initCloudRelay() {
    if (typeof window === 'undefined') return;

    try {
      const sse = new EventSource(`${CLOUD_RELAY_URL}/sse`);
      this.cloudEventSource = sse;

      sse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            const payload = JSON.parse(raw.message);
            if (payload && payload.type && payload.data) {
              this.handleIncomingEvent(payload.type, payload.data, false);
            }
          }
        } catch {}
      };

      sse.onerror = () => {
        // Auto-reconnect after 4s
        if (this.cloudEventSource) {
          this.cloudEventSource.close();
          this.cloudEventSource = null;
        }
        setTimeout(() => this.initCloudRelay(), 4000);
      };
    } catch {}
  }

  // Local SSE if running on server.ts
  private initLocalSSE() {
    if (typeof window === 'undefined') return;
    try {
      const sse = new EventSource('/api/chat/stream');
      this.localEventSource = sse;

      sse.addEventListener('message', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleIncomingEvent('message', data, false);
        } catch {}
      });

      sse.addEventListener('reaction', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleIncomingEvent('reaction', data, false);
        } catch {}
      });

      sse.addEventListener('new_channel', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleIncomingEvent('new_channel', data, false);
        } catch {}
      });

      sse.addEventListener('presence', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'presence', data });
        } catch {}
      });

      sse.onerror = () => {
        if (this.localEventSource) {
          this.localEventSource.close();
          this.localEventSource = null;
        }
      };
    } catch {}
  }

  private handleIncomingEvent(type: string, data: any, shouldBroadcast = true) {
    if (type === 'message') {
      const msg: ChatMessage = data;
      const exists = this.messagesCache.some(m => m.id === msg.id);
      if (!exists) {
        this.messagesCache.push(msg);
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
    } else if (type === 'new_channel') {
      const chan: ChatChannel = data;
      const exists = this.channelsCache.some(c => c.id === chan.id);
      if (!exists) {
        this.channelsCache.push(chan);
        this.saveCaches();
        this.emit({ type: 'new_channel', data: chan });
      }
    } else if (type === 'typing' || type === 'presence') {
      this.emit({ type, data });
    }

    if (shouldBroadcast) {
      // Broadcast to other tabs
      try {
        this.broadcastChannel?.postMessage({ type, data });
      } catch {}

      // Broadcast to cloud relay for other devices
      try {
        fetch(CLOUD_RELAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: CLOUD_RELAY_TOPIC,
            message: JSON.stringify({ type, data })
          })
        }).catch(() => {});
      } catch {}
    }
  }

  setCurrentUser(user: ChatUser) {
    this.currentUser = user;
    // Broadcast user presence to cloud relay
    this.handleIncomingEvent('presence', {
      activeUsers: 2,
      members: [{
        id: user.id,
        name: user.name,
        photoURL: user.photoURL,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
        lastSeen: Date.now()
      }]
    }, true);
  }

  subscribe(listener: ChatEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: { type: string; data: any }) {
    this.listeners.forEach(l => {
      try {
        l(event);
      } catch {}
    });
  }

  // Fetch channels list with bulletproof fallback
  async getChannels(): Promise<ChatChannel[]> {
    try {
      const res = await fetch('/api/chat/channels');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverChannels = await res.json();
        if (Array.isArray(serverChannels) && serverChannels.length > 0) {
          // Merge unique channels
          const map = new Map<string, ChatChannel>();
          this.channelsCache.forEach(c => map.set(c.id, c));
          serverChannels.forEach((c: ChatChannel) => map.set(c.id, c));
          this.channelsCache = Array.from(map.values());
          this.saveCaches();
          return this.channelsCache;
        }
      }
    } catch {}

    return this.channelsCache.length > 0 ? this.channelsCache : DEFAULT_CHANNELS;
  }

  // Create a new channel / group chat
  async createChannel(name: string, topic: string, emoji: string, creatorId?: string): Promise<ChatChannel> {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '') || 'new-group';
    const newChan: ChatChannel = {
      id: `chan_${Date.now()}_${cleanName.slice(0, 15)}`,
      name: cleanName,
      topic: topic || 'Believers gathering in fellowship',
      emoji: emoji || '🕊️',
      creatorId,
      createdAt: Date.now(),
      lastMessage: 'Group chat created! Start the conversation.',
      lastMessageTime: Date.now()
    };

    // 1. Optimistic local addition & cloud broadcast
    this.handleIncomingEvent('new_channel', newChan, true);

    // 2. Try server endpoint in background
    try {
      fetch('/api/chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChan),
      }).catch(() => {});
    } catch {}

    return newChan;
  }

  // Fetch messages for a channel
  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(channelId)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const serverMsgs = await res.json();
        if (Array.isArray(serverMsgs)) {
          // Merge into cache
          const map = new Map<string, ChatMessage>();
          this.messagesCache.forEach(m => map.set(m.id, m));
          serverMsgs.forEach((m: ChatMessage) => map.set(m.id, m));
          this.messagesCache = Array.from(map.values());
          this.saveCaches();
        }
      }
    } catch {}

    return this.messagesCache.filter(m => m.channelId === channelId);
  }

  // Fetch active presence and members list
  async getPresence(): Promise<{ activeUsers: number; members: ActiveChatMember[] }> {
    try {
      const res = await fetch('/api/chat/presence');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {}

    const selfMember: ActiveChatMember = {
      id: this.currentUser?.id || 'guest',
      name: this.currentUser?.name || 'Believer in Christ',
      photoURL: this.currentUser?.photoURL,
      email: this.currentUser?.email,
      isGoogleUser: !!this.currentUser?.isGoogleUser,
      lastSeen: Date.now()
    };

    return { activeUsers: 2, members: [selfMember] };
  }

  // Send a message
  async sendMessage(payload: {
    channelId: string;
    text: string;
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    senderEmail?: string;
    isGoogleUser: boolean;
    attachment?: ChatMessage['attachment'];
  }): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: payload.channelId,
      text: payload.text.trim(),
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderPhoto: payload.senderPhoto,
      senderEmail: payload.senderEmail,
      isGoogleUser: payload.isGoogleUser,
      createdAt: Date.now(),
      reactions: {},
      attachment: payload.attachment,
    };

    // 1. Optimistic addition, local cache & cloud broadcast
    this.handleIncomingEvent('message', newMsg, true);

    // 2. Send to server in background if available
    try {
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      }).catch(() => {});
    } catch {}

    return newMsg;
  }

  // Toggle reaction
  async toggleReaction(messageId: string, emoji: string, userName: string): Promise<void> {
    const msg = this.messagesCache.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    const userList = currentReactions[emoji] || [];

    if (userList.includes(userName)) {
      currentReactions[emoji] = userList.filter(u => u !== userName);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...userList, userName];
    }

    const update = { messageId, reactions: currentReactions, channelId: msg.channelId };
    this.handleIncomingEvent('reaction', update, true);

    try {
      fetch('/api/chat/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, userName }),
      }).catch(() => {});
    } catch {}
  }

  // Send typing indicator
  async sendTyping(channelId: string, userName: string, isTyping: boolean): Promise<void> {
    this.handleIncomingEvent('typing', { channelId, userName, isTyping, timestamp: Date.now() }, true);
    try {
      fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, userName, isTyping }),
      }).catch(() => {});
    } catch {}
  }
}

export const chatService = new ChatService();
