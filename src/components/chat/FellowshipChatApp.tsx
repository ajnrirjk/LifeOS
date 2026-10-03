import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ChatChannel, ChatUser, ActiveChatMember } from '../../types/chat';
import { chatService, DEFAULT_CHANNELS, DEFAULT_SEED_MESSAGES } from '../../services/chatService';
import { googleDriveService, getFriendlyAuthErrorMessage } from '../../services/googleDriveService';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../services/soundEffects';
import {
  Send,
  Plus,
  Hash,
  Users,
  Search,
  BookOpen,
  Share2,
  LogIn,
  LogOut,
  X,
  Volume2,
  VolumeX,
  MessageSquare,
  AlertTriangle,
  Edit2,
  Check,
  HeartHandshake
} from 'lucide-react';

export const FellowshipChatApp: React.FC = () => {
  const { todayHighlight } = useApp();

  // Active channel & messages with robust fallback for Vercel & offline
  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_fellowship_channels_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CHANNELS;
  });

  const [activeChannelId, setActiveChannelId] = useState<string>('general');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_fellowship_messages_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((m: ChatMessage) => m.channelId === 'general');
        }
      }
    } catch {}
    return DEFAULT_SEED_MESSAGES.filter(m => m.channelId === 'general');
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Current User (Google or Guest / Custom Name)
  const [currentUser, setCurrentUser] = useState<ChatUser>(() => {
    try {
      const saved = localStorage.getItem('lifeos_chat_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    const guestId = `guest_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id: guestId,
      name: 'Believer in Christ',
      isGoogleUser: false,
      photoURL: '',
    };
  });

  const [activeUsersCount, setActiveUsersCount] = useState<number>(1);
  const [activeMembers, setActiveMembers] = useState<ActiveChatMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelTopic, setNewChannelTopic] = useState('');
  const [newChannelEmoji, setNewChannelEmoji] = useState('🕊️');
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState(currentUser.name);
  const [isMobileChannelsOpen, setIsMobileChannelsOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [authErrorModal, setAuthErrorModal] = useState<{ title: string; message: string; actionTip?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Sync current user with chatService for active SSE & presence
  useEffect(() => {
    chatService.setCurrentUser(currentUser);
  }, [currentUser]);

  // Initialize Google Auth listener
  useEffect(() => {
    const unsub = googleDriveService.initAuth(
      (user) => {
        const updated: ChatUser = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          isGoogleUser: true,
        };
        setCurrentUser(updated);
        chatService.setCurrentUser(updated);
        try {
          localStorage.setItem('lifeos_chat_user', JSON.stringify(updated));
        } catch {}
      },
      () => {
        // Not signed in with Google, keep guest identity
      }
    );
    return () => unsub();
  }, []);

  // Fetch channels on mount
  useEffect(() => {
    chatService.getChannels().then(setChannels).catch(console.error);
    chatService.getPresence().then((res) => {
      setActiveUsersCount(res.activeUsers);
      setActiveMembers(res.members);
    }).catch(() => {});
  }, []);

  // Fetch messages when active channel changes
  useEffect(() => {
    chatService.getMessages(activeChannelId).then(setMessages).catch(console.error);
  }, [activeChannelId]);

  // Subscribe to real-time events & polling sync across devices
  useEffect(() => {
    const unsubscribe = chatService.subscribe((event) => {
      if (event.type === 'message') {
        const newMsg: ChatMessage = event.data;
        if (newMsg.channelId === activeChannelId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Play notification chime if message is from another device / user
          if (newMsg.senderId !== currentUser.id) {
            sounds.playTap();
          }
        }
        // Update channels last message in sidebar
        setChannels((prev) =>
          prev.map((c) =>
            c.id === newMsg.channelId
              ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.createdAt }
              : c
          )
        );
      } else if (event.type === 'reaction') {
        const { messageId, reactions } = event.data;
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
        );
      } else if (event.type === 'new_channel') {
        const channel: ChatChannel = event.data;
        setChannels((prev) => {
          if (prev.some((c) => c.id === channel.id)) return prev;
          return [...prev, channel];
        });
      } else if (event.type === 'presence') {
        setActiveUsersCount(Math.max(1, event.data.activeUsers || 1));
        if (Array.isArray(event.data.members)) {
          setActiveMembers(event.data.members);
        }
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
      } else if (event.type === 'poll_tick') {
        // Fast background sync: reconcile messages across all devices
        chatService.getMessages(activeChannelId).then((incoming) => {
          setMessages((prev) => {
            // Check if there are differences
            if (incoming.length === prev.length) {
              // Check reactions
              const isDifferent = incoming.some((inc, i) => {
                const p = prev[i];
                return !p || inc.id !== p.id || JSON.stringify(inc.reactions) !== JSON.stringify(p.reactions);
              });
              if (!isDifferent) return prev;
            }
            return incoming;
          });
        }).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [activeChannelId, currentUser.id, currentUser.name]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    sounds.playTap();
    try {
      const { user } = await googleDriveService.signIn();
      const updated: ChatUser = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        isGoogleUser: true,
      };
      setCurrentUser(updated);
      chatService.setCurrentUser(updated);
      try {
        localStorage.setItem('lifeos_chat_user', JSON.stringify(updated));
      } catch {}
      sounds.playVictory();
    } catch (err: any) {
      console.warn('Google Sign-In cancelled or failed:', err);
      const friendly = getFriendlyAuthErrorMessage(err);
      setAuthErrorModal(friendly);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    sounds.playTap();
    await googleDriveService.signOutUser();
    const guestUser: ChatUser = {
      id: `guest_${Math.random().toString(36).substring(2, 8)}`,
      name: 'Believer in Christ',
      isGoogleUser: false,
    };
    setCurrentUser(guestUser);
    chatService.setCurrentUser(guestUser);
    try {
      localStorage.setItem('lifeos_chat_user', JSON.stringify(guestUser));
    } catch {}
  };

  // Handle Guest / Custom Name Save
  const handleSaveGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNameInput.trim()) return;
    sounds.playTap();
    const updated: ChatUser = { ...currentUser, name: guestNameInput.trim() };
    setCurrentUser(updated);
    chatService.setCurrentUser(updated);
    setIsEditingGuestName(false);
    try {
      localStorage.setItem('lifeos_chat_user', JSON.stringify(updated));
    } catch {}
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playTap();
    const textToSend = inputText.trim();
    setInputText('');

    chatService.sendTyping(activeChannelId, currentUser.name, false);

    try {
      const newMsg = await chatService.sendMessage({
        channelId: activeChannelId,
        text: textToSend,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderPhoto: currentUser.photoURL,
        senderEmail: currentUser.email,
        isGoogleUser: currentUser.isGoogleUser,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Share Verse of the Day into Chat
  const handleShareVerse = async () => {
    sounds.playVictory();
    try {
      const newMsg = await chatService.sendMessage({
        channelId: activeChannelId,
        text: `“${todayHighlight.text}” — ${todayHighlight.reference}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderPhoto: currentUser.photoURL,
        senderEmail: currentUser.email,
        isGoogleUser: currentUser.isGoogleUser,
        attachment: {
          type: 'verse',
          title: `Verse of the Day • ${todayHighlight.reference}`,
          content: todayHighlight.reflection,
          reference: todayHighlight.reference,
        },
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Error sharing verse:', err);
    }
  };

  // Share Latest Sermon Note into Chat
  const handleShareSermonNote = async () => {
    sounds.playVictory();
    try {
      const saved = localStorage.getItem('lifeos_church_sermon_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const note = parsed[0];
          const newMsg = await chatService.sendMessage({
            channelId: activeChannelId,
            text: `Sharing notes from today's sermon: "${note.title || 'Sunday Sermon'}" (${note.passage || 'Scripture'})`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderPhoto: currentUser.photoURL,
            senderEmail: currentUser.email,
            isGoogleUser: currentUser.isGoogleUser,
            attachment: {
              type: 'sermon_note',
              title: note.title || 'Sunday Sermon Notes',
              content: note.content ? note.content.slice(0, 300) + '...' : 'Sermon notes excerpt',
              reference: note.passage || '',
            },
          });

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      }
    } catch (err) {
      console.error('Error sharing note:', err);
    }
  };

  // Toggle emoji reaction
  const handleReaction = (messageId: string, emoji: string) => {
    sounds.playTap();
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = { ...(msg.reactions || {}) };
        const userList = currentReactions[emoji] || [];
        if (userList.includes(currentUser.name)) {
          currentReactions[emoji] = userList.filter((u) => u !== currentUser.name);
          if (currentReactions[emoji].length === 0) {
            delete currentReactions[emoji];
          }
        } else {
          currentReactions[emoji] = [...userList, currentUser.name];
        }
        return { ...msg, reactions: currentReactions };
      })
    );
    chatService.toggleReaction(messageId, emoji, currentUser.name);
  };

  // Handle typing change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    chatService.sendTyping(activeChannelId, currentUser.name, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(activeChannelId, currentUser.name, false);
    }, 2000);
  };

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    sounds.playVictory();
    try {
      const chan = await chatService.createChannel(
        newChannelName.trim(),
        newChannelTopic.trim() || 'Community Group Chat',
        newChannelEmoji,
        currentUser.id
      );
      setNewChannelName('');
      setNewChannelTopic('');
      setIsNewChannelModalOpen(false);
      setChannels((prev) => {
        if (prev.some((c) => c.id === chan.id)) return prev;
        return [...prev, chan];
      });
      setActiveChannelId(chan.id);
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || {
    id: 'general',
    name: 'general-fellowship',
    topic: 'Welcome & community fellowship in Christ',
    emoji: '🕊️',
  };

  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-stone-900 text-stone-100 select-none overflow-hidden font-sans relative">
      {/* Mobile Backdrop for Channels Drawer */}
      {isMobileChannelsOpen && (
        <div
          onClick={() => setIsMobileChannelsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar: Group Channels & Rooms */}
      <aside
        className={`w-72 sm:w-80 bg-stone-950/98 md:bg-black/40 border-r border-white/10 flex flex-col shrink-0 z-30 transition-transform duration-200 absolute inset-y-0 left-0 md:relative md:translate-x-0 ${
          isMobileChannelsOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: App Header & Current User */}
        <div className="p-3.5 border-b border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕊️</span>
              <span className="font-black text-sm text-white tracking-tight">Fellowship Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  sounds.playTap();
                  setIsNewChannelModalOpen(true);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-emerald-600 text-white transition-colors"
                title="Create new group channel"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
              <button
                onClick={() => setIsMobileChannelsOpen(false)}
                className="md:hidden p-1.5 rounded-xl bg-white/10 text-stone-400 hover:text-white"
                title="Close channels"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Profile & Account Card */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-xs font-black text-white truncate flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.isGoogleUser && (
                      <span className="text-[10px] text-emerald-400 font-bold" title="Google Verified Account">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-stone-400 truncate">
                    {currentUser.isGoogleUser ? currentUser.email || 'Google Account' : 'Guest Account'}
                  </span>
                </div>
              </div>

              {currentUser.isGoogleUser ? (
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGuestNameInput(currentUser.name);
                    setIsEditingGuestName(!isEditingGuestName);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors"
                  title="Change your chat display name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Edit Guest Name Input Box */}
            {isEditingGuestName && !currentUser.isGoogleUser && (
              <form onSubmit={handleSaveGuestName} className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  placeholder="Enter your name / device..."
                  className="flex-1 px-2.5 py-1 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save
                </button>
              </form>
            )}

            {/* Google Sign-in Prompt if guest */}
            {!currentUser.isGoogleUser && (
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all border border-white/10"
              >
                {/* Official Google G Icon */}
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Channels */}
        <div className="px-3 pt-2.5 pb-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-black uppercase text-stone-400 tracking-wider">
            Group Channels
          </div>

          {filteredChannels.map((channel) => {
            const isActive = channel.id === activeChannelId;
            return (
              <button
                key={channel.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveChannelId(channel.id);
                  setIsMobileChannelsOpen(false);
                }}
                className={`w-full p-2.5 rounded-2xl flex items-center gap-2.5 text-left transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'hover:bg-white/5 text-stone-300'
                }`}
              >
                <span className="text-xl">{channel.emoji}</span>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black truncate">#{channel.name}</span>
                  </div>
                  <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-stone-400'}`}>
                    {channel.lastMessage || channel.topic}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Active Devices & Presence Drawer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="View Active Users on other devices"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeUsersCount} online</span>
          </button>
          <button
            onClick={() => setIsNewChannelModalOpen(true)}
            className="text-stone-400 hover:text-white text-[11px] transition-colors"
          >
            + New Group
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-stone-900/90 overflow-hidden min-w-0">
        {/* Chat Room Top Bar */}
        <header className="h-14 px-3 sm:px-5 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                sounds.playTap();
                setIsMobileChannelsOpen(true);
              }}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
              title="Open channels list"
            >
              <Hash className="w-4 h-4" />
            </button>
            <span className="text-xl sm:text-2xl shrink-0">{activeChannel.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
                #{activeChannel.name}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate max-w-[140px] sm:max-w-md">
                {activeChannel.topic}
              </p>
            </div>
          </div>

          {/* Quick Share & Active Members Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Who is online right now"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{activeUsersCount} Online</span>
            </button>

            <button
              onClick={handleShareVerse}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all shadow-sm"
              title="Share Today's Verse into group chat"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Share Verse</span>
            </button>

            <button
              onClick={handleShareSermonNote}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm"
              title="Share Sermon Note into group chat"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Note</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <span className="text-4xl mb-2">{activeChannel.emoji}</span>
              <h3 className="text-sm font-black text-white">#{activeChannel.name}</h3>
              <p className="text-xs max-w-sm mt-1 text-stone-400">
                Welcome to fellowship! Send a message or scripture to start the conversation with other believers.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group animate-in fade-in duration-200 ${
                    isMine ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  {msg.senderPhoto ? (
                    <img
                      src={msg.senderPhoto}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name & Time Header */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        {msg.senderName}
                        {msg.isGoogleUser && (
                          <span className="text-[10px] text-emerald-400 font-bold" title="Google Verified User">
                            ✓
                          </span>
                        )}
                        {isMine && (
                          <span className="text-[10px] text-stone-400 font-normal">(You)</span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">{formattedTime}</span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`p-3.5 rounded-3xl text-xs leading-relaxed select-text shadow-sm ${
                        isMine
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-stone-800 text-stone-100 rounded-tl-none border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-normal">{msg.text}</p>

                      {/* Attached Verse or Sermon Note Card */}
                      {msg.attachment && (
                        <div className="mt-2.5 p-2.5 rounded-2xl bg-black/30 border border-white/15 text-stone-200">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300 mb-1">
                            <span>{msg.attachment.type === 'verse' ? '📜 Scripture' : '📖 Church Note'}</span>
                            <span>•</span>
                            <span>{msg.attachment.title}</span>
                          </div>
                          <p className="text-[11px] italic font-serif leading-relaxed text-stone-300">
                            {msg.attachment.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1 mt-1.5 px-1 flex-wrap">
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, users]) => {
                          const hasReacted = users.includes(currentUser.name);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border transition-all ${
                                hasReacted
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                  : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{users.length}</span>
                            </button>
                          );
                        })}

                      {/* Quick Emoji Triggers */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        {['❤️', '🙏', '✝️', '🕊️', '🙌'].map((e) => (
                          <button
                            key={e}
                            onClick={() => handleReaction(msg.id, e)}
                            className="w-5 h-5 rounded-full hover:bg-white/15 flex items-center justify-center text-xs transition-transform hover:scale-125"
                            title={`React ${e}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-5 py-1 text-[11px] text-emerald-400 font-bold italic animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...</span>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3.5 bg-black/40 border-t border-white/10 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Quick Share Verse on Mobile */}
            <button
              type="button"
              onClick={handleShareVerse}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 transition-colors sm:hidden"
              title="Share verse"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message #${activeChannel.name} as ${currentUser.name}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-800/90 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>

      {/* MODAL: ONLINE MEMBERS & CONNECTED DEVICES */}
      <AnimatePresence>
        {isMembersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-stone-900 border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white">Online Believers</h3>
                  <span className="text-xs text-stone-400">({activeMembers.length || 1})</span>
                </div>
                <button
                  onClick={() => setIsMembersModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {activeMembers.length > 0 ? (
                  activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-black text-white block">
                            {member.name} {member.id === currentUser.id && '(You)'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {member.isGoogleUser ? 'Google Verified' : 'Community Member'}
                          </span>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active now" />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-400 text-center py-4">
                    You are connected! Open another tab or browser to chat across accounts.
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="w-full py-2 rounded-xl bg-stone-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE NEW GROUP CHAT */}
      <AnimatePresence>
        {isNewChannelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{newChannelEmoji}</span>
                  <h3 className="text-base font-black text-white">Create Group Chat</h3>
                </div>
                <button
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Pick Group Icon</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['🕊️', '📖', '🙏', '✝️', '🔥', '🌿', '✨', '🛡️'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewChannelEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          newChannelEmoji === emoji
                            ? 'bg-emerald-600 scale-110 shadow-md ring-2 ring-emerald-400'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. youth-fellowship, romans-study"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Topic / Purpose</label>
                  <input
                    type="text"
                    value={newChannelTopic}
                    onChange={(e) => setNewChannelTopic(e.target.value)}
                    placeholder="What is this group gathering for?"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewChannelModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Auth Error Modal */}
      {authErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-6 max-w-md w-full text-stone-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{authErrorModal.title}</h3>
                <p className="text-xs text-stone-400">Google Authentication Notice</p>
              </div>
            </div>

            <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800 text-xs sm:text-sm text-stone-300 space-y-2">
              <p>{authErrorModal.message}</p>
              {authErrorModal.actionTip && (
                <div className="pt-2 border-t border-stone-800/80 text-amber-300/90 text-xs font-medium">
                  👉 <strong>Fix:</strong> {authErrorModal.actionTip}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  sounds.playTap();
                  setAuthErrorModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
