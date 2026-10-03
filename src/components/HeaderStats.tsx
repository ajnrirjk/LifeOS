import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Heart, Sparkles, Moon, Sun, Volume2, VolumeX, Type, BookOpen } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export const HeaderStats: React.FC = () => {
  const {
    userStats,
    setIsShopOpen,
    setIsWidgetModalOpen,
    darkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    soundEnabled,
    toggleSoundEnabled
  } = useApp();

  const cycleFontSize = () => {
    sounds.playTap();
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: App Logo & Brand (Shown on Desktop only) */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-sm flex items-center justify-center text-white shrink-0">
            <span className="text-base sm:text-xl select-none">🕊️</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-emerald-800 dark:text-emerald-400 leading-none">
              FaithLingo
            </h1>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Scripture & Teachings
            </span>
          </div>
        </div>

        {/* Center: Game Stats (Duolingo style) */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {/* Daily Streak */}
          <div 
            title={`${userStats.streak} day streak! Keep learning daily.`}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 font-extrabold text-xs sm:text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userStats.streak}</span>
          </div>

          {/* Manna / Gems */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsShopOpen(true);
            }}
            title="Manna (Gems) - Click to open Grace Store"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/80 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs sm:text-base hover:scale-105 active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-cyan-400 text-cyan-500" />
            <span>{userStats.gems}</span>
          </button>

          {/* Hearts / Lives */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsShopOpen(true);
            }}
            title={`${userStats.hearts} hearts remaining. Click to refill!`}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-500 dark:text-rose-400 font-extrabold text-xs sm:text-base hover:scale-105 active:scale-95 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${userStats.hearts > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            <span>{userStats.hearts}</span>
          </button>
        </div>

        {/* Right: Quick Tools & Toggles */}
        <div className="flex items-center gap-0.5 sm:gap-2">
          {/* Pinned Today's Scripture Highlight Widget button */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsWidgetModalOpen(true);
            }}
            title="Today's Scripture Highlight Widget"
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm active:translate-y-0.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Today's Verse</span>
          </button>

          {/* Font Size Accessibility Adjuster */}
          <button
            onClick={cycleFontSize}
            title={`Adjust text size (Current: ${fontSize})`}
            className="hidden sm:flex p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Type className="w-4 h-4" />
            <span className="sr-only">Toggle font size</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              toggleSoundEnabled();
              sounds.playTap();
            }}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="hidden sm:flex p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              sounds.playTap();
              toggleDarkMode();
            }}
            title={darkMode ? 'Switch to daylight mode' : 'Switch to evening devotion dark mode'}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
