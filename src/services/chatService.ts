import { ChatMessage, ChatChannel, ChatUser, ActiveChatMember } from '../types/chat';

type ChatEventListener = (event: { type: string; data: any }) => void;

class ChatService {
  private eventSource: EventSource | null = null;
  private listeners: Set<ChatEventListener> = new Set();
  private isConnecting = false;
  private pollInterval: any = null;
  private heartbeatInterval: any = null;
  private currentUser: ChatUser | null = null;

  constructor() {
    // Background polling fallback every 2.5 seconds for instant multi-device sync
    this.pollInterval = setInterval(() => {
      this.listeners.forEach(cb => cb({ type: 'poll_tick', data: Date.now() }));
    }, 2500);
  }

  // Update current user info and re-establish SSE if needed
  setCurrentUser(user: ChatUser) {
    const changed = !this.currentUser || this.currentUser.id !== user.id || this.currentUser.name !== user.name;
    this.currentUser = user;
    if (changed) {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.connectSSE();
    }
  }

  // Connect to real-time Server-Sent Events
  public connectSSE() {
    if (this.eventSource || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const params = new URLSearchParams();
      if (this.currentUser) {
        params.set('userId', this.currentUser.id);
        params.set('userName', this.currentUser.name);
        if (this.currentUser.photoURL) params.set('userPhoto', this.currentUser.photoURL);
        if (this.currentUser.email) params.set('userEmail', this.currentUser.email);
        params.set('isGoogleUser', this.currentUser.isGoogleUser ? 'true' : 'false');
      }

      const url = `/api/chat/stream${params.toString() ? `?${params.toString()}` : ''}`;
      const es = new EventSource(url);
      this.eventSource = es;

      es.addEventListener('connected', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'presence', data });
        } catch {}
      });

      es.addEventListener('message', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'message', data });
        } catch {}
      });

      es.addEventListener('reaction', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'reaction', data });
        } catch {}
      });

      es.addEventListener('new_channel', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'new_channel', data });
        } catch {}
      });

      es.addEventListener('presence', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'presence', data });
        } catch {}
      });

      es.addEventListener('typing', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.emit({ type: 'typing', data });
        } catch {}
      });

      es.onerror = () => {
        es.close();
        this.eventSource = null;
        this.isConnecting = false;
        // Reconnect after 2 seconds
        setTimeout(() => this.connectSSE(), 2000);
      };

      es.onopen = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
    }

    // Heartbeat to keep presence active
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        if (this.currentUser) {
          fetch('/api/chat/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: this.currentUser.id,
              userName: this.currentUser.name,
              photoURL: this.currentUser.photoURL,
              email: this.currentUser.email,
              isGoogleUser: this.currentUser.isGoogleUser
            })
          }).catch(() => {});
        }
      }, 15000);
    }
  }

  subscribe(listener: ChatEventListener): () => void {
    this.listeners.add(listener);
    this.connectSSE();
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

  // Fetch channels list
  async getChannels(): Promise<ChatChannel[]> {
    const res = await fetch('/api/chat/channels');
    if (!res.ok) throw new Error('Failed to fetch channels');
    return res.json();
  }

  // Create a new channel / group chat
  async createChannel(name: string, topic: string, emoji: string, creatorId?: string): Promise<ChatChannel> {
    const res = await fetch('/api/chat/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, topic, emoji, creatorId }),
    });
    if (!res.ok) throw new Error('Failed to create channel');
    return res.json();
  }

  // Fetch messages for a channel
  async getMessages(channelId: string, since: number = 0): Promise<ChatMessage[]> {
    const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(channelId)}&since=${since}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  }

  // Fetch active presence and members list
  async getPresence(): Promise<{ activeUsers: number; members: ActiveChatMember[] }> {
    try {
      const res = await fetch('/api/chat/presence');
      if (res.ok) return res.json();
    } catch {}
    return { activeUsers: 1, members: [] };
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
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }

  // Toggle reaction
  async toggleReaction(messageId: string, emoji: string, userName: string): Promise<void> {
    await fetch('/api/chat/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, emoji, userName }),
    });
  }

  // Send typing indicator
  async sendTyping(channelId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, userName, isTyping }),
      });
    } catch {}
  }
}

export const chatService = new ChatService();
