import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { useSettings } from '../../context/SettingsContext';
import { MiniGameId, MiniGameMeta, ArcadeStats } from './types';
import { PilgrimGoGame } from './PilgrimGoGame';
import { FlappyDoveGame } from './FlappyDoveGame';
import { BabelStackerGame } from './BabelStackerGame';
import { DemonBusterGame } from './DemonBusterGame';
import { EdenSnakeGame } from './EdenSnakeGame';
import { ScriptureMatrixGame } from './ScriptureMatrixGame';
import { SlingshotTargetGame } from './SlingshotTargetGame';
import { SamsonSmashGame } from './SamsonSmashGame';
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
  Star,
  Gift,
  ShoppingBag,
  Check,
  RotateCcw,
  User,
  Medal,
  Coins,
  Lock,
  ArrowLeft
} from 'lucide-react';

const GAMES_LIST: MiniGameMeta[] = [
  {
    id: 'pilgrim_go',
    title: "Pilgrim's Journey (Bible Roguelike)",
    tagline: 'Capybara-Go style auto-walking RPG: biblical events, 3-skill choices, gear & companions',
    emoji: '🚶‍♂️',
    genre: 'Auto-Battler RPG',
    difficulty: 'Medium',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentGradient: 'from-amber-500 via-orange-500 to-yellow-500',
    instructions: ['Auto-walk day by day through Judea & Galilee', 'Battle monsters & defeat bosses for 3 Holy Blessings', 'Equip weapons, armor & faithful animal companions']
  },
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
  },
  {
    id: 'samson_smash',
    title: "Samson's Pillar Smash",
    tagline: 'Rhythmic precision power meter to topple pagan temple columns & release divine fury',
    emoji: '🏛️',
    genre: 'Rhythm / Timing',
    difficulty: 'Challenging',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentGradient: 'from-amber-500 via-orange-600 to-red-600',
    instructions: ['Tap or press Spacebar when needle hits golden center', 'Shatter pillars before the collapse timer runs out', 'Fill Spirit of God meter for devastating 3x crit fury']
  }
];

const INITIAL_STATS: ArcadeStats = {
  totalTokens: 100,
  highScores: {
    pilgrim_go: 0,
    flappy_dove: 0,
    babel_stack: 0,
    demon_buster: 0,
    eden_snake: 0,
    scripture_matrix: 0,
    slingshot_target: 0,
    samson_smash: 0
  },
  gamesPlayed: {
    pilgrim_go: 0,
    flappy_dove: 0,
    babel_stack: 0,
    demon_buster: 0,
    eden_snake: 0,
    scripture_matrix: 0,
    slingshot_target: 0,
    samson_smash: 0
  },
  unlockedSkins: ['classic'],
  activeSkin: 'classic'
};

