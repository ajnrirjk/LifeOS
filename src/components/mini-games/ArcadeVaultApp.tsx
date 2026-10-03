import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../services/soundEffects';
import { MiniGameId, MiniGameMeta, ArcadeStats } from './types';
import { FlappyDoveGame } from './FlappyDoveGame';
import { BabelStackerGame } from './BabelStackerGame';
import { DemonBusterGame } from './DemonBusterGame';
import { EdenSnakeGame } from './EdenSnakeGame';
import { ScriptureMatrixGame } from './ScriptureMatrixGame';
import { SlingshotTargetGame } from './SlingshotTargetGame';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Zap,
  Play,
  Volume2,
  VolumeX,
  Layers,
  Crown,
  Star
} from 'lucide-react';

const GAMES_LIST: MiniGameMeta[] = [
  {
    id: 'flappy_dove',
    title: 'Faith Flappy Dove',
    tagline: 'Glide through holy marble columns & collect golden halos',
    emoji: '🕊️',
    genre: 'Precision Flight',
    difficulty: 'Challenging',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentGradient: 'from-amber-500 via-yellow-500 to-orange-600',
    instructions: ['Tap / Click to flap wings', 'Fly through marble columns', 'Collect halos for bonus tokens']
  },
  {
    id: 'babel_stack',
    title: 'Tower of Babel Stacker',
    tagline: 'Precision 3D stacker with slicing physics & harmony combos',
    emoji: '🧱',
    genre: 'Rhythm Timing',
    difficulty: 'Medium',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    accentGradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    instructions: ['Tap when block aligns with tower', 'Slice overhanging edges', 'Match perfectly for combo multipliers']
  },
  {
    id: 'demon_buster',
    title: 'Armor of God: Demon Buster',
    tagline: 'Retro neon space shooter with Shield of Faith & Holy Lasers',
    emoji: '⚔️',
    genre: 'Arcade Shooter',
    difficulty: 'High Reflex',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentGradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    instructions: ['Drag / Arrow keys to move vessel', 'Auto-fire holy laser blasts', 'Collect Shield of Faith & Spirit Bombs']
  },
  {
    id: 'eden_snake',
    title: 'Garden of Eden Cyber Snake',
    tagline: 'Fast-paced cyber neon snake collecting wisdom scrolls & apples',
    emoji: '🐍',
    genre: 'Classic Arcade',
    difficulty: 'Medium',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentGradient: 'from-emerald-500 via-teal-600 to-green-600',
    instructions: ['Swipe or use D-Pad to steer', 'Eat golden apples & wisdom scrolls', 'Avoid crashing into yourself']
  },
  {
    id: 'slingshot_target',
    title: "David's Slingshot Range",
    tagline: 'Physics slingshot aiming stream stones at Goliath targets & clay jars',
    emoji: '🎯',
    genre: 'Physics Action',
    difficulty: 'Medium',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    accentGradient: 'from-orange-500 via-amber-600 to-rose-600',
    instructions: ['Pull back stone to adjust angle & power', 'Aim at Goliath armor & golden urns', 'Hit moving shields for combos']
  },
  {
    id: 'scripture_matrix',
    title: 'Scripture Memory Matrix',
    tagline: 'Harmonic crystal audio synthesizer Simon memory challenge',
    emoji: '🧠',
    genre: 'Memory / Audio',
    difficulty: 'Easy',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    instructions: ['Watch crystal pads flash with sound', 'Repeat the melody sequence', 'Level up speed and pattern length']
  }
];

const INITIAL_STATS: ArcadeStats = {
  totalTokens: 50,
  highScores: {
    flappy_dove: 0,
    babel_stack: 0,
    demon_buster: 0,
    eden_snake: 0,
    scripture_matrix: 0,
    slingshot_target: 0
  },
  gamesPlayed: {
    flappy_dove: 0,
    babel_stack: 0,
    demon_buster: 0,
    eden_snake: 0,
    scripture_matrix: 0,
    slingshot_target: 0
  },
  unlockedSkins: ['classic'],
  activeSkin: 'classic'
};

