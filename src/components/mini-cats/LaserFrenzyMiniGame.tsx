import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../services/soundEffects';
import { Trophy, Clock, Zap, RotateCcw, X, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TargetItem {
  id: string;
  type: 'yarn' | 'mouse' | 'moth' | 'gem';
  x: number;
  y: number;
  vx: number;
  vy: number;
  points: number;
  emoji: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onFinishGame: (score: number, silverEarned: number, goldEarned: number, xpEarned: number) => void;
  catName: string;
  breedEmoji: string;
}

export const LaserFrenzyMiniGame: React.FC<Props> = ({
  onClose,
  onFinishGame,
  catName,
  breedEmoji
}) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('pocket_paws_laser_high') || 0);
    } catch {
      return 0;
    }
  });

  const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [popParticles, setPopParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const arenaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<any>(null);

  // Start the 30-second game
  const startGame = () => {
    sounds.playTap();
    setScore(0);
    setCombo(1);
    setTimeLeft(30);
    setPopParticles([]);
    setGameState('playing');

    // Initial targets
    spawnInitialTargets();
  };

  const spawnInitialTargets = () => {
    const initial: TargetItem[] = [
      { id: '1', type: 'yarn', x: 25, y: 35, vx: 0.8, vy: 0.6, points: 15, emoji: '🧶', name: 'Yarn Ball' },
      { id: '2', type: 'mouse', x: 75, y: 55, vx: -1.2, vy: 0.8, points: 30, emoji: '🐭', name: 'Toy Mouse' },
      { id: '3', type: 'moth', x: 50, y: 25, vx: 1.4, vy: -1.1, points: 50, emoji: '🦋', name: 'Catnip Moth' }
    ];
    setTargets(initial);
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, score]);

  // Target physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setTargets(prev =>
        prev.map(t => {
          let nx = t.x + t.vx;
          let ny = t.y + t.vy;
          let nvx = t.vx;
          let nvy = t.vy;

          if (nx <= 8 || nx >= 92) {
            nvx = -nvx;
            nx = Math.max(8, Math.min(92, nx));
          }
          if (ny <= 15 || ny >= 85) {
            nvy = -nvy;
            ny = Math.max(15, Math.min(85, ny));
          }

          return { ...t, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  // Handle Laser Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current || gameState !== 'playing') return;
    const rect = arenaRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(12, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));
    setLaserPos({ x: xPct, y: yPct });
  };

  // Hit Target
  const handleHitTarget = (target: TargetItem) => {
    if (gameState !== 'playing') return;
    sounds.playTap();

    const addedPoints = target.points * combo;
    setScore(prev => prev + addedPoints);
    setCombo(prev => Math.min(4, prev + 1));

    // Spawn floating score pop
    const popId = Date.now() + Math.random();
    setPopParticles(prev => [
      ...prev,
      { id: popId, x: target.x, y: target.y, text: `+${addedPoints} pts!` }
    ]);
    setTimeout(() => {
      setPopParticles(prev => prev.filter(p => p.id !== popId));
    }, 900);

    // Respawn new random target
    const types: ('yarn' | 'mouse' | 'moth' | 'gem')[] = ['yarn', 'mouse', 'moth', 'gem'];
    const pick = types[Math.floor(Math.random() * types.length)];
    const pts = pick === 'gem' ? 80 : pick === 'moth' ? 50 : pick === 'mouse' ? 30 : 15;
    const emj = pick === 'gem' ? '💎' : pick === 'moth' ? '🦋' : pick === 'mouse' ? '🐭' : '🧶';

    setTargets(prev => [
      ...prev.filter(t => t.id !== target.id),
      {
        id: Date.now().toString(),
        type: pick,
        x: Math.floor(Math.random() * 70) + 15,
        y: Math.floor(Math.random() * 60) + 20,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        points: pts,
        emoji: emj,
        name: pick
      }
    ]);
  };

  // End Game
  const endGame = () => {
    setGameState('gameover');
    sounds.playVictory();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    // Rewards calculation
    const currentScore = score;
    const silverEarned = Math.max(20, Math.floor(currentScore / 4));
    const goldEarned = currentScore >= 200 ? 5 : currentScore >= 100 ? 2 : 1;
    const xpEarned = Math.max(30, Math.floor(currentScore / 3));

    if (currentScore > highScore) {
      setHighScore(currentScore);
      try {
        localStorage.setItem('pocket_paws_laser_high', currentScore.toString());
      } catch {}
    }

    onFinishGame(currentScore, silverEarned, goldEarned, xpEarned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-2xl bg-[#fffbeb] dark:bg-stone-900 border-3 border-[#b45309] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[700px] relative"
      >
        {/* Top Header */}
        <div className="px-5 py-3 bg-[#fef3c7] dark:bg-stone-800 border-b-2 border-[#b45309]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🔴</span>
            <div>
              <h2 className="text-base font-black text-[#78350f] dark:text-amber-300 flex items-center gap-2 leading-none">
                Laser Frenzy Arcade
              </h2>
              <p className="text-[11px] text-[#92400e] dark:text-stone-400 font-bold">
                Guide the laser & tap targets before time expires!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-stone-700 px-2.5 py-1 rounded-full border border-amber-300">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Best: {highScore}</span>
            </div>

            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-[#b45309]/30 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Stats HUD */}
        {gameState === 'playing' && (
          <div className="px-5 py-2 bg-[#fde68a] dark:bg-stone-800/80 border-b border-[#b45309]/20 flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-4">
              <span className="text-base font-black text-[#78350f] dark:text-amber-200">
                Score: {score}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                combo > 1 ? 'bg-rose-500 text-white animate-bounce' : 'bg-white/60 text-stone-700'
              }`}>
                <Flame className="w-3 h-3 fill-current" />
                {combo}x Combo
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-sm">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Playfield Canvas */}
        <div
          ref={arenaRef}
          onPointerMove={handlePointerMove}
          className="flex-1 relative bg-gradient-to-b from-[#fef08a]/30 via-[#fed7aa]/20 to-[#fde047]/30 dark:from-stone-950 dark:to-stone-900 overflow-hidden cursor-crosshair"
        >
          {/* Room Decor Rug */}
          <div className="absolute inset-8 rounded-3xl border-4 border-dashed border-[#b45309]/20 pointer-events-none flex items-center justify-center">
            <span className="text-8xl opacity-10 font-serif">🐾</span>
          </div>

          {/* READY SCREEN */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-black/20 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-3xl bg-white dark:bg-stone-800 border-3 border-[#b45309] shadow-2xl max-w-sm flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-stone-700 flex items-center justify-center text-4xl shadow-inner">
                  {breedEmoji}
                </div>
                <h3 className="text-xl font-black text-[#78350f] dark:text-amber-300">
                  Ready, {catName}?
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                  Tap or guide your laser pointer onto the moving yarn balls, mice, and moths to score big points!
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-base shadow-lg transition-transform"
                >
                  START FRENZY (30s)
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* ACTIVE GAMEPLAY */}
          {gameState === 'playing' && (
            <>
              {/* Laser Pointer Red Dot */}
              <div
                className="absolute w-6 h-6 rounded-full bg-rose-600 shadow-[0_0_20px_#f43f5e] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
              >
                <div className="w-full h-full rounded-full bg-white opacity-40 animate-ping" />
              </div>

              {/* Moving Targets */}
              {targets.map(target => (
                <motion.div
                  key={target.id}
                  onClick={() => handleHitTarget(target)}
                  onPointerDown={() => handleHitTarget(target)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 z-20 group"
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-stone-800/90 border-2 border-[#b45309] shadow-md flex items-center justify-center text-2xl hover:scale-125 transition-transform active:scale-90">
                    <span>{target.emoji}</span>
                  </div>
                </motion.div>
              ))}

              {/* Particle score pops */}
              {popParticles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -30, scale: 1.2 }}
                  transition={{ duration: 0.8 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 text-xs font-black text-rose-600 bg-white/95 px-2 py-0.5 rounded-full border border-rose-300 shadow"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  {p.text}
                </motion.div>
              ))}
            </>
          )}

          {/* GAME OVER RESULTS MODAL */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-40 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-800 border-3 border-[#b45309] shadow-2xl max-w-md w-full flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-4xl shadow-md text-white">
                  🏆
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#78350f] dark:text-amber-300">
                    Frenzy Complete!
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                    {catName} chased with maximum feline spirit!
                  </p>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-stone-700 border border-amber-200 text-center">
                    <span className="block text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                      Final Score
                    </span>
                    <span className="text-lg font-black text-[#78350f] dark:text-white">
                      {score}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-stone-700 border border-blue-200 text-center">
                    <span className="block text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">
                      Silver Fish
                    </span>
                    <span className="text-lg font-black text-blue-700 dark:text-blue-300">
                      +{Math.max(20, Math.floor(score / 4))} 🐟
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-stone-700 border border-emerald-200 text-center">
                    <span className="block text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                      Sanctuary XP
                    </span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      +{Math.max(30, Math.floor(score / 3))} ⭐
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startGame}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-black text-sm shadow-md"
                  >
                    Back to Yard
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
