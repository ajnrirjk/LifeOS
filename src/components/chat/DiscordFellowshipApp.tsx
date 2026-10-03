import React, { useState, useEffect, useRef } from 'react';
import {
  Hash,
  Volume2,
  Plus,
  Bell,
  Pin,
  Users,
  Search,
  Smile,
  Send,
  Settings,
  Mic,
  MicOff,
  Headphones,
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
  MessageSquare
} from 'lucide-react';
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
  UserStatusType
} from '../../types/chat';
import { googleDriveService } from '../../services/googleDriveService';
import { sounds } from '../../services/soundEffects';

interface DiscordFellowshipAppProps {
  onClose?: () => void;
}

export const DiscordFellowshipApp: React.FC<DiscordFellowshipAppProps> = ({ onClose }) => {
  // Navigation State
  const [activeServerId, setActiveServerId] = useState<string>('server_fellowship');
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileMembersOpen, setIsMobileMembersOpen] = useState<boolean>(false);
  const [showDesktopMembers, setShowDesktopMembers] = useState<boolean>(true);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showVerseModal, setShowVerseModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<ActiveChatMember | null>(null);

  // Chat & Data State
  const [servers] = useState<DiscordServer[]>(DEFAULT_SERVERS);
  const [channels, setChannels] = useState<ChatChannel[]>(DEFAULT_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ActiveChatMember[]>(discordChatService.membersCache);
  const [currentUser, setCurrentUser] = useState(discordChatService.currentUser);

  // Input & Reply State
  const [inputText, setInputText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Voice Lounge State
  const [connectedVoiceChannel, setConnectedVoiceChannel] = useState<ChatChannel | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);

  // Verse Modal Form
  const [verseRef, setVerseRef] = useState('Philippians 4:13');
  const [verseContent, setVerseContent] = useState('“I can do all things through Christ who strengthens me.”');

  // Profile Settings Form
  const [customNameInput, setCustomNameInput] = useState(currentUser.name);
  const [customStatusInput, setCustomStatusInput] = useState(currentUser.customStatus || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];
  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Sync with Google Auth on Mount
  useEffect(() => {
    const unsubAuth = googleDriveService.initAuth((user) => {
      if (user) {
        const userObj = {
          id: user.uid || user.email || 'google_user',
          name: user.displayName || user.email?.split('@')[0] || 'Believer in Christ',
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          isGoogleUser: true,
          role: 'Google Verified',
          roleColor: '#38BDF8',
          status: 'online' as UserStatusType,
        };
        discordChatService.setCurrentUser(userObj);
        setCurrentUser(discordChatService.currentUser);
        setCustomNameInput(userObj.name);
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to real-time Discord Chat events
  useEffect(() => {
    // Initial Load
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
        }
        setChannels([...discordChatService.channelsCache]);
      } else if (
        event.type === 'reaction' ||
        event.type === 'pin_message' ||
        event.type === 'delete_message' ||
        event.type === 'sync_all'
      ) {
        setMessages(discordChatService.getMessages(activeChannelId));
        setChannels([...discordChatService.channelsCache]);
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

  // Handle message send
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
      serverId: activeServerId,
      text: textToSend,
      replyTo: replyTarget,
    });
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

  // Share Verse Embed
  const handleSendVerseEmbed = async () => {
    if (!verseRef.trim() || !verseContent.trim()) return;
    sounds.playTap();

    await discordChatService.sendMessage({
      channelId: activeChannelId,
      serverId: activeServerId,
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

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    sounds.playTap();
    try {
      const { user } = await googleDriveService.signIn();
      const updatedUser = {
        id: user.uid || user.email || 'google_user',
        name: user.displayName || user.email?.split('@')[0] || 'Believer in Christ',
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        isGoogleUser: true,
        role: 'Google Verified',
        roleColor: '#38BDF8',
      };
      discordChatService.setCurrentUser(updatedUser);
      setCurrentUser(discordChatService.currentUser);
      setShowSettingsModal(false);
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

  // Filter messages by search if active
  const filteredMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="relative flex h-full w-full bg-[#1e1f22] text-[#dbdee1] font-sans antialiased select-none overflow-hidden rounded-2xl shadow-2xl border border-white/10">
      {/* ========================================================================= */}
      {/* MOBILE OVERLAY BACKDROP FOR LEFT SERVER / CHANNELS DRAWER                */}
      {/* ========================================================================= */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* ========================================================================= */}
      {/* MOBILE OVERLAY BACKDROP FOR RIGHT MEMBERS DRAWER                         */}
      {/* ========================================================================= */}
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
        <nav className="w-[68px] sm:w-[72px] bg-[#111214] flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          {/* Direct Messages / Home Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveServerId('server_fellowship');
              setActiveChannelId('general');
              setIsMobileNavOpen(false);
            }}
            className={`relative group w-11 h-11 sm:w-12 sm:h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center transition-all duration-200 ${
              activeServerId === 'server_fellowship'
                ? 'bg-[#5865F2] text-white rounded-[16px]'
                : 'bg-[#313338] text-emerald-400 hover:bg-[#5865F2] hover:text-white'
            }`}
            title="Fellowship Direct & Global"
          >
            <span
              className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                activeServerId === 'server_fellowship' ? 'h-8 sm:h-10' : 'h-0 group-hover:h-5'
              }`}
            />
            <span className="text-xl sm:text-2xl">🕊️</span>
          </button>

          {/* Separator */}
          <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />

          {/* Server Guild Icons */}
          {servers.map((server) => {
            const isActive = activeServerId === server.id;
            return (
              <button
                key={server.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveServerId(server.id);
                  const firstChan = channels.find((c) => c.serverId === server.id);
                  if (firstChan) setActiveChannelId(firstChan.id);
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
              </button>
            );
          })}
        </nav>

        {/* 2. CHANNELS SIDEBAR (230px on mobile, 240px on desktop) */}
        <aside className="w-[230px] sm:w-60 bg-[#2b2d31] flex flex-col shrink-0 border-r border-[#1f2023] z-10">
          {/* Server Header Banner */}
          <header
            onClick={() => setShowSettingsModal(true)}
            className="h-12 px-3 sm:px-4 border-b border-[#1f2023] flex items-center justify-between hover:bg-[#35373c] transition-colors cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-base">{activeServer.emoji}</span>
              <h1 className="font-extrabold text-xs sm:text-sm text-white truncate">
                {activeServer.name}
              </h1>
              <span title="Verified Fellowship">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </header>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 custom-scrollbar">
            {activeServer.categories.map((category) => {
              const isCollapsed = collapsedCategories[category.id];
              const catChannels = channels.filter(
                (c) => c.serverId === activeServerId && category.channelIds.includes(c.id)
              );

              return (
                <div key={category.id} className="space-y-0.5">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-1 px-1 py-1 text-[10px] sm:text-[11px] font-black tracking-wider text-[#949ba4] hover:text-stone-200 transition-colors uppercase"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-[#949ba4]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#949ba4]" />
                    )}
                    <span>{category.name}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-[2px]">
                      {catChannels.map((channel) => {
                        const isActive = activeChannelId === channel.id;
                        const isVoice = channel.type === 'voice';
                        const isAnnouncement = channel.type === 'announcement';

                        return (
                          <button
                            key={channel.id}
                            onClick={() => {
                              if (isVoice) {
                                handleToggleVoiceChannel(channel);
                              } else {
                                sounds.playTap();
                                setActiveChannelId(channel.id);
                                setIsMobileNavOpen(false); // Auto close drawer on mobile selection
                              }
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[6px] text-xs font-semibold group transition-all ${
                              isActive && !isVoice
                                ? 'bg-[#35373c] text-white'
                                : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isVoice ? (
                                <Volume2
                                  className={`w-4 h-4 ${
                                    connectedVoiceChannel?.id === channel.id
                                      ? 'text-emerald-400 animate-pulse'
                                      : 'text-[#80848e]'
                                  }`}
                                />
                              ) : isAnnouncement ? (
                                <Bell className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Hash className="w-4 h-4 text-[#80848e] group-hover:text-[#dbdee1]" />
                              )}
                              <span className="truncate">{channel.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connected Voice Bar */}
          {connectedVoiceChannel && (
            <div className="p-2.5 bg-[#111214] border-t border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] font-bold text-emerald-400 truncate">
                    Voice Connected
                  </span>
                  <span className="text-[9px] text-stone-400 truncate">
                    {connectedVoiceChannel.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  setConnectedVoiceChannel(null);
                }}
                className="p-1 rounded hover:bg-rose-500/20 text-stone-400 hover:text-rose-400"
                title="Disconnect"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom User Bar */}
          <footer className="h-[52px] bg-[#232428] px-2 flex items-center justify-between border-t border-[#1f2023] z-10">
            <div
              onClick={() => setShowSettingsModal(true)}
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
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.isGoogleUser && (
                    <span title="Google Verified">
                      <Check className="w-3 h-3 text-sky-400" />
                    </span>
                  )}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#949ba4] truncate leading-tight">
                  {currentUser.customStatus || `#${currentUser.discriminator || '7777'}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 text-[#b5bac1]">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded hover:bg-[#35373c] hover:text-white"
                title="Settings & Name"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CHAT AREA (FULL WIDTH ON MOBILE, MIDDLE ON DESKTOP)               */}
      {/* ========================================================================= */}
      <main className="flex-1 bg-[#313338] flex flex-col min-w-0 h-full relative z-0">
        {/* Top Header Bar */}
        <header className="h-12 px-3 sm:px-4 border-b border-[#1f2023] flex items-center justify-between shadow-sm bg-[#313338] z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => {
                sounds.playTap();
                setIsMobileNavOpen(true);
              }}
              className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-[#35373c] text-stone-200"
              title="Open Channels Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-[#80848e] shrink-0" />
            <h2 className="font-extrabold text-white text-xs sm:text-sm truncate">
              {activeChannel.name}
            </h2>
            <div className="w-[1px] h-4 bg-[#3f4147] mx-1 hidden sm:block" />
            <p className="text-xs text-[#949ba4] truncate font-medium hidden md:block">
              {activeChannel.topic}
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[#b5bac1]">
            {/* Quick Share Verse Button */}
            <button
              onClick={() => setShowVerseModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] sm:text-xs font-bold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Verse</span>
            </button>

            {/* Pinned Messages Trigger */}
            <button
              onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
              className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors relative"
              title="Pinned Messages"
            >
              <Pin className="w-4 h-4" />
              {messages.some((m) => m.pinned) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            {/* Member List Toggle (Opens Right Drawer on mobile) */}
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

            {/* Close window if applet */}
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
          {/* Welcome Channel Banner */}
          <div className="mt-2 mb-4 pb-3 border-b border-[#3f4147]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2b2d31] flex items-center justify-center mb-2 shadow-inner">
              <Hash className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Welcome to #{activeChannel.name}!
            </h3>
            <p className="text-[11px] sm:text-xs text-[#949ba4] mt-0.5">
              This is the start of the #{activeChannel.name} channel. Text in real-time across all
              devices! 🕊️
            </p>
          </div>

          {/* Render Messages */}
          {filteredMessages.map((msg) => {
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
                {/* Action Toolbar on Hover / Focus */}
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
                    onClick={() => handleAddReaction(msg.id, '🙌')}
                    className="p-1 sm:p-1.5 hover:bg-[#35373c] text-stone-300 hover:text-emerald-400 text-xs"
                    title="Praise"
                  >
                    🙌
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
                  {isMine && (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        discordChatService.deleteMessage(msg.id);
                      }}
                      className="p-1 sm:p-1.5 hover:bg-rose-500/20 text-[#b5bac1] hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Left Avatar */}
                <div className="shrink-0 pt-0.5">
                  {msg.senderPhoto ? (
                    <img
                      src={msg.senderPhoto}
                      alt={msg.senderName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer hover:opacity-90"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs sm:text-sm cursor-pointer shadow-sm">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Body Content */}
                <div className="flex-1 min-w-0">
                  {/* Reply Reference Header if replied */}
                  {msg.replyTo && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#949ba4] mb-0.5">
                      <CornerUpLeft className="w-3 h-3 rotate-180" />
                      <span className="font-bold text-[#dbdee1]">@{msg.replyTo.senderName}:</span>
                      <span className="truncate italic text-stone-400">"{msg.replyTo.text}"</span>
                    </div>
                  )}

                  {/* Sender Name + Role Badge + Time */}
                  <div className="flex items-center gap-1.5 sm:gap-2 leading-none mb-1 flex-wrap">
                    <span
                      style={{ color: msg.senderRoleColor || '#dbdee1' }}
                      className="font-bold text-xs sm:text-xs hover:underline cursor-pointer"
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

                    {msg.isGoogleUser && (
                      <span title="Google Verified">
                        <Check className="w-3 h-3 text-sky-400" />
                      </span>
                    )}

                    <span className="text-[9px] sm:text-[10px] text-[#949ba4] font-medium">
                      {timeString}
                    </span>

                    {msg.pinned && (
                      <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>

                  {/* Text Content */}
                  <p className="text-xs sm:text-xs text-[#dbdee1] leading-relaxed select-text font-normal whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>

                  {/* Rich Discord Embed Card (if any) */}
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
                      {msg.embed.footer && (
                        <div className="text-[9px] text-[#80848e] pt-1 border-t border-[#383a40]">
                          {msg.embed.footer}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Emoji Reactions Bar */}
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
                            <span className="text-[10px] sm:text-[11px]">{users.length}</span>
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

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] text-[#23a55a] font-bold italic flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#23a55a] animate-ping" />
            <span>
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </span>
          </div>
        )}

        {/* Discord Chat Input Box (Mobile-Optimized) */}
        <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 pt-1 bg-[#313338] shrink-0">
          {/* Active Reply Banner */}
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

          <form
            onSubmit={handleSendMessage}
            className={`flex items-center gap-1.5 sm:gap-2 bg-[#383a40] px-2.5 sm:px-3 py-2 sm:py-2.5 ${
              replyingTo ? 'rounded-b-lg' : 'rounded-lg'
            }`}
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowVerseModal(true)}
              className="p-1.5 rounded-full bg-[#4e5058] hover:bg-[#5865F2] text-[#dbdee1] hover:text-white transition-colors shrink-0"
              title="Share Scripture"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message #${activeChannel.name}...`}
              className="flex-1 bg-transparent text-white text-xs sm:text-xs placeholder-[#80848e] focus:outline-none min-w-0"
            />

            {/* Emoji Quick Picker */}
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

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 sm:p-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-30 text-white transition-all shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. RIGHT MEMBERS SIDEBAR (RESPONSIVE DRAWER ON MOBILE, PANEL ON DESKTOP)  */}
      {/* ========================================================================= */}
      <aside
        className={`bg-[#2b2d31] flex flex-col border-l border-[#1f2023] z-40 transition-transform duration-300 ease-in-out fixed md:relative right-0 top-0 bottom-0 w-64 md:w-60 shrink-0 ${
          isMobileMembersOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
        } ${showDesktopMembers ? 'md:flex' : 'md:hidden'}`}
      >
        <div className="h-12 px-4 border-b border-[#1f2023] flex items-center justify-between">
          <span className="text-xs font-black text-[#949ba4] uppercase tracking-wider">
            Fellowship Members — {members.length + 1}
          </span>
          <button
            onClick={() => setIsMobileMembersOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
          {/* PASTORS & LEADERS */}
          <div>
            <div className="px-2 py-1 text-[11px] font-black text-amber-400 tracking-wider uppercase">
              Pastors & Leaders — 1
            </div>
            <div className="space-y-0.5 mt-1">
              {members
                .filter((m) => m.role === 'Pastor')
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setIsMobileMembersOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] hover:bg-[#35373c] cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-amber-300 truncate">{m.name}</span>
                      <span className="text-[10px] text-[#949ba4] truncate">{m.customStatus}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ONLINE BELIEVERS */}
          <div>
            <div className="px-2 py-1 text-[11px] font-black text-emerald-400 tracking-wider uppercase">
              Online Believers — {members.filter((m) => m.role !== 'Pastor').length + 1}
            </div>
            <div className="space-y-0.5 mt-1">
              {/* Current User */}
              <div
                onClick={() => {
                  setShowSettingsModal(true);
                  setIsMobileMembersOpen(false);
                }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] bg-[#35373c]/50 hover:bg-[#35373c] cursor-pointer transition-colors"
              >
                <div className="relative">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {currentUser.name}
                    <span className="text-[9px] text-stone-400 font-normal">(You)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 truncate">
                    {currentUser.customStatus || 'Active now'}
                  </span>
                </div>
              </div>

              {/* Other Members */}
              {members
                .filter((m) => m.role !== 'Pastor')
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setIsMobileMembersOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] hover:bg-[#35373c] cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <div
                        style={{ backgroundColor: m.roleColor || '#10B981' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs"
                      >
                        {m.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#2b2d31] ${
                          m.status === 'online'
                            ? 'bg-[#23a55a]'
                            : m.status === 'idle'
                            ? 'bg-[#f0b232]'
                            : 'bg-[#80848e]'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        style={{ color: m.roleColor || '#dbdee1' }}
                        className="text-xs font-bold truncate"
                      >
                        {m.name}
                      </span>
                      <span className="text-[10px] text-[#949ba4] truncate">{m.customStatus}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 5. MODAL: SCRIPTURE & EMBED GENERATOR (MOBILE-RESPONSIVE)                  */}
      {/* ========================================================================= */}
      {showVerseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3f4147] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
                <BookOpen className="w-5 h-5" />
                <span>Share Scripture Card Embed</span>
              </div>
              <button
                onClick={() => setShowVerseModal(false)}
                className="text-stone-400 hover:text-white"
              >
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
      {/* 6. MODAL: USER & DISCORD PROFILE SETTINGS (MOBILE-RESPONSIVE)             */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-[#313338] border border-[#3f4147] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header Banner */}
            <div className="h-20 sm:h-24 bg-gradient-to-r from-[#5865F2] to-[#23a55a] p-4 flex items-end justify-between relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-white">
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  Fellowship Profile Settings
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80">
                  Instant chat — no login required!
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

              {/* Google Account Optional Card */}
              <div className="p-3.5 bg-[#2b2d31] rounded-lg border border-[#3f4147] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Google Verification (Optional)</span>
                  </span>
                  {currentUser.isGoogleUser && (
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded">
                      Verified
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
                    <span>Connect Google Account</span>
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
                  className="px-3 sm:px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PINNED MESSAGES DRAWER (RESPONSIVE)                                    */}
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
    </div>
  );
};
