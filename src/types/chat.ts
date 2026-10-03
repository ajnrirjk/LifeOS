export type UserStatusType = 'online' | 'idle' | 'dnd' | 'offline';

export interface ChatUser {
  id: string;
  name: string;
  discriminator?: string; // e.g. "0001" or "#1234"
  email?: string | null;
  photoURL?: string | null;
  isGoogleUser: boolean;
  status?: UserStatusType;
  customStatus?: string;
  role?: string;
  roleColor?: string;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color?: string;
  author?: string;
  footer?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  serverId?: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  senderEmail?: string | null;
  senderRole?: string;
  senderRoleColor?: string;
  isGoogleUser: boolean;
  createdAt: number;
  editedAt?: number;
  reactions: Record<string, string[]>; // emoji -> array of user names
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  pinned?: boolean;
  embed?: DiscordEmbed;
  attachment?: {
    type: 'verse' | 'sermon_note' | 'image';
    title: string;
    content: string;
    reference?: string;
    url?: string;
  };
}

export interface DiscordCategory {
  id: string;
  name: string;
  channelIds: string[];
}

export interface ChatChannel {
  id: string;
  serverId?: string;
  name: string;
  topic: string;
  type?: 'text' | 'voice' | 'announcement';
  emoji?: string;
  categoryId?: string;
  isPrivate?: boolean;
  creatorId?: string;
  createdAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}

export interface DiscordServer {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
  description: string;
  bannerGradient?: string;
  categories: DiscordCategory[];
  unread?: boolean;
}

export interface ActiveChatMember {
  id: string;
  name: string;
  discriminator?: string;
  photoURL?: string | null;
  email?: string | null;
  isGoogleUser: boolean;
  status?: UserStatusType;
  customStatus?: string;
  role?: string;
  roleColor?: string;
  lastSeen: number;
}
