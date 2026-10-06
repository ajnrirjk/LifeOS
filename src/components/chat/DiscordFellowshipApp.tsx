import React, { useState, useEffect, useRef } from 'react';
import {
  Hash,
  Volume2,
  Plus,
  Bell,
  Pin,
  Users,
  Smile,
  Send,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Trash2,
  CornerUpLeft,
  X,
  Radio,
  PhoneOff,
  LogOut,
  Sparkles,
  Check,
  Menu,
  MessageSquare,
  Crown,
  PlusCircle,
  AtSign,
  LayoutDashboard,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import {
  discordChatService,
  DEFAULT_SERVERS,
  DEFAULT_CHANNELS
} from '../../services/discordChatService';
import {
  ChatMessage,
  ChatChannel,
  DiscordServer,
  ActiveChatMember,
  UserStatusType,
  SUPER_ADMIN_EMAIL,
  PRESET_ROLES
} from '../../types/chat';
import { googleDriveService } from '../../services/googleDriveService';
import { sounds } from '../../services/soundEffects';
import { AdminDashboardView } from './AdminDashboardView';
import { FellowshipImageModal } from './FellowshipImageModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { ChatMessageMedia } from './ChatMessageMedia';

interface DiscordFellowshipAppProps {
  onClose?: () => void;
}

export const DiscordFellowshipApp: React.FC<DiscordFellowshipAppProps> = ({ onClose }) => {
  const { launchApp } = useLifeOS();
  const { settings, isAuthorizedAdmin } = useSettings();
  // Navigation State
  const [activeServerId, setActiveServerId] = useState<string>('server_fellowship');
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [isDMView, setIsDMView] = useState<boolean>(false);
  const [activeDMRecipient, setActiveDMRecipient] = useState<ActiveChatMember | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // Unread message counters per channel / DM
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('lifeos_discord_unread_v6');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Responsive Drawer State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState<boolean>(false);
  const [showDesktopMembers, setShowDesktopMembers] = useState<boolean>(true);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState<boolean>(false);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showVerseModal, setShowVerseModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showCreateServerModal, setShowCreateServerModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<ActiveChatMember | null>(null);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title?: string;
    caption?: string;
    verse?: string;
    senderName?: string;
  }>({
    isOpen: false,
    imageUrl: '',
  });

  // Chat & Data State
  const [servers, setServers] = useState<DiscordServer[]>(discordChatService.serversCache);
  const [channels, setChannels] = useState<ChatChannel[]>(discordChatService.channelsCache);
  const [dmChannels, setDMChannels] = useState<ChatChannel[]>(discordChatService.dmChannelsCache);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ActiveChatMember[]>(discordChatService.membersCache);
  const [currentUser, setCurrentUser] = useState(discordChatService.currentUser);

  // Input & Reply State
  const [inputText, setInputText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Voice Lounge State
  const [connectedVoiceChannel, setConnectedVoiceChannel] = useState<ChatChannel | null>(null);

  // Creation Forms
  const [newServerName, setNewServerName] = useState('');
  const [newServerEmoji, setNewServerEmoji] = useState('⛪');
  const [newServerDesc, setNewServerDesc] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelTopic, setNewChannelTopic] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'announcement'>('text');

  // Verse Modal Form
  const [verseRef, setVerseRef] = useState('Philippians 4:13');
  const [verseContent, setVerseContent] = useState('“I can do all things through Christ who strengthens me.”');

  // Profile Settings Form
  const [customNameInput, setCustomNameInput] = useState(currentUser.name);
  const [customStatusInput, setCustomStatusInput] = useState(currentUser.customStatus || '');

  // Enforce mandatory Name entry before using fellowship chat
  const [showNameRequiredModal, setShowNameRequiredModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isGoogle = !!localStorage.getItem('lifeos_persistent_google_user');
    const isSaved = localStorage.getItem('lifeos_discord_name_set_v6') === 'true';
    const savedUser = localStorage.getItem('lifeos_discord_user_v6');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name && u.name !== 'Believer in Christ' && u.name.trim().length > 1) {
          return false;
        }
      } catch {}
    }
    try {
      const setts = localStorage.getItem('lifeos_settings_v3');
      if (setts) {
        const p = JSON.parse(setts);
        if (p?.profile?.name && p.profile.name !== 'Believer in Christ' && p.profile.name.trim().length > 1) {
          return false;
        }
      }
    } catch {}
    return !isSaved && !isGoogle;
  });
  const [onboardingName, setOnboardingName] = useState(() => {
    return settings?.profile?.name && settings.profile.name !== 'Believer in Christ'
      ? settings.profile.name
      : '';
  });
  const [onboardingStatus, setOnboardingStatus] = useState('');
  const [onboardingError, setOnboardingError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const isSuperAdmin = Boolean(
    isAuthorizedAdmin ||
    (currentUser.isGoogleUser && currentUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];
  const activeChannel = isDMView
    ? dmChannels.find((d) => d.id === activeChannelId) || {
        id: activeChannelId,
        name: activeDMRecipient?.name || 'Direct Message',
        topic: `1-on-1 conversation with @${activeDMRecipient?.name || 'User'}`,
        type: 'dm' as const,
        createdAt: Date.now(),
      }
    : channels.find((c) => c.id === activeChannelId) || channels[0];

  // Save unread counts
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_discord_unread_v6', JSON.stringify(unreadCounts));
    } catch {}
  }, [unreadCounts]);

  // Sync with Google Auth on Mount
  useEffect(() => {
    const unsubAuth = googleDriveService.initAuth((user) => {
      if (user) {
        const isOwner = Boolean(user.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase());
        const userObj = {
          id: user.uid || user.email || 'google_user',
          name: isOwner ? 'Anthony Williams (Owner)' : (user.displayName || user.email?.split('@')[0] || 'Believer in Christ'),
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          isGoogleUser: true,
          isOwner,
          isAdmin: isOwner,
          role: isOwner ? 'Super Admin' : 'Google Verified',
          roleColor: isOwner ? '#F59E0B' : '#38BDF8',
          status: 'online' as UserStatusType,
        };
        discordChatService.setCurrentUser(userObj);
        setCurrentUser(discordChatService.currentUser);
        setCustomNameInput(userObj.name);
      }
    });

    return () => unsubAuth();
  }, []);

  // Clear unread on channel change
  const selectChannel = (channelId: string, isDM = false, recipient: ActiveChatMember | null = null) => {
    sounds.playTap();
    setActiveChannelId(channelId);
    setIsDMView(isDM);
    if (recipient) setActiveDMRecipient(recipient);
    setShowAdminDashboard(false);
    setIsMobileNavOpen(false);

    // Reset unread count for this channel
    setUnreadCounts((prev) => ({
      ...prev,
      [channelId]: 0,
    }));
  };

  // Subscribe to real-time Discord Chat events
  useEffect(() => {
    setMessages(discordChatService.getMessages(activeChannelId));

    const unsubscribe = discordChatService.subscribe((event) => {
      if (event.type === 'message') {
        const newMsg: ChatMessage = event.data;

        if (newMsg.channelId === activeChannelId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.senderId !== currentUser.id) {
            sounds.playTap();
          }
        } else {
          // Message received in another channel -> play notification sound & increment badge
          if (newMsg.senderId !== currentUser.id) {
            sounds.playMessageNotification();
          }
          setUnreadCounts((prev) => ({
            ...prev,
            [newMsg.channelId]: (prev[newMsg.channelId] || 0) + 1,
          }));
        }

        setChannels([...discordChatService.channelsCache]);
        setDMChannels([...discordChatService.dmChannelsCache]);
      } else if (event.type === 'purge_all') {
        sounds.playPurgeSound();
        setMessages(discordChatService.getMessages(activeChannelId));
        setUnreadCounts({});
      } else if (
        event.type === 'reaction' ||
        event.type === 'pin_message' ||
        event.type === 'delete_message' ||
        event.type === 'sync_all'
      ) {
        setMessages(discordChatService.getMessages(activeChannelId));
        setChannels([...discordChatService.channelsCache]);
        setDMChannels([...discordChatService.dmChannelsCache]);
      } else if (event.type === 'server_created') {
        setServers([...discordChatService.serversCache]);
      } else if (event.type === 'channel_created') {
        setChannels([...discordChatService.channelsCache]);
      } else if (event.type === 'role_assigned') {
        setMembers([...discordChatService.membersCache]);
        setCurrentUser({ ...discordChatService.currentUser });
      } else if (event.type === 'typing') {
        const { channelId, userName, isTyping } = event.data;
        if (channelId === activeChannelId && userName !== currentUser.name) {
          setTypingUsers((prev) => {
            if (isTyping) {
              return prev.includes(userName) ? prev : [...prev, userName];
            } else {
              return prev.filter((u) => u !== userName);
            }
          });
        }
      } else if (event.type === 'user_status') {
        setMembers([...discordChatService.membersCache]);
      }
    });

    return () => unsubscribe();
  }, [activeChannelId, currentUser.id, currentUser.name]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message send (Channel or 1-on-1 DM)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playTap();
    const textToSend = inputText.trim();
    setInputText('');
    const replyTarget = replyingTo
      ? { id: replyingTo.id, senderName: replyingTo.senderName, text: replyingTo.text }
      : undefined;
    setReplyingTo(null);

    discordChatService.sendTyping(activeChannelId, false);

    await discordChatService.sendMessage({
      channelId: activeChannelId,
      serverId: isDMView ? undefined : activeServerId,
      recipientId: isDMView ? activeDMRecipient?.id : undefined,
      text: textToSend,
      replyTo: replyTarget,
    });
  };

  // Start a 1-on-1 Direct Message
  const handleStartDM = (targetMember: ActiveChatMember) => {
    const dmChannel = discordChatService.getOrCreateDMChannel(targetMember);
    selectChannel(dmChannel.id, true, targetMember);
    setDMChannels([...discordChatService.dmChannelsCache]);
    setIsMobileMembersOpen(false);
    setSelectedMember(null);
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    discordChatService.sendTyping(activeChannelId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      discordChatService.sendTyping(activeChannelId, false);
    }, 2000);
  };

  // Create Server
  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    sounds.playTap();

    const created = discordChatService.createServer({
      name: newServerName.trim(),
      emoji: newServerEmoji.trim() || '⛪',
      description: newServerDesc.trim() || 'Fellowship community server',
    });

    setServers([...discordChatService.serversCache]);
    setActiveServerId(created.id);
    const initialChan = discordChatService.channelsCache.find((c) => c.serverId === created.id);
    if (initialChan) selectChannel(initialChan.id, false);
    setShowCreateServerModal(false);
    setNewServerName('');
    setNewServerDesc('');
  };

  // Create Channel
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    sounds.playTap();

    const created = discordChatService.createChannel({
      serverId: activeServerId,
      name: newChannelName.trim(),
      topic: newChannelTopic.trim() || `Channel in ${activeServer.name}`,
      type: newChannelType,
    });

    setChannels([...discordChatService.channelsCache]);
    selectChannel(created.id, false);
    setShowCreateChannelModal(false);
    setNewChannelName('');
    setNewChannelTopic('');
  };

  // Assign Role to member
  const handleAssignRole = (role: typeof PRESET_ROLES[0]) => {
    if (!selectedMember || !isSuperAdmin) return;
    sounds.playTap();

    discordChatService.assignMemberRole(selectedMember.id, role.name, role.color);
    setMembers([...discordChatService.membersCache]);
    setShowRoleModal(false);
  };

  // Share Verse Embed
  const handleSendVerseEmbed = async () => {
    if (!verseRef.trim() || !verseContent.trim()) return;
    sounds.playTap();

    await discordChatService.sendMessage({
      channelId: activeChannelId,
      serverId: isDMView ? undefined : activeServerId,
      recipientId: isDMView ? activeDMRecipient?.id : undefined,
      text: `📜 Shared Scripture: **${verseRef}**`,
      attachment: {
        type: 'verse',
        title: verseRef,
        content: verseContent,
        reference: verseRef,
      },
      embed: {
        title: `📖 ${verseRef}`,
        description: verseContent,
        color: '#F59E0B',
        author: currentUser.name,
        footer: 'Holy Bible (ESV) • Shared in Fellowship',
      },
    });

    setShowVerseModal(false);
  };

  // Share Image Attachment (from Gallery, URL, or upload)
  const handleSendImageAttachment = async (imageData: {
    url: string;
    title: string;
    caption?: string;
    verse?: string;
  }) => {
    sounds.playTap();
    await discordChatService.sendMessage({
      channelId: activeChannelId,
      serverId: isDMView ? undefined : activeServerId,
      recipientId: isDMView ? activeDMRecipient?.id : undefined,
      text: imageData.caption || (imageData.title ? `🖼️ **${imageData.title}**` : '🖼️ Shared an image'),
      attachment: {
        type: 'image',
        title: imageData.title,
        content: imageData.caption || '',
        url: imageData.url,
        caption: imageData.caption,
        verse: imageData.verse,
      },
    });
  };

  // Quick Emoji Reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    sounds.playTap();
    discordChatService.toggleReaction(messageId, emoji);
  };

  // Toggle Category Collapse
  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Voice Lounge Connect / Disconnect
  const handleToggleVoiceChannel = (channel: ChatChannel) => {
    sounds.playTap();
    if (connectedVoiceChannel?.id === channel.id) {
      setConnectedVoiceChannel(null);
    } else {
      setConnectedVoiceChannel(channel);
    }
  };

  // Complete Name onboarding
  const handleCompleteNameOnboarding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = onboardingName.trim() || settings?.profile?.name || 'Believer in Christ';

    const isOwner = Boolean(
      (currentUser.isGoogleUser && currentUser.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) ||
      isAuthorizedAdmin
    );
    const updatedUser = {
      ...currentUser,
      name: cleanName,
      customStatus: onboardingStatus.trim() || currentUser.customStatus || 'Walking in faith 🕊️',
      role: isOwner ? 'Super Admin' : (currentUser.role || 'Believer'),
      roleColor: isOwner ? '#F59E0B' : (currentUser.roleColor || '#10B981'),
    };

    discordChatService.setCurrentUser(updatedUser);
    setCurrentUser(discordChatService.currentUser);
    setCustomNameInput(cleanName);
    setCustomStatusInput(updatedUser.customStatus);
    try {
      localStorage.setItem('lifeos_discord_name_set_v6', 'true');
    } catch {}

    setShowNameRequiredModal(false);
    setOnboardingError('');
    sounds.playVictory();
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    sounds.playTap();
    try {
      const { user } = await googleDriveService.signIn();
      const isOwner = Boolean(user.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase());
      const updatedUser = {
        id: user.uid || user.email || 'google_user',
        name: isOwner ? 'Anthony Williams (Owner)' : (user.displayName || user.email?.split('@')[0] || 'Believer in Christ'),
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        isGoogleUser: true,
        isOwner,
        isAdmin: isOwner,
        role: isOwner ? 'Super Admin' : 'Google Verified',
        roleColor: isOwner ? '#F59E0B' : '#38BDF8',
      };
      discordChatService.setCurrentUser(updatedUser);
      setCurrentUser(discordChatService.currentUser);
      try {
        localStorage.setItem('lifeos_discord_name_set_v6', 'true');
      } catch {}
      setShowSettingsModal(false);
      setShowNameRequiredModal(false);
    } catch (err) {
      console.error('Google Sign-in failed', err);
    }
  };

  // Google Sign-Out
  const handleGoogleSignOut = async () => {
    sounds.playTap();
    await googleDriveService.signOutUser();
    const guestUser = {
      id: `guest_${Math.random().toString(36).substring(2, 7)}`,
      name: 'Believer in Christ',
      isGoogleUser: false,
      isOwner: false,
      isAdmin: false,
      role: 'Believer',
      roleColor: '#10B981',
      status: 'online' as UserStatusType,
    };
    discordChatService.setCurrentUser(guestUser);
    setCurrentUser(discordChatService.currentUser);
    setShowSettingsModal(false);
  };

  // Save Profile Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    discordChatService.setCurrentUser({
      name: customNameInput.trim() || 'Believer in Christ',
      customStatus: customStatusInput.trim(),
    });
    setCurrentUser(discordChatService.currentUser);
    setShowSettingsModal(false);
  };

  // Calculate total unread DMs
  const totalUnreadDMs = dmChannels.reduce((sum, dm) => sum + (unreadCounts[dm.id] || 0), 0);

  return (
    <div className="relative flex h-full w-full bg-[#1e1f22] text-[#dbdee1] font-sans antialiased select-none overflow-hidden rounded-none border-0 shadow-none">
      {/* ========================================================================= */}
      {/* MOBILE OVERLAY BACKDROPS                                                  */}
      {/* ========================================================================= */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
        />
      )}
      {isMobileMembersOpen && (
        <div
          onClick={() => setIsMobileMembersOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* ========================================================================= */}
      {/* 1 & 2. COMBINED SERVER + CHANNEL DRAWER (RESPONSIVE)                      */}
      {/* ========================================================================= */}
      <div
        className={`flex absolute md:relative z-40 h-full transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* 1. LEFTMOST DISCORD SERVER BAR (72px) */}
        <nav className="w-[68px] sm:w-[72px] bg-[#111214] flex flex-col items-center py-3 gap-2 shrink-0 z-20 overflow-y-auto custom-scrollbar">
          {/* Direct Messages Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsDMView(true);
              setShowAdminDashboard(false);
              if (dmChannels.length > 0) {
                selectChannel(dmChannels[0].id, true, dmChannels[0].dmRecipient || null);
              }
            }}
            className={`relative group w-11 h-11 sm:w-12 sm:h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 ${
              isDMView && !showAdminDashboard
                ? 'bg-[#5865F2] text-white rounded-[16px]'
                : 'bg-[#313338] text-[#5865F2] hover:bg-[#5865F2] hover:text-white'
            }`}
            title="Direct Messages (1-on-1)"
          >
            <span
              className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                isDMView && !showAdminDashboard ? 'h-8 sm:h-10' : 'h-0 group-hover:h-5'
              }`}
            />
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />

            {/* Total Unread DMs Badge */}
            {totalUnreadDMs > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#f23f43] text-white text-[9px] font-black leading-none border-2 border-[#111214] shadow-md animate-pulse">
                {totalUnreadDMs > 99 ? '99+' : totalUnreadDMs}
              </span>
            )}
          </button>

          {/* Separator */}
          <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />

          {/* Server Guild Icons */}
          {servers.map((server) => {
            const isActive = !isDMView && !showAdminDashboard && activeServerId === server.id;
            // Calculate unread count for this server
            const serverUnread = channels
              .filter((c) => c.serverId === server.id)
              .reduce((sum, c) => sum + (unreadCounts[c.id] || 0), 0);

            return (
              <button
                key={server.id}
                onClick={() => {
                  sounds.playTap();
                  setIsDMView(false);
                  setShowAdminDashboard(false);
                  setActiveServerId(server.id);
                  const firstChan = channels.find((c) => c.serverId === server.id);
                  if (firstChan) selectChannel(firstChan.id, false);
                }}
                className={`relative group w-11 h-11 sm:w-12 sm:h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center text-lg sm:text-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#23a55a] text-white rounded-[16px] shadow-lg'
                    : 'bg-[#313338] text-stone-200 hover:bg-[#23a55a] hover:text-white'
                }`}
                title={server.name}
              >
                <span
                  className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                    isActive ? 'h-8 sm:h-10' : 'h-0 group-hover:h-5'
                  }`}
                />
                <span>{server.emoji}</span>

                {/* Server Unread Badge */}
                {serverUnread > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#f23f43] text-white text-[9px] font-black leading-none border-2 border-[#111214] shadow-md">
                    {serverUnread > 99 ? '99+' : serverUnread}
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Server Button (Super Admin) */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                sounds.playTap();
                setShowCreateServerModal(true);
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a55a] text-[#23a55a] hover:text-white flex items-center justify-center transition-all group mt-1"
              title="Add a Server (Super Admin)"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
            </button>
          )}

          {/* Super Admin Dashboard Button */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                sounds.playTap();
                setShowAdminDashboard(true);
                setIsMobileNavOpen(false);
              }}
              className={`relative group w-11 h-11 sm:w-12 sm:h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 mt-auto ${
                showAdminDashboard
                  ? 'bg-amber-500 text-white rounded-[16px] shadow-lg'
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white'
              }`}
              title="Super Admin Dashboard (Owner Only)"
            >
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </nav>

        {/* 2. CHANNELS OR DIRECT MESSAGES SIDEBAR */}
        <aside className="w-[230px] sm:w-60 bg-[#2b2d31] flex flex-col shrink-0 border-r border-[#1f2023] z-10">
          {/* Header Banner */}
          {isDMView ? (
            <header className="h-12 px-3 sm:px-4 border-b border-[#1f2023] flex items-center justify-between shadow-sm bg-[#2b2d31]">
              <div className="flex items-center gap-2">
                <AtSign className="w-4 h-4 text-[#5865F2]" />
                <h1 className="font-extrabold text-xs sm:text-sm text-white">Direct Messages</h1>
              </div>
            </header>
          ) : (
            <header
              onClick={() => {
                if (isSuperAdmin) {
                  setShowAdminDashboard(true);
                } else {
                  setShowSettingsModal(true);
                }
              }}
              className="h-12 px-3 sm:px-4 border-b border-[#1f2023] flex items-center justify-between hover:bg-[#35373c] transition-colors cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-base">{activeServer.emoji}</span>
                <h1 className="font-extrabold text-xs sm:text-sm text-white truncate">
                  {activeServer.name}
                </h1>
                {isSuperAdmin && (
                  <span title="You are Super Admin & App Owner">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </header>
          )}

          {/* List Area */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 custom-scrollbar">
            {/* Quick Admin Dashboard Link if Super Admin */}
            {isSuperAdmin && (
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowAdminDashboard(true);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-black transition-all mb-1 ${
                  showAdminDashboard
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[9px] uppercase px-1 rounded bg-black/30">Owner</span>
              </button>
            )}

            {isDMView ? (
              /* Direct Messages List */
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] sm:text-[11px] font-black tracking-wider text-[#949ba4] uppercase flex items-center justify-between">
                  <span>Direct Messages</span>
                  <span className="text-[10px] text-[#5865F2] font-bold">1-on-1</span>
                </div>

                {dmChannels.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#949ba4] italic">
                    No active 1-on-1 chats. Click on any member from the right to start a DM!
                  </div>
                ) : (
                  dmChannels.map((dm) => {
                    const isActive = !showAdminDashboard && activeChannelId === dm.id;
                    const recipient = dm.dmRecipient;
                    const unread = unreadCounts[dm.id] || 0;

                    return (
                      <button
                        key={dm.id}
                        onClick={() => selectChannel(dm.id, true, recipient || null)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[6px] text-xs font-semibold group transition-all ${
                          isActive
                            ? 'bg-[#35373c] text-white font-bold'
                            : unread > 0
                            ? 'text-white font-bold bg-[#35373c]/30'
                            : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {recipient?.name?.charAt(0) || dm.name.charAt(0)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#23a55a] border border-[#2b2d31]" />
                          </div>
                          <span className="truncate">{recipient?.name || dm.name}</span>
                        </div>

                        {/* Unread number badge */}
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#f23f43] text-white text-[10px] font-black leading-none shrink-0 shadow">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              /* Server Channels List (Matches user screenshot) */
              activeServer.categories.map((category) => {
                const isCollapsed = collapsedCategories[category.id];
                const catChannels = channels.filter(
                  (c) => c.serverId === activeServerId && category.channelIds.includes(c.id)
                );

                return (
                  <div key={category.id} className="space-y-0.5">
                    <div className="flex items-center justify-between px-1 py-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black tracking-wider text-[#949ba4] hover:text-stone-200 transition-colors uppercase"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-[#949ba4]" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-[#949ba4]" />
                        )}
                        <span>{category.name}</span>
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            sounds.playTap();
                            setShowCreateChannelModal(true);
                          }}
                          className="text-[#949ba4] hover:text-white p-0.5"
                          title="Add Channel"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-[2px]">
                        {catChannels.map((channel) => {
                          const isActive = !showAdminDashboard && activeChannelId === channel.id;
                          const isVoice = channel.type === 'voice';
                          const isAnnouncement = channel.type === 'announcement';
                          const unread = unreadCounts[channel.id] || 0;

                          return (
                            <button
                              key={channel.id}
                              onClick={() => {
                                if (isVoice) {
                                  handleToggleVoiceChannel(channel);
                                } else {
                                  selectChannel(channel.id, false);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[6px] text-xs transition-all relative group ${
                                isActive && !isVoice
                                  ? 'bg-[#35373c] text-white font-bold'
                                  : unread > 0
                                  ? 'text-white font-bold bg-[#35373c]/30'
                                  : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1] font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isVoice ? (
                                  <Volume2
                                    className={`w-4 h-4 shrink-0 ${
                                      connectedVoiceChannel?.id === channel.id
                                        ? 'text-emerald-400 animate-pulse'
                                        : 'text-[#80848e]'
                                    }`}
                                  />
                                ) : isAnnouncement ? (
                                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <Hash className="w-4 h-4 text-[#80848e] group-hover:text-[#dbdee1] shrink-0" />
                                )}
                                <span className="truncate">{channel.name}</span>
                              </div>

                              {/* Unread number badge on channel (Matches screenshot requirement) */}
                              {unread > 0 && !isActive && (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#f23f43] text-white text-[10px] font-black leading-none shrink-0 shadow animate-pulse">
                                  {unread > 99 ? '99+' : unread}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom User Bar */}
          <footer className="h-[52px] bg-[#232428] px-2 flex items-center justify-between border-t border-[#1f2023] z-10">
            <div
              onClick={() => {
                if (isSuperAdmin) {
                  setShowAdminDashboard(true);
                } else {
                  setShowSettingsModal(true);
                }
              }}
              className="flex items-center gap-2 p-1 -ml-1 rounded-md hover:bg-[#35373c] transition-colors cursor-pointer flex-1 min-w-0 mr-1"
            >
              <div className="relative shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1">
                  {currentUser.name}
                  {isSuperAdmin && (
                    <span title="Super Admin / App Owner">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </span>
                  )}
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold truncate leading-tight">
                  {isSuperAdmin ? '👑 App Owner' : (currentUser.role || 'Believer')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 text-[#b5bac1]">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded hover:bg-[#35373c] hover:text-white"
                title="Settings & Admin"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: ADMIN DASHBOARD VIEW OR CHAT STREAM                      */}
      {/* ========================================================================= */}
      {currentUser.isBanned ? (
        /* BANNED LOCKOUT SCREEN */
        <main className="flex-1 bg-[#1e1f22] flex flex-col items-center justify-center p-6 text-center z-0">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 text-3xl mb-4 shadow-xl">
            🔨
          </div>
          <h2 className="text-xl font-black text-white mb-2">You Have Been Banned</h2>
          <p className="text-xs text-rose-300 max-w-md bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-xl mb-4 leading-relaxed">
            <strong>Reason:</strong> {currentUser.banReason || 'Violation of Fellowship rules and community guidelines by Server Owner.'}
          </p>
          <p className="text-[11px] text-[#949ba4]">
            If you believe this was in error, contact the app owner at <span className="text-white font-medium">{SUPER_ADMIN_EMAIL}</span>.
          </p>
        </main>
      ) : showAdminDashboard && isSuperAdmin ? (
        /* SUPER ADMIN DASHBOARD VIEW */
        <AdminDashboardView
          onClose={() => setShowAdminDashboard(false)}
          onOpenDM={handleStartDM}
          onOpenCreateServer={() => setShowCreateServerModal(true)}
          onOpenCreateChannel={() => setShowCreateChannelModal(true)}
        />
      ) : (
        /* STANDARD DISCORD CHAT FEED */
        <main className="flex-1 bg-[#313338] flex flex-col min-w-0 h-full relative z-0">
          {/* Top Header Bar */}
          <header className="h-12 px-3 sm:px-4 border-b border-[#1f2023] flex items-center justify-between shadow-sm bg-[#313338] z-10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsMobileNavOpen(true);
                }}
                className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-[#35373c] text-stone-200"
                title="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {isDMView ? (
                <AtSign className="w-5 h-5 text-[#5865F2] shrink-0" />
              ) : (
                <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-[#80848e] shrink-0" />
              )}

              <h2 className="font-extrabold text-white text-xs sm:text-sm truncate">
                {activeChannel.name}
              </h2>
              <div className="w-[1px] h-4 bg-[#3f4147] mx-1 hidden sm:block" />
              <p className="text-xs text-[#949ba4] truncate font-medium hidden md:block">
                {activeChannel.topic}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 text-[#b5bac1]">
              {/* Admin Dashboard shortcut button if owner */}
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    sounds.playTap();
                    setShowAdminDashboard(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-black shadow-sm transition-all"
                  title="Super Admin Command Center"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </button>
              )}

              {/* Start Video Meet button */}
              <button
                onClick={() => {
                  sounds.playTap();
                  launchApp('faith_meet');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] sm:text-xs font-bold transition-all shadow-sm"
                title="Start or Join Google Meet Group Call"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Group Call</span>
              </button>

              <button
                onClick={() => setShowVerseModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] sm:text-xs font-bold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Verse</span>
              </button>

              <button
                onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
                className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors relative"
                title="Pinned Messages"
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsMobileMembersOpen(true);
                  setShowDesktopMembers(!showDesktopMembers);
                }}
                className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors"
                title="Toggle Member List"
              >
                <Users className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 transition-colors"
                  title="Close Applet"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3.5 custom-scrollbar">
            {/* Welcome Banner */}
            <div className="mt-2 mb-4 pb-3 border-b border-[#3f4147]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2b2d31] flex items-center justify-center mb-2 shadow-inner">
                {isDMView ? (
                  <AtSign className="w-7 h-7 sm:w-8 sm:h-8 text-[#5865F2]" />
                ) : (
                  <Hash className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isDMView ? `Direct Message with @${activeChannel.name}` : `Welcome to #${activeChannel.name}!`}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#949ba4] mt-0.5">
                {isDMView
                  ? 'This is the start of your 1-on-1 private direct message history.'
                  : 'Text in real-time across all devices with instant sub-50ms sync! 🕊️'}
              </p>
            </div>

            {/* Render Messages */}
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`group relative flex gap-2.5 sm:gap-3.5 px-2 py-1.5 -mx-2 rounded hover:bg-[#2e3035] transition-colors ${
                    msg.pinned ? 'bg-amber-500/5 border-l-2 border-amber-500 pl-2.5' : ''
                  }`}
                >
                  {/* Action Toolbar */}
                  <div className="absolute right-2 -top-3 hidden group-hover:flex sm:flex opacity-0 group-hover:opacity-100 items-center bg-[#313338] border border-[#232428] rounded-md shadow-md overflow-hidden z-10">
                    <button
                      onClick={() => handleAddReaction(msg.id, '❤️')}
                      className="p-1 sm:p-1.5 hover:bg-[#35373c] text-stone-300 hover:text-rose-400 text-xs"
                      title="Heart"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handleAddReaction(msg.id, '🙏')}
                      className="p-1 sm:p-1.5 hover:bg-[#35373c] text-stone-300 hover:text-amber-400 text-xs"
                      title="Pray"
                    >
                      🙏
                    </button>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setReplyingTo(msg);
                      }}
                      className="p-1 sm:p-1.5 hover:bg-[#35373c] text-[#b5bac1] hover:text-white"
                      title="Reply"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        discordChatService.togglePin(msg.id);
                      }}
                      className={`p-1 sm:p-1.5 hover:bg-[#35373c] ${
                        msg.pinned ? 'text-amber-400' : 'text-[#b5bac1] hover:text-white'
                      }`}
                      title={msg.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    {(isMine || isSuperAdmin) && (
                      <button
                        onClick={() => {
                          sounds.playTap();
                          discordChatService.deleteMessage(msg.id);
                        }}
                        className="p-1 sm:p-1.5 hover:bg-rose-500/20 text-[#b5bac1] hover:text-rose-400"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {msg.senderPhoto ? (
                      <img
                        src={msg.senderPhoto}
                        alt={msg.senderName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-teal-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {msg.replyTo && (
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#949ba4] mb-0.5">
                        <CornerUpLeft className="w-3 h-3 rotate-180" />
                        <span className="font-bold text-[#dbdee1]">@{msg.replyTo.senderName}:</span>
                        <span className="truncate italic text-stone-400">"{msg.replyTo.text}"</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-2 leading-none mb-1 flex-wrap">
                      <span
                        style={{ color: msg.senderRoleColor || '#dbdee1' }}
                        className="font-bold text-xs hover:underline cursor-pointer"
                      >
                        {msg.senderName}
                      </span>

                      {msg.senderRole && (
                        <span
                          style={{
                            backgroundColor: `${msg.senderRoleColor || '#10B981'}20`,
                            color: msg.senderRoleColor || '#10B981',
                          }}
                          className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[4px] tracking-wider"
                        >
                          {msg.senderRole}
                        </span>
                      )}

                      <span className="text-[9px] sm:text-[10px] text-[#949ba4] font-medium">
                        {timeString}
                      </span>
                    </div>

                    <p className="text-xs text-[#dbdee1] leading-relaxed select-text font-normal whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>

                    {/* Embeds */}
                    {msg.embed && (
                      <div
                        style={{ borderLeftColor: msg.embed.color || '#10B981' }}
                        className="mt-2 p-2.5 sm:p-3 bg-[#2b2d31] rounded-r-lg border-l-4 max-w-lg shadow-md space-y-1.5"
                      >
                        {msg.embed.author && (
                          <div className="text-[9px] sm:text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">
                            {msg.embed.author}
                          </div>
                        )}
                        <h4 className="text-xs font-bold text-white">{msg.embed.title}</h4>
                        <p className="text-xs text-stone-300 font-serif italic leading-relaxed">
                          {msg.embed.description}
                        </p>
                      </div>
                    )}

                    {/* Media / Shared Images (Gallery, URL, or Uploaded) */}
                    <ChatMessageMedia
                      message={msg}
                      onOpenLightbox={(data) => setLightboxData({ isOpen: true, ...data })}
                    />

                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {Object.entries(msg.reactions).map(([emoji, users]) => {
                          const hasReacted = users.includes(currentUser.name);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className={`px-1.5 sm:px-2 py-0.5 rounded-[4px] text-xs font-bold flex items-center gap-1 border transition-all ${
                                hasReacted
                                  ? 'bg-[#5865F2]/20 border-[#5865F2] text-[#5865F2]'
                                  : 'bg-[#2b2d31] border-[#383a40] text-[#b5bac1] hover:bg-[#35373c]'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{users.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-2.5 sm:px-4 pb-[calc(58px+env(safe-area-inset-bottom,0px))] md:pb-3 pt-1 bg-[#313338] shrink-0">
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1 bg-[#2b2d31] rounded-t-lg text-xs text-stone-300 border-b border-[#1f2023]">
                <div className="flex items-center gap-1.5 truncate">
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span className="font-semibold text-white">
                    Replying to @{replyingTo.senderName}
                  </span>
                  <span className="text-stone-400 truncate italic">"{replyingTo.text}"</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:text-white text-stone-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentUser.mutedUntil && currentUser.mutedUntil > Date.now() ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
                <span>⏳ You have been temporarily muted by server administration until {new Date(currentUser.mutedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className={`flex items-center gap-1.5 sm:gap-2 bg-[#383a40] px-2.5 sm:px-3 py-2 sm:py-2.5 ${
                  replyingTo ? 'rounded-b-lg' : 'rounded-lg'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowVerseModal(true)}
                  className="p-1.5 rounded-full bg-[#4e5058] hover:bg-[#5865F2] text-[#dbdee1] hover:text-white transition-colors shrink-0"
                  title="Share Scripture"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-1.5 rounded-full bg-[#4e5058] hover:bg-[#5865F2] text-[#dbdee1] hover:text-white transition-colors shrink-0"
                  title="Share Image / Fellowship Gallery"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={isDMView ? `Message @${activeChannel.name}...` : `Message #${activeChannel.name}...`}
                  className="flex-1 bg-transparent text-white text-base md:text-xs placeholder-[#80848e] focus:outline-none min-w-0 py-0.5"
                />

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 rounded hover:text-white text-[#b5bac1] transition-colors"
                    title="Add Emoji"
                  >
                    <Smile className="w-4 h-4 text-amber-300" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute right-0 bottom-10 p-2 bg-[#2b2d31] border border-[#1f2023] rounded-lg shadow-xl flex gap-1 z-30">
                      {['❤️', '🙏', '✝️', '🕊️', '🙌', '🔥', '📖', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-7 h-7 flex items-center justify-center hover:bg-[#35373c] rounded text-base transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-1.5 sm:p-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-30 text-white transition-all shrink-0"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Who is Typing Indicator Bar */}
            <div className="h-5 px-1 pt-1 flex items-center text-[11px] text-[#dbdee1] select-none min-w-0">
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-1.5 animate-fadeIn truncate">
                  <span className="flex items-center gap-0.5 bg-[#4e5058]/50 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#dbdee1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#dbdee1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#dbdee1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="truncate text-stone-300">
                    <strong className="font-bold text-white">
                      {typingUsers.length === 1
                        ? typingUsers[0]
                        : typingUsers.length === 2
                        ? `${typingUsers[0]} and ${typingUsers[1]}`
                        : `${typingUsers.slice(0, 2).join(', ')} and ${typingUsers.length - 2} others`}
                    </strong>
                    {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. RIGHT MEMBERS SIDEBAR (RESPONSIVE)                                     */}
      {/* ========================================================================= */}
      <aside
        className={`bg-[#2b2d31] flex flex-col border-l border-[#1f2023] z-40 transition-transform duration-300 ease-in-out fixed md:relative right-0 top-0 bottom-0 w-64 md:w-60 shrink-0 ${
          isMobileMembersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
        } ${showDesktopMembers ? 'md:flex' : 'md:hidden'}`}
      >
        <div className="h-12 px-4 border-b border-[#1f2023] flex items-center justify-between">
          <span className="text-xs font-black text-[#949ba4] uppercase tracking-wider">
            Members — {members.length + 1}
          </span>
          <button
            onClick={() => setIsMobileMembersOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
          {(() => {
            const onlineOthers = members.filter((m) => m.status !== 'offline');
            const offlineOthers = members.filter((m) => m.status === 'offline');
            const totalOnline = onlineOthers.length + 1;

            return (
              <div className="space-y-4">
                {/* ONLINE GROUP */}
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#949ba4] px-2 mb-1 flex items-center justify-between">
                    <span>ONLINE — {totalOnline}</span>
                  </div>

                  {/* Current User */}
                  <div
                    onClick={() => {
                      if (isSuperAdmin) {
                        setShowAdminDashboard(true);
                      } else {
                        setShowSettingsModal(true);
                      }
                      setIsMobileMembersOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] bg-[#35373c]/50 hover:bg-[#35373c] cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-xs">
                        {currentUser.name.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {currentUser.name}
                        {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold truncate">
                        {isSuperAdmin ? '👑 Super Admin' : (currentUser.role || 'Believer')}
                      </span>
                    </div>
                  </div>

                  {/* Online Members */}
                  {onlineOthers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        if (isSuperAdmin) {
                          setShowRoleModal(true);
                        } else {
                          handleStartDM(m);
                        }
                      }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-[6px] hover:bg-[#35373c] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <div
                            style={{ backgroundColor: m.roleColor || '#10B981' }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs"
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            style={{ color: m.roleColor || '#dbdee1' }}
                            className="text-xs font-bold truncate flex items-center gap-1"
                          >
                            {m.name}
                            {m.email === SUPER_ADMIN_EMAIL && <Crown className="w-3 h-3 text-amber-400" />}
                          </span>
                          <span className="text-[10px] text-[#949ba4] truncate">{m.role || 'Believer'}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDM(m);
                        }}
                        className="p-1.5 rounded hover:bg-[#5865F2] text-stone-400 hover:text-white transition-colors"
                        title={`Direct Message @${m.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* OFFLINE GROUP */}
                {offlineOthers.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-[#35373c]/50">
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#80848e] px-2 mb-1 flex items-center justify-between">
                      <span>OFFLINE — {offlineOthers.length}</span>
                    </div>

                    {offlineOthers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m);
                          if (isSuperAdmin) {
                            setShowRoleModal(true);
                          } else {
                            handleStartDM(m);
                          }
                        }}
                        className="flex items-center justify-between px-2 py-1.5 rounded-[6px] hover:bg-[#35373c] cursor-pointer transition-colors group opacity-60 hover:opacity-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <div
                              style={{ backgroundColor: m.roleColor || '#6b7280' }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 font-black text-xs grayscale"
                            >
                              {m.name.charAt(0)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#80848e] border-2 border-[#2b2d31]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#949ba4] truncate flex items-center gap-1">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-[#80848e] font-medium truncate">
                              Offline
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartDM(m);
                          }}
                          className="p-1.5 rounded hover:bg-[#5865F2] text-stone-400 hover:text-white transition-colors"
                          title={`Direct Message @${m.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State when no other members exist at all */}
                {members.length === 0 && (
                  <div className="px-2 py-4 text-center space-y-1.5 bg-[#232428]/40 rounded-lg border border-[#383a40]/30">
                    <div className="w-7 h-7 rounded-full bg-[#35373c] flex items-center justify-center text-stone-400 mx-auto">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] font-bold text-stone-300">No other believers online</p>
                    <p className="text-[9px] text-stone-500 leading-tight">
                      Open on your phone or invite friends to see real users appear live!
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 5. MODAL: CREATE SERVER (SUPER ADMIN ONLY)                                */}
      {/* ========================================================================= */}
      {showCreateServerModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3f4147] pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                <PlusCircle className="w-5 h-5" />
                <span>Create New Fellowship Server</span>
              </div>
              <button
                onClick={() => setShowCreateServerModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServer} className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g. Youth Ministry, Prayer Warriors..."
                  required
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#23a55a]"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Server Emoji Icon
                </label>
                <div className="flex gap-2">
                  {['⛪', '✝️', '🕊️', '🔥', '📖', '🛡️', '👑', '🌟'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewServerEmoji(em)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                        newServerEmoji === em
                          ? 'bg-[#23a55a]/30 border-[#23a55a]'
                          : 'bg-[#1e1f22] border-[#3f4147]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Server Description
                </label>
                <input
                  type="text"
                  value={newServerDesc}
                  onChange={(e) => setNewServerDesc(e.target.value)}
                  placeholder="Short purpose of this server..."
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#23a55a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
                <button
                  type="button"
                  onClick={() => setShowCreateServerModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#23a55a] hover:bg-[#1d8a4a] text-white text-xs font-bold shadow-lg"
                >
                  Create Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: CREATE CHANNEL (SUPER ADMIN)                                    */}
      {/* ========================================================================= */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3f4147] pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Hash className="w-5 h-5 text-[#5865F2]" />
                <span>Create Channel in {activeServer.name}</span>
              </div>
              <button
                onClick={() => setShowCreateChannelModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. testimony-lounge, worship-schedule"
                  required
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#5865f2]"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Channel Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('text')}
                    className={`p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 ${
                      newChannelType === 'text'
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                        : 'bg-[#1e1f22] border-[#3f4147] text-[#949ba4]'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('voice')}
                    className={`p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 ${
                      newChannelType === 'voice'
                        ? 'bg-[#23a55a]/20 border-[#23a55a] text-white'
                        : 'bg-[#1e1f22] border-[#3f4147] text-[#949ba4]'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Voice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('announcement')}
                    className={`p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 ${
                      newChannelType === 'announcement'
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-[#1e1f22] border-[#3f4147] text-[#949ba4]'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>News</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Topic / Purpose
                </label>
                <input
                  type="text"
                  value={newChannelTopic}
                  onChange={(e) => setNewChannelTopic(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#5865f2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="px-4 py-2 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: MEMBER ROLE MANAGEMENT (SUPER ADMIN ONLY)                       */}
      {/* ========================================================================= */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3f4147] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
                <Crown className="w-5 h-5" />
                <span>Admin Role Manager: {selectedMember.name}</span>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#949ba4]">
                As App Owner (<strong>{SUPER_ADMIN_EMAIL}</strong>), select a role to assign to{' '}
                <strong>{selectedMember.name}</strong>:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pt-2">
                {PRESET_ROLES.filter((r) => r.name !== 'Super Admin').map((role) => (
                  <button
                    key={role.name}
                    onClick={() => handleAssignRole(role)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{role.icon}</span>
                      <div>
                        <span style={{ color: role.color }} className="text-xs font-bold block">
                          {role.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {role.canManageChannels ? 'Can manage channels' : 'Standard member access'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white/50">Assign</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#3f4147]">
              <button
                type="button"
                onClick={() => handleStartDM(selectedMember)}
                className="px-3 py-1.5 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send 1-on-1 DM</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-1.5 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: SCRIPTURE EMBED                                                 */}
      {/* ========================================================================= */}
      {showVerseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3f4147] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                <BookOpen className="w-5 h-5" />
                <span>Share Scripture Card Embed</span>
              </div>
              <button onClick={() => setShowVerseModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Verse Reference
                </label>
                <input
                  type="text"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  placeholder="e.g. John 3:16, Romans 8:28..."
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#5865f2]"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Scripture Text Content
                </label>
                <textarea
                  rows={4}
                  value={verseContent}
                  onChange={(e) => setVerseContent(e.target.value)}
                  placeholder="Paste Scripture text..."
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs font-serif italic focus:outline-none focus:border-[#5865f2]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowVerseModal(false)}
                className="px-3 sm:px-4 py-2 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendVerseEmbed}
                className="px-3 sm:px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Post Embed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: PROFILE & GOOGLE SETTINGS                                       */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="h-20 sm:h-24 bg-gradient-to-r from-[#5865F2] to-[#23a55a] p-4 flex items-end justify-between relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-white">
                <h3 className="text-base sm:text-lg font-black leading-tight flex items-center gap-1.5">
                  Fellowship Profile & App Settings
                  {isSuperAdmin && <Crown className="w-4 h-4 text-amber-300" />}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80">
                  {isSuperAdmin ? 'App Owner: aw03102008@gmail.com' : 'Instant chat enabled!'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Your Display Name / Handle
                </label>
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="Your chat display name..."
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#5865f2]"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-black uppercase text-[#949ba4] mb-1">
                  Custom Status Message
                </label>
                <input
                  type="text"
                  value={customStatusInput}
                  onChange={(e) => setCustomStatusInput(e.target.value)}
                  placeholder="e.g. Rejoicing in the Lord! ✨"
                  className="w-full px-3 py-2 rounded-md bg-[#1e1f22] border border-[#3f4147] text-white text-xs focus:outline-none focus:border-[#5865f2]"
                />
              </div>

              {/* Google Account Card */}
              <div className="p-3.5 bg-[#2b2d31] rounded-lg border border-[#3f4147] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Google Account Verification</span>
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-500/30">
                      👑 Super Admin
                    </span>
                  )}
                </div>

                {currentUser.isGoogleUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-medium">{currentUser.name}</span>
                      <span className="text-[10px] text-stone-400">{currentUser.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignOut}
                      className="px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2 rounded-md bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google (aw03102008@gmail.com)</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3f4147]">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3 sm:px-4 py-2 rounded-md text-xs font-bold text-stone-300 hover:bg-[#35373c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. PINNED MESSAGES DRAWER                                                */}
      {/* ========================================================================= */}
      {showPinnedDrawer && (
        <div className="fixed right-0 top-0 bottom-0 w-72 sm:w-80 bg-[#2b2d31] border-l border-[#1f2023] shadow-2xl z-50 flex flex-col p-3 sm:p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3f4147]">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <Pin className="w-4 h-4" />
              <span>Pinned Messages</span>
            </div>
            <button
              onClick={() => setShowPinnedDrawer(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar">
            {messages.filter((m) => m.pinned).length === 0 ? (
              <p className="text-xs text-stone-400 italic text-center py-6">
                No pinned messages in this channel.
              </p>
            ) : (
              messages
                .filter((m) => m.pinned)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 sm:p-3 bg-[#313338] rounded-lg border border-[#3f4147] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{m.senderName}</span>
                      <button
                        onClick={() => discordChatService.togglePin(m.id)}
                        className="text-stone-400 hover:text-rose-400 text-[10px]"
                      >
                        Unpin
                      </button>
                    </div>
                    <p className="text-xs text-[#dbdee1] font-normal leading-relaxed">{m.text}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. MANDATORY NAME ONBOARDING MODAL (UNSKIPPABLE)                         */}
      {/* ========================================================================= */}
      {showNameRequiredModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#313338] border border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
            {/* Top decorative glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                try {
                  localStorage.setItem('lifeos_discord_name_set_v6', 'true');
                } catch {}
                setShowNameRequiredModal(false);
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white transition-colors z-20"
              title="Dismiss and browse chat"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🕊️
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Welcome to Fellowship Chat
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed max-w-sm mx-auto">
                Connect with believers across all phones and computers in real-time. Please enter your name to join the server.
              </p>
            </div>

            <form onSubmit={handleCompleteNameOnboarding} className="space-y-4">
              {onboardingError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold text-center animate-shake">
                  {onboardingError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>Your Display Name</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={onboardingName}
                  onChange={(e) => {
                    setOnboardingName(e.target.value);
                    if (onboardingError) setOnboardingError('');
                  }}
                  placeholder="e.g. Sarah Jenkins, Marcus, or Brother John"
                  className="w-full px-3.5 py-2.5 bg-[#1e1f22] border border-[#3f4147] focus:border-amber-400 rounded-xl text-white text-base md:text-sm font-semibold focus:outline-none transition-all placeholder:text-stone-500 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#949ba4] flex items-center justify-between">
                  <span>Custom Status Message (Optional)</span>
                </label>
                <input
                  type="text"
                  value={onboardingStatus}
                  onChange={(e) => setOnboardingStatus(e.target.value)}
                  placeholder="e.g. Walking with Christ ✝️"
                  className="w-full px-3.5 py-2 bg-[#1e1f22] border border-[#3f4147] focus:border-emerald-400 rounded-xl text-white text-base md:text-xs font-medium focus:outline-none transition-all placeholder:text-stone-500"
                />

                {/* Status Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Walking in faith 🕊️', 'In prayer 🙏', 'Reading Bible 📖', 'Rejoicing ✨'].map((statusChip) => (
                    <button
                      key={statusChip}
                      type="button"
                      onClick={() => setOnboardingStatus(statusChip)}
                      className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] text-[10px] text-stone-300 font-medium border border-[#3f4147] transition-all"
                    >
                      {statusChip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter Fellowship Chat ✨</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteNameOnboarding()}
                  className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white font-bold text-xs transition-colors"
                  title="Quick join using current profile name"
                >
                  Quick Enter
                </button>
              </div>
            </form>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#3f4147] w-full" />
              <span className="bg-[#313338] px-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest absolute">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-white text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. FELLOWSHIP IMAGE GALLERY & URL PICKER MODAL                           */}
      {/* ========================================================================= */}
      <FellowshipImageModal
        channelName={activeChannel.name}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSendImage={handleSendImageAttachment}
      />

      {/* ========================================================================= */}
      {/* 13. IMAGE LIGHTBOX VIEWER MODAL                                           */}
      {/* ========================================================================= */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        caption={lightboxData.caption}
        verse={lightboxData.verse}
        senderName={lightboxData.senderName}
      />
    </div>
  );
};
