import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { LifeOSTopBar } from './LifeOSTopBar';
import { LifeOSDock } from './LifeOSDock';
import { LaunchpadModal } from './LaunchpadModal';
import { AppStudio } from './AppStudio';
import { CustomAppRunner } from './CustomAppRunner';
import { BibleJournalApp } from '../journal/BibleJournalApp';
import { HeaderStats } from '../HeaderStats';
import { Navigation } from '../Navigation';
import { StudyPathView } from '../StudyPathView';
import { BibleReader } from '../BibleReader';
import { ReadingPlansView } from '../ReadingPlansView';
import { AiPrayerCompanion } from '../AiPrayerCompanion';
import { LeaderboardView } from '../LeaderboardView';
import { ShopModal } from '../ShopModal';
import { DailyWidget } from '../DailyWidget';
import { LifeOSDesktopWidgets } from './LifeOSDesktopWidgets';
import { AddWidgetModal } from './AddWidgetModal';
import { FellowshipChatApp } from '../chat/FellowshipChatApp';
import { DiscordFellowshipApp } from '../chat/DiscordFellowshipApp';
import { MiniCatsApp } from '../mini-cats/MiniCatsApp';
import { ArcadeVaultApp } from '../mini-games/ArcadeVaultApp';
import { YouTubeApp } from '../youtube/YouTubeApp';
import { useApp } from '../../context/AppContext';
import { Minus, Square, X, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal';

// Renders the full flagship FaithLingo app inside its LifeOS window
const FaithLingoWindowContent: React.FC = () => {
  const { currentTab, fontSize } = useApp();

  const fontMultiplierClass = 
    fontSize === 'xlarge' ? 'text-lg' :
    fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${fontMultiplierClass} transition-colors duration-200`}>
      <HeaderStats />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Navigation />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-100px)]">
          {currentTab === 'learn' && <StudyPathView />}
          {currentTab === 'bible' && <BibleReader />}
          {currentTab === 'plans' && <ReadingPlansView />}
          {currentTab === 'prayer' && <AiPrayerCompanion />}
          {currentTab === 'leaderboard' && <LeaderboardView />}
        </main>
      </div>
      <ShopModal />
      <DailyWidget isModal={true} />
    </div>
  );
};

export const LifeOSDesktop: React.FC = () => {
  const {
    apps,
    activeAppId,
    openWindows,
    closeApp,
    minimizeApp,
    maximizeApp,
    wallpaper,
    isDesktopView,
    showDesktop,
    desktopWidgets,
    addDesktopWidget,
    removeDesktopWidget,
    resetDesktopWidgets
  } = useLifeOS();

  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
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

  // Keyboard shortcuts (Escape key minimizes active window to desktop dashboard)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;
        if (!isDesktopView && activeAppId) {
          minimizeApp(activeAppId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktopView, activeAppId, minimizeApp]);

  const wallpaperClasses = {
    mountain: 'bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950',
    nebula: 'bg-gradient-to-tr from-purple-950 via-slate-950 to-indigo-950',
    olive: 'bg-gradient-to-b from-emerald-950 via-teal-950 to-stone-950',
    slate: 'bg-gradient-to-b from-slate-900 via-stone-900 to-black',
    aurora: 'bg-gradient-to-tr from-emerald-950 via-sky-950 to-purple-950',
  }[wallpaper];

  const activeApp = apps.find(a => a.id === activeAppId);
  const activeWindowState = openWindows[activeAppId];

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden relative select-none ${wallpaperClasses}`}>
      {/* Top System Menu Bar (Desktop always; Mobile only on Desktop/Widgets view) */}
      <div className={!isDesktopView && activeApp && activeWindowState && !activeWindowState.isMinimized ? 'hidden md:block' : 'block'}>
        <LifeOSTopBar onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
      </div>

      {/* Desktop Workspace / Active App Window / Desktop Widgets */}
      <div className={`flex-1 relative overflow-hidden flex flex-col ${
        !isDesktopView && activeApp && activeWindowState && !activeWindowState.isMinimized
          ? 'p-0 md:p-3 pb-16 md:pb-24'
          : 'p-2 sm:p-3 pb-20 md:pb-24'
      }`}>
        <AnimatePresence mode="wait">
          {!isDesktopView && activeApp && activeWindowState && !activeWindowState.isMinimized ? (
            <motion.div
              key={`window-${activeApp.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360, mass: 0.7 }}
              className={`flex-1 flex flex-col rounded-none md:rounded-3xl bg-amber-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-0 md:border md:border-white/20 shadow-none md:shadow-2xl overflow-hidden transition-all duration-300 ${
                !activeWindowState.isMaximized ? 'md:max-w-6xl md:max-h-[84vh] md:mx-auto md:my-auto md:w-full' : 'w-full h-full'
              }`}
            >
              {/* Desktop Window Titlebar with macOS traffic lights & Windows-style actions */}
              <div className="hidden md:flex h-9 px-4 bg-stone-100/90 dark:bg-slate-900/90 border-b border-stone-200/80 dark:border-slate-800 items-center justify-between select-none shrink-0">
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
                  {/* Maximize (Green) */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeApp(activeApp.id);
                    }}
                    className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[9px] text-white opacity-90 transition-all shadow-sm group"
                    title={activeWindowState.isMaximized ? "Restore windowed view" : "Maximize window"}
                  >
                    <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>

                {/* Window Title & Emoji */}
                <div className="flex items-center gap-2 font-black text-xs text-stone-700 dark:text-stone-300">
                  <span className="text-sm">{activeApp.emoji}</span>
                  <span>{activeApp.title}</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    — {activeApp.description}
                  </span>
                </div>

                {/* Right Side Window Controls (Windows / Chrome style for easy minimize & close) */}
                <div className="flex items-center gap-1">
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

              {/* Window Body: Specific App Rendering */}
              <div className="flex-1 overflow-y-auto">
                {activeApp.id === 'faithlingo' && <FaithLingoWindowContent />}
                {activeApp.id === 'bible_journal' && <BibleJournalApp />}
                {activeApp.id === 'fellowship_chat' && <DiscordFellowshipApp />}
                {activeApp.id === 'mini_cats' && <MiniCatsApp />}
                {activeApp.id === 'mini_games' && <ArcadeVaultApp />}
                {activeApp.id === 'youtube' && <YouTubeApp />}
                {activeApp.id === 'app_studio' && <AppStudio />}
                {activeApp.id !== 'faithlingo' && activeApp.id !== 'bible_journal' && activeApp.id !== 'fellowship_chat' && activeApp.id !== 'mini_cats' && activeApp.id !== 'mini_games' && activeApp.id !== 'youtube' && activeApp.id !== 'app_studio' && (
                  <CustomAppRunner app={activeApp} />
                )}
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
              className="flex-1 flex flex-col overflow-y-auto"
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

      {/* Official Life OS Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
