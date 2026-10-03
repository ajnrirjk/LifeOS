import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { useLifeOS } from '../../context/LifeOSContext';
import {
  User,
  Shield,
  Palette,
  Volume2,
  BookOpen,
  Database,
  Crown,
  Sparkles,
  Flame,
  Heart,
  Bell,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Megaphone,
  Radio,
  Sliders,
  Check,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Zap
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { UserRole, ThemeAccent, FontScale, FellowshipMember } from '../../types/settings';

const AVATAR_PRESETS = [
  '🕊️', '✝️', '👑', '📖', '🧔🏻‍♂️', '👩🏼', '🌟', '🌿', '🕯️', '🛡️', '🦁', '🐑', '⛪', '🥊', '🕹️', '🌊'
];

export const SystemSettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateProfile,
    isSettingsOpen,
    setIsSettingsOpen,
    activeTab,
    setActiveTab,
    members,
    updateMemberRole,
    updateMemberStatus,
    addMember,
    deleteMember,
    announcement,
    setAnnouncement,
    toggleMaintenanceMode,
    toggleAppVisibility,
    auditLogs,
    clearAuditLogs,
    exportBackup,
    importBackup,
    factoryReset
  } = useSettings();

  const {
    userStats,
    addXp,
    refillHearts,
    toggleDarkMode,
    darkMode
  } = useApp();

  const { apps } = useLifeOS();

  // Admin PIN prompt state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // New announcement form state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'warning' | 'alert' | 'celebration'>('celebration');

  // New member form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemHandle, setNewMemHandle] = useState('');
  const [newMemRole, setNewMemRole] = useState<UserRole>('user');
  const [newMemAvatar, setNewMemAvatar] = useState('🕊️');

  // Search filter for fellowship roster
  const [rosterSearch, setRosterSearch] = useState('');

  // Import file ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const isAdmin = settings.profile.role === 'admin' || settings.profile.role === 'superadmin';

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    m.handle.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  const handleGiveGems = (amount: number) => {
    sounds.playVictory();
    try {
      const saved = localStorage.getItem('faithlingo_stats');
      const cur = saved ? JSON.parse(saved) : userStats;
      const updated = { ...cur, gems: (cur.gems || 0) + amount };
      localStorage.setItem('faithlingo_stats', JSON.stringify(updated));
    } catch {}
  };

  const handleGiveXp = (amount: number) => {
    sounds.playVictory();
    addXp(amount);
  };

  const handleSetStreak = (days: number) => {
    sounds.playVictory();
    try {
      const saved = localStorage.getItem('faithlingo_stats');
      const cur = saved ? JSON.parse(saved) : userStats;
      const updated = { ...cur, streak: days };
      localStorage.setItem('faithlingo_stats', JSON.stringify(updated));
    } catch {}
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnMessage) return;
    setAnnouncement({
      id: `ann_${Date.now()}`,
      title: newAnnTitle,
      message: newAnnMessage,
      type: newAnnType,
      isActive: true,
      author: settings.profile.name,
      timestamp: 'Just now'
    });
    setNewAnnTitle('');
    setNewAnnMessage('');
    sounds.playCorrect();
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName) return;
    addMember({
      name: newMemName,
      handle: newMemHandle ? (newMemHandle.startsWith('@') ? newMemHandle : `@${newMemHandle}`) : `@${newMemName.toLowerCase().replace(/\s+/g, '')}`,
      avatar: newMemAvatar,
      role: newMemRole,
      status: 'active',
      lastActive: 'Just now',
      xp: 100,
      streak: 1,
      warningsCount: 0
    });
    setNewMemName('');
    setNewMemHandle('');
    setIsAddingMember(false);
    sounds.playCorrect();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        importBackup(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-4xl h-[92vh] max-h-[760px] rounded-3xl bg-stone-900 border border-white/15 text-stone-100 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-lg shadow-md">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  LifeOS Control Center
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isAdmin ? <Crown className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3" />}
                  <span>{settings.profile.role}</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                Manage personal profile, display themes, spiritual routines & admin suite
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setIsSettingsOpen(false);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar Tabs & Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs Navigation Sidebar */}
          <div className="w-full md:w-56 bg-stone-950/50 border-r border-white/10 p-2.5 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
            <div className="hidden md:block px-3 py-1.5 text-[10px] font-black uppercase text-stone-400 tracking-wider">
              General User
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('profile');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('appearance');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                activeTab === 'appearance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('audio');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                activeTab === 'audio'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio & Voice</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('spiritual');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                activeTab === 'spiritual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Spiritual Routine</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('storage');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                activeTab === 'storage'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Data & Backup</span>
            </button>

            <div className="hidden md:block my-2 border-t border-white/10" />
            <div className="hidden md:block px-3 py-1 text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Administration
            </div>

            {/* Admin Controls Tab */}
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('admin');
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 relative ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/40'
                  : 'text-amber-300 hover:bg-amber-500/15 border border-amber-500/20'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Controls</span>
              <span className="ml-auto text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">
                GOD
              </span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* TAB 1: PROFILE & IDENTITY */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white mb-1">Personal Identity & Spiritual Bio</h3>
                  <p className="text-xs text-stone-400">Configure how other believers see you in Fellowship Chat & leaderboards.</p>
                </div>

                {/* Avatar Picker */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
                      {settings.profile.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Choose Your Avatar</h4>
                      <p className="text-xs text-stone-400">Select an emblem representing your walk.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {AVATAR_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          sounds.playTap();
                          updateProfile({ avatar: emoji });
                        }}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                          settings.profile.avatar === emoji
                            ? 'bg-emerald-600 border-2 border-emerald-400 scale-110 shadow-md'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => updateProfile({ name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. Grace Walk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">Spiritual Handle</label>
                      <input
                        type="text"
                        value={settings.profile.handle}
                        onChange={(e) => updateProfile({ handle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                        placeholder="@handle"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Bio / Testimony</label>
                    <textarea
                      rows={2}
                      value={settings.profile.bio}
                      onChange={(e) => updateProfile({ bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                      placeholder="Share a verse or short testimony..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Current Status Banner</label>
                    <input
                      type="text"
                      value={settings.profile.statusText || ''}
                      onChange={(e) => updateProfile({ statusText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 📖 Memorizing Romans 8"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: APPEARANCE & DISPLAY */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white mb-1">Appearance & Desktop Aesthetics</h3>
                  <p className="text-xs text-stone-400">Tailor color palette, font sizes & window behaviors.</p>
                </div>

                {/* Theme Mode */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-stone-300 block">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark Mode', icon: '🌙', desc: 'Default sanctuary dark' },
                      { id: 'light', label: 'Daylight', icon: '☀️', desc: 'Clean bright parchment' },
                      { id: 'amoled', label: 'OLED Night', icon: '🖤', desc: 'Pure zero-battery black' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          sounds.playTap();
                          updateSettings({ themeMode: mode.id as any });
                          if (mode.id === 'light' && darkMode) toggleDarkMode();
                          if (mode.id !== 'light' && !darkMode) toggleDarkMode();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          settings.themeMode === mode.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white'
                            : 'bg-black/30 border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xl mb-1">{mode.icon}</div>
                        <div className="text-xs font-black text-white">{mode.label}</div>
                        <div className="text-[10px] text-stone-400">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-stone-300 block">Accent Palette</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { id: 'emerald', bg: 'bg-emerald-500', label: 'Emerald' },
                      { id: 'purple', bg: 'bg-purple-500', label: 'Royal' },
                      { id: 'blue', bg: 'bg-blue-500', label: 'Sapphire' },
                      { id: 'amber', bg: 'bg-amber-500', label: 'Gold' },
                      { id: 'rose', bg: 'bg-rose-500', label: 'Rose' },
                      { id: 'cyan', bg: 'bg-cyan-500', label: 'Cyan' }
                    ].map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => {
                          sounds.playTap();
                          updateSettings({ accentColor: accent.id as ThemeAccent });
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          settings.accentColor === accent.id
                            ? 'border-white bg-white/15 scale-105'
                            : 'border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full ${accent.bg} shadow-md`} />
                        <span className="text-[10px] font-bold text-stone-300">{accent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-stone-300 block">System Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'compact', label: 'Compact', size: 'text-xs' },
                      { id: 'normal', label: 'Standard', size: 'text-sm' },
                      { id: 'large', label: 'Large', size: 'text-base' },
                      { id: 'senior', label: 'Senior', size: 'text-lg' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          sounds.playTap();
                          updateSettings({ fontScale: f.id as FontScale });
                        }}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                          settings.fontScale === f.id
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-black/30 border-white/10 text-stone-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO & VOICE */}
            {activeTab === 'audio' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white mb-1">Audio & Haptic Feedback</h3>
                  <p className="text-xs text-stone-400">Control sound effects, scripture audio narration & vibrations.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-300 mb-2">
                      <span>Master Volume</span>
                      <span className="text-emerald-400 font-black">{settings.masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.masterVolume}
                      onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { key: 'soundFxEnabled', label: 'Sound Effects & Chimes', desc: 'Plays tap, quiz feedback & level up sounds' },
                      { key: 'narratorVoiceEnabled', label: 'Scripture Read-Aloud Narration', desc: 'Audio voice synthesizer on Bible verses' },
                      { key: 'hapticFeedbackEnabled', label: 'Haptic Vibrations (Mobile)', desc: 'Tactile buzz on arcade buttons & quiz checks' }
                    ].map((item) => (
                      <div
                        key={item.key}
                        onClick={() => {
                          sounds.playTap();
                          updateSettings({ [item.key]: !((settings as any)[item.key]) });
                        }}
                        className="p-3 rounded-xl bg-black/30 hover:bg-black/40 border border-white/10 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-extrabold text-white">{item.label}</div>
                          <div className="text-[10px] text-stone-400">{item.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black ${
                          (settings as any)[item.key] ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-500'
                        }`}>
                          {(settings as any)[item.key] ? '✓' : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => sounds.playVictory()}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-2"
                    >
                      <span>🔊</span>
                      <span>Test Chime FX</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SPIRITUAL ROUTINE */}
            {activeTab === 'spiritual' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white mb-1">Spiritual Disciplines & Reminders</h3>
                  <p className="text-xs text-stone-400">Set daily scripture quotas, translations & prayer notifications.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Daily Scripture Reading Goal (Minutes)
                    </label>
                    <div className="flex items-center gap-3">
                      {[5, 15, 30, 60].map((min) => (
                        <button
                          key={min}
                          onClick={() => {
                            sounds.playTap();
                            updateSettings({ dailyReadingMinutesGoal: min });
                          }}
                          className={`flex-1 py-2 rounded-xl font-black text-xs border transition-all ${
                            settings.dailyReadingMinutesGoal === min
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-black/30 border-white/10 text-stone-400 hover:text-white'
                          }`}
                        >
                          {min} Min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Preferred Default Bible Translation
                    </label>
                    <select
                      value={settings.preferredTranslation}
                      onChange={(e) => updateSettings({ preferredTranslation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="WEB">World English Bible (WEB) - Modern</option>
                      <option value="KJV">King James Version (KJV) - Traditional</option>
                      <option value="ASV">American Standard Version (ASV) - Literal</option>
                      <option value="BBE">Bible in Basic English (BBE) - Simple</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-white">Daily Prayer Notification</div>
                      <div className="text-[10px] text-stone-400">Pings your desktop with the Verse of the Day</div>
                    </div>
                    <input
                      type="time"
                      value={settings.prayerReminderTime}
                      onChange={(e) => updateSettings({ prayerReminderTime: e.target.value })}
                      className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/20 text-xs font-bold text-white"
                    />
                  </div>

                  <div
                    onClick={() => {
                      sounds.playTap();
                      updateSettings({ fastingModeActive: !settings.fastingModeActive });
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      settings.fastingModeActive
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                        : 'bg-black/30 border-white/10 text-stone-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-white">🕯️ Fasting & Solitude Mode</div>
                      <div className="text-[10px] text-stone-300">
                        Mutes game sound FX, dims interface to meditative candlelight, and highlights prayer prompts.
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black ${
                      settings.fastingModeActive ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-500'
                    }`}>
                      {settings.fastingModeActive ? '✓' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DATA & STORAGE */}
            {activeTab === 'storage' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white mb-1">Local Storage & Cloud Snapshot</h3>
                  <p className="text-xs text-stone-400">Export your journal notes, reading bookmarks, and custom apps as JSON.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-2 mb-1">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Export Backup</span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Download a full JSON file with all your notes, stats, prayers & settings.
                      </p>
                    </div>
                    <button
                      onClick={exportBackup}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors"
                    >
                      Download .JSON
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-2 mb-1">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>Restore Backup</span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Import an existing backup JSON file to restore your full profile.
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-colors"
                    >
                      Import .JSON
                    </button>
                  </div>
                </div>

                {/* Factory Reset */}
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-rose-300">Factory Reset System</h4>
                    <p className="text-[11px] text-stone-400">
                      Reverts all preferences, themes, and member mock data to fresh install defaults.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to factory reset all LifeOS preferences?')) {
                        factoryReset();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shrink-0"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: ADMIN CONTROLS SUITE (GOD MODE) */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-amber-400">Administrator Control Center</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Full Access Unlocked
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      Master controls for user moderation, economy overrides, system announcements & app visibility.
                    </p>
                  </div>

                  {/* Quick Role Switcher */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                    {(['user', 'moderator', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          sounds.playTap();
                          updateProfile({ role: r });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black capitalize transition-all ${
                          settings.profile.role === r
                            ? 'bg-amber-500 text-stone-950 shadow-md'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. GOD-MODE ECONOMY & GAMIFICATION OVERRIDES */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        God-Mode Economy Overrides
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono">Real-time Local State Injection</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => handleGiveGems(500)}
                      className="p-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>+500 Manna (Gems)</span>
                    </button>

                    <button
                      onClick={() => handleGiveXp(1000)}
                      className="p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>+1,000 XP</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playVictory();
                        refillHearts();
                      }}
                      className="p-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-extrabold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <span>Infinite Lives (5)</span>
                    </button>

                    <button
                      onClick={() => handleSetStreak(100)}
                      className="p-3 rounded-xl bg-orange-950/60 hover:bg-orange-900 border border-orange-500/40 text-orange-300 font-extrabold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span>Set 100-Day Streak</span>
                    </button>
                  </div>
                </div>

                {/* 2. GLOBAL SYSTEM ANNOUNCEMENT BROADCASTER */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                        Broadcast System Announcement
                      </h4>
                    </div>
                    {announcement && (
                      <button
                        onClick={() => setAnnouncement(null)}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        Dismiss Current Broadcast
                      </button>
                    )}
                  </div>

                  {announcement ? (
                    <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-black text-purple-200">
                          <span>{announcement.title}</span>
                          <span className="text-[10px] text-stone-400">• By {announcement.author} ({announcement.timestamp})</span>
                        </div>
                        <p className="text-xs text-stone-300 mt-0.5">{announcement.message}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/30 text-purple-300 shrink-0">
                        LIVE
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAnnouncement} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newAnnTitle}
                          onChange={(e) => setNewAnnTitle(e.target.value)}
                          placeholder="Headline (e.g. 🕊️ Sunday Service Live)"
                          className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                        <select
                          value={newAnnType}
                          onChange={(e) => setNewAnnType(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="celebration">🎉 Celebration</option>
                          <option value="info">ℹ️ Notice</option>
                          <option value="warning">⚠️ Warning</option>
                          <option value="alert">🚨 Urgent Alert</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newAnnMessage}
                          onChange={(e) => setNewAnnMessage(e.target.value)}
                          placeholder="Broadcast message body visible to all believers..."
                          className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs tracking-wider uppercase transition-colors shrink-0"
                        >
                          Broadcast
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 3. FELLOWSHIP MEMBER DIRECTORY & MODERATION */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        Fellowship Member Roster & Roles ({members.length})
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsAddingMember(!isAddingMember)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  {/* Add Member Form */}
                  {isAddingMember && (
                    <form onSubmit={handleCreateMember} className="p-3 rounded-xl bg-black/40 border border-white/15 space-y-2.5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={newMemName}
                          onChange={(e) => setNewMemName(e.target.value)}
                          placeholder="Member Name"
                          className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white"
                          required
                        />
                        <input
                          type="text"
                          value={newMemHandle}
                          onChange={(e) => setNewMemHandle(e.target.value)}
                          placeholder="@handle"
                          className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white"
                        />
                        <select
                          value={newMemRole}
                          onChange={(e) => setNewMemRole(e.target.value as UserRole)}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                        <select
                          value={newMemAvatar}
                          onChange={(e) => setNewMemAvatar(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white"
                        >
                          {AVATAR_PRESETS.map((a) => (
                            <option key={a} value={a}>{a} Avatar</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingMember(false)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-xs text-stone-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 rounded-lg bg-emerald-600 text-xs font-bold text-white"
                        >
                          Save Believer
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Member Search */}
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search by name, handle, or role..."
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-stone-500"
                  />

                  {/* Member Table */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{member.avatar}</span>
                          <div className="min-w-0">
                            <div className="font-extrabold text-white truncate flex items-center gap-1.5">
                              <span>{member.name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">{member.handle}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-2">
                              <span>⚡ {member.xp} XP</span>
                              <span>🔥 {member.streak}d streak</span>
                              <span className={member.status === 'banned' ? 'text-rose-400' : member.status === 'muted' ? 'text-amber-400' : 'text-emerald-400'}>
                                • {member.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value as UserRole)}
                            className="px-2 py-1 rounded-lg bg-black/60 border border-white/20 text-[11px] font-black text-white"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">SuperAdmin</option>
                          </select>

                          {member.status === 'active' ? (
                            <button
                              onClick={() => updateMemberStatus(member.id, 'muted')}
                              title="Mute User in Fellowship Chat"
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateMemberStatus(member.id, 'active')}
                              title="Unmute User"
                              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete member ${member.name}?`)) {
                                deleteMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. APP FEATURE FLAGS & VISIBILITY */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">
                        App Marketplace & Feature Flags
                      </h4>
                    </div>
                    <span className="text-[10px] text-stone-400">Toggle apps globally in LifeOS</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {apps.map((app) => {
                      const isVisible = settings.appVisibility[app.id] !== false;
                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            sounds.playTap();
                            toggleAppVisibility(app.id);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isVisible
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                              : 'bg-black/30 border-white/10 text-stone-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{app.emoji}</span>
                            <span className="text-xs font-extrabold truncate">{app.title}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                            isVisible ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-500'
                          }`}>
                            {isVisible ? '✓' : '✕'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. SYSTEM AUDIT LOGS */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                        Live System Audit Log ({auditLogs.length})
                      </h4>
                    </div>
                    <button
                      onClick={clearAuditLogs}
                      className="text-[10px] text-stone-400 hover:text-white font-bold"
                    >
                      Clear Logs
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1 text-stone-300">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-white/5 pb-1">
                        <span className="text-stone-500 shrink-0">[{log.timestamp}]</span>
                        <span className="font-bold text-amber-400 shrink-0">{log.action}:</span>
                        <span className="text-stone-300">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
