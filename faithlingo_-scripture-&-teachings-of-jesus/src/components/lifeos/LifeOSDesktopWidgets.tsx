import React, { useState, useEffect } from 'react';
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
  Send
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
  const { launchApp } = useLifeOS();
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
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto max-h-full">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">LifeOS Desktop</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-stone-200 text-xs font-bold border border-white/20 backdrop-blur-md">
              Dashboard
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Your spiritual command center. Live widgets, sermon scribe, and scripture devotion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              sounds.playTap();
              onOpenAddModal();
            }}
            className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
            title="Add or remove desktop widgets"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Customize Widgets</span>
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      {activeWidgets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-black/30 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeWidgets.map((widgetId) => {
            const config = ALL_DESKTOP_WIDGETS.find(w => w.id === widgetId);
            if (!config) return null;

            return (
              <div
                key={widgetId}
                className="group relative rounded-3xl bg-stone-900/60 hover:bg-stone-900/75 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Delete Widget Button */}
                <button
                  onClick={() => {
                    sounds.playTap();
                    onRemoveWidget(widgetId);
                  }}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-black/40 hover:bg-rose-600 text-stone-400 hover:text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-20"
                  title="Remove widget from desktop"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Widget Header */}
                <div className="flex items-center gap-2.5 mb-3 select-none">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-sm">
                    {config.emoji}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      {config.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-medium line-clamp-1">{config.subtitle}</p>
                  </div>
                </div>

                {/* Widget Specific Body */}
                <div className="flex-1 my-1">
                  {/* 1. ChurchNotes Scribe Widget */}
                  {widgetId === 'church_notes' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-200">
                        {latestNote ? (
                          <>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-extrabold text-amber-300 line-clamp-1">
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
                        <span>📁 {totalNotesCount} Sermon Notes Saved</span>
                        <span className="text-emerald-400 flex items-center gap-1">☁️ Google Drive Ready</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Fellowship Group Chat Widget */}
                  {widgetId === 'fellowship_chat' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-stone-200">
                        {latestChatMessage ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-300 flex items-center gap-1">
                                {latestChatMessage.senderName}
                                {latestChatMessage.isGoogleUser && (
                                  <span className="text-[10px] text-emerald-400">✓</span>
                                )}
                              </span>
                              <span className="text-[10px] text-stone-400">
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

                  {/* 2. FaithLingo Stats Widget */}
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

                  {/* 3. Verse of the Day Widget */}
                  {widgetId === 'verse_of_day' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-stone-100">
                        <div className="flex items-center justify-between text-xs font-black text-blue-300 mb-1.5">
                          <span>{todayHighlight.reference}</span>
                          <span className="text-[10px] text-stone-400 font-semibold">{todayHighlight.theme}</span>
                        </div>
                        <p className="text-xs italic font-serif leading-relaxed text-stone-200">
                          “{todayHighlight.text}”
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={handleAudioNarration}
                          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isPlayingAudio ? 'Playing...' : 'Audio'}</span>
                        </button>
                        <button
                          onClick={handleCopyVerse}
                          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedVerse ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. Fast Sermon Voice Listener Widget */}
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
                        <span>🎙️ Sanctuary (+8dB) Boost</span>
                        <span>✨ AI Structured</span>
                      </div>
                    </div>
                  )}

                  {/* 5. Daily Prayer Wall Widget */}
                  {widgetId === 'prayer_focus' && (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
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

                      <form onSubmit={handleAddPrayer} className="flex items-center gap-1.5 pt-1">
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

                  {/* 6. Spiritual Disciplines Widget */}
                  {widgetId === 'spiritual_habits' && (
                    <div className="flex flex-col gap-2">
                      <div className="space-y-2">
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

                  {/* 7. App Studio Widget */}
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
                </div>

                {/* Widget Action Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
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
                      } else if (widgetId === 'app_studio') {
                        launchApp('app_studio');
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
                        ? 'Open Fellowship Chat'
                        : widgetId === 'quick_listen'
                        ? 'Record Sermon'
                        : widgetId === 'app_studio'
                        ? 'Open Studio'
                        : 'Open FaithLingo'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
