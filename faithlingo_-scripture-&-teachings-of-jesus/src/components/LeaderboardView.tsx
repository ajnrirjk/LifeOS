import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_LEADERBOARD_USERS, LEAGUES } from '../data/leaderboardData';
import { LeaderboardUser } from '../types';
import { Trophy, Flame, Sparkles, Heart, Crown, ArrowUp, ArrowDown, Shield, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';
import { MascotGrace } from './MascotGrace';

export const LeaderboardView: React.FC = () => {
  const { userStats } = useApp();
  const [users, setUsers] = useState<LeaderboardUser[]>(() => {
    // Inject current user XP from userStats
    return MOCK_LEADERBOARD_USERS.map(u => 
      u.isCurrentUser ? { ...u, xp: userStats.xp, streak: userStats.streak } : u
    ).sort((a, b) => b.xp - a.xp);
  });

  const [cheeredIds, setCheeredIds] = useState<string[]>([]);

  const currentLeague = LEAGUES.find(l => l.name === userStats.activeLeague) || LEAGUES[2];
  const userRank = users.findIndex(u => u.isCurrentUser) + 1;

  const handleCheer = (userId: string) => {
    sounds.playCorrect();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 }
    });
    setCheeredIds(prev => [...prev, userId]);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, cheersReceived: u.cheersReceived + 1 } : u));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
      {/* League Header Banner */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${currentLeague.color} text-white shadow-md relative overflow-hidden`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-200 block mb-1">
              Weekly League
            </span>
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Trophy className="w-7 h-7" />
              <span>{currentLeague.name} League</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-100 opacity-90 mt-1 font-medium">
              Top 5 disciples advance to the next league this Sunday!
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm p-3 rounded-2xl text-center shrink-0">
            <Clock className="w-4 h-4 mx-auto text-amber-300 mb-1" />
            <span className="text-[10px] font-black uppercase block">Ends in</span>
            <span className="text-xs font-black">3d 14h</span>
          </div>
        </div>
      </div>

      {/* Mascot Cheer Banner */}
      <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 shadow-sm">
        <MascotGrace pose="cheering" size="sm" message={`You are in Rank #${userRank}! Run the race with perseverance.`} />
        <div className="text-right">
          <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">
            Your League XP
          </span>
          <p className="text-base font-black text-stone-800 dark:text-stone-200">
            {userStats.xp} XP
          </p>
        </div>
      </div>

      {/* League Rank List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-stone-200 dark:border-slate-800 shadow-sm divide-y divide-stone-100 dark:divide-slate-800 overflow-hidden transition-colors">
        {users.map((user, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const isPromotionZone = rank <= 5;
          const isCurrentUser = user.isCurrentUser;
          const hasCheered = cheeredIds.includes(user.id);

          return (
            <div
              key={user.id}
              className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                isCurrentUser
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-l-4 border-l-emerald-500'
                  : 'hover:bg-stone-50/60 dark:hover:bg-slate-850'
              }`}
            >
              {/* Left: Rank & Avatar */}
              <div className="flex items-center gap-3.5">
                {/* Rank indicator */}
                <div className="w-7 text-center">
                  {rank === 1 ? (
                    <Crown className="w-6 h-6 text-amber-400 mx-auto fill-amber-400" />
                  ) : rank === 2 ? (
                    <span className="text-base font-black text-slate-400">🥈</span>
                  ) : rank === 3 ? (
                    <span className="text-base font-black text-amber-600">🥉</span>
                  ) : (
                    <span className="text-sm font-black text-stone-400 dark:text-stone-500">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar with country flag */}
                <div className="relative text-2xl select-none">
                  <span>{user.avatar}</span>
                  <span className="absolute -bottom-1 -right-1 text-xs">{user.country}</span>
                </div>

                {/* Name & Status */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm sm:text-base font-black ${
                      isCurrentUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'
                    }`}>
                      {user.name}
                    </span>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-1 max-w-[200px] sm:max-w-xs">
                    {user.statusQuote}
                  </p>
                </div>
              </div>

              {/* Right: XP, Streak & Cheer Button */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* Streak */}
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.streak}d</span>
                </div>

                {/* Total XP */}
                <span className="text-sm font-black text-stone-700 dark:text-stone-200">
                  {user.xp} XP
                </span>

                {/* Cheer Button for others */}
                {!isCurrentUser ? (
                  <button
                    onClick={() => handleCheer(user.id)}
                    title="Send prayer encouragement"
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                      hasCheered
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasCheered ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="hidden sm:inline">{user.cheersReceived}</span>
                  </button>
                ) : (
                  <div className="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-emerald-500" />
                    <span>{user.cheersReceived}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Promotion Zone Explanation */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
          <ArrowUp className="w-4 h-4" />
          Top 5 Advance to Sapphire League
        </span>
        <span className="flex items-center gap-1.5 font-bold text-stone-500">
          <Shield className="w-4 h-4" />
          Ranks 6-25 Maintain League
        </span>
      </div>
    </div>
  );
};
