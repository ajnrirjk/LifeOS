import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { sounds } from '../../services/soundEffects';
import { ChevronDown, ChevronUp, MoveHorizontal, LayoutGrid, X, Search, Sparkles } from 'lucide-react';

export const LifeOSDock: React.FC = () => {
  const { apps, activeAppId, openWindows, launchApp, isDesktopView, showDesktop, minimizeApp } = useLifeOS();
  const { settings, updateSettings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDockPosition = settings.dockPosition || 'center';

  // Desktop Pinned apps respecting settings feature flags
  const desktopDockApps = apps.filter(a => {
    const isVisible = settings.appVisibility[a.id] !== false;
    return isVisible && (a.id === 'faithlingo' || a.id === 'bible_journal' || a.isPinned);
  });

  const handlePositionToggle = () => {
    sounds.playTap();
    const positions: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    const nextIdx = (positions.indexOf(currentDockPosition) + 1) % positions.length;
    updateSettings({ dockPosition: positions[nextIdx] });
  };

  const positionClasses = {
    left: 'bottom-2.5 left-6',
    center: 'bottom-2.5 left-1/2 -translate-x-1/2',
    right: 'bottom-2.5 right-6',
  }[currentDockPosition];

  // In app mode, auto-tuck unless hovered or explicitly pinned
  const isDockExpanded = isDesktopView || isPinned || isHovered || !isCollapsed;
  const isTuckedInApp = !isDesktopView && !isPinned && !isHovered;

  const filteredApps = apps.filter(app => {
    const isVisible = settings.appVisibility[app.id] !== false;
    return isVisible && (
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      {/* DESKTOP DOCK (Tablets & Desktops >= 768px) */}
      {!isTuckedInApp && !isCollapsed && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:block fixed ${positionClasses} z-40 select-none`}
        >
          <div className="px-2.5 py-1.5 rounded-3xl bg-black/75 dark:bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1.5 ring-1 ring-black/50">
            {/* Desktop Home / Widgets Button */}
            <motion.button
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={() => {
                sounds.playTap();
                showDesktop();
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-2xl transition-colors duration-200 ${
                isDesktopView
                  ? 'bg-emerald-500/30 text-white shadow-inner ring-1 ring-emerald-400/40'
                  : 'hover:bg-white/10 text-stone-200'
              }`}
              title="LifeOS Desktop & Widgets"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-green-800 flex items-center justify-center text-lg shadow-md shrink-0">
                <span>🌿</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xs text-white tracking-wide whitespace-nowrap">
                  Desktop
                </span>
                <span className="text-[9px] text-stone-300/80 font-bold whitespace-nowrap">
                  App Widgets
                </span>
              </div>
            </motion.button>

            <div className="h-5 w-px bg-white/20 mx-0.5 shrink-0" />

            {desktopDockApps.map((app) => {
              const isActive = !isDesktopView && activeAppId === app.id && openWindows[app.id] && !openWindows[app.id].isMinimized;
              const isMinimized = !!openWindows[app.id]?.isMinimized;

              return (
                <motion.button
                  key={app.id}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={() => {
                    sounds.playTap();
                    if (isActive) {
                      minimizeApp(app.id);
                    } else {
                      launchApp(app.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-2xl transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner ring-1 ring-white/30'
                      : isMinimized
                      ? 'bg-amber-400/20 text-white ring-1 ring-amber-400/40 shadow-sm'
                      : 'hover:bg-white/10 text-stone-200'
                  }`}
                  title={
                    isActive
                      ? `Click to minimize ${app.title}`
                      : isMinimized
                      ? `Click to restore ${app.title}`
                      : `${app.title} — ${app.description}`
                  }
                >
                  {/* App Icon */}
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-lg shadow-md shrink-0`}>
                    <span>{app.emoji}</span>
                  </div>

                  {/* App Label */}
                  <div className="flex flex-col text-left">
                    <span className="font-black text-xs text-white tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                      {app.title}
                      {isActive && (
                        <motion.span
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                          title="Active Window"
                        />
                      )}
                      {isMinimized && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Minimized Window" />
                      )}
                    </span>
                    <span className="text-[9px] text-stone-300/80 font-bold whitespace-nowrap">
                      {app.id === 'faithlingo'
                        ? 'Scripture Study'
                        : app.id === 'bible_journal'
                        ? 'Sermon Notes'
                        : app.id === 'fellowship_chat'
                        ? 'Group Chat'
                        : app.id === 'faith_meet'
                        ? 'Group Calls'
                        : app.id === 'lifeai'
                        ? 'AI Companion'
                        : app.id === 'mini_cats'
                        ? 'Cat Fighter Turbo'
                        : app.id === 'mini_games'
                        ? 'Retro Arcade'
                        : app.id === 'youtube'
                        ? 'Videos & Worship'
                        : 'App'}
                    </span>
                  </div>
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="h-5 w-px bg-white/20 mx-0.5 shrink-0" />

            {/* Move Position: Toggle Left / Center / Right */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePositionToggle}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
              title={`Dock Position: ${currentDockPosition.toUpperCase()} (Click to cycle)`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
            </motion.button>

            {/* Pin / Unpin Dock */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.playTap();
                setIsPinned(!isPinned);
              }}
              className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                isPinned ? 'bg-amber-500/30 text-amber-300' : 'hover:bg-white/15 text-white/70 hover:text-white'
              }`}
              title={isPinned ? "Unpin Dock (Auto-Hide in Apps)" : "Pin Dock (Always Visible)"}
            >
              <span className="text-xs">📌</span>
            </motion.button>

            {/* Minimize / Hide Dock button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.playTap();
                setIsCollapsed(true);
              }}
              className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
              title="Minimize Dock completely"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* When tucked in app: sleek, unobtrusive floating trigger pill that expands on hover */}
      {isTuckedInApp && !isCollapsed && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          className={`hidden md:block fixed ${positionClasses} z-40 select-none`}
        >
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 0.75, y: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.05, y: -2 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            onClick={() => {
              sounds.playTap();
              setIsHovered(true);
            }}
            className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-2xl transition-all"
            title="Hover or click to show Dock"
          >
            <span>🌿</span>
            <span>LifeOS Dock</span>
            <ChevronUp className="w-3 h-3 text-emerald-400" />
          </motion.button>
        </div>
      )}

      {/* When manually collapsed on desktop: compact discreet pill */}
      {isCollapsed && (
        <div className={`hidden md:block fixed ${positionClasses} z-40 select-none`}>
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            onClick={() => {
              sounds.playTap();
              setIsCollapsed(false);
              setIsHovered(true);
            }}
            className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all"
            title="Show LifeOS Dock"
          >
            <span>🌿</span>
            <span>🕊️</span>
            <span>📖</span>
            <ChevronUp className="w-3.5 h-3.5 opacity-80" />
          </motion.button>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION DOCK (ALL APPS ACCESSIBLE) (< 768px) */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-2xl border-t border-white/15 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] items-center select-none shadow-[0_-8px_30px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 w-full justify-between min-w-max px-1">
          {/* All Apps / Drawer Launcher Button at the START */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsAppDrawerOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl text-amber-300 hover:text-amber-200 bg-amber-500/15 border border-amber-500/30 min-w-[56px] min-h-[46px] active:scale-95 transition-all"
            title="Open All Apps Drawer"
          >
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] tracking-tight font-black">All Apps</span>
          </button>

          {/* Home / Desktop Tab */}
          <button
            onClick={() => {
              sounds.playTap();
              showDesktop();
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all min-w-[56px] min-h-[46px] active:scale-95 ${
              isDesktopView
                ? 'bg-emerald-500/25 text-emerald-400 font-black border border-emerald-500/40 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🌿</span>
            <span className="text-[10px] tracking-tight font-bold">Desktop</span>
          </button>

          {/* All Registered Apps listed dynamically (filtered by feature flag) */}
          {apps.filter(app => settings.appVisibility[app.id] !== false).map((app) => {
            const isActive = !isDesktopView && activeAppId === app.id && openWindows[app.id] && !openWindows[app.id].isMinimized;

            return (
              <button
                key={app.id}
                onClick={() => {
                  sounds.playTap();
                  if (isActive) {
                    showDesktop();
                  } else {
                    launchApp(app.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all min-w-[56px] min-h-[46px] active:scale-95 relative ${
                  isActive
                    ? 'bg-white/20 text-white font-black border border-white/30 shadow-md ring-1 ring-white/40'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span className="text-xl">{app.emoji}</span>
                <span className="text-[10px] tracking-tight font-bold truncate max-w-[62px]">
                  {app.id === 'faithlingo'
                    ? 'Study'
                    : app.id === 'bible_journal'
                    ? 'Notes'
                    : app.id === 'fellowship_chat'
                    ? 'Chat'
                    : app.id === 'faith_meet'
                    ? 'Meet'
                    : app.id === 'lifeai'
                    ? 'LifeAi'
                    : app.id === 'mini_games'
                    ? 'Arcade'
                    : app.id === 'mini_cats'
                    ? 'Fighter'
                    : app.id === 'youtube'
                    ? 'Videos'
                    : app.title}
                </span>

                {isActive && (
                  <span className="absolute -top-0.5 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-stone-950 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MOBILE ALL APPS DRAWER MODAL */}
      <AnimatePresence>
        {isAppDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-end p-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="w-full bg-stone-900/95 border border-white/20 rounded-3xl p-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-lg">
                    🌿
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">LifeOS App Drawer</h3>
                    <p className="text-[10px] text-stone-400 font-bold">All applications, games & spiritual tools</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAppDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="my-3 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps, games & tools..."
                  className="w-full bg-stone-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Grid of Apps */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2.5">
                {/* Desktop Option */}
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsAppDrawerOpen(false);
                    showDesktop();
                  }}
                  className="p-3 rounded-2xl bg-stone-950 border border-emerald-500/30 hover:border-emerald-400 flex items-start gap-2.5 text-left transition-all active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-xl shrink-0 shadow-md">
                    🌿
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-white">LifeOS Desktop</h4>
                    <p className="text-[10px] text-stone-400 line-clamp-1">Widgets & Command Center</p>
                  </div>
                </button>

                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      sounds.playTap();
                      setIsAppDrawerOpen(false);
                      launchApp(app.id);
                    }}
                    className="p-3 rounded-2xl bg-stone-950 border border-white/10 hover:border-white/30 flex items-start gap-2.5 text-left transition-all active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                      {app.emoji}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-black text-white truncate">{app.title}</h4>
                      </div>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{app.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

