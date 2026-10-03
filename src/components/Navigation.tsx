import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BookOpen, Trophy, Sparkles, BookMarked, Home, HeartHandshake } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, setIsShopOpen } = useApp();

  const navItems = [
    { id: 'learn', label: 'Learn', icon: Home, badge: null },
    { id: 'bible', label: 'Offline Bible', icon: BookOpen, badge: '3 Ver' },
    { id: 'plans', label: 'Reading Plans', icon: BookMarked, badge: null },
    { id: 'prayer', label: 'AI Prayer', icon: HeartHandshake, badge: 'AI' },
    { id: 'leaderboard', label: 'Leagues', icon: Trophy, badge: null },
  ] as const;

  return (
    <>
      {/* Desktop Sidebar (Left side) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0 min-h-[calc(100vh-65px)]">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playTap();
                  setCurrentTab(item.id);
                }}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl font-black text-sm tracking-wide uppercase transition-colors select-none ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="flex-1 text-left relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 relative z-10">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}

          <div className="my-2 border-t border-stone-200 dark:border-slate-800" />

          {/* Manna Store button */}
          <motion.button
            whileHover={{ x: 3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playTap();
              setIsShopOpen(true);
            }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-black text-sm tracking-wide uppercase text-stone-600 dark:text-stone-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 border-2 border-transparent transition-colors select-none"
          >
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <span className="flex-1 text-left">Grace Store</span>
          </motion.button>
        </nav>

        {/* Spiritual Quote on bottom of sidebar */}
        <div className="mt-auto p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs mb-1">
            <span>✨</span>
            <span>Daily Remembrancer</span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 italic">
            “Your word is a lamp to my feet and a light for my path.”
          </p>
          <span className="block text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-semibold">
            Psalm 119:105
          </span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-stone-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playTap();
                setCurrentTab(item.id);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-black'
                  : 'text-stone-500 dark:text-stone-400 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
