import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { sounds } from '../../services/soundEffects';
import { ChevronDown, ChevronUp, MoveHorizontal } from 'lucide-react';

export const LifeOSDock: React.FC = () => {
  const { apps, activeAppId, openWindows, launchApp, isDesktopView, showDesktop, minimizeApp } = useLifeOS();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dockPosition, setDockPosition] = useState<'center' | 'right'>(() => {
    try {
      return (localStorage.getItem('lifeos_dock_position') as 'center' | 'right') || 'center';
    } catch {
      return 'center';
    }
  });

  // Show pinned apps: FaithLingo and ChurchNotes
  const dockApps = apps.filter(a => a.id === 'faithlingo' || a.id === 'bible_journal' || a.isPinned);

  const handlePositionToggle = () => {
    sounds.playTap();
    const next = dockPosition === 'center' ? 'right' : 'center';
    setDockPosition(next);
    try {
      localStorage.setItem('lifeos_dock_position', next);
    } catch {}
  };

  const positionClasses = {
    center: 'bottom-2.5 left-1/2 -translate-x-1/2',
    right: 'bottom-2.5 right-4',
  }[dockPosition];

  // When collapsed on desktop: tiny discreet pill that doesn't block any screen content
  if (isCollapsed) {
    return (
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
    );
  }

  return (
    <>
      {/* DESKTOP DOCK (Tablets & Desktops >= 768px) */}
      <motion.div
        layout
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className={`hidden md:block fixed ${positionClasses} z-40 select-none`}
      >
        <div className="px-2.5 py-1.5 rounded-3xl bg-black/65 dark:bg-black/80 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1.5">
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

          {dockApps.map((app) => {
            const isActive = !isDesktopView && activeAppId === app.id && openWindows[app.id] && !openWindows[app.id].isMinimized;
            const isRunning = !!openWindows[app.id];
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
                      : app.id === 'mini_cats'
                      ? 'Mini Kitties'
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

          {/* Move Position: Toggle Center vs Corner */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePositionToggle}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
            title={dockPosition === 'center' ? 'Move Dock to Bottom Right Corner' : 'Move Dock to Bottom Center'}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
          </motion.button>

          {/* Minimize / Hide Dock button so it never blocks anything */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playTap();
              setIsCollapsed(true);
            }}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
            title="Minimize Dock out of the way"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      {isDesktopView && (
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-2xl border-t border-white/10 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] items-center justify-around select-none shadow-2xl">
          {/* Home / Desktop */}
          <button
            onClick={() => {
              sounds.playTap();
              showDesktop();
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all min-w-[50px] min-h-[44px] active:scale-95 ${
              isDesktopView ? 'text-emerald-400 font-black' : 'text-stone-400'
            }`}
          >
            <span className="text-xl">🌿</span>
            <span className="text-[10px] tracking-tight">Desktop</span>
          </button>

          {/* Notes */}
          <button
            onClick={() => {
              sounds.playTap();
              launchApp('bible_journal');
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-stone-300 hover:text-white min-w-[50px] min-h-[44px] active:scale-95 transition-all"
          >
            <span className="text-xl">📖</span>
            <span className="text-[10px] tracking-tight">Notes</span>
          </button>

          {/* FaithLingo */}
          <button
            onClick={() => {
              sounds.playTap();
              launchApp('faithlingo');
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-stone-300 hover:text-white min-w-[50px] min-h-[44px] active:scale-95 transition-all"
          >
            <span className="text-xl">🕊️</span>
            <span className="text-[10px] tracking-tight">Study</span>
          </button>

          {/* Fellowship Chat */}
          <button
            onClick={() => {
              sounds.playTap();
              launchApp('fellowship_chat');
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-stone-300 hover:text-white min-w-[50px] min-h-[44px] active:scale-95 transition-all"
          >
            <span className="text-xl">💬</span>
            <span className="text-[10px] tracking-tight">Chat</span>
          </button>

          {/* YouTube Worship */}
          <button
            onClick={() => {
              sounds.playTap();
              launchApp('youtube');
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-stone-300 hover:text-white min-w-[50px] min-h-[44px] active:scale-95 transition-all"
          >
            <span className="text-xl">▶️</span>
            <span className="text-[10px] tracking-tight">Videos</span>
          </button>
        </nav>
      )}
    </>
  );
};