export const ArcadeVaultApp: React.FC = () => {
  const [activeGame, setActiveGame] = useState<MiniGameId | null>(null);
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'trophies'>('games');
  const [soundMuted, setSoundMuted] = useState(false);

  const [stats, setStats] = useState<ArcadeStats>(() => {
    try {
      const saved = localStorage.getItem('lifeos_arcade_stats_v1');
      if (saved) return JSON.parse(saved);
      return INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lifeos_arcade_stats_v1', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  const handleGameOver = (gameId: MiniGameId, score: number, tokensEarned: number) => {
    setStats((prev) => {
      const currentHigh = prev.highScores[gameId] || 0;
      const newHigh = Math.max(currentHigh, score);
      const newPlays = (prev.gamesPlayed[gameId] || 0) + 1;
      const newTokens = prev.totalTokens + tokensEarned;

      return {
        ...prev,
        totalTokens: newTokens,
        highScores: { ...prev.highScores, [gameId]: newHigh },
        gamesPlayed: { ...prev.gamesPlayed, [gameId]: newPlays }
      };
    });
  };

  const launchGame = (gameId: MiniGameId) => {
    sounds.playTap();
    setActiveGame(gameId);
  };

  // If a specific mini game is launched, render its game screen
  if (activeGame) {
    return (
      <div className="min-h-full bg-stone-950 text-white flex flex-col justify-center items-center py-2 px-2 sm:px-4 overflow-x-hidden">
        {activeGame === 'flappy_dove' && (
          <FlappyDoveGame
            highScore={stats.highScores.flappy_dove}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('flappy_dove', sc, tk)}
          />
        )}
        {activeGame === 'babel_stack' && (
          <BabelStackerGame
            highScore={stats.highScores.babel_stack}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('babel_stack', sc, tk)}
          />
        )}
        {activeGame === 'demon_buster' && (
          <DemonBusterGame
            highScore={stats.highScores.demon_buster}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('demon_buster', sc, tk)}
          />
        )}
        {activeGame === 'eden_snake' && (
          <EdenSnakeGame
            highScore={stats.highScores.eden_snake}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('eden_snake', sc, tk)}
          />
        )}
        {activeGame === 'scripture_matrix' && (
          <ScriptureMatrixGame
            highScore={stats.highScores.scripture_matrix}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('scripture_matrix', sc, tk)}
          />
        )}
        {activeGame === 'slingshot_target' && (
          <SlingshotTargetGame
            highScore={stats.highScores.slingshot_target}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('slingshot_target', sc, tk)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-950 text-white flex flex-col">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/80 via-stone-900 to-stone-950 px-4 sm:px-8 pt-6 pb-6 border-b border-purple-900/30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> LifeOS Arcade Vault
              </span>
              <span className="text-xs text-stone-400">6 Mini Games Available</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🕹️</span>
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
                Retro Mini-Games Arcade
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Play fast-paced retro games with smooth physics, high score tracking, sound effects, and token rewards!
            </p>
          </div>

          {/* Arcade Token & Stats Badge */}
          <div className="flex items-center gap-3 bg-stone-900/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <span className="text-lg">🪙</span>
              <div>
                <div className="text-[10px] font-bold text-amber-400/80 uppercase leading-none">Arcade Tokens</div>
                <div className="text-sm sm:text-base font-black text-amber-300 leading-none mt-0.5">{stats.totalTokens}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Trophy className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] font-bold text-purple-400/80 uppercase leading-none">Total Plays</div>
                <div className="text-sm sm:text-base font-black text-purple-300 leading-none mt-0.5">
                  {Object.values(stats.gamesPlayed).reduce((a, b) => a + b, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-5xl mx-auto flex items-center gap-2 mt-6">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('games');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50'
                : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>All Games ({GAMES_LIST.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('leaderboard');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50'
                : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>High Scores & Records</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 flex-1">
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAMES_LIST.map((game) => {
              const bestScore = stats.highScores[game.id] || 0;
              const plays = stats.gamesPlayed[game.id] || 0;

              return (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => launchGame(game.id)}
                  className="group relative bg-stone-900/80 border border-stone-800 hover:border-purple-500/50 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-purple-900/20 transition-all cursor-pointer"
                >
                  {/* Subtle corner gradient glow */}
                  <div className={`absolute -right-10 -bottom-10 w-36 h-36 bg-gradient-to-tr ${game.accentGradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity`} />

                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.accentGradient} flex items-center justify-center text-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        {game.emoji}
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${game.badgeColor}`}>
                        {game.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-fuchsia-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {game.tagline}
                    </p>

                    {/* How to play bullets */}
                    <div className="mt-3.5 space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-white/5">
                      {game.instructions.map((inst, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-300">
                          <span className="text-fuchsia-400 font-bold">•</span>
                          <span>{inst}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Stats & Launch Button */}
                  <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Personal Best</div>
                      <div className="text-sm font-black text-amber-300">{bestScore} pts</div>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 group-hover:from-violet-500 group-hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-violet-950/50 flex items-center gap-1.5 active:scale-95 transition-all">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>PLAY</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Your Arcade Hall of Fame</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Your highest record scores achieved across all 6 mini-games!
              </p>
            </div>

            <div className="space-y-3">
              {GAMES_LIST.map((game, rank) => {
                const high = stats.highScores[game.id] || 0;
                const plays = stats.gamesPlayed[game.id] || 0;

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-950 border border-white/10 flex items-center justify-center text-xl">
                        {game.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{game.title}</div>
                        <div className="text-xs text-stone-400">{plays} total attempts played</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 uppercase font-bold">Record Score</div>
                        <div className="text-base font-black text-amber-300">{high} pts</div>
                      </div>

                      <button
                        onClick={() => launchGame(game.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95"
                      >
                        Beat Score
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
