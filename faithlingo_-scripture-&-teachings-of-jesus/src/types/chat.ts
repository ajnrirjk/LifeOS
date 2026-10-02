export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  isGoogleUser: boolean;
  status?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderEmail?: string;
  isGoogleUser: boolean;
  createdAt: number;
  reactions: Record<string, string[]>; // emoji -> array of user names
  attachment?: {
    type: 'verse' | 'sermon_note';
    title: string;
    content: string;
    reference?: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  topic: string;
  emoji: string;
  isPrivate?: boolean;
  creatorId?: string;
  createdAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
}
