import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { sounds } from '../../services/soundEffects';
import { ChevronDown, ChevronUp, MoveHorizontal, LayoutGrid, X, Search, Sparkles } from 'lucide-react';

export const LifeOSDock: React.FC = () => {
  const { apps, activeAppId, openWindows, launchApp, isDesktopView, showDesktop, minimizeApp, setIsLaunchpadOpen } = useLifeOS();
  const { settings, updateSettings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

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
          <div className="px-3 py-2 rounded-2xl bg-stone-950/80 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center gap-2 ring-1 ring-white/10">
            {/* Desktop Home / Widgets Button */}
            <div className="relative group flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={() => {
                  sounds.playTap();
                  showDesktop();
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all relative ${
                  isDesktopView
                    ? 'bg-emerald-600/30 text-white border border-emerald-400/40 shadow-md ring-1 ring-emerald-400/30'
                    : 'hover:bg-white/15 bg-white/5 text-stone-200 border border-white/10'
                }`}
                title="LifeOS Desktop Dashboard"
              >
                <span>🌿</span>
              </motion.button>
              {/* Active Indicator Dot */}
              <div className="h-2 flex items-center justify-center mt-1">
                {isDesktopView && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-stone-900/95 border border-white/20 text-white text-[11px] font-bold shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Desktop Dashboard
              </div>
            </div>

            {/* Launchpad / All Apps Button */}
            <div className="relative group flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={() => {
                  sounds.playTap();
                  setIsLaunchpadOpen(true);
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
                title="All Apps Drawer"
              >
                <LayoutGrid className="w-5 h-5" />
              </motion.button>
              <div className="h-2 mt-1" />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-stone-900/95 border border-white/20 text-white text-[11px] font-bold shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                All Apps Drawer
              </div>
            </div>

            <div className="h-6 w-px bg-white/15 mx-0.5 shrink-0" />

            {/* App Icons */}
            {desktopDockApps.map((app) => {
              const isActive = !isDesktopView && activeAppId === app.id && openWindows[app.id] && !openWindows[app.id].isMinimized;
              const isMinimized = !!openWindows[app.id]?.isMinimized;

              return (
                <div key={app.id} className="relative group flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    onClick={() => {
                      sounds.playTap();
                      if (isActive) {
                        minimizeApp(app.id);
                      } else {
                        launchApp(app.id);
                      }
                    }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all relative ${
                      isActive
                        ? 'bg-white/25 text-white shadow-md border border-white/40 ring-1 ring-white/30'
                        : isMinimized
                        ? 'bg-amber-400/20 text-white border border-amber-400/40 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10'
                    }`}
                  >
                    <span>{app.emoji}</span>
                  </motion.button>

                  {/* Active / Minimized dot indicator */}
                  <div className="h-2 flex items-center justify-center mt-1">
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    ) : isMinimized ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    ) : null}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-stone-900/95 border border-white/20 text-white text-[11px] font-bold shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
                    <span>{app.emoji}</span>
                    <span>{app.title}</span>
                  </div>
                </div>
              );
            })}

            {/* Divider */}
            <div className="h-6 w-px bg-white/15 mx-0.5 shrink-0" />

            {/* Utility group: Position, Pin, Minimize */}
            <div className="flex items-center gap-1 pl-0.5">
              <button
                onClick={handlePositionToggle}
                className="w-7 h-7 rounded-lg hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                title={`Dock Position: ${currentDockPosition.toUpperCase()} (Cycle)`}
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsPinned(!isPinned);
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isPinned ? 'bg-amber-500/30 text-amber-300' : 'hover:bg-white/15 text-stone-400 hover:text-white'
                }`}
                title={isPinned ? "Unpin Dock (Auto-Hide in Apps)" : "Pin Dock (Always Visible)"}
              >
                <span className="text-xs">📌</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsCollapsed(true);
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                title="Minimize Dock"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
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
            className="px-3 py-1 rounded-full bg-stone-950/80 hover:bg-stone-900/90 backdrop-blur-xl border border-white/20 text-stone-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xl transition-all"
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
            className="px-3 py-1.5 rounded-full bg-stone-950/85 hover:bg-stone-900/95 backdrop-blur-xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all"
            title="Show LifeOS Dock"
          >
            <span>🌿</span>
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
              setIsLaunchpadOpen(true);
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

    </>
  );
};