// Pre-seeded Fellowship Champions for realistic, competitive hall of fame leaderboards
const FELLOWSHIP_CHAMPIONS: Record<MiniGameId, Array<{ name: string; score: number; date: string; badge: string }>> = {
  pilgrim_go: [
    { name: 'David_The_Slayer', score: 4850, date: 'Today', badge: '🏆 Legend' },
    { name: 'Gideon_300', score: 3920, date: 'Yesterday', badge: '⚔️ Veteran' },
    { name: 'Joshua_Jericho', score: 2840, date: '2 days ago', badge: '🛡️ Guardian' },
    { name: 'Caleb_Faithful', score: 1950, date: '3 days ago', badge: '🚶‍♂️ Explorer' },
  ],
  flappy_dove: [
    { name: 'Noah_Ark_Dove', score: 142, date: 'Today', badge: '🕊️ Sky Master' },
    { name: 'Elijah_Chariot', score: 98, date: 'Yesterday', badge: '⚡ High Flyer' },
    { name: 'Peter_Rock', score: 76, date: '2 days ago', badge: '🌿 Pilgrim' },
    { name: 'FaithSeeker_88', score: 48, date: '3 days ago', badge: '✨ Novice' },
  ],
  babel_stack: [
    { name: 'Solomon_Architect', score: 68, date: 'Today', badge: '🏛️ Master Builder' },
    { name: 'Nehemiah_Wall', score: 54, date: 'Yesterday', badge: '🧱 Perfect Stacker' },
    { name: 'Bezalel_Artisan', score: 41, date: '2 days ago', badge: '📐 Crafter' },
    { name: 'Hiram_Tyre', score: 32, date: '3 days ago', badge: '🔨 Mason' },
  ],
  demon_buster: [
    { name: 'Michael_Archangel', score: 1240, date: 'Today', badge: '⚔️ Divine General' },
    { name: 'ArmorOfGod_Warrior', score: 980, date: 'Yesterday', badge: '🛡️ Shield Hero' },
    { name: 'Paul_Ephesus', score: 750, date: '2 days ago', badge: '⚡ Laser Ace' },
    { name: 'GraceDefender_7', score: 520, date: '3 days ago', badge: '✨ Scout' },
  ],
  eden_snake: [
    { name: 'Eden_Keeper', score: 460, date: 'Today', badge: '🐍 Cyber Serpent' },
    { name: 'Adam_Tender', score: 350, date: 'Yesterday', badge: '🍎 Scroll Hunter' },
    { name: 'Abel_Shepherd', score: 270, date: '2 days ago', badge: '🌿 Swift Runner' },
    { name: 'Seth_Righteous', score: 190, date: '3 days ago', badge: '🌱 Crawler' },
  ],
  slingshot_target: [
    { name: 'David_Goliath_Slayer', score: 890, date: 'Today', badge: '🎯 Brook Master' },
    { name: 'Jonathan_Archer', score: 720, date: 'Yesterday', badge: '🏹 Marksman' },
    { name: 'Benjamite_Sling', score: 580, date: '2 days ago', badge: '🪨 Stone Thrower' },
    { name: 'ShepherdBoy_1', score: 410, date: '3 days ago', badge: '🎯 Striker' },
  ],
  scripture_matrix: [
    { name: 'Ezra_Scribe', score: 38, date: 'Today', badge: '🧠 Memory Master' },
    { name: 'Timothy_Disciple', score: 29, date: 'Yesterday', badge: '📖 Scripture Sage' },
    { name: 'Luke_Physician', score: 22, date: '2 days ago', badge: '🕊️ Melodic Scholar' },
    { name: 'Priscilla_Teacher', score: 16, date: '3 days ago', badge: '💡 Student' },
  ],
  samson_smash: [
    { name: 'Samson_Nazarite', score: 9800, date: 'Today', badge: '🦁 Mighty Judge' },
    { name: 'Manoah_Son', score: 7400, date: 'Yesterday', badge: '🏛️ Pillar Breaker' },
    { name: 'Gaza_Gate_Lifter', score: 5200, date: '2 days ago', badge: '⚡ Colossus' },
    { name: 'Danite_Hero', score: 3600, date: '3 days ago', badge: '💥 Smasher' },
  ]
};

// Arcade Token Shop Catalog
const SHOP_ITEMS = [
  { id: 'skin_cyber', name: 'Cyber Neon Glow', type: 'theme', cost: 150, emoji: '⚡', desc: 'Futuristic glowing neon aesthetic for arcade games' },
  { id: 'skin_gold', name: 'Golden Sanctuary', type: 'theme', cost: 250, emoji: '✨', desc: 'Radiant gold-tinted temple borders and particle effects' },
  { id: 'skin_celestial', name: 'Celestial Twilight', type: 'theme', cost: 350, emoji: '🌌', desc: 'Deep cosmic starfields and ethereal purple aurora' },
  { id: 'title_champion', name: 'Faith Champion Tag', type: 'title', cost: 100, emoji: '👑', desc: 'Gold crown badge displayed next to your gamer tag' },
  { id: 'title_overcomer', name: 'More Than Conqueror', type: 'title', cost: 200, emoji: '🛡️', desc: 'Romans 8:37 conqueror banner in the Hall of Fame' },
];

