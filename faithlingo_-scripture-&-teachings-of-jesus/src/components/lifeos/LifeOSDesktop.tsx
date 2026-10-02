import React, { useState } from 'react';
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
import { useApp } from '../../context/AppContext';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

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
    desktopWidgets,
    addDesktopWidget,
    removeDesktopWidget,
    resetDesktopWidgets
  } = useLifeOS();

  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

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
    <div className={`h-screen w-screen flex flex-col overflow-hidden relative ${wallpaperClasses}`}>
      {/* Top System Menu Bar */}
      <LifeOSTopBar />

      {/* Desktop Workspace / Active App Window / Desktop Widgets */}
      <div className="flex-1 relative p-2 sm:p-3 pb-24 overflow-hidden flex flex-col">
        {!isDesktopView && activeApp && activeWindowState && !activeWindowState.isMinimized ? (
          <div
            className={`flex-1 flex flex-col rounded-3xl bg-amber-50/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95`}
          >
            {/* Window Titlebar with macOS traffic light buttons */}
            <div className="h-9 px-4 bg-stone-100/90 dark:bg-slate-900/90 border-b border-stone-200/80 dark:border-slate-800 flex items-center justify-between select-none shrink-0">
              {/* Traffic Light Controls */}
              <div className="flex items-center gap-2">
                {/* Close (Red) */}
                <button
                  onClick={() => closeApp(activeApp.id)}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-[8px] text-white opacity-90 transition-all hover:scale-110"
                  title="Close app to desktop"
                >
                  <X className="w-2 h-2" />
                </button>
                {/* Minimize (Yellow) */}
                <button
                  onClick={() => minimizeApp(activeApp.id)}
                  className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-[8px] text-white opacity-90 transition-all hover:scale-110"
                  title="Minimize to desktop widgets"
                >
                  <Minus className="w-2 h-2" />
                </button>
                {/* Maximize (Green) */}
                <button
                  onClick={() => maximizeApp(activeApp.id)}
                  className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[8px] text-white opacity-90 transition-all hover:scale-110"
                  title="Maximize / Restore window"
                >
                  <Maximize2 className="w-2 h-2" />
                </button>
              </div>

              {/* Window Title & Emoji */}
              <div className="flex items-center gap-2 font-black text-xs text-stone-700 dark:text-stone-300">
                <span>{activeApp.emoji}</span>
                <span>{activeApp.title}</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  — {activeApp.description}
                </span>
              </div>

              <div className="w-12" />
            </div>

            {/* Window Body: Specific App Rendering */}
            <div className="flex-1 overflow-y-auto">
              {activeApp.id === 'faithlingo' && <FaithLingoWindowContent />}
              {activeApp.id === 'bible_journal' && <BibleJournalApp />}
              {activeApp.id === 'fellowship_chat' && <FellowshipChatApp />}
              {activeApp.id === 'app_studio' && <AppStudio />}
              {activeApp.id !== 'faithlingo' && activeApp.id !== 'bible_journal' && activeApp.id !== 'fellowship_chat' && activeApp.id !== 'app_studio' && (
                <CustomAppRunner app={activeApp} />
              )}
            </div>
          </div>
        ) : (
          /* Main LifeOS Desktop Page with Interactive App Widgets */
          <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-300">
            <LifeOSDesktopWidgets
              activeWidgets={desktopWidgets}
              onRemoveWidget={removeDesktopWidget}
              onOpenAddModal={() => setIsAddWidgetModalOpen(true)}
            />
          </div>
        )}
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
    </div>
  );
};
