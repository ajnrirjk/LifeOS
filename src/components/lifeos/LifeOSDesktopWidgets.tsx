import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WidgetId, ALL_DESKTOP_WIDGETS } from '../../types/widgets';
import { useLifeOS } from '../../context/LifeOSContext';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../services/soundEffects';
import { tts } from '../../services/ttsService';
import {
  BookOpen,
  Mic,
  Heart,
  Flame,
  Volume2,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  Wand2,
  Layers,
  ArrowRight,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LifeOSDesktopWidgetsProps {
  activeWidgets: WidgetId[];
  onRemoveWidget: (id: WidgetId) => void;
  onOpenAddModal: () => void;
}

interface PrayerItem {
  id: string;
  text: string;
  isAnswered: boolean;
}

const DEFAULT_PRAYERS: PrayerItem[] = [
  { id: '1', text: 'Wisdom & discernment for work and family this week', isAnswered: false },
  { id: '2', text: 'Healing & peace for loved ones in need', isAnswered: true },
  { id: '3', text: 'A deeper, persistent prayer life and love for God’s Word', isAnswered: false },
];

export const LifeOSDesktopWidgets: React.FC<LifeOSDesktopWidgetsProps> = ({
  activeWidgets,
  onRemoveWidget,
  onOpenAddModal
}) => {
  const { launchApp, moveDesktopWidget } = useLifeOS();
  const { userStats, todayHighlight } = useApp();

  const streak = userStats?.streak ?? 7;
  const hearts = userStats?.hearts ?? 5;
  const xp = userStats?.xp ?? 410;

  // Latest Sermon Note from localStorage
  const [latestNote, setLatestNote] = useState<any>(null);
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0);

  // Copy state for verse
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Prayer Wall state
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_prayer_wall');
      return saved ? JSON.parse(saved) : DEFAULT_PRAYERS;
    } catch {
      return DEFAULT_PRAYERS;
    }
  });
  const [newPrayerText, setNewPrayerText] = useState('');

  // Daily Habits state
  const [habits, setHabits] = useState<{ [key: string]: boolean }>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`lifeos_habits_${today}`);
      return saved ? JSON.parse(saved) : { scripture: true, notes: false, prayer: false };
    } catch {
      return { scripture: true, notes: false, prayer: false };
    }
  });

  // Latest Chat Message state
  const [latestChatMessage, setLatestChatMessage] = useState<any>(null);
  const [quickChatInput, setQuickChatInput] = useState('');
  const [chatUser, setChatUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('lifeos_chat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Subscribe to latest chat messages
  useEffect(() => {
    import('../../services/chatService').then(({ chatService }) => {
      chatService.getMessages('general').then((msgs) => {
        if (msgs.length > 0) {
          setLatestChatMessage(msgs[msgs.length - 1]);
        }
      }).catch(() => {});

      const unsub = chatService.subscribe((event) => {
        if (event.type === 'message') {
          setLatestChatMessage(event.data);
        }
      });
      return () => unsub();
    });
  }, []);

  const handleSendQuickChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickChatInput.trim()) return;
    sounds.playTap();
    const text = quickChatInput.trim();
    setQuickChatInput('');
    try {
      const { chatService } = await import('../../services/chatService');
      await chatService.sendMessage({
        channelId: 'general',
        text,
        senderId: chatUser?.id || 'guest',
        senderName: chatUser?.name || 'Fellow Believer',
        senderPhoto: chatUser?.photoURL,
        isGoogleUser: !!chatUser?.isGoogleUser,
      });
    } catch {}
  };

  // Load church notes info
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifeos_church_sermon_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTotalNotesCount(parsed.length);
          setLatestNote(parsed[0]);
        }
      }
    } catch {}
  }, []);

  // Persist prayers
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_prayer_wall', JSON.stringify(prayers));
    } catch {}
  }, [prayers]);

  // Persist daily habits
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(`lifeos_habits_${today}`, JSON.stringify(habits));
    } catch {}
  }, [habits]);

  const handleToggleHabit = (key: string) => {
    sounds.playTap();
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePrayer = (id: string) => {
    sounds.playVictory();
    setPrayers(prev =>
      prev.map(p => (p.id === id ? { ...p, isAnswered: !p.isAnswered } : p))
    );
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerText.trim()) return;
    sounds.playTap();
    const item: PrayerItem = {
      id: Date.now().toString(),
      text: newPrayerText.trim(),
      isAnswered: false,
    };
    setPrayers(prev => [item, ...prev]);
    setNewPrayerText('');
  };

  const handleCopyVerse = () => {
    sounds.playTap();
    const text = `"${todayHighlight.text}" — ${todayHighlight.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  const handleAudioNarration = () => {
    sounds.playTap();
    if (isPlayingAudio) {
      tts.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const text = `${todayHighlight.reference}. ${todayHighlight.text}. Reflection: ${todayHighlight.reflection}`;
      tts.toggle(text);
      setTimeout(() => setIsPlayingAudio(false), 12000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-5 pb-28 md:pb-28 overflow-y-auto max-h-full">
      {/* Top Welcome & Actions Header */}
      <div className="flex items-center justify-between gap-3 select-none pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shadow-inner shrink-0">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                LifeOS <span className="hidden sm:inline">Desktop</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
                Dashboard
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 line-clamp-1 font-medium">
              Spiritual command center, daily scripture & live fellowship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              onOpenAddModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            title="Add or remove desktop widgets"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Customize Widgets</span>
            <span className="sm:hidden">Widgets</span>
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      {activeWidgets.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-black/30 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">🕊️</span>
          <h3 className="text-base font-bold text-white">No Widgets on Desktop</h3>
          <p className="text-xs text-stone-300 max-w-sm">
            Add widgets to preview your sermon notes, track daily Bible study, or listen to the verse of the day.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Widget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {activeWidgets.map((widgetId, index) => {
            const config = ALL_DESKTOP_WIDGETS.find(w => w.id === widgetId);
            if (!config) return null;

            return (
              <motion.div
                key={widgetId}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350, delay: index * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-3xl bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden min-h-[235px]"
              >
                {/* Widget Header with Integrated Action Controls */}
                <div className="flex items-center justify-between gap-2 mb-3 select-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <motion.div 
                      whileHover={{ scale: 1.12, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-sm shrink-0"
                    >
                      {config.emoji}
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">
                        {config.title}
                      </h3>
                      <p className="text-[11px] text-stone-400 font-medium truncate">{config.subtitle}</p>
                    </div>
                  </div>

                  {/* Reorder & Remove Controls */}
                  <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        onClick={() => moveDesktopWidget(widgetId, 'prev')}
                        className="w-6 h-6 rounded-lg bg-black/40 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Move left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {index < activeWidgets.length - 1 && (
                      <button
                        onClick={() => moveDesktopWidget(widgetId, 'next')}
                        className="w-6 h-6 rounded-lg bg-black/40 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Move right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        sounds.playTap();
                        onRemoveWidget(widgetId);
                      }}
                      className="w-6 h-6 rounded-lg bg-black/40 hover:bg-rose-600 text-stone-400 hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="Remove widget"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Widget Specific Body */}
                <div className="flex-1 my-2 flex flex-col justify-center">
                  {/* 1. ChurchNotes Scribe Widget */}
                  {widgetId === 'church_notes' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-200">
                        {latestNote ? (
                          <>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-extrabold text-amber-300 truncate">
                                {latestNote.title || 'Untitled Sermon'}
                              </span>
                              <span className="text-[10px] text-stone-400 shrink-0 font-bold">
                                {latestNote.passage || 'Scripture'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-300 line-clamp-2 italic font-serif">
                              {latestNote.content ? latestNote.content.slice(0, 110) + '...' : 'Clean sermon study notes.'}
                            </p>
                          </>
                        ) : (
                          <div className="text-xs text-stone-400 italic">
                            No sermon notes yet. Tap below to write or dictate your first church note.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 px-1">
                        <span>📁 {totalNotesCount} Sermon Notes</span>
                        <span className="text-emerald-400 flex items-center gap-1">☁️ Google Drive Ready</span>
                      </div>
                    </div>
                  )}

                  {/* YouTube Player Widget */}
                  {widgetId === 'youtube' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-red-600/15 border border-red-500/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shrink-0">
                          <span className="text-sm font-black">▶️</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate">Worship & Study Stream</h4>
                          <p className="text-[11px] text-stone-300 truncate">
                            Elevation, Maverick City, BibleProject & Lofi
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 px-1">
                        <span className="text-stone-400">Picture-in-Picture Ready</span>
                        <span className="text-red-400 font-black">1080p HD</span>
                      </div>
                    </div>
                  )}

                  {/* Cat Fighter Turbo Widget */}
                  {widgetId === 'mini_cats' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                          <div className="text-xl mb-0.5">🥋</div>
                          <div className="text-[10px] font-bold text-white truncate">Ryu-Paw</div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                          <div className="text-xl mb-0.5">🎀</div>
                          <div className="text-[10px] font-bold text-white truncate">Chun-Meow</div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                          <div className="text-xl mb-0.5">👹</div>
                          <div className="text-[10px] font-bold text-white truncate">Akuma-Cat</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 text-[11px] text-stone-300 font-bold">
                        <span>🥊 16-Bit Engine</span>
                        <button
                          onClick={() => {
                            sounds.playMeow();
                            sounds.playPurr();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition-all"
                        >
                          Pet Kitty 💖
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fellowship Group Chat Widget */}
                  {widgetId === 'fellowship_chat' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-stone-200">
                        {latestChatMessage ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-300 flex items-center gap-1 truncate">
                                {latestChatMessage.senderName}
                                {latestChatMessage.isGoogleUser && (
                                  <span className="text-[10px] text-emerald-400">✓</span>
                                )}
                              </span>
                              <span className="text-[10px] text-stone-400 shrink-0">
                                {new Date(latestChatMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                              {latestChatMessage.text}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 italic">
                            No messages yet. Send an encouraging word to the group!
                          </p>
                        )}
                      </div>

                      <form onSubmit={handleSendQuickChat} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={quickChatInput}
                          onChange={(e) => setQuickChatInput(e.target.value)}
                          placeholder="Quick reply to group..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-blue-400"
                        />
                        <button
                          type="submit"
                          disabled={!quickChatInput.trim()}
                          className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}

                  {/* FaithLingo Stats Widget */}
                  {widgetId === 'faithlingo_stats' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                          <span className="text-xl font-black text-amber-400 flex items-center gap-1">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            {streak} Days
                          </span>
                          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                            Daily Streak
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center text-center">
                          <span className="text-xl font-black text-rose-400 flex items-center gap-1">
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            {hearts}/5
                          </span>
                          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                            Hearts Left
                          </span>
                        </div>
                      </div>

                      <div className="px-1">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-300 mb-1">
                          <span>Today's XP Goal</span>
                          <span className="text-emerald-400">{xp} XP Earned</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (xp / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verse of the Day Widget */}
                  {widgetId === 'verse_of_day' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-stone-100">
                        <div className="flex items-center justify-between text-xs font-black text-blue-300 mb-1.5">
                          <span>{todayHighlight.reference}</span>
                          <span className="text-[10px] text-stone-400 font-semibold">{todayHighlight.theme}</span>
                        </div>
                        <p className="text-xs italic font-serif leading-relaxed text-stone-200 line-clamp-3">
                          “{todayHighlight.text}”
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-0.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAudioNarration}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isPlayingAudio 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-white/10 hover:bg-white/20 text-stone-200'
                          }`}
                        >
                          {isPlayingAudio ? (
                            <div className="flex items-center gap-0.5 h-3">
                              <motion.div animate={{ scaleY: [0.3, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 h-3 bg-white rounded-full" />
                              <motion.div animate={{ scaleY: [0.8, 0.2, 0.9] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-3 bg-white rounded-full" />
                              <motion.div animate={{ scaleY: [0.4, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 h-3 bg-white rounded-full" />
                            </div>
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{isPlayingAudio ? 'Listening' : 'Audio'}</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopyVerse}
                          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedVerse ? 'Copied' : 'Copy'}</span>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Quick Sermon Listen Widget */}
                  {widgetId === 'quick_listen' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-200">
                        <div className="flex items-center gap-2 mb-1.5 text-amber-300 font-black text-xs">
                          <Mic className="w-4 h-4 text-rose-400" />
                          <span>Sanctuary Voice Scribe</span>
                        </div>
                        <p className="text-xs text-stone-300 leading-normal">
                          Filters out announcements and choir chatter. Captures long church sermons with deep theological outlines.
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 px-1">
                        <span>🎙️ Sanctuary Boost</span>
                        <span>✨ AI Structured</span>
                      </div>
                    </div>
                  )}

                  {/* Daily Prayer Wall Widget */}
                  {widgetId === 'prayer_focus' && (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {prayers.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleTogglePrayer(item.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-xs text-stone-200 cursor-pointer transition-all"
                          >
                            {item.isAnswered ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                            )}
                            <span className={`line-clamp-1 flex-1 ${item.isAnswered ? 'line-through text-stone-400' : ''}`}>
                              {item.text}
                            </span>
                            {item.isAnswered && (
                              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">Answered!</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddPrayer} className="flex items-center gap-1.5 pt-0.5">
                        <input
                          type="text"
                          value={newPrayerText}
                          onChange={(e) => setNewPrayerText(e.target.value)}
                          placeholder="+ Add prayer petition..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Spiritual Disciplines Widget */}
                  {widgetId === 'spiritual_habits' && (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1.5">
                        {[
                          { key: 'scripture', label: 'Daily Bible Reading (15 min)' },
                          { key: 'notes', label: 'Sermon / Devotional Journal' },
                          { key: 'prayer', label: 'Morning & Evening Prayer' }
                        ].map((habit) => (
                          <div
                            key={habit.key}
                            onClick={() => handleToggleHabit(habit.key)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs text-stone-200 cursor-pointer transition-all"
                          >
                            <span className={habits[habit.key] ? 'font-bold text-white' : 'text-stone-400'}>
                              {habit.label}
                            </span>
                            {habits[habit.key] ? (
                              <CheckCircle2 className="w-4 h-4 text-rose-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mini Games Arcade Widget */}
                  {widgetId === 'mini_games' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                          <div className="text-xl mb-0.5">🕊️</div>
                          <div className="text-[10px] font-bold text-white truncate">Flappy Dove</div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-center">
                          <div className="text-xl mb-0.5">🧱</div>
                          <div className="text-[10px] font-bold text-white truncate">Babel Stacker</div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                          <div className="text-xl mb-0.5">⚔️</div>
                          <div className="text-[10px] font-bold text-white truncate">Demon Buster</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 text-[11px] font-bold text-stone-300">
                        <span>🕹️ 8 Retro Games</span>
                        <span className="text-amber-400">Tokens & High Scores</span>
                      </div>
                    </div>
                  )}

                  {/* App Studio Widget */}
                  {widgetId === 'app_studio' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-stone-200">
                        <div className="flex items-center gap-2 mb-1.5 text-cyan-300 font-black text-xs">
                          <Wand2 className="w-4 h-4" />
                          <span>AI Spiritual App Studio</span>
                        </div>
                        <p className="text-xs text-stone-300 leading-normal">
                          Build custom fasting logs, habit trackers, and personal devotion tools with AI in seconds.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Life Meet Widget */}
                  {widgetId === 'life_meet' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl shrink-0">
                          📹
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-white truncate">Fellowship Video Calls</h4>
                          <p className="text-[11px] text-stone-300 truncate">
                            WebRTC group audio/video & screen sharing
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 px-1">
                        <span className="text-stone-400">Prayer Rooms & Bible Study</span>
                        <span className="text-emerald-400 font-black">Live WebRTC</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Widget Action Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between select-none">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    {config.category}
                  </span>

                  <button
                    onClick={() => {
                      sounds.playTap();
                      if (widgetId === 'church_notes' || widgetId === 'quick_listen') {
                        launchApp('bible_journal');
                      } else if (widgetId === 'fellowship_chat') {
                        launchApp('fellowship_chat');
                      } else if (widgetId === 'mini_games') {
                        launchApp('mini_games');
                      } else if (widgetId === 'mini_cats') {
                        launchApp('mini_cats');
                      } else if (widgetId === 'app_studio') {
                        launchApp('app_studio');
                      } else if (widgetId === 'life_meet') {
                        launchApp('faith_meet');
                      } else if (widgetId === 'youtube') {
                        launchApp('youtube');
                      } else {
                        launchApp('faithlingo');
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-black text-white hover:text-emerald-300 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>
                      {widgetId === 'church_notes'
                        ? 'Open ChurchNotes'
                        : widgetId === 'fellowship_chat'
                        ? 'Open Chat'
                        : widgetId === 'mini_games'
                        ? 'Play Arcade'
                        : widgetId === 'mini_cats'
                        ? 'Play Cat Fighter'
                        : widgetId === 'quick_listen'
                        ? 'Record Sermon'
                        : widgetId === 'app_studio'
                        ? 'Open Studio'
                        : widgetId === 'life_meet'
                        ? 'Join LifeMeet'
                        : widgetId === 'youtube'
                        ? 'Open YouTube'
                        : widgetId === 'prayer_focus'
                        ? 'View Prayer Wall'
                        : widgetId === 'spiritual_habits'
                        ? 'Track Disciplines'
                        : 'Open FaithLingo'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
