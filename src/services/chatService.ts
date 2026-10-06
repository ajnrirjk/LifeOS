import { ChatMessage, ChatChannel, ChatUser, ActiveChatMember } from '../types/chat';
import { discordChatService, DEFAULT_CHANNELS as DISCORD_CHANNELS, DEFAULT_SEED_MESSAGES as DISCORD_SEEDS } from './discordChatService';

export const DEFAULT_CHANNELS: ChatChannel[] = DISCORD_CHANNELS;
export const DEFAULT_SEED_MESSAGES: ChatMessage[] = DISCORD_SEEDS;

type ChatEventListener = (event: { type: string; data: any }) => void;

export class ChatService {
  public currentUser: ChatUser | null = null;

  constructor() {
    this.currentUser = discordChatService.currentUser;
  }

  public subscribe(listener: ChatEventListener): () => void {
    return discordChatService.subscribe(listener);
  }

  public setCurrentUser(user: ChatUser) {
    this.currentUser = user;
    discordChatService.setCurrentUser(user);
  }

  public async getChannels(): Promise<ChatChannel[]> {
    return discordChatService.channelsCache;
  }

  public async createChannel(name: string, topic: string, emoji: string, creatorId?: string): Promise<ChatChannel> {
    return discordChatService.createChannel({
      serverId: 'server_fellowship',
      name,
      topic,
      type: 'text'
    });
  }

  public async getMessages(channelId: string): Promise<ChatMessage[]> {
    return discordChatService.getMessages(channelId);
  }

  public async getPresence(): Promise<{ activeUsers: number; members: ActiveChatMember[] }> {
    return {
      activeUsers: Math.max(1, discordChatService.membersCache.length),
      members: discordChatService.membersCache
    };
  }

  public async sendMessage(payload: {
    channelId: string;
    text: string;
    senderId?: string;
    senderName?: string;
    senderPhoto?: string;
    senderEmail?: string;
    isGoogleUser?: boolean;
    attachment?: ChatMessage['attachment'];
  }): Promise<ChatMessage> {
    if (payload.senderName && (!discordChatService.currentUser.name || discordChatService.currentUser.name === 'Believer in Christ')) {
      discordChatService.setCurrentUser({
        name: payload.senderName,
        photoURL: payload.senderPhoto,
        isGoogleUser: !!payload.isGoogleUser
      });
    }

    return discordChatService.sendMessage({
      channelId: payload.channelId,
      serverId: 'server_fellowship',
      text: payload.text,
      attachment: payload.attachment
    });
  }

  public async toggleReaction(messageId: string, emoji: string, _userName?: string): Promise<void> {
    return discordChatService.toggleReaction(messageId, emoji);
  }

  public async sendTyping(channelId: string, _userName: string, isTyping: boolean): Promise<void> {
    discordChatService.sendTyping(channelId, isTyping);
  }

  public async fetchHistoryFromCloudRelay(): Promise<void> {
    return discordChatService.fetchHistoryFromCloudRelay();
  }
}

export const chatService = new ChatService();
