import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Search,
  X,
  Trash2,
  Sparkles,
  ArrowRight,
  Flame,
  LayoutGrid,
  Wand2,
  SlidersHorizontal,
  Bookmark,
  Compass
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

type AppCategoryFilter = 'all' | 'flagship' | 'spiritual' | 'study' | 'fellowship' | 'arcade' | 'custom';

export const LaunchpadModal: React.FC = () => {
  const {
    apps,
    launchApp,
    isLaunchpadOpen,
    setIsLaunchpadOpen,
    deleteApp,
    activeAppId,
    openWindows,
    showDesktop
  } = useLifeOS();
  const { settings } = useSettings();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<AppCategoryFilter>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens & register keyboard shortcuts
  useEffect(() => {
    if (isLaunchpadOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          sounds.playTap();
          setIsLaunchpadOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLaunchpadOpen, setIsLaunchpadOpen]);

  if (!isLaunchpadOpen) return null;

  // Filter apps respecting system settings feature visibility
  const visibleApps = apps.filter(a => settings.appVisibility[a.id] !== false);

  const filteredApps = visibleApps.filter(app => {
    // 1. Category Filter
    if (activeCategory === 'flagship') {
      if (!app.isPinned && app.id !== 'faithlingo' && app.id !== 'bible_journal') return false;
    } else if (activeCategory === 'spiritual') {
      if (app.category !== 'Spiritual' && app.id !== 'bible_journal' && app.id !== 'verse_of_day') return false;
    } else if (activeCategory === 'study') {
      if (app.category !== 'Learning' && app.category !== 'Productivity' && app.id !== 'faithlingo') return false;
    } else if (activeCategory === 'fellowship') {
      if (app.id !== 'fellowship_chat' && app.id !== 'faith_meet') return false;
    } else if (activeCategory === 'arcade') {
      if (app.id !== 'mini_games' && app.id !== 'mini_cats') return false;
    } else if (activeCategory === 'custom') {
      if (app.isSystem) return false;
    }

    // 2. Search Query Filter
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      app.title.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query)
    );
  });

  const handleLaunch = (appId: string) => {
    sounds.playTap();
    setIsLaunchpadOpen(false);
    launchApp(appId);
  };

  const categories: Array<{ id: AppCategoryFilter; label: string; icon: string }> = [
    { id: 'all', label: 'All Apps', icon: '✨' },
    { id: 'flagship', label: 'Pinned & Favorites', icon: '⭐' },
    { id: 'spiritual', label: 'Spiritual', icon: '🕊️' },
    { id: 'study', label: 'Study & Notes', icon: '📖' },
    { id: 'fellowship', label: 'Fellowship', icon: '💬' },
    { id: 'arcade', label: 'Arcade & Fun', icon: '🕹️' },
    { id: 'custom', label: 'Custom Apps', icon: '🛠️' },
  ];

  // Top Flagship Apps for Quick Launch Hero strip
  const quickLaunchApps = visibleApps.filter(
    a => a.id === 'faithlingo' || a.id === 'bible_journal' || a.id === 'fellowship_chat' || a.id === 'faith_meet'
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            sounds.playTap();
            setIsLaunchpadOpen(false);
          }}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-2xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          className="w-full max-w-4xl bg-stone-900/95 border border-white/15 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col max-h-[88vh] overflow-hidden relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Top Glow Ribbon */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 shrink-0" />

          {/* Header & Spotlight Search Bar */}
          <div className="p-4 sm:p-6 pb-3 border-b border-white/10 flex flex-col gap-3.5 shrink-0 bg-stone-950/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-green-800 flex items-center justify-center text-xl shadow-md shrink-0">
                  <span>🌿</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                      LifeOS Application Vault
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-stone-300 text-[10px] font-bold border border-white/15">
                      {visibleApps.length} Apps
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    Search and quick-launch spiritual suites, devotion tools & arcade
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-stone-400 text-[10px] font-mono">
                  ESC to close
                </span>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    sounds.playTap();
                    setIsLaunchpadOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Spotlight Smart Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredApps.length > 0) {
                    handleLaunch(filteredApps[0].id);
                  }
                }}
                placeholder="Type to search apps, study tools, or press Enter to launch..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-950/80 border border-white/15 text-sm text-white placeholder:text-stone-500 font-semibold focus:outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playTap();
                      setActiveCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md border border-emerald-400/50'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body: Apps View (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick-Launch Flagship Strip (Shown when searching is empty and on 'All' category) */}
            {!search.trim() && activeCategory === 'all' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Quick Launch Pinned Suites
                  </span>
                  <span className="text-[10px] text-stone-400">Instant Access</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {quickLaunchApps.map((app) => {
                    const isOpen = openWindows[app.id] && !openWindows[app.id].isMinimized;
                    return (
                      <motion.button
                        key={`hero-${app.id}`}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleLaunch(app.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all relative overflow-hidden group shadow-md ${
                          isOpen
                            ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/30'
                            : 'bg-white/5 hover:bg-white/10 border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-2xl shadow-md`}>
                            {app.emoji}
                          </div>
                          {isOpen && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white truncate">{app.title}</h4>
                          <p className="text-[10px] text-stone-400 line-clamp-1">{app.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Apps Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                  All Available Applications ({filteredApps.length})
                </span>
                {search && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Matches for "{search}"
                  </span>
                )}
              </div>

              {filteredApps.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-bold text-white">No applications found</p>
                  <p className="text-xs text-stone-400">Try a different search term or category filter</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setActiveCategory('all');
                    }}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredApps.map((app) => {
                    const isOpen = openWindows[app.id] && !openWindows[app.id].isMinimized;
                    const isMinimized = !!openWindows[app.id]?.isMinimized;

                    return (
                      <motion.div
                        key={app.id}
                        whileHover={{ y: -3 }}
                        onClick={() => handleLaunch(app.id)}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-md relative ${
                          isOpen
                            ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30'
                            : 'bg-stone-950/60 hover:bg-stone-900 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* App Icon */}
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                            {app.emoji}
                          </div>

                          {/* App Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-white truncate group-hover:text-emerald-300 transition-colors">
                                {app.title}
                              </h4>
                              {isOpen && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" title="Running" />
                              )}
                              {isMinimized && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Minimized" />
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 truncate mt-0.5 font-medium">
                              {app.description}
                            </p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10 text-stone-400 font-bold uppercase tracking-wider inline-block mt-1">
                              {app.category}
                            </span>
                          </div>
                        </div>

                        {/* Hover Action / Custom App Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!app.isSystem && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sounds.playTap();
                                deleteApp(app.id);
                              }}
                              className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete custom app"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="w-7 h-7 rounded-xl bg-white/5 group-hover:bg-emerald-600 group-hover:text-white text-stone-400 flex items-center justify-center transition-all">
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Clever Footer Bar with AI Studio shortcut and Dashboard Return */}
          <div className="p-3.5 sm:px-6 bg-stone-950/80 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsLaunchpadOpen(false);
                  launchApp('app_studio');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-600/40 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Spiritual App Studio</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsLaunchpadOpen(false);
                  showDesktop();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white font-semibold transition-colors"
              >
                <span>🖥️</span>
                <span>Desktop Dashboard</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
              <span className="hidden md:inline">LifeOS Sanctuary v2.4</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>{visibleApps.length} Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
