import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { LifeOSTopBar } from './LifeOSTopBar';
import { LifeOSDock } from './LifeOSDock';
import { LaunchpadModal } from './LaunchpadModal';
import { LifeOSSplitPaneView } from './LifeOSSplitPaneView';
import { LifeOSAppContentRenderer } from './LifeOSAppContentRenderer';
import { LifeOSDesktopWidgets } from './LifeOSDesktopWidgets';
import { AddWidgetModal } from './AddWidgetModal';
import { LifeMeetFloatingPiP } from '../meet/LifeMeetFloatingPiP';
import { useSettings } from '../../context/SettingsContext';
import { Minus, Square, X, Maximize2, Minimize2, ArrowLeft, Megaphone, Columns2 } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { LifeOSGodModeBar } from '../admin/LifeOSGodModeBar';
import { MASTER_ADMIN_EMAIL } from '../../types/settings';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal';
import { WelcomeOnboardingModal } from './WelcomeOnboardingModal';

export const LifeOSDesktop: React.FC = () => {
  const {
    apps,
    activeAppId,
    openWindows,
    launchApp,
    closeApp,
    minimizeApp,
    maximizeApp,
    wallpaper,
    isDesktopView,
    showDesktop,
    desktopWidgets,
    addDesktopWidget,
    removeDesktopWidget,
    resetDesktopWidgets,
    splitScreen,
    enterSplitScreen,
    exitSplitScreen,
    toggleSplitScreen,
    setSplitPreset
  } = useLifeOS();

  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const isRegisteredV2 = localStorage.getItem('lifeos_user_registered_v2');
      const isRegisteredV1 = localStorage.getItem('lifeos_user_registered_v1');
      const googleUser = localStorage.getItem('lifeos_persistent_google_user');
      const savedSettings = localStorage.getItem('lifeos_system_settings_v1');

      if (isRegisteredV2 === 'true' || isRegisteredV1 === 'true' || Boolean(googleUser)) {
        return false;
      }
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed?.profile?.name && parsed.profile.name.trim() !== '') {
          return false;
        }
      }
      return !isRegisteredV2 && !isRegisteredV1;
    } catch {
      return false;
    }
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isDirectPrivacyRoute =
      window.location.hash.toLowerCase().includes('privacy') ||
      window.location.pathname.toLowerCase().includes('privacy');
    if (isDirectPrivacyRoute) return true;

    // Only show if user hasn't agreed yet
    try {
      return localStorage.getItem('lifeos_privacy_agreed') !== 'true';
    } catch {
      return false;
    }
  });

  // Check URL hash or path for direct privacy link (e.g. /#privacy or /privacy)
  React.useEffect(() => {
    const checkPrivacyRoute = () => {
      if (
        window.location.hash.toLowerCase().includes('privacy') ||
        window.location.pathname.toLowerCase().includes('privacy')
      ) {
        setIsPrivacyModalOpen(true);
      }
    };
    checkPrivacyRoute();
    window.addEventListener('hashchange', checkPrivacyRoute);
    return () => window.removeEventListener('hashchange', checkPrivacyRoute);
  }, []);

  // Check URL hash for direct meeting invite link (e.g. /#meet=fellowship-prayer-room)
  React.useEffect(() => {
    const checkMeetRoute = () => {
      if (window.location.hash.toLowerCase().includes('meet=')) {
        launchApp('faith_meet');
      }
    };
    checkMeetRoute();
    window.addEventListener('hashchange', checkMeetRoute);
    return () => window.removeEventListener('hashchange', checkMeetRoute);
  }, [launchApp]);

  // Keyboard shortcuts (Escape, Alt+[, Alt+], Alt+Enter)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) return;

      // Escape key minimizes active window or exits split screen to desktop dashboard
      if (e.key === 'Escape') {
        if (!isDesktopView) {
          if (splitScreen.isSplit) {
            exitSplitScreen();
          } else if (activeAppId) {
            minimizeApp(activeAppId);
          }
        }
      }

      // Alt + [ : Snap active window to Left 50%
      if (e.altKey && (e.key === '[' || e.code === 'BracketLeft')) {
        e.preventDefault();
        sounds.playTap();
        const curApp = activeAppId || 'faithlingo';
        const companion = apps.find(a => a.id !== curApp)?.id || 'bible_journal';
        enterSplitScreen(curApp, companion, '50-50');
      }

      // Alt + ] : Snap active window to Right 50%
      if (e.altKey && (e.key === ']' || e.code === 'BracketRight')) {
        e.preventDefault();
        sounds.playTap();
        const curApp = activeAppId || 'bible_journal';
        const companion = apps.find(a => a.id !== curApp)?.id || 'faithlingo';
        enterSplitScreen(companion, curApp, '50-50');
      }

      // Alt + Enter : Toggle Split Screen / Full Screen Maximized
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        sounds.playTap();
        toggleSplitScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktopView, activeAppId, splitScreen, minimizeApp, enterSplitScreen, exitSplitScreen, toggleSplitScreen, apps]);

  const [windowSnap, setWindowSnap] = useState<'maximize' | 'left' | 'right' | 'center'>('maximize');
  const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);

  const customWallpaperUrl = typeof window !== 'undefined' ? localStorage.getItem('lifeos_custom_wallpaper') : null;

  const wallpaperClasses: Record<string, string> = {
    mountain: 'bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950',
    nebula: 'bg-gradient-to-tr from-purple-950 via-slate-950 to-indigo-950',
    olive: 'bg-gradient-to-b from-emerald-950 via-teal-950 to-stone-950',
    slate: 'bg-gradient-to-b from-slate-900 via-stone-900 to-black',
    aurora: 'bg-gradient-to-tr from-emerald-950 via-sky-950 to-purple-950',
    stained_glass: 'bg-gradient-to-tr from-rose-950 via-indigo-950 to-purple-950',
    golden_temple: 'bg-gradient-to-b from-amber-950 via-yellow-950 to-stone-950',
    sunset_peaks: 'bg-gradient-to-b from-rose-950 via-purple-950 to-stone-950',
    cyber_neon: 'bg-gradient-to-tr from-cyan-950 via-fuchsia-950 to-stone-950',
    celestial: 'bg-gradient-to-b from-indigo-950 via-blue-950 to-black',
    custom: customWallpaperUrl ? 'bg-cover bg-center bg-no-repeat' : 'bg-gradient-to-b from-slate-900 to-black'
  };

  const activeApp = apps.find(a => a.id === activeAppId);
  const activeWindowState = openWindows[activeAppId];
  const { announcement, setAnnouncement, settings, updateSettings, isAuthorizedAdmin } = useSettings();

  const themeWallpaper = {
    dark: wallpaperClasses[wallpaper] || wallpaperClasses.mountain,
    light: 'bg-gradient-to-b from-amber-50 via-sky-50 to-stone-100 text-stone-900',
    amoled: 'bg-black text-white'
  }[settings.themeMode || 'dark'] || wallpaperClasses[wallpaper] || wallpaperClasses.mountain;

  return (
    <div
      style={wallpaper === 'custom' && customWallpaperUrl ? { backgroundImage: `url(${customWallpaperUrl})` } : undefined}
      className={`h-[100dvh] w-full flex flex-col overflow-hidden relative select-none ${themeWallpaper} ${
      settings.fastingModeActive ? 'sepia-[0.3] contrast-[0.95] brightness-[0.92]' : ''
    }`}>
      {/* Top System Menu Bar (Desktop always; Mobile only on Desktop/Widgets view) */}
      <div className={!isDesktopView && ((activeApp && activeWindowState && !activeWindowState.isMinimized) || splitScreen.isSplit) ? 'hidden md:block' : 'block'}>
        <LifeOSTopBar onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
      </div>

      {/* Fasting & Solitude Mode Ribbon */}
      {settings.fastingModeActive && (
        <div className="bg-gradient-to-r from-amber-950/90 via-stone-900/90 to-amber-950/90 border-b border-amber-500/40 px-3 py-1 flex items-center justify-between text-[11px] text-amber-200 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <span>🕯️</span>
            <span className="font-extrabold">Fasting & Solitude Mode Active:</span>
            <span className="text-stone-300">Atmosphere dimmed to candlelight • Focused on quiet reflection & prayer.</span>
          </div>
          <button
            onClick={() => updateSettings({ fastingModeActive: false })}
            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold"
          >
            End Solitude
          </button>
        </div>
      )}

      {/* Global Broadcast Announcement Ribbon (If active) */}
      {announcement && (
        <div className="bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 border-b border-purple-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-white z-40 shrink-0 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 rounded-md bg-purple-500/30 text-purple-200 shrink-0">
              <Megaphone className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="font-black text-amber-300 shrink-0">{announcement.title}:</span>
            <span className="truncate text-stone-200">{announcement.message}</span>
          </div>
          <button
            onClick={() => setAnnouncement(null)}
            className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-white shrink-0 ml-2"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Desktop Workspace / Active App Window / Split-Screen Dual Canvas / Desktop Widgets */}
      <div className={`flex-1 relative overflow-hidden flex flex-col ${
        !isDesktopView && (splitScreen.isSplit || (activeApp && activeWindowState && !activeWindowState.isMinimized))
          ? 'p-0 pb-0'
          : 'p-0 pb-0'
      }`}>
        <AnimatePresence mode="wait">
          {!isDesktopView && splitScreen.isSplit ? (
            <motion.div
              key="lifeos-split-screen-canvas"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full h-full flex-1 overflow-hidden"
            >
              <LifeOSSplitPaneView />
            </motion.div>
          ) : !isDesktopView && activeApp && activeWindowState && !activeWindowState.isMinimized ? (
            <motion.div
              key={`window-${activeApp.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`flex flex-col bg-amber-50/95 dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden transition-all duration-200 ${
                windowSnap === 'maximize'
                  ? 'flex-1 w-full h-full rounded-none border-0 shadow-none m-0 p-0'
                  : windowSnap === 'left'
                  ? 'flex-1 w-full md:w-1/2 h-full rounded-none border-r border-white/20 self-start shadow-2xl'
                  : windowSnap === 'right'
                  ? 'flex-1 w-full md:w-1/2 h-full rounded-none border-l border-white/20 self-end shadow-2xl ml-auto'
                  : 'w-full md:w-11/12 max-w-6xl h-full md:h-[94%] my-auto mx-auto rounded-3xl border border-white/20 shadow-2xl'
              }`}
            >
              {/* Desktop Window Titlebar with macOS traffic lights & Windows-style actions */}
              <div className="hidden md:flex h-9 px-4 bg-stone-100/90 dark:bg-slate-900/90 border-b border-stone-200/80 dark:border-slate-800 items-center justify-between select-none shrink-0 relative">
                {/* Traffic Light Controls */}
                <div className="flex items-center gap-2">
                  {/* Close (Red) */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeApp(activeApp.id);
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-[9px] text-white opacity-90 transition-all shadow-sm group"
                    title="Close window to desktop"
                  >
                    <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                  {/* Minimize (Yellow) */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeApp(activeApp.id);
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-[9px] text-white opacity-90 transition-all shadow-sm group"
                    title="Minimize window to dock"
                  >
                    <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                  {/* Maximize & Snap (Green) */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSnapMenuOpen(!isSnapMenuOpen);
                      }}
                      className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[9px] text-white opacity-90 transition-all shadow-sm group"
                      title="Window Snap & Split Layouts"
                    >
                      <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </div>
                </div>

                {/* Window Title & Emoji */}
                <div className="flex items-center gap-2 font-black text-xs text-stone-700 dark:text-stone-300">
                  <span className="text-sm">{activeApp.emoji}</span>
                  <span>{activeApp.title}</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    — {activeApp.description}
                  </span>
                </div>

                {/* Right Side Window Controls (Windows 11 Snap Layouts & Controls) */}
                <div className="flex items-center gap-1 relative">
                  {/* Snap Layouts Selector Button */}
                  <button
                    onClick={() => {
                      sounds.playTap();
                      setIsSnapMenuOpen(!isSnapMenuOpen);
                    }}
                    className={`p-1 px-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isSnapMenuOpen ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-400 hover:text-white'
                    }`}
                    title="Snap layouts & Split-Screen"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>🗖 Snap</span>
                  </button>

                  {/* Snap Layout Dropdown Menu */}
                  {isSnapMenuOpen && (
                    <div className="absolute top-8 right-0 w-64 bg-stone-900/98 border border-white/20 rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-stone-200 space-y-2 backdrop-blur-2xl">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase text-stone-400">Snap & Split Layouts</span>
                        <span className="text-[10px] text-amber-400 font-mono">Alt+[ / Alt+]</span>
                      </div>

                      {/* Single Window Snapping */}
                      <div className="space-y-1">
                        <button
                          onClick={() => { sounds.playTap(); setWindowSnap('maximize'); setIsSnapMenuOpen(false); }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                            windowSnap === 'maximize' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-white/10'
                          }`}
                        >
                          <span>🗖 Full Screen</span>
                          {windowSnap === 'maximize' && <span>✓</span>}
                        </button>
                        <button
                          onClick={() => { sounds.playTap(); setWindowSnap('center'); setIsSnapMenuOpen(false); }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                            windowSnap === 'center' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-white/10'
                          }`}
                        >
                          <span>▣ Centered Glass View</span>
                          {windowSnap === 'center' && <span>✓</span>}
                        </button>
                      </div>

                      {/* Split Screen Dual Window Presets */}
                      <div className="pt-1.5 border-t border-white/10 space-y-1">
                        <div className="text-[10px] font-black uppercase text-emerald-400 px-1 py-0.5">
                          Dual-App Split Presets
                        </div>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            setIsSnapMenuOpen(false);
                            const companion = apps.find(a => a.id !== activeApp.id)?.id || 'bible_journal';
                            enterSplitScreen(activeApp.id, companion, '50-50');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span>◧ Split Left 50%</span>
                          <span className="text-[10px] text-stone-400 font-mono">50 / 50</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            setIsSnapMenuOpen(false);
                            const companion = apps.find(a => a.id !== activeApp.id)?.id || 'bible_journal';
                            enterSplitScreen(companion, activeApp.id, '50-50');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span>◨ Split Right 50%</span>
                          <span className="text-[10px] text-stone-400 font-mono">50 / 50</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            setIsSnapMenuOpen(false);
                            const companion = apps.find(a => a.id !== activeApp.id)?.id || 'bible_journal';
                            enterSplitScreen(activeApp.id, companion, '70-30');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span>◫ Focus Split (Current 70%)</span>
                          <span className="text-[10px] text-stone-400 font-mono">70 / 30</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playTap();
                            setIsSnapMenuOpen(false);
                            const companion = apps.find(a => a.id !== activeApp.id)?.id || 'bible_journal';
                            enterSplitScreen(companion, activeApp.id, '30-70');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span>◫ Companion Split (Current 70%)</span>
                          <span className="text-[10px] text-stone-400 font-mono">30 / 70</span>
                        </button>
                      </div>

                      {/* Quick Companion App Picker */}
                      <div className="pt-1.5 border-t border-white/10">
                        <div className="text-[10px] font-black uppercase text-stone-400 px-1 py-0.5 mb-1">
                          Pick Second App to Dock:
                        </div>
                        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-1">
                          {apps
                            .filter(a => a.id !== activeApp.id)
                            .map(companion => (
                              <button
                                key={companion.id}
                                onClick={() => {
                                  sounds.playTap();
                                  setIsSnapMenuOpen(false);
                                  enterSplitScreen(activeApp.id, companion.id, '50-50');
                                }}
                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white text-[11px] text-stone-300 flex items-center gap-1.5 truncate transition-all text-left"
                                title={`Open alongside ${companion.title}`}
                              >
                                <span>{companion.emoji}</span>
                                <span className="truncate">{companion.title}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => minimizeApp(activeApp.id)}
                    className="p-1 px-1.5 rounded hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                    title="Minimize window to desktop"
                  >
                    <Minus className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => maximizeApp(activeApp.id)}
                    className="p-1 px-1.5 rounded hover:bg-stone-200 dark:hover:bg-slate-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                    title={activeWindowState.isMaximized ? "Restore window" : "Maximize window"}
                  >
                    {activeWindowState.isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => closeApp(activeApp.id)}
                    className="p-1 px-1.5 rounded hover:bg-rose-500 hover:text-white text-stone-500 transition-colors"
                    title="Close window to desktop"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Mobile Native App Bar */}
              <div className="flex md:hidden pt-[max(env(safe-area-inset-top,0px),48px)] pb-2.5 px-3 bg-stone-900/98 dark:bg-black/98 border-b border-white/10 items-center justify-between select-none shrink-0 text-white z-20 shadow-md">
                <button
                  onClick={() => {
                    sounds.playTap();
                    showDesktop();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-400 font-extrabold text-xs active:scale-95 transition-all"
                  title="Return to Desktop Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <div className="flex items-center gap-1.5 font-black text-xs text-white">
                  <span className="text-sm">{activeApp.emoji}</span>
                  <span className="truncate max-w-[140px]">{activeApp.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Quick Mobile Split Button */}
                  <button
                    onClick={() => {
                      sounds.playTap();
                      const second = apps.find(a => a.id !== activeApp.id)?.id || 'bible_journal';
                      enterSplitScreen(activeApp.id, second, '50-50');
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-400 hover:text-white"
                    title="Split screen on mobile"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      sounds.playTap();
                      closeApp(activeApp.id);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white"
                    title="Close App"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Window Body: Specific App Rendering */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <LifeOSAppContentRenderer appId={activeApp.id} onReturnToDesktop={() => showDesktop()} />
              </div>
            </motion.div>
          ) : (
            /* Main LifeOS Desktop Page with Interactive App Widgets */
            <motion.div
              key="desktop-widgets"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <LifeOSDesktopWidgets
                activeWidgets={desktopWidgets}
                onRemoveWidget={removeDesktopWidget}
                onOpenAddModal={() => setIsAddWidgetModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating System Dock */}
      <LifeOSDock />

      {/* Floating Picture-in-Picture Bar for Active Calls when Navigating other Apps */}
      <LifeMeetFloatingPiP />

      {/* Full-screen Launchpad Modal */}
      <LaunchpadModal />

      {/* Add / Manage Desktop Widgets Modal */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        activeWidgets={desktopWidgets}
        onAddWidget={addDesktopWidget}
        onRemoveWidget={removeDesktopWidget}
        onResetDefaults={resetDesktopWidgets}
      />

      {/* Welcome & Name Registration Onboarding Modal for First-time users */}
      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* Official Life OS Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={() => setIsPrivacyModalOpen(false)}
      />

      {/* Exclusive Master Admin Floating God-Mode Command Center for aw03102008@gmail.com */}
      <LifeOSGodModeBar />

      {/* Site-Wide Maintenance Mode Lockdown Overlay for non-admins */}
      {settings.maintenanceMode && !isAuthorizedAdmin && (
        <div className="fixed inset-0 z-[99999] bg-stone-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white select-none">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-4xl mb-4 shadow-2xl animate-pulse">
            🔒
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-2">
            LifeOS Sanctuary Under Scheduled Maintenance
          </h2>
          <p className="text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
            {settings.maintenanceMessage || 'System maintenance in progress. All offline features remain functional.'}
          </p>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-stone-400 font-mono">
            Administrator: {MASTER_ADMIN_EMAIL}
          </div>
        </div>
      )}
    </div>
  );
};
