import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeaderStats } from '../HeaderStats';
import { LessonModal } from '../LessonModal';
import { Navigation } from '../Navigation';
import { StudyPathView } from '../StudyPathView';
import { BibleReader } from '../BibleReader';
import { ReadingPlansView } from '../ReadingPlansView';
import { AiPrayerCompanion } from '../AiPrayerCompanion';
import { LeaderboardView } from '../LeaderboardView';
import { ShopModal } from '../ShopModal';
import { DailyWidget } from '../DailyWidget';

export const FaithLingoWindowContent: React.FC = () => {
  const { currentTab, fontSize, activeLesson, setActiveLesson } = useApp();

  const fontMultiplierClass = 
    fontSize === 'xlarge' ? 'text-lg' :
    fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className={`flex flex-col flex-1 h-full overflow-y-auto ${fontMultiplierClass} transition-colors duration-200 pb-20 md:pb-0`}>
      <HeaderStats />
      {activeLesson ? (
        <LessonModal lesson={activeLesson} onClose={() => setActiveLesson(null)} />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full">
          <Navigation />
          <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-100px)]">
            {currentTab === 'learn' && <StudyPathView />}
            {currentTab === 'bible' && <BibleReader />}
            {currentTab === 'plans' && <ReadingPlansView />}
            {currentTab === 'prayer' && <AiPrayerCompanion />}
            {currentTab === 'leaderboard' && <LeaderboardView />}
          </main>
        </div>
      )}
      <ShopModal />
      <DailyWidget isModal={true} />
    </div>
  );
};
