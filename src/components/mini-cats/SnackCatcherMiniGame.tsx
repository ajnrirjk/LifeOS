import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../../services/soundEffects';
import { Trophy, Clock, X, ArrowLeft, ArrowRight, RotateCcw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingItem {
  id: string;
  type: 'salmon' | 'tuna' | 'catnip' | 'gold_fish' | 'water';
  x: number; // percentage (10 to 90)
  y: number; // percentage (0 to 100)
  speed: number;
  points: number;
  emoji: string;
}

interface Props {
  onClose: () => void;
  onFinishGame: (score: number, silverEarned: number, goldEarned: number, xpEarned: number) => void;
  catName: string;
  breedEmoji: string;
}

export const SnackCatcherMiniGame: React.FC<Props> = ({
  onClose,
  onFinishGame,
  catName,
  breedEmoji
}) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerX, setPlayerX] = useState(50); // percentage 10 to 90
  const [items, setItems] = useState<FallingItem[]>([]);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('pocket_paws_catcher_high') || 0);
    } catch {
      return 0;
    }
  });

  const arenaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<any>(null);
  const spawnTimerRef = useRef<any>(null);

  // Keyboard navigation (ArrowLeft & ArrowRight or A & D)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerX(prev => Math.max(12, prev - 10));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerX(prev => Math.min(88, prev + 10));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  // Start Game
  const startGame = () => {
    sounds.playTap();
    setScore(0);
    setCombo(1);
    setTimeLeft(30);
    setPlayerX(50);
    setItems([]);
    setGameState('playing');
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

  // Spawner loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    spawnTimerRef.current = setInterval(() => {
      const types: ('salmon' | 'tuna' | 'catnip' | 'gold_fish' | 'water')[] = [
        'salmon', 'tuna', 'salmon', 'tuna', 'catnip', 'water', 'water', 'gold_fish'
      ];
      const pick = types[Math.floor(Math.random() * types.length)];
      const pts = pick === 'gold_fish' ? 50 : pick === 'catnip' ? 25 : pick === 'tuna' ? 15 : pick === 'salmon' ? 10 : -10;
      const emj = pick === 'gold_fish' ? '🪙' : pick === 'catnip' ? '🌿' : pick === 'tuna' ? '🐟' : pick === 'salmon' ? '🍣' : '💧';

      const newItem: FallingItem = {
        id: Date.now().toString() + Math.random(),
        type: pick,
        x: Math.floor(Math.random() * 76) + 12,
        y: 0,
        speed: Math.random() * 1.5 + 2.5,
        points: pts,
        emoji: emj
      };

      setItems(prev => [...prev, newItem]);
    }, 650);

    return () => clearInterval(spawnTimerRef.current);
  }, [gameState]);

  // Falling & Collision Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setItems(prev => {
        const nextItems: FallingItem[] = [];

        for (const item of prev) {
          const nextY = item.y + item.speed;

          // Check Catch by Basket (basket is around y: 82 to 92, x: playerX +- 10)
          if (nextY >= 80 && nextY <= 92 && Math.abs(item.x - playerX) <= 10) {
            if (item.type === 'water') {
              sounds.playSlurp();
              setScore(s => Math.max(0, s - 10));
              setCombo(1);
            } else {
              sounds.playMunch();
              setScore(s => s + item.points * combo);
              setCombo(c => Math.min(5, c + 1));
            }
            continue; // Item consumed!
          }

          // Off screen bottom
          if (nextY < 100) {
            nextItems.push({ ...item, y: nextY });
          }
        }

        return nextItems;
      });
    }, 45);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, playerX, combo]);

  // Mouse / Touch Drag to Move Kitty Basket
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current || gameState !== 'playing') return;
    const rect = arenaRef.current.getBoundingClientRect();
    const xPct = Math.max(12, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
    setPlayerX(xPct);
  };

  // End Game
  const endGame = () => {
    setGameState('gameover');
    sounds.playVictory();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    const currentScore = score;
    const silverEarned = Math.max(20, Math.floor(currentScore / 4));
    const goldEarned = currentScore >= 200 ? 6 : currentScore >= 100 ? 3 : 1;
    const xpEarned = Math.max(35, Math.floor(currentScore / 3));

    if (currentScore > highScore) {
      setHighScore(currentScore);
      try {
        localStorage.setItem('pocket_paws_catcher_high', currentScore.toString());
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
            <span className="text-2xl animate-bounce">🧺</span>
            <div>
              <h2 className="text-base font-black text-[#78350f] dark:text-amber-300 flex items-center gap-2 leading-none">
                Snack Catcher Arcade
              </h2>
              <p className="text-[11px] text-[#92400e] dark:text-stone-400 font-bold">
                Catch delicious treats, avoid water drops!
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
                combo > 1 ? 'bg-orange-500 text-white animate-bounce' : 'bg-white/60 text-stone-700'
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
          className="flex-1 relative bg-gradient-to-b from-[#e0f2fe]/40 via-[#fef3c7]/30 to-[#fed7aa]/40 dark:from-stone-950 dark:to-stone-900 overflow-hidden cursor-ew-resize"
        >
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
                  Catch the Snacks!
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                  Use arrow keys or move your pointer to guide {catName} across the bottom to catch treats and dodge water drops!
                </p>

                <div className="flex items-center justify-center gap-3 text-xs font-bold text-stone-600 dark:text-stone-300 bg-amber-50 dark:bg-stone-700 p-2.5 rounded-2xl w-full">
                  <span>🍣 +10</span>
                  <span>🐟 +15</span>
                  <span>🌿 +25</span>
                  <span>🪙 +50</span>
                  <span className="text-blue-500">💧 -10</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-lg transition-transform"
                >
                  START CATCHING (30s)
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* ACTIVE GAMEPLAY */}
          {gameState === 'playing' && (
            <>
              {/* Falling Snacks */}
              {items.map(item => (
                <div
                  key={item.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl filter drop-shadow-md z-20 pointer-events-none"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  <span>{item.emoji}</span>
                </div>
              ))}

              {/* Player Kitty with Catch Basket */}
              <div
                className="absolute bottom-6 -translate-x-1/2 flex flex-col items-center z-30 transition-transform duration-75"
                style={{ left: `${playerX}%` }}
              >
                {/* Wicker Basket */}
                <div className="w-20 h-9 rounded-b-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-2 border-[#b45309] shadow-lg flex items-center justify-around px-2 text-xs">
                  <span>🧺</span>
                  <span className="text-[10px] font-black text-amber-100">BASKET</span>
                  <span>🧺</span>
                </div>

                {/* Kitty Face */}
                <div className="text-3xl -mt-2">
                  <span>{breedEmoji}</span>
                </div>
              </div>
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
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-md text-white">
                  🐟
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#78350f] dark:text-amber-300">
                    Snack Feast Finished!
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                    {catName} caught a mountainous pile of goodies!
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
                      +{Math.max(35, Math.floor(score / 3))} ⭐
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startGame}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Catch Again</span>
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

        {/* On-screen controls for mobile / touch */}
        {gameState === 'playing' && (
          <div className="p-3 bg-[#fef3c7] dark:bg-stone-800 border-t border-[#b45309]/30 flex items-center justify-between sm:hidden">
            <button
              onClick={() => setPlayerX(prev => Math.max(12, prev - 12))}
              className="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center gap-1 shadow active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Left
            </button>
            <span className="text-xs text-stone-500 font-bold">Drag or Tap Arrows</span>
            <button
              onClick={() => setPlayerX(prev => Math.min(88, prev + 12))}
              className="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center gap-1 shadow active:scale-95"
            >
              Right <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
