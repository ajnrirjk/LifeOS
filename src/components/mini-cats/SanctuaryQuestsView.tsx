import React from 'react';
import { motion } from 'motion/react';
import { CatQuest } from '../../types/miniCats';
import { Check, Sparkles, Trophy, Award, Gift } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface Props {
  quests: CatQuest[];
  onClaimQuest: (questId: string) => void;
  silverFish: number;
  goldFish: number;
}

export const SanctuaryQuestsView: React.FC<Props> = ({
  quests,
  onClaimQuest,
  silverFish,
  goldFish
}) => {
  const completedCount = quests.filter(q => q.isClaimed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fffbeb] dark:bg-stone-900 select-none">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {/* Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-none">
                Daily Sanctuary Quests
              </h2>
              <p className="text-xs text-white/90 font-bold mt-1">
                Complete missions to earn Silver 🐟 and Gold Fish 🪙
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black bg-white/25 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
              {completedCount} / {quests.length} Done
            </span>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3">
          {quests.map((quest) => {
            const isCompleted = quest.currentCount >= quest.targetCount;
            const progressPct = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <motion.div
                key={quest.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                  quest.isClaimed
                    ? 'bg-stone-100 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 opacity-60'
                    : isCompleted
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-amber-200/40'
                    : 'bg-white dark:bg-stone-800 border-[#b45309]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-stone-700 flex items-center justify-center text-xl shrink-0">
                    {quest.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#78350f] dark:text-stone-100 flex items-center gap-2">
                      <span>{quest.title}</span>
                      {quest.isClaimed && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                          Claimed ✓
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {quest.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2 w-48 max-w-full">
                      <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-stone-500">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward & Claim Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-700">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                      +{quest.rewardSilver} 🐟
                    </span>
                    {quest.rewardGold && (
                      <span className="text-amber-500 flex items-center gap-0.5">
                        +{quest.rewardGold} 🪙
                      </span>
                    )}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{quest.rewardXp} ⭐
                    </span>
                  </div>

                  {quest.isClaimed ? (
                    <div className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : isCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onClaimQuest(quest.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs shadow-md animate-bounce flex items-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim!</span>
                    </motion.button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-400 text-xs font-bold cursor-not-allowed"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
