import React, { useState } from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { sounds } from '../../services/soundEffects';
import { ChevronDown, ChevronUp, MoveHorizontal } from 'lucide-react';

export const LifeOSDock: React.FC = () => {
  const { apps, activeAppId, openWindows, launchApp, isDesktopView, showDesktop } = useLifeOS();
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

  // When collapsed: tiny discreet pill that doesn't block any screen content
  if (isCollapsed) {
    return (
      <div className={`fixed ${positionClasses} z-40 select-none animate-in fade-in duration-200`}>
        <button
          onClick={() => {
            sounds.playTap();
            setIsCollapsed(false);
          }}
          className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xl transition-all hover:scale-105 active:scale-95"
          title="Show LifeOS Dock"
        >
          <span>🌿</span>
          <span>🕊️</span>
          <span>📖</span>
          <ChevronUp className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-40 select-none transition-all duration-300`}>
      <div className="px-2.5 py-1.5 rounded-2xl sm:rounded-3xl bg-black/65 dark:bg-black/80 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1.5">
        {/* Desktop Home / Widgets Button */}
        <button
          onClick={() => {
            sounds.playTap();
            showDesktop();
          }}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 ${
            isDesktopView
              ? 'bg-emerald-500/30 text-white shadow-inner ring-1 ring-emerald-400/40'
              : 'hover:bg-white/10 text-stone-200'
          }`}
          title="LifeOS Desktop & Widgets"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-green-800 flex items-center justify-center text-base sm:text-lg shadow-md shrink-0">
            <span>🌿</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-xs text-white tracking-wide whitespace-nowrap">
              Desktop
            </span>
            <span className="text-[9px] text-stone-300/80 font-bold hidden sm:inline whitespace-nowrap">
              App Widgets
            </span>
          </div>
        </button>

        <div className="h-5 w-px bg-white/20 mx-0.5 shrink-0" />

        {dockApps.map((app) => {
          const isActive = !isDesktopView && activeAppId === app.id && openWindows[app.id] && !openWindows[app.id].isMinimized;
          const isRunning = !!openWindows[app.id];

          return (
            <button
              key={app.id}
              onClick={() => {
                sounds.playTap();
                launchApp(app.id);
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-white/20 text-white shadow-inner ring-1 ring-white/30'
                  : 'hover:bg-white/10 text-stone-200'
              }`}
              title={`${app.title} — ${app.description}`}
            >
              {/* App Icon */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-base sm:text-lg shadow-md shrink-0`}>
                <span>{app.emoji}</span>
              </div>

              {/* App Label */}
              <div className="flex flex-col text-left">
                <span className="font-black text-xs text-white tracking-wide flex items-center gap-1 whitespace-nowrap">
                  {app.title}
                  {isRunning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </span>
                <span className="text-[9px] text-stone-300/80 font-bold hidden sm:inline whitespace-nowrap">
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
                    : app.id === 'tiktok'
                    ? 'Shorts & Clips'
                    : 'App'}
                </span>
              </div>
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-5 w-px bg-white/20 mx-0.5 shrink-0" />

        {/* Move Position: Toggle Center vs Corner */}
        <button
          onClick={handlePositionToggle}
          className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
          title={dockPosition === 'center' ? 'Move Dock to Bottom Right Corner' : 'Move Dock to Bottom Center'}
        >
          <MoveHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Minimize / Hide Dock button so it never blocks anything */}
        <button
          onClick={() => {
            sounds.playTap();
            setIsCollapsed(true);
          }}
          className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors shrink-0"
          title="Minimize Dock out of the way"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
