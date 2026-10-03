import React, { useState } from 'react';
import { STUDY_UNITS } from '../data/lessonsData';
import { StudyUnit, Lesson } from '../types';
import { useApp } from '../context/AppContext';
import { Check, Star, Lock, Sparkles, BookOpen, Crown, ChevronRight, Gift } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { DailyWidget } from './DailyWidget';
import { LessonModal } from './LessonModal';
import { MascotGrace } from './MascotGrace';

export const StudyPathView: React.FC = () => {
  const { userStats, activeLesson, setActiveLesson } = useApp();

  const isLessonCompleted = (lessonId: string) => userStats.completedLessonIds.includes(lessonId);

  // Lesson is unlocked if it's the very first lesson, or if previous lesson is completed
  const isLessonUnlocked = (unitIndex: number, lessonIndex: number) => {
    if (unitIndex === 0 && lessonIndex === 0) return true;
    if (lessonIndex > 0) {
      const prevLesson = STUDY_UNITS[unitIndex].lessons[lessonIndex - 1];
      return isLessonCompleted(prevLesson.id);
    } else {
      const prevUnit = STUDY_UNITS[unitIndex - 1];
      const lastLessonOfPrevUnit = prevUnit.lessons[prevUnit.lessons.length - 1];
      return isLessonCompleted(lastLessonOfPrevUnit.id);
    }
  };

  const handleNodeClick = (lesson: Lesson, unlocked: boolean) => {
    sounds.playTap();
    if (!unlocked) return;
    setActiveLesson(lesson);
  };

  if (activeLesson) {
    return <LessonModal lesson={activeLesson} onClose={() => setActiveLesson(null)} />;
  }

  // Node horizontal offset sequence to create the signature Duolingo winding path
  const getOffsetClass = (index: number) => {
    const pattern = ['translate-x-0', '-translate-x-8', 'translate-x-8', '-translate-x-6', 'translate-x-6'];
    return pattern[index % pattern.length];
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-8 pb-24">
      {/* Pinned Daily Scripture Highlight Widget */}
      <DailyWidget isModal={false} />

      {/* Encouragement Banner with Mascot */}
      <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-sm">
        <MascotGrace pose="happy" size="sm" message="Walk with Jesus step-by-step!" />
        <div className="hidden sm:block text-right">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Daily Streak Goal
          </span>
          <p className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
            {userStats.streak} Days Strong 🔥
          </p>
        </div>
      </div>

      {/* Units & Winding Lesson Tree */}
      <div className="flex flex-col gap-12">
        {STUDY_UNITS.map((unit, unitIdx) => {
          const completedInUnit = unit.lessons.filter(l => isLessonCompleted(l.id)).length;
          const unitProgress = Math.round((completedInUnit / unit.lessons.length) * 100);

          return (
            <section key={unit.id} className="flex flex-col items-center">
              {/* Unit Header Card */}
              <div
                className={`w-full p-5 rounded-3xl bg-gradient-to-r ${unit.themeColor} text-white shadow-md mb-8 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-black tracking-widest uppercase opacity-90 block mb-1">
                      Unit {unit.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                      {unit.title}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-90 font-medium leading-relaxed max-w-md">
                      {unit.description}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-amber-300" />
                  </div>
                </div>

                {/* Progress bar inside unit */}
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-black">
                  <span>Progress: {unitProgress}%</span>
                  <span>{completedInUnit} / {unit.lessons.length} Lessons</span>
                </div>
              </div>

              {/* Stepped Lesson Path Nodes */}
              <div className="flex flex-col items-center gap-6 py-2 w-full">
                {unit.lessons.map((lesson, lessonIdx) => {
                  const completed = isLessonCompleted(lesson.id);
                  const unlocked = isLessonUnlocked(unitIdx, lessonIdx);
                  const offsetClass = getOffsetClass(lessonIdx);

                  return (
                    <div
                      key={lesson.id}
                      className={`flex flex-col items-center transition-transform duration-300 ${offsetClass}`}
                    >
                      {/* Chunky 3D Duolingo Lesson Button */}
                      <button
                        onClick={() => handleNodeClick(lesson, unlocked)}
                        disabled={!unlocked}
                        className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all active:translate-y-1 select-none ${
                          completed
                            ? 'bg-amber-400 text-stone-900 border-4 border-amber-500 shadow-amber-600/30'
                            : unlocked
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-4 border-emerald-600 shadow-emerald-700/30 animate-pulse'
                            : 'bg-stone-200 dark:bg-slate-800 text-stone-400 dark:text-stone-600 border-4 border-stone-300 dark:border-slate-700 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {/* Icon inside node */}
                        {completed ? (
                          <Check className="w-8 h-8 stroke-[3.5]" />
                        ) : unlocked ? (
                          <Star className="w-8 h-8 fill-white stroke-[2.5]" />
                        ) : (
                          <Lock className="w-7 h-7" />
                        )}

                        {/* Floating Crown or XP badge */}
                        <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-sm text-[10px] font-black text-stone-700 dark:text-stone-300">
                          +{lesson.xpReward} XP
                        </div>
                      </button>

                      {/* Lesson title label */}
                      <span className="mt-2 text-xs font-extrabold text-stone-700 dark:text-stone-300 text-center max-w-[130px] line-clamp-1">
                        {lesson.title}
                      </span>
                    </div>
                  );
                })}

                {/* Milestone Bonus Chest at unit completion */}
                <div className="mt-4 flex flex-col items-center">
                  <div
                    title={`Complete Unit ${unit.number} to earn +${unit.milestoneBonusGems} Manna!`}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      unitProgress === 100
                        ? 'bg-amber-100 border-amber-400 text-amber-700'
                        : 'bg-stone-100 dark:bg-slate-800/60 border-dashed border-stone-300 dark:border-slate-700 text-stone-400'
                    }`}
                  >
                    <Gift className={`w-8 h-8 ${unitProgress === 100 ? 'text-amber-500 animate-bounce' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-wider">
                    +{unit.milestoneBonusGems} Manna Milestone
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
