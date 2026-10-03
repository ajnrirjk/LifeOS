import { ChatMessage, ChatChannel, ChatUser } from '../types/chat';

type ChatEventListener = (event: { type: string; data: any }) => void;

class ChatService {
  private eventSource: EventSource | null = null;
  private listeners: Set<ChatEventListener> = new Set();
  private isConnecting = false;
  private pollInterval: any = null;

  constructor() {
    this.connectSSE();
    // Background polling fallback every 4 seconds to guarantee sync
    this.pollInterval = setInterval(() => {
      this.listeners.forEach(cb => cb({ type: 'poll_tick', data: Date.now() }));
    }, 4000);
  }

  // Connect to real-time Server-Sent Events
  private connectSSE() {
    if (this.eventSource || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const es = new EventSource('/api/chat/stream');
      this.eventSource = es;

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
        // Reconnect after 3 seconds
        setTimeout(() => this.connectSSE(), 3000);
      };

      es.onopen = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
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
