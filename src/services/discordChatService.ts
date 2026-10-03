import mqtt, { MqttClient } from 'mqtt';
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
    lastMessage: 'Welcome to Fellowship! Real-time across all devices like iMessage — no login required!',
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
    id: 'msg_seed_1',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Welcome everyone to Fellowship Chat! 🕊️\n\n"Let us consider how to stir up one another to love and good works, not neglecting to meet together... but encouraging one another." — **Hebrews 10:24-25**',
    senderId: 'pastor_david',
    senderName: 'Pastor David',
    senderRole: 'Pastor',
    senderRoleColor: '#F59E0B',
    isGoogleUser: true,
    createdAt: Date.now() - 3600000 * 5,
    reactions: { '🙏': ['Pastor David', 'Sister Sarah'], '❤️': ['Brother Marcus', 'Sister Sarah'] },
    embed: {
      title: '📖 Welcome to Fellowship Hub',
      description: 'Real-time text messaging across all devices (phones, computers, tablets) with zero login required. You can also connect your Google account anytime!',
      color: '#10B981',
      author: 'Fellowship Ministry',
      footer: 'Grace and Peace be with you all',
    }
  },
  {
    id: 'msg_seed_2',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Glory to God! The real-time messaging is super fast now. Text on your phone or computer and it pops up instantly! ✨',
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

const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC_MESSAGES = 'lifeos/fellowship/v5/messages';
const MQTT_TOPIC_PRESENCE = 'lifeos/fellowship/v5/presence';
const MQTT_TOPIC_SYNC = 'lifeos/fellowship/v5/sync';

type DiscordEventListener = (event: { type: string; data: any }) => void;

class DiscordChatService {
  private mqttClient: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<DiscordEventListener> = new Set();
  public isConnectedToBroker = false;

  public currentUser: ChatUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: 'Believer in Christ',
    discriminator: String(Math.floor(1000 + Math.random() * 9000)),
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
    this.initMqttRealtime();
  }

  private initCaches() {
    try {
      const savedUser = localStorage.getItem('lifeos_discord_user_v5');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch {}

    try {
      const savedMsgs = localStorage.getItem('lifeos_discord_messages_v5');
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
  }

  private saveCaches() {
    try {
      localStorage.setItem('lifeos_discord_messages_v5', JSON.stringify(this.messagesCache));
      localStorage.setItem('lifeos_discord_user_v5', JSON.stringify(this.currentUser));
    } catch {}
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_discord_sync_v5');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type) {
            this.handleIncomingPayload(e.data.type, e.data.data, false);
          }
        };
      } catch {}
    }
  }

  // Real-Time Cross-Device WebSocket Messaging (Sub-50ms iMessage Speed)
  private initMqttRealtime() {
    if (typeof window === 'undefined') return;

    try {
      const clientId = `lifeos_client_${this.currentUser.id}_${Math.random().toString(36).substring(2, 6)}`;
      const client = mqtt.connect(MQTT_BROKER_URL, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000,
        keepalive: 30,
      });

      this.mqttClient = client;

      client.on('connect', () => {
        this.isConnectedToBroker = true;

        // Subscribe to real-time messages and sync channels
        client.subscribe([MQTT_TOPIC_MESSAGES, MQTT_TOPIC_PRESENCE, MQTT_TOPIC_SYNC], (err) => {
          if (!err) {
            // Broadcast presence and request sync
            this.publishPresence();
            this.requestSync();
          }
        });
      });

      client.on('message', (topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString());
          if (!parsed || !parsed.type) return;

          if (topic === MQTT_TOPIC_MESSAGES) {
            this.handleIncomingPayload(parsed.type, parsed.data, false);
          } else if (topic === MQTT_TOPIC_PRESENCE) {
            this.handlePresenceUpdate(parsed.data);
          } else if (topic === MQTT_TOPIC_SYNC) {
            if (parsed.type === 'sync_request' && parsed.fromId !== this.currentUser.id) {
              // Share our cached messages to the newly joined device
              this.respondToSync(parsed.fromId);
            } else if (parsed.type === 'sync_response' && parsed.targetId === this.currentUser.id) {
              this.mergeHistory(parsed.messages);
            }
          }
        } catch {}
      });

      client.on('reconnect', () => {
        this.isConnectedToBroker = true;
      });

      client.on('close', () => {
        this.isConnectedToBroker = false;
      });
    } catch (err) {
      console.warn('MQTT connection fallback:', err);
    }
  }

  private handleIncomingPayload(type: string, data: any, shouldBroadcastLocal = true) {
    if (type === 'message') {
      const msg: ChatMessage = data;
      if (!msg || !msg.id || !msg.text) return;
      if (!this.messagesCache.some((m) => m.id === msg.id)) {
        this.messagesCache.push(msg);
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
      this.messagesCache = this.messagesCache.filter((m) => m.id !== messageId);
      this.saveCaches();
      this.emit({ type: 'delete_message', data });
    } else if (type === 'typing') {
      this.emit({ type: 'typing', data });
    }

    if (shouldBroadcastLocal) {
      try {
        this.broadcastChannel?.postMessage({ type, data });
      } catch {}
    }
  }

  private handlePresenceUpdate(data: any) {
    if (!data || !data.user || data.user.id === this.currentUser.id) return;
    const incomingUser: ChatUser = data.user;
    
    // Update or add to members list
    const existingIndex = this.membersCache.findIndex((m) => m.id === incomingUser.id);
    const memberObj: ActiveChatMember = {
      id: incomingUser.id,
      name: incomingUser.name,
      discriminator: incomingUser.discriminator,
      photoURL: incomingUser.photoURL,
      email: incomingUser.email,
      isGoogleUser: incomingUser.isGoogleUser,
      status: incomingUser.status || 'online',
      customStatus: incomingUser.customStatus,
      role: incomingUser.role || 'Believer',
      roleColor: incomingUser.roleColor || '#10B981',
      lastSeen: Date.now(),
    };

    if (existingIndex >= 0) {
      this.membersCache[existingIndex] = memberObj;
    } else {
      this.membersCache.push(memberObj);
    }

    this.emit({ type: 'user_status', data: { members: this.membersCache } });
  }

  private publishPresence() {
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_PRESENCE,
        JSON.stringify({
          type: 'presence',
          data: { user: this.currentUser, timestamp: Date.now() },
        })
      );
    }
  }

  private requestSync() {
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_SYNC,
        JSON.stringify({
          type: 'sync_request',
          fromId: this.currentUser.id,
        })
      );
    }
  }

  private respondToSync(targetId: string) {
    if (this.mqttClient && this.mqttClient.connected && this.messagesCache.length > 0) {
      this.mqttClient.publish(
        MQTT_TOPIC_SYNC,
        JSON.stringify({
          type: 'sync_response',
          targetId,
          messages: this.messagesCache.slice(-50),
        })
      );
    }
  }

  private mergeHistory(incomingMsgs: ChatMessage[]) {
    if (!Array.isArray(incomingMsgs)) return;
    let hasNew = false;
    const map = new Map<string, ChatMessage>();
    this.messagesCache.forEach((m) => map.set(m.id, m));

    incomingMsgs.forEach((m) => {
      if (m && m.id && m.text && !map.has(m.id)) {
        map.set(m.id, m);
        hasNew = true;
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
    this.currentUser = {
      ...this.currentUser,
      ...user,
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

  // Send Message - Sub-50ms Cross-Device Instant Text Message
  public async sendMessage(payload: {
    channelId: string;
    serverId: string;
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

    // 1. Optimistic Local Update & Broadcast
    this.handleIncomingPayload('message', newMsg, true);

    // 2. Publish to MQTT WebSocket Network for All Other Devices / Phones / Incognito
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_MESSAGES,
        JSON.stringify({ type: 'message', data: newMsg })
      );
    }

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
      this.mqttClient.publish(
        MQTT_TOPIC_MESSAGES,
        JSON.stringify({ type: 'reaction', data: payload })
      );
    }
  }

  // Pin / Unpin
  public async togglePin(messageId: string) {
    const msg = this.messagesCache.find((m) => m.id === messageId);
    if (!msg) return;
    const newPinned = !msg.pinned;
    const payload = { messageId, pinned: newPinned };
    this.handleIncomingPayload('pin_message', payload, true);

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_MESSAGES,
        JSON.stringify({ type: 'pin_message', data: payload })
      );
    }
  }

  // Delete message
  public async deleteMessage(messageId: string) {
    const payload = { messageId };
    this.handleIncomingPayload('delete_message', payload, true);

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_MESSAGES,
        JSON.stringify({ type: 'delete_message', data: payload })
      );
    }
  }

  public sendTyping(channelId: string, isTyping: boolean) {
    const payload = {
      channelId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      isTyping,
      timestamp: Date.now(),
    };

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        MQTT_TOPIC_MESSAGES,
        JSON.stringify({ type: 'typing', data: payload })
      );
    }
  }
}

export const discordChatService = new DiscordChatService();
