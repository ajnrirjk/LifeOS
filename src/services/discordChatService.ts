import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ChatMessage,
  ChatChannel,
  DiscordServer,
  ChatUser,
  ActiveChatMember,
  UserStatusType
} from '../types/chat';

// Active Firebase Configuration
const activeFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApps()[0];
export const db = getFirestore(app);

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
    lastMessage: 'Welcome to Fellowship Chat! Real-time across all your devices like iMessage.',
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
      description: 'A Discord & iMessage-styled sanctuary built right into LifeOS. Messages sync across all devices instantly in real-time.',
      color: '#10B981',
      author: 'Fellowship Ministry',
      footer: 'Grace and Peace be with you all',
    }
  },
  {
    id: 'msg_seed_2',
    channelId: 'general',
    serverId: 'server_fellowship',
    text: 'Glory to God! The real-time Firestore sync is live! Messages appear across phone & computer instantly.',
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

type DiscordEventListener = (event: { type: string; data: any }) => void;

class DiscordChatService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<DiscordEventListener> = new Set();
  private unsubscribeFirestore: (() => void) | null = null;

  public currentUser: ChatUser = {
    id: 'guest_user_' + Math.random().toString(36).substring(2, 7),
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
    this.initFirestoreRealtimeListener();
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
  }

  private saveCaches() {
    try {
      localStorage.setItem('lifeos_discord_messages', JSON.stringify(this.messagesCache));
      localStorage.setItem('lifeos_discord_user', JSON.stringify(this.currentUser));
    } catch {}
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('lifeos_discord_sync_v4');
        this.broadcastChannel.onmessage = (e) => {
          if (e.data && e.data.type) {
            this.handleLocalEvent(e.data.type, e.data.data);
          }
        };
      } catch {}
    }
  }

  // Real-Time Sub-second Firestore Sync (Exactly like iMessage)
  private initFirestoreRealtimeListener() {
    try {
      const messagesRef = collection(db, 'fellowship_messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(300));

      this.unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const map = new Map<string, ChatMessage>();
          // Pre-populate with default seeds
          DEFAULT_SEED_MESSAGES.forEach((m) => map.set(m.id, m));
          this.messagesCache.forEach((m) => map.set(m.id, m));

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data() as ChatMessage;
            if (data && data.text) {
              map.set(docSnap.id, {
                ...data,
                id: docSnap.id,
              });
            }
          });

          this.messagesCache = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
          this.saveCaches();
          this.emit({ type: 'sync_all', data: this.messagesCache });
        },
        (error) => {
          console.warn('Firestore realtime fallback to local:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore initialization fallback:', err);
    }
  }

  private handleLocalEvent(type: string, data: any) {
    if (type === 'message') {
      const msg: ChatMessage = data;
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
    } else if (type === 'typing' || type === 'user_status') {
      this.emit({ type, data });
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
    this.broadcastChannel?.postMessage({ type: 'user_status', data: { user: this.currentUser } });
  }

  public getMessages(channelId: string): ChatMessage[] {
    return this.messagesCache
      .filter((m) => m.channelId === channelId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // Send Message - Writes to Firestore and Broadcasts (iMessage real-time speed)
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

    // 1. Local Optimistic Update & Cross-tab Broadcast
    if (!this.messagesCache.some((m) => m.id === newMsg.id)) {
      this.messagesCache.push(newMsg);
      this.saveCaches();
      this.emit({ type: 'message', data: newMsg });
    }
    try {
      this.broadcastChannel?.postMessage({ type: 'message', data: newMsg });
    } catch {}

    // 2. Persist to Firebase Firestore (Real-time iMessage push to all other devices)
    try {
      const cleanData: Record<string, any> = {
        channelId: newMsg.channelId,
        serverId: newMsg.serverId,
        text: newMsg.text,
        senderId: newMsg.senderId,
        senderName: newMsg.senderName,
        isGoogleUser: !!newMsg.isGoogleUser,
        createdAt: newMsg.createdAt,
        reactions: newMsg.reactions || {},
      };
      if (newMsg.senderPhoto) cleanData.senderPhoto = newMsg.senderPhoto;
      if (newMsg.senderEmail) cleanData.senderEmail = newMsg.senderEmail;
      if (newMsg.senderRole) cleanData.senderRole = newMsg.senderRole;
      if (newMsg.senderRoleColor) cleanData.senderRoleColor = newMsg.senderRoleColor;
      if (newMsg.replyTo) cleanData.replyTo = newMsg.replyTo;
      if (newMsg.attachment) cleanData.attachment = newMsg.attachment;
      if (newMsg.embed) cleanData.embed = newMsg.embed;

      await setDoc(doc(db, 'fellowship_messages', messageId), cleanData);
    } catch (err) {
      console.warn('Firestore setDoc failed:', err);
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

    msg.reactions = currentReactions;
    this.saveCaches();
    this.emit({ type: 'reaction', data: { messageId, reactions: currentReactions } });
    try {
      this.broadcastChannel?.postMessage({
        type: 'reaction',
        data: { messageId, reactions: currentReactions },
      });
    } catch {}

    try {
      await updateDoc(doc(db, 'fellowship_messages', messageId), {
        reactions: currentReactions,
      });
    } catch {}
  }

  // Pin / Unpin
  public async togglePin(messageId: string) {
    const msg = this.messagesCache.find((m) => m.id === messageId);
    if (!msg) return;
    const newPinned = !msg.pinned;
    msg.pinned = newPinned;
    this.saveCaches();
    this.emit({ type: 'pin_message', data: { messageId, pinned: newPinned } });
    try {
      this.broadcastChannel?.postMessage({
        type: 'pin_message',
        data: { messageId, pinned: newPinned },
      });
    } catch {}

    try {
      await updateDoc(doc(db, 'fellowship_messages', messageId), {
        pinned: newPinned,
      });
    } catch {}
  }

  // Delete message
  public async deleteMessage(messageId: string) {
    this.messagesCache = this.messagesCache.filter((m) => m.id !== messageId);
    this.saveCaches();
    this.emit({ type: 'delete_message', data: { messageId } });
    try {
      this.broadcastChannel?.postMessage({ type: 'delete_message', data: { messageId } });
    } catch {}

    try {
      await deleteDoc(doc(db, 'fellowship_messages', messageId));
    } catch {}
  }

  public sendTyping(channelId: string, isTyping: boolean) {
    this.broadcastChannel?.postMessage({
      type: 'typing',
      data: {
        channelId,
        userName: this.currentUser.name,
        isTyping,
        timestamp: Date.now(),
      },
    });
  }
}

export const discordChatService = new DiscordChatService();
