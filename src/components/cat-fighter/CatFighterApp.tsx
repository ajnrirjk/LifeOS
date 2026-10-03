import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FighterId, GameMode, AiDifficulty, KeyBindings, MobileControlsConfig } from './types';
import { FIGHTERS, STAGES, DEFAULT_P1_KEYS, DEFAULT_P2_KEYS } from './CatFighterRoster';
import { CatFighterGameCanvas } from './CatFighterGameCanvas';
import { CatFighterControlsModal } from './CatFighterControlsModal';
import { sounds } from '../../services/soundEffects';
import {
  Swords,
  Trophy,
  Users,
  Dumbbell,
  Sliders,
  Sparkles,
  Zap,
  Flame,
  Award,
  Play,
  RotateCcw,
  ArrowRight,
  Shield,
  Volume2,
  VolumeX
} from 'lucide-react';

export const CatFighterApp: React.FC = () => {
  const [screen, setScreen] = useState<'title' | 'select' | 'battle' | 'victory_ladder'>('title');
  const [mode, setMode] = useState<GameMode>('arcade');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium');

  const [p1Fighter, setP1Fighter] = useState<FighterId>('ryu_paw');
  const [p2Fighter, setP2Fighter] = useState<FighterId>('chun_meow');
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [ladderStageIndex, setLadderStageIndex] = useState<number>(0);

  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);

  // Custom Controls State with localStorage persistence
  const [p1Keys, setP1Keys] = useState<KeyBindings>(() => {
    try {
      const saved = localStorage.getItem('cat_fighter_p1_keys');
      return saved ? JSON.parse(saved) : DEFAULT_P1_KEYS;
    } catch {
      return DEFAULT_P1_KEYS;
    }
  });

  const [p2Keys, setP2Keys] = useState<KeyBindings>(() => {
    try {
      const saved = localStorage.getItem('cat_fighter_p2_keys');
      return saved ? JSON.parse(saved) : DEFAULT_P2_KEYS;
    } catch {
      return DEFAULT_P2_KEYS;
    }
  });

  const [mobileConfig, setMobileConfig] = useState<MobileControlsConfig>(() => {
    try {
      const saved = localStorage.getItem('cat_fighter_mobile_cfg');
      return saved ? JSON.parse(saved) : { buttonScale: 1.0, opacity: 0.85, layout: 'standard', haptics: true };
    } catch {
      return { buttonScale: 1.0, opacity: 0.85, layout: 'standard', haptics: true };
    }
  });

  const handleStartBattle = () => {
    sounds.playLevelComplete();
    setScreen('battle');
  };

  const handleMatchEnd = (winner: 'p1' | 'p2') => {
    if (mode === 'arcade' && winner === 'p1') {
      if (ladderStageIndex < 4) {
        setLadderStageIndex(ladderStageIndex + 1);
        const nextOpponents: FighterId[] = ['chun_meow', 'guile_claw', 'blanka_cat', 'akuma_cat'];
        setP2Fighter(nextOpponents[ladderStageIndex % nextOpponents.length]);
        setSelectedStage((selectedStage + 1) % STAGES.length);
        setScreen('victory_ladder');
      } else {
        setScreen('victory_ladder');
      }
    }
  };

  const fightersList = Object.values(FIGHTERS);
  const selectedP1Meta = FIGHTERS[p1Fighter];
  const selectedP2Meta = FIGHTERS[p2Fighter];

  return (
    <div className="min-h-full bg-stone-950 text-white flex flex-col justify-start items-center py-2 px-1 sm:px-4 overflow-x-hidden w-full font-sans select-none">
      {/* 1. TITLE / ARCADE HOME SCREEN */}
      {screen === 'title' && (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-6 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-black tracking-wider uppercase mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" /> 16-Bit Retro Arcade
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-[0_4px_15px_rgba(239,68,68,0.5)] mb-2">
            STREET MEOW-TER
          </h1>
          <div className="text-base sm:text-xl font-black tracking-widest text-amber-200 uppercase mb-6 flex items-center gap-2">
            <span>🥋</span> FELINE FIGHTER TURBO ALPHA <span>🥊</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8">
            <button
              onClick={() => {
                sounds.playTap();
                setMode('arcade');
                setLadderStageIndex(0);
                setP2Fighter('chun_meow');
                setScreen('select');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-amber-500/20 to-orange-600/20 border-2 border-amber-500/40 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all shadow-xl group"
            >
              <Trophy className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm text-white">ARCADE LADDER</span>
              <span className="text-[10px] text-amber-200/70">5 Tournament Stages</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setMode('versus_cpu');
                setScreen('select');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-blue-500/20 to-indigo-600/20 border-2 border-blue-500/40 hover:border-blue-400 hover:scale-105 active:scale-95 transition-all shadow-xl group"
            >
              <Swords className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm text-white">VERSUS CPU</span>
              <span className="text-[10px] text-blue-200/70">Custom Match & Stage</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setMode('versus_2p');
                setScreen('select');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-purple-500/20 to-pink-600/20 border-2 border-purple-500/40 hover:border-purple-400 hover:scale-105 active:scale-95 transition-all shadow-xl group"
            >
              <Users className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm text-white">2-PLAYER BRAWL</span>
              <span className="text-[10px] text-purple-200/70">Same Keyboard / Touch</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setMode('training');
                setScreen('select');
              }}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/40 hover:border-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-xl group"
            >
              <Dumbbell className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm text-white">TRAINING DOJO</span>
              <span className="text-[10px] text-emerald-200/70">Practice Move Combos</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playTap();
                setIsControlsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Configure Custom Controls</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. CHARACTER SELECT SCREEN (90s Capcom Arcade Grid) */}
      {screen === 'select' && (
        <div className="w-full max-w-4xl mx-auto flex flex-col py-3 px-2 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                sounds.playTap();
                setScreen('title');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
            >
              ← Back to Title
            </button>

            <div className="font-black text-sm sm:text-base text-amber-300 tracking-wider uppercase">
              SELECT YOUR FIGHTER
            </div>

            <button
              onClick={() => setIsControlsModalOpen(true)}
              className="p-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Controls</span>
            </button>
          </div>

          {/* Fighter Select Grid & Previews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
            {/* Player 1 Card */}
            <div className="bg-stone-900 border-2 border-amber-500/50 rounded-3xl p-4 flex flex-col items-center text-center shadow-xl">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase mb-2">
                PLAYER 1 (YOU)
              </span>
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${selectedP1Meta.avatarGradient} flex items-center justify-center text-5xl shadow-2xl mb-2 border-2 border-white/30`}>
                {selectedP1Meta.emoji}
              </div>
              <h3 className="text-xl font-black text-white">{selectedP1Meta.name}</h3>
              <p className="text-xs text-amber-300 font-bold mb-3">{selectedP1Meta.subtitle}</p>

              <div className="w-full space-y-1.5 text-xs text-left bg-stone-950 p-2.5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-stone-300">
                  <span>Special Move:</span>
                  <span className="font-black text-cyan-400">{selectedP1Meta.specialMove.name}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Super Art:</span>
                  <span className="font-black text-yellow-400">{selectedP1Meta.superArt.name}</span>
                </div>
              </div>
            </div>

            {/* Central Grid Roster */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-2 p-3 bg-stone-900/80 border border-white/10 rounded-3xl">
                {fightersList.map((f) => {
                  const isSelectedP1 = p1Fighter === f.id;
                  const isSelectedP2 = p2Fighter === f.id;

                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        sounds.playTap();
                        setP1Fighter(f.id);
                      }}
                      className={`relative w-20 h-20 rounded-2xl bg-gradient-to-tr ${f.avatarGradient} flex flex-col items-center justify-center text-3xl border-2 transition-all hover:scale-105 active:scale-95 ${
                        isSelectedP1
                          ? 'border-amber-400 ring-4 ring-amber-400/50 scale-105'
                          : 'border-white/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>{f.emoji}</span>
                      <span className="text-[9px] font-black text-white mt-1 leading-none">{f.name}</span>
                      {isSelectedP1 && (
                        <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[9px]">
                          1P
                        </span>
                      )}
                      {isSelectedP2 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-blue-500 text-white font-black text-[9px]">
                          2P
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stage Select Carousel */}
              <div className="mt-4 flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-2xl border border-white/10">
                <span className="text-xs text-stone-400">Stage:</span>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedStage((selectedStage + 1) % STAGES.length);
                  }}
                  className="text-xs font-black text-amber-300 hover:text-white"
                >
                  {STAGES[selectedStage].name} ➔
                </button>
              </div>
            </div>

            {/* Player 2 / Opponent Card */}
            <div className="bg-stone-900 border-2 border-blue-500/50 rounded-3xl p-4 flex flex-col items-center text-center shadow-xl">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase mb-2">
                {mode === 'versus_2p' ? 'PLAYER 2' : 'OPPONENT CPU'}
              </span>
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${selectedP2Meta.avatarGradient} flex items-center justify-center text-5xl shadow-2xl mb-2 border-2 border-white/30`}>
                {selectedP2Meta.emoji}
              </div>
              <h3 className="text-xl font-black text-white">{selectedP2Meta.name}</h3>
              <p className="text-xs text-blue-300 font-bold mb-3">{selectedP2Meta.subtitle}</p>

              {mode === 'versus_2p' ? (
                <div className="flex gap-1.5">
                  {fightersList.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setP2Fighter(f.id)}
                      className={`p-1.5 rounded-xl border text-sm ${p2Fighter === f.id ? 'border-blue-400 bg-blue-500/20' : 'border-white/10'}`}
                    >
                      {f.emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-stone-400">CPU Difficulty:</span>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as AiDifficulty)}
                    className="bg-transparent text-amber-300 font-black cursor-pointer outline-none"
                  >
                    <option value="easy" className="bg-stone-900">Novice Kitty</option>
                    <option value="medium" className="bg-stone-900">Street Brawler</option>
                    <option value="hard" className="bg-stone-900">Black Belt Master</option>
                    <option value="turbo" className="bg-stone-900">Turbo God</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Big Start Battle Button */}
          <button
            onClick={handleStartBattle}
            className="w-full max-w-md mx-auto py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-stone-950 font-black text-base shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>COMMENCE THE BATTLE ➔</span>
          </button>
        </div>
      )}

      {/* 3. ACTIVE FIGHTING BATTLE ENGINE SCREEN */}
      {screen === 'battle' && (
        <CatFighterGameCanvas
          p1FighterId={p1Fighter}
          p2FighterId={p2Fighter}
          isTwoPlayer={mode === 'versus_2p'}
          difficulty={difficulty}
          stageIndex={selectedStage}
          p1Keys={p1Keys}
          p2Keys={p2Keys}
          mobileConfig={mobileConfig}
          onOpenControls={() => setIsControlsModalOpen(true)}
          onBack={() => setScreen('select')}
          onMatchEnd={handleMatchEnd}
        />
      )}

      {/* 4. TOURNAMENT LADDER VICTORY SCREEN */}
      {screen === 'victory_ladder' && (
        <div className="w-full max-w-md mx-auto py-8 px-4 flex flex-col items-center text-center">
          <div className="text-5xl mb-3 animate-bounce">🏆</div>
          <h2 className="text-3xl font-black text-amber-300 mb-1">STAGE CLEARED!</h2>
          <p className="text-xs text-stone-300 mb-6">You advanced through the Feline Championship Ladder!</p>

          <button
            onClick={() => setScreen('battle')}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-sm shadow-xl active:scale-95 transition-all"
          >
            NEXT TOURNAMENT MATCH ➔
          </button>
        </div>
      )}

      {/* Custom Controls Modal */}
      <CatFighterControlsModal
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
        p1Keys={p1Keys}
        setP1Keys={(keys) => {
          setP1Keys(keys);
          localStorage.setItem('cat_fighter_p1_keys', JSON.stringify(keys));
        }}
        p2Keys={p2Keys}
        setP2Keys={(keys) => {
          setP2Keys(keys);
          localStorage.setItem('cat_fighter_p2_keys', JSON.stringify(keys));
        }}
        mobileConfig={mobileConfig}
        setMobileConfig={(cfg) => {
          setMobileConfig(cfg);
          localStorage.setItem('cat_fighter_mobile_cfg', JSON.stringify(cfg));
        }}
      />
    </div>
  );
};
