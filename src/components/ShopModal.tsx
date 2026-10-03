import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Heart, Shield, Zap, Award, Check } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export const ShopModal: React.FC = () => {
  const { isShopOpen, setIsShopOpen, userStats, refillHearts, buyStreakFreeze } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isShopOpen) return null;

  const handleRefill = () => {
    sounds.playTap();
    if (userStats.hearts >= userStats.maxHearts) {
      setSuccessMsg('Your hearts are already full!');
      setTimeout(() => setSuccessMsg(null), 2000);
      return;
    }
    const ok = refillHearts();
    if (ok) {
      sounds.playCorrect();
      setSuccessMsg('Hearts refilled to full!');
    } else {
      sounds.playIncorrect();
      setSuccessMsg('Not enough Manna. Complete lessons to earn more!');
    }
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleFreeze = () => {
    sounds.playTap();
    if (userStats.streakFreezeActive) {
      setSuccessMsg('Streak Freeze is already active!');
      setTimeout(() => setSuccessMsg(null), 2000);
      return;
    }
    const ok = buyStreakFreeze();
    if (ok) {
      sounds.playCorrect();
      setSuccessMsg('Streak Freeze equipped!');
    } else {
      sounds.playIncorrect();
      setSuccessMsg('Not enough Manna. Complete lessons to earn more!');
    }
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={() => {
            sounds.playTap();
            setIsShopOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Store Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
              Grace Store
            </h3>
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 fill-cyan-400" />
              <span>{userStats.gems} Manna Available</span>
            </div>
          </div>
        </div>

        {/* Notification Feedback */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-xs text-center">
            {successMsg}
          </div>
        )}

        {/* Store Items List */}
        <div className="flex flex-col gap-3.5">
          {/* 1. Full Refill Hearts */}
          <div className="p-4 rounded-2xl border-2 border-stone-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h4 className="font-black text-sm text-stone-800 dark:text-stone-200">
                  Full Hearts Refill
                </h4>
                <p className="text-xs text-stone-500">
                  Refills your lives to {userStats.maxHearts} hearts
                </p>
              </div>
            </div>

            <button
              onClick={handleRefill}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-sm active:translate-y-0.5"
            >
              50 Manna
            </button>
          </div>

          {/* 2. Streak Freeze Shield */}
          <div className="p-4 rounded-2xl border-2 border-stone-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-stone-800 dark:text-stone-200">
                  Streak Freeze Shield
                </h4>
                <p className="text-xs text-stone-500">
                  Protects your streak if you miss 1 day
                </p>
              </div>
            </div>

            <button
              onClick={handleFreeze}
              disabled={userStats.streakFreezeActive}
              className={`px-3.5 py-2 rounded-xl font-black text-xs shadow-sm transition-all ${
                userStats.streakFreezeActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white active:translate-y-0.5'
              }`}
            >
              {userStats.streakFreezeActive ? 'Equipped' : '100 Manna'}
            </button>
          </div>

          {/* 3. Devotion XP Booster */}
          <div className="p-4 rounded-2xl border-2 border-stone-200 dark:border-slate-800 flex items-center justify-between gap-3 opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                <Zap className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h4 className="font-black text-sm text-stone-800 dark:text-stone-200">
                  2x XP Blessing Boost
                </h4>
                <p className="text-xs text-stone-500">
                  Double XP for the next 15 minutes
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playCorrect();
                setSuccessMsg('2x XP Blessing Boost activated!');
                setTimeout(() => setSuccessMsg(null), 2000);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm active:translate-y-0.5"
            >
              60 Manna
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <p className="text-center text-xs text-stone-400 mt-6 font-semibold">
          Earn free Manna by completing daily scripture lessons and reading plans!
        </p>
      </div>
    </div>
  );
};
