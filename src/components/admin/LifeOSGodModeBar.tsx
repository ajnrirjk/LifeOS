import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Crown,
  Zap,
  Sparkles,
  Shield,
  Megaphone,
  Radio,
  Lock,
  Unlock,
  Coins,
  Heart,
  Flame,
  Award,
  Layers,
  VolumeX,
  Volume2,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Wand2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  PhoneOff,
  MicOff,
  Palette
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { useLifeOS } from '../../context/LifeOSContext';
import { sounds } from '../../services/soundEffects';
import { SystemAnnouncement, MASTER_ADMIN_EMAIL } from '../../types/settings';
import { LifeOSWallpaper } from '../../types/lifeos';

export const LifeOSGodModeBar: React.FC = () => {
  const {
    settings,
    updateSettings,
    isAuthorizedAdmin,
    masterAdminEmail,
    toggleMaintenanceMode,
    announcement,
    setAnnouncement,
    members,
    updateMemberStatus
  } = useSettings();

  const {
    userStats,
    addXp,
    addGems,
    setStreak,
    setInfiniteHearts,
    refillHearts
  } = useApp();

  const { setWallpaper } = useLifeOS();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'economy' | 'arcade' | 'broadcast' | 'maintenance' | 'meet'>('economy');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Announcement form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'celebration' | 'info' | 'warning' | 'alert'>('celebration');

  // Maintenance form
  const [maintMsg, setMaintMsg] = useState(settings.maintenanceMessage || 'System maintenance in progress.');

  // Compact mini mode state so it never blocks anything
  const [isMini, setIsMini] = useState(() => {
    try {
      return localStorage.getItem('lifeos_godmode_mini') === 'true';
    } catch {
      return false;
    }
  });

  // Listen to system events to toggle God Mode from TopBar or elsewhere
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle_god_mode', handleToggle);
    window.addEventListener('open_god_mode', handleOpen);
    return () => {
      window.removeEventListener('toggle_god_mode', handleToggle);
      window.removeEventListener('open_god_mode', handleOpen);
    };
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    sounds.playVictory();
    setTimeout(() => setFeedback(null), 3000);
  };

  // Only render for aw03102008@gmail.com
  if (!isAuthorizedAdmin) {
    return null;
  }

  // --- Quick Economy Handlers ---
  const handleGrantXp = (amount: number = 5000) => {
    addXp(amount);
    showToast(`+${amount.toLocaleString()} XP Granted!`);
  };

  const handleGrantGems = (amount: number = 1000) => {
    addGems(amount);
    showToast(`+${amount.toLocaleString()} Manna (Gems) Granted!`);
  };

  const handleInfiniteLives = () => {
    setInfiniteHearts();
    refillHearts();
    showToast('Infinite Lives (99) Activated!');
  };

  const handleSetMaxStreak = (days: number = 365) => {
    setStreak(days);
    showToast(`${days}-Day Streak Activated!`);
  };

  // --- Quick Arcade Handlers ---
  const handleGrantArcadeTokens = (amount: number = 10000) => {
    try {
      const raw = localStorage.getItem('lifeos_arcade_stats_v1');
      const stats = raw ? JSON.parse(raw) : {
        totalTokens: 100,
        highScores: {},
        gamesPlayed: {},
        unlockedSkins: ['classic'],
        activeSkin: 'classic'
      };
      stats.totalTokens = (stats.totalTokens || 0) + amount;
      localStorage.setItem('lifeos_arcade_stats_v1', JSON.stringify(stats));
      window.dispatchEvent(new Event('lifeos_arcade_stats_updated'));
      confetti({ particleCount: 60, spread: 70 });
      showToast(`+${amount.toLocaleString()} Arcade Tokens Added!`);
    } catch {}
  };

  const handleUnlockAllSkins = () => {
    try {
      const allSkins = ['classic', 'skin_cyber', 'skin_gold', 'skin_celestial', 'title_champion', 'title_overcomer'];
      const raw = localStorage.getItem('lifeos_arcade_stats_v1');
      const stats = raw ? JSON.parse(raw) : {
        totalTokens: 100,
        highScores: {},
        gamesPlayed: {},
        unlockedSkins: ['classic'],
        activeSkin: 'classic'
      };
      stats.unlockedSkins = allSkins;
      localStorage.setItem('lifeos_arcade_stats_v1', JSON.stringify(stats));
      window.dispatchEvent(new Event('lifeos_arcade_stats_updated'));
      confetti({ particleCount: 80, spread: 80 });
      showToast('All Arcade Skins & Titles Unlocked!');
    } catch {}
  };

  const handleSetMaxArcadeScores = () => {
    try {
      const raw = localStorage.getItem('lifeos_arcade_stats_v1');
      const stats = raw ? JSON.parse(raw) : {
        totalTokens: 100,
        highScores: {},
        gamesPlayed: {},
        unlockedSkins: ['classic'],
        activeSkin: 'classic'
      };
      stats.highScores = {
        pilgrim_go: 9999,
        flappy_dove: 999,
        babel_stack: 999,
        demon_buster: 9999,
        eden_snake: 9999,
        scripture_matrix: 999,
        slingshot_target: 9999,
        samson_smash: 9999
      };
      localStorage.setItem('lifeos_arcade_stats_v1', JSON.stringify(stats));
      window.dispatchEvent(new Event('lifeos_arcade_stats_updated'));
      showToast('All 8 Mini-Game High Scores Set to 9,999!');
    } catch {}
  };

  const handleResetArcadeScores = () => {
    try {
      const raw = localStorage.getItem('lifeos_arcade_stats_v1');
      const stats = raw ? JSON.parse(raw) : {
        totalTokens: 100,
        highScores: {},
        gamesPlayed: {},
        unlockedSkins: ['classic'],
        activeSkin: 'classic'
      };
      stats.highScores = {
        pilgrim_go: 0,
        flappy_dove: 0,
        babel_stack: 0,
        demon_buster: 0,
        eden_snake: 0,
        scripture_matrix: 0,
        slingshot_target: 0,
        samson_smash: 0
      };
      localStorage.setItem('lifeos_arcade_stats_v1', JSON.stringify(stats));
      window.dispatchEvent(new Event('lifeos_arcade_stats_updated'));
      showToast('Arcade High Scores Reset to 0!');
    } catch {}
  };

  // --- Broadcast Handlers ---
  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    const ann: SystemAnnouncement = {
      id: `ann_${Date.now()}`,
      title: broadcastTitle.trim(),
      message: broadcastMsg.trim(),
      type: broadcastType,
      isActive: true,
      author: 'Master Admin (aw03102008@gmail.com)',
      timestamp: 'Just now'
    };

    setAnnouncement(ann);
    setBroadcastTitle('');
    setBroadcastMsg('');
    showToast('Sticky Top Announcement Broadcasted Globally!');
  };

  const handleClearBroadcast = () => {
    setAnnouncement(null);
    showToast('Global Announcement Dismissed!');
  };

  // --- Maintenance Mode Handler ---
  const handleToggleMaintenance = async () => {
    const nextState = !settings.maintenanceMode;
    await toggleMaintenanceMode(nextState, maintMsg);
    showToast(`Maintenance Mode ${nextState ? 'ENABLED (Locked for Public)' : 'DISABLED (Public Access Restored)'}!`);
  };

  // --- Global Wallpaper Override ---
  const handleSetGlobalWallpaper = (wp: LifeOSWallpaper) => {
    setWallpaper(wp);
    showToast(`Wallpaper switched to ${wp.toUpperCase()}!`);
  };

  // --- LifeMeet & Moderation Handlers ---
  const handleMuteAllMembers = () => {
    members.forEach((m) => {
      if (m.role !== 'superadmin') {
        updateMemberStatus(m.id, 'muted');
      }
    });
    showToast('All Fellowship Members Muted in Chat!');
  };

  const handleLockLifeMeetRooms = () => {
    try {
      localStorage.setItem('lifemeet_global_locked', 'true');
      window.dispatchEvent(new CustomEvent('lifemeet_room_lock', { detail: { locked: true } }));
      showToast('LifeMeet Rooms Locked (No New Attendees)!');
    } catch {}
  };

  const handleUnlockLifeMeetRooms = () => {
    try {
      localStorage.removeItem('lifemeet_global_locked');
      window.dispatchEvent(new CustomEvent('lifemeet_room_lock', { detail: { locked: false } }));
      showToast('LifeMeet Rooms Unlocked!');
    } catch {}
  };

  const handlePurgeAllChat = () => {
    try {
      import('../../services/discordChatService').then(({ discordChatService }) => {
        discordChatService.purgeAllMessages();
        showToast('All Fellowship Chat Messages Purged!');
      });
    } catch {}
  };

  return (
    <>
      {/* Repositioned Floating Trigger Pill (Draggable & Minimal, only visible to aw03102008@gmail.com) */}
      <motion.div
        drag
        dragMomentum={false}
        className="fixed top-10 sm:top-11 right-3 sm:right-5 z-50 select-none cursor-grab active:cursor-grabbing"
      >
        {isMini ? (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playTap();
              setIsOpen(!isOpen);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsMini(false);
              try { localStorage.setItem('lifeos_godmode_mini', 'false'); } catch {}
            }}
            className={`w-9 h-9 rounded-2xl border shadow-xl flex items-center justify-center text-lg backdrop-blur-xl transition-all ${
              isOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-amber-500/40 ring-4 ring-amber-500/20'
                : 'bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/40 shadow-stone-950/80 hover:border-amber-400'
            }`}
            title="Master Admin God-Mode (Click to open, right-click to expand)"
          >
            <span className="animate-pulse">👑</span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-1 group">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playTap();
                setIsOpen(!isOpen);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
                isOpen
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-amber-500/40 ring-4 ring-amber-500/20'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/40 shadow-stone-950/80 hover:border-amber-400'
              }`}
              title="Master Admin God-Mode Panel (Drag to reposition anywhere)"
            >
              <span className="text-base animate-pulse">👑</span>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-wider leading-none">God Mode</div>
                <div className="text-[9px] text-stone-400 leading-none mt-0.5 truncate max-w-[110px]">
                  {MASTER_ADMIN_EMAIL}
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-amber-400" />}
            </motion.button>

            {/* Quick Mini Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playTap();
                setIsMini(true);
                try { localStorage.setItem('lifeos_godmode_mini', 'true'); } catch {}
              }}
              className="w-5 h-5 rounded-lg bg-black/40 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              title="Minimize to tiny crown icon"
            >
              −
            </button>
          </div>
        )}
      </motion.div>

      {/* Floating God-Mode Command Center Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-12 sm:top-14 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-[480px] max-h-[85vh] bg-stone-900/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl text-white z-50 flex flex-col overflow-hidden select-none"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-md">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                      Master Admin Control Suite
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[9px] font-black border border-amber-500/40">
                      GOD MODE
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">Exclusive controls for {MASTER_ADMIN_EMAIL}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Feedback Toast */}
            {feedback && (
              <div className="px-4 py-2 bg-emerald-600/90 text-white text-xs font-black flex items-center justify-between animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{feedback}</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">✕</button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center p-1.5 bg-black/40 border-b border-white/10 gap-1 overflow-x-auto">
              {[
                { id: 'economy', label: 'Economy', icon: Zap },
                { id: 'arcade', label: 'Arcade', icon: Coins },
                { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
                { id: 'maintenance', label: 'Lockdown', icon: Lock },
                { id: 'meet', label: 'LifeMeet', icon: PhoneOff }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playTap();
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Tab Content Body */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* 1. ECONOMY TAB */}
              {activeTab === 'economy' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Live State Overrides</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {userStats.xp} XP • {userStats.gems} Gems • {userStats.streak}d Streak
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleGrantXp(10000)}
                      className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Crown className="w-5 h-5 text-amber-400" />
                      <span>+10,000 XP Boost</span>
                    </button>

                    <button
                      onClick={() => handleGrantGems(1000)}
                      className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>+1,000 Manna (Gems)</span>
                    </button>

                    <button
                      onClick={handleInfiniteLives}
                      className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                      <span>Infinite Lives (99)</span>
                    </button>

                    <button
                      onClick={() => handleSetMaxStreak(365)}
                      className="p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
                      <span>365-Day Daily Streak</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. ARCADE TAB */}
              {activeTab === 'arcade' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Arcade Vault God-Mode</span>
                    <span className="text-amber-400 font-mono font-bold">8 Games Installed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleGrantArcadeTokens(10000)}
                      className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-black text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span>+10,000 Arcade Tokens</span>
                    </button>

                    <button
                      onClick={handleUnlockAllSkins}
                      className="p-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-black text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span>Unlock All 5 Skins & Titles</span>
                    </button>

                    <button
                      onClick={handleSetMaxArcadeScores}
                      className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-black text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span>Set 9,999 on All Games</span>
                    </button>

                    <button
                      onClick={handleResetArcadeScores}
                      className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-white/10 text-stone-300 font-black text-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                      <Trash2 className="w-5 h-5 text-stone-400" />
                      <span>Reset High Scores to 0</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. BROADCAST TAB */}
              {activeTab === 'broadcast' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Sticky Top Banner Announcement</span>
                    {announcement && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                        BROADCAST LIVE
                      </span>
                    )}
                  </div>

                  {announcement ? (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-200">{announcement.title}</span>
                        <span className="text-[10px] text-stone-400">{announcement.timestamp}</span>
                      </div>
                      <p className="text-xs text-stone-300">{announcement.message}</p>
                      <button
                        onClick={handleClearBroadcast}
                        className="mt-1 w-full py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                      >
                        Dismiss Active Announcement Globally
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePublishBroadcast} className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder="Headline (e.g. 🕊️ Sunday Service Live)"
                          className="col-span-2 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                          required
                        />
                        <select
                          value={broadcastType}
                          onChange={(e) => setBroadcastType(e.target.value as any)}
                          className="px-2 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="celebration">🎉 Celebration</option>
                          <option value="info">ℹ️ Info</option>
                          <option value="warning">⚠️ Warning</option>
                          <option value="alert">🚨 Urgent</option>
                        </select>
                      </div>

                      <textarea
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        placeholder="Write message visible as sticky top banner to all believers..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none"
                        required
                      />

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                      >
                        Broadcast Banner to All Devices
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 4. MAINTENANCE LOCKDOWN TAB */}
              {activeTab === 'maintenance' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        {settings.maintenanceMode ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                        <span>Site-Wide Maintenance Lock</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {settings.maintenanceMode
                          ? 'Site is locked for all regular users. Master Admin has bypass.'
                          : 'Public access is currently open to all users.'}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleMaintenance}
                      className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${
                        settings.maintenanceMode
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 shadow-lg'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 shadow-lg'
                      }`}
                    >
                      {settings.maintenanceMode ? 'Unlock Site' : 'Lock Site Now'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-400 mb-1">
                      Maintenance Lock Message Displayed to Visitors:
                    </label>
                    <input
                      type="text"
                      value={maintMsg}
                      onChange={(e) => setMaintMsg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Quick Global Wallpaper Override */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-xs font-black text-white mb-2 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <span>Global Wallpaper Override</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'mountain', label: 'Mountain' },
                        { id: 'aurora', label: 'Aurora' },
                        { id: 'golden_temple', label: 'Golden' },
                        { id: 'stained_glass', label: 'Sanctuary' },
                        { id: 'celestial', label: 'Celestial' },
                        { id: 'cyber_neon', label: 'Cyber' }
                      ].map((wp) => (
                        <button
                          key={wp.id}
                          onClick={() => handleSetGlobalWallpaper(wp.id as any)}
                          className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-stone-300 hover:text-white"
                        >
                          {wp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. LIFEMEET & MODERATION TAB */}
              {activeTab === 'meet' && (
                <div className="space-y-3">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <PhoneOff className="w-4 h-4 text-rose-400" />
                    <span>LifeMeet Video Host & Fellowship Controls</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleLockLifeMeetRooms}
                      className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-black text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>Lock LifeMeet Rooms</span>
                    </button>

                    <button
                      onClick={handleUnlockLifeMeetRooms}
                      className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span>Unlock LifeMeet Rooms</span>
                    </button>

                    <button
                      onClick={handleMuteAllMembers}
                      className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <MicOff className="w-4 h-4 text-amber-400" />
                      <span>Mute All Members</span>
                    </button>

                    <button
                      onClick={handlePurgeAllChat}
                      className="p-3 rounded-2xl bg-stone-800 hover:bg-rose-950/60 border border-white/10 hover:border-rose-500/40 text-stone-300 hover:text-rose-300 font-black text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-stone-400" />
                      <span>Purge Fellowship Chat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
