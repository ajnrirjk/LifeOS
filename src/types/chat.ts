export type UserStatusType = 'online' | 'idle' | 'dnd' | 'offline';

export const SUPER_ADMIN_EMAIL = 'aw03102008@gmail.com';

export interface ChatRole {
  name: string;
  color: string;
  icon: string;
  canManageServers?: boolean;
  canManageChannels?: boolean;
  canManageRoles?: boolean;
  canDeleteMessages?: boolean;
}

export const PRESET_ROLES: ChatRole[] = [
  { name: 'Super Admin', color: '#F59E0B', icon: '👑', canManageServers: true, canManageChannels: true, canManageRoles: true, canDeleteMessages: true },
  { name: 'Admin', color: '#EF4444', icon: '🛡️', canManageServers: false, canManageChannels: true, canManageRoles: false, canDeleteMessages: true },
  { name: 'Pastor', color: '#8B5CF6', icon: '✝️', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: true },
  { name: 'Moderator', color: '#3B82F6', icon: '⚡', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: true },
  { name: 'Deacon', color: '#10B981', icon: '📜', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: false },
  { name: 'Worship Leader', color: '#EC4899', icon: '🎵', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: false },
  { name: 'Believer', color: '#14B8A6', icon: '🕊️', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: false },
  { name: 'Member', color: '#9CA3AF', icon: '👤', canManageServers: false, canManageChannels: false, canManageRoles: false, canDeleteMessages: false },
];

export interface ChatUser {
  id: string;
  name: string;
  discriminator?: string; // e.g. "0001" or "#1234"
  email?: string | null;
  photoURL?: string | null;
  isGoogleUser: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
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
  recipientId?: string; // For 1-on-1 Direct Messages
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
  type?: 'text' | 'voice' | 'announcement' | 'dm';
  emoji?: string;
  categoryId?: string;
  isPrivate?: boolean;
  dmRecipient?: ActiveChatMember;
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
  creatorId?: string;
  isOwnerCreated?: boolean;
  unread?: boolean;
}

export interface ActiveChatMember {
  id: string;
  name: string;
  discriminator?: string;
  photoURL?: string | null;
  email?: string | null;
  isGoogleUser: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  status?: UserStatusType;
  customStatus?: string;
  role?: string;
  roleColor?: string;
  lastSeen: number;
}