export const ArcadeVaultApp: React.FC = () => {
  const { settings, isAuthorizedAdmin } = useSettings();
  const [activeGame, setActiveGame] = useState<MiniGameId | null>(null);
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'trophies'>('games');
  const [soundMuted, setSoundMuted] = useState(false);
  const [showGodModeModal, setShowGodModeModal] = useState(false);
  const [selectedLeaderboardGame, setSelectedLeaderboardGame] = useState<MiniGameId>('pilgrim_go');
  const [claimedDailyToday, setClaimedDailyToday] = useState<boolean>(() => {
    try {
      const last = localStorage.getItem('lifeos_arcade_last_daily');
      if (!last) return false;
      const today = new Date().toDateString();
      return last === today;
    } catch {
      return false;
    }
  });

  const [customTag, setCustomTag] = useState<string>(() => {
    try {
      return localStorage.getItem('lifeos_arcade_tag') || settings.profile.name || 'FaithChampion_7';
    } catch {
      return 'FaithChampion_7';
    }
  });

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

  // Sync external God Mode token/skin grants instantly
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('lifeos_arcade_stats_v1');
        if (saved) setStats(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('lifeos_arcade_stats_updated', handleUpdate);
    return () => window.removeEventListener('lifeos_arcade_stats_updated', handleUpdate);
  }, []);

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

  const handleClaimDailyTokens = () => {
    if (claimedDailyToday) return;
    sounds.playCelebration();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const today = new Date().toDateString();
    try {
      localStorage.setItem('lifeos_arcade_last_daily', today);
    } catch {}
    setClaimedDailyToday(true);

    setStats((prev) => ({
      ...prev,
      totalTokens: prev.totalTokens + 100
    }));
  };

  const handleGodGrantTokens = (amount: number = 10000) => {
    sounds.playVictory();
    confetti({ particleCount: 60, spread: 70 });
    setStats(prev => ({
      ...prev,
      totalTokens: prev.totalTokens + amount
    }));
  };

  const handleGodUnlockAll = () => {
    sounds.playVictory();
    confetti({ particleCount: 80, spread: 80 });
    setStats(prev => ({
      ...prev,
      unlockedSkins: SHOP_ITEMS.map(i => i.id).concat(['classic'])
    }));
  };

  const handleGodSetMaxScores = () => {
    sounds.playVictory();
    setStats(prev => ({
      ...prev,
      highScores: {
        pilgrim_go: 9999,
        flappy_dove: 999,
        babel_stack: 999,
        demon_buster: 9999,
        eden_snake: 9999,
        scripture_matrix: 999,
        slingshot_target: 9999,
        samson_smash: 9999
      }
    }));
  };

  const handleGodResetScores = () => {
    sounds.playTap();
    setStats(prev => ({
      ...prev,
      highScores: {
        pilgrim_go: 0,
        flappy_dove: 0,
        babel_stack: 0,
        demon_buster: 0,
        eden_snake: 0,
        scripture_matrix: 0,
        slingshot_target: 0,
        samson_smash: 0
      }
    }));
  };

  const handleBuyShopItem = (item: typeof SHOP_ITEMS[0]) => {
    if (stats.unlockedSkins.includes(item.id)) {
      // Toggle active skin
      sounds.playTap();
      setStats((prev) => ({
        ...prev,
        activeSkin: prev.activeSkin === item.id ? 'classic' : item.id
      }));
      return;
    }

    if (stats.totalTokens < item.cost) {
      sounds.playIncorrect();
      return;
    }

    sounds.playCorrect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setStats((prev) => ({
      ...prev,
      totalTokens: prev.totalTokens - item.cost,
      unlockedSkins: [...prev.unlockedSkins, item.id],
      activeSkin: item.id
    }));
  };

  // Compile Leaderboard for currently selected mini game
  const currentLeaderboard = useMemo(() => {
    const list = [...(FELLOWSHIP_CHAMPIONS[selectedLeaderboardGame] || [])];
    const userBest = stats.highScores[selectedLeaderboardGame] || 0;

    const userEntry = {
      name: `${customTag} (You)`,
      score: userBest,
      date: userBest > 0 ? 'Your Best' : 'Unplayed',
      badge: userBest > 0 ? '🌟 Player' : '🌱 New',
      isUser: true
    };

    list.push(userEntry);
    list.sort((a, b) => b.score - a.score);

    return list.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  }, [selectedLeaderboardGame, stats.highScores, customTag]);

  // If a specific mini game is launched, render its game screen
  if (activeGame) {
    return (
      <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-stone-950 text-white flex flex-col justify-start items-center py-2 px-1 sm:px-4">
        {activeGame === 'pilgrim_go' && (
          <PilgrimGoGame
            highScore={stats.highScores.pilgrim_go || 0}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('pilgrim_go', sc, tk)}
          />
        )}
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
        {activeGame === 'samson_smash' && (
          <SamsonSmashGame
            highScore={stats.highScores.samson_smash || 0}
            onBack={() => setActiveGame(null)}
            onGameOver={(sc, tk) => handleGameOver('samson_smash', sc, tk)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden bg-stone-950 text-white select-none">
      {/* Hero Header */}
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-b from-purple-950/80 via-stone-900 to-stone-950 px-4 sm:px-8 pt-5 pb-5 border-b border-purple-900/30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> LifeOS Arcade Vault
              </span>
              <span className="text-xs text-stone-400">{GAMES_LIST.length} Retro Games Available</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🕹️</span>
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
                Retro Mini-Games Arcade
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Play fast-paced retro games with authentic physics, synthesized audio, community leaderboards, and token rewards!
            </p>
          </div>

          {/* Arcade Token & Stats Badge */}
          <div className="flex items-center gap-2.5 bg-stone-900/90 border border-white/10 rounded-2xl p-2 sm:p-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <span className="text-base sm:text-lg">🪙</span>
              <div>
                <div className="text-[10px] font-bold text-amber-400/80 uppercase leading-none">Arcade Tokens</div>
                <div className="text-xs sm:text-sm font-black text-amber-300 leading-none mt-0.5">{stats.totalTokens}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <div>
                <div className="text-[10px] font-bold text-purple-400/80 uppercase leading-none">Total Plays</div>
                <div className="text-xs sm:text-sm font-black text-purple-300 leading-none mt-0.5">
                  {Object.values(stats.gamesPlayed).reduce((a, b) => a + b, 0)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSoundMuted(!soundMuted);
                sounds.setEnabled(soundMuted);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {isAuthorizedAdmin && (
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowGodModeModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition-all"
                title="Arcade God Mode (aw03102008@gmail.com)"
              >
                <span>👑</span>
                <span className="hidden sm:inline">God Mode</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Navigation Tabs Bar */}
      <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-2.5 shadow-2xl shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('games');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50'
                  : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Fellowship Leaderboard</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setActiveTab('trophies');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === 'trophies'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50'
                  : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Token Shop & Rewards</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-bold uppercase">Balance:</span>
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
              🪙 {stats.totalTokens} Tokens
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 pb-36 flex-1">
        {/* 1. ALL GAMES TAB */}
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
                  <div className={`absolute -right-10 -bottom-10 w-36 h-36 bg-gradient-to-tr ${game.accentGradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity`} />

                  <div>
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

                    <div className="mt-3.5 space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-white/5">
                      {game.instructions.map((inst, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-300">
                          <span className="text-fuchsia-400 font-bold">•</span>
                          <span>{inst}</span>
                        </div>
                      ))}
                    </div>
                  </div>

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

        {/* 2. LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/70 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Fellowship Hall of Fame</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Compete against top believers across the globe to claim the #1 record!
                </p>
              </div>

              {/* Tag Editor */}
              <div className="flex items-center gap-2 bg-stone-950/80 px-3 py-1.5 rounded-2xl border border-white/10">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[10px] text-stone-400 uppercase font-bold">Your Tag:</span>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 18);
                    setCustomTag(val);
                    try { localStorage.setItem('lifeos_arcade_tag', val); } catch {}
                  }}
                  className="bg-transparent text-xs font-black text-amber-300 w-28 outline-none border-b border-transparent focus:border-amber-400"
                />
              </div>
            </div>

            {/* Game Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {GAMES_LIST.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedLeaderboardGame(g.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedLeaderboardGame === g.id
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                      : 'bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Leaderboard Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3.5 bg-stone-950/80 border-b border-white/10 flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <span className="w-8">Rank</span>
                  <span>Champion Name</span>
                </div>
                <span>High Score</span>
              </div>

              <div className="divide-y divide-white/5">
                {currentLeaderboard.map((entry) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <motion.div
                      key={`${entry.name}-${entry.rank}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                        (entry as any).isUser
                          ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border-l-4 border-amber-400'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex items-center justify-center font-black text-sm">
                          {isTop1 ? (
                            <span className="text-xl">🥇</span>
                          ) : isTop2 ? (
                            <span className="text-xl">🥈</span>
                          ) : isTop3 ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="text-stone-400 font-bold">#{entry.rank}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${(entry as any).isUser ? 'text-amber-300' : 'text-white'}`}>
                              {entry.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-stone-300 border border-white/10">
                              {entry.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500">{entry.date}</div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div className="text-base font-black text-amber-300">
                          {entry.score.toLocaleString()} <span className="text-xs text-stone-400 font-normal">pts</span>
                        </div>

                        <button
                          onClick={() => launchGame(selectedLeaderboardGame)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95"
                        >
                          Play
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. TOKEN SHOP & REWARDS TAB */}
        {activeTab === 'trophies' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Daily Manna Token Reward Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-950/50 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                  🎁
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Daily Arcade Manna Reward</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase">
                      +100 Tokens
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Claim your daily free tokens to unlock exclusive retro themes and custom titles!
                  </p>
                </div>
              </div>

              <button
                disabled={claimedDailyToday}
                onClick={handleClaimDailyTokens}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                  claimedDailyToday
                    ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 hover:brightness-110 shadow-amber-900/50'
                }`}
              >
                {claimedDailyToday ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Claimed Today</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Claim +100 Tokens</span>
                  </>
                )}
              </button>
            </div>

            {/* Shop Catalog */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <span>Arcade Customizations Catalog</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SHOP_ITEMS.map((item) => {
                  const isUnlocked = stats.unlockedSkins.includes(item.id);
                  const isActive = stats.activeSkin === item.id;
                  const canAfford = stats.totalTokens >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-400/60 shadow-lg shadow-purple-900/30'
                          : isUnlocked
                          ? 'bg-stone-900/80 border-stone-700 hover:border-purple-500/40'
                          : 'bg-stone-900/60 border-stone-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                            {item.emoji}
                          </div>
                          {isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                              Active
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-stone-700 text-stone-300 text-[10px] font-bold uppercase">
                              Owned
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-black text-amber-300">
                              <span>🪙</span>
                              <span>{item.cost}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="font-black text-sm text-white">{item.name}</h4>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end">
                        <button
                          onClick={() => handleBuyShopItem(item)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                            isActive
                              ? 'bg-purple-600 text-white'
                              : isUnlocked
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-black'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'Applied' : isUnlocked ? 'Equip' : canAfford ? 'Unlock' : 'Need Tokens'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exclusive Master Admin Arcade God Mode Modal */}
      {showGodModeModal && isAuthorizedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">Arcade God Mode</h3>
                  <p className="text-[10px] text-stone-400">Exclusive controls for aw03102008@gmail.com</p>
                </div>
              </div>
              <button
                onClick={() => setShowGodModeModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleGodGrantTokens(10000)}
                className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-black text-xs flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Coins className="w-5 h-5 text-amber-400" />
                <span>+10,000 Tokens</span>
              </button>

              <button
                onClick={handleGodUnlockAll}
                className="p-3.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-black text-xs flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Unlock All Skins</span>
              </button>

              <button
                onClick={handleGodSetMaxScores}
                className="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-black text-xs flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Set Max 9,999 Scores</span>
              </button>

              <button
                onClick={handleGodResetScores}
                className="p-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-white/10 text-stone-300 font-black text-xs flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <RotateCcw className="w-5 h-5 text-stone-400" />
                <span>Reset Scores to 0</span>
              </button>
            </div>

            <button
              onClick={() => setShowGodModeModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              Close God Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
