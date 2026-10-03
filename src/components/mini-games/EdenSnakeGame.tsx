import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface EdenSnakeGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

interface Point {
  x: number;
  y: number;
}

export const EdenSnakeGame: React.FC<EdenSnakeGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [applesEaten, setApplesEaten] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);

  const gridSize = 16;
  const tileCount = 20;

  const stateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ] as Point[],
    dir: { x: 0, y: -1 } as Point,
    nextDir: { x: 0, y: -1 } as Point,
    food: { x: 5, y: 5, type: 'apple' as 'apple' | 'scroll' | 'gem' },
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    score: 0,
    apples: 0,
    speed: 120, // ms per tick
    lastTick: 0,
    running: false
  });

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    let newX: number;
    let newY: number;
    let occupied = true;

    while (occupied) {
      newX = Math.floor(Math.random() * tileCount);
      newY = Math.floor(Math.random() * tileCount);
      occupied = s.snake.some(seg => seg.x === newX && seg.y === newY);
    }

    const rand = Math.random();
    const type: 'apple' | 'scroll' | 'gem' = rand > 0.8 ? 'scroll' : rand > 0.55 ? 'gem' : 'apple';
    s.food = { x: newX!, y: newY!, type };
  }, []);

  const startGame = () => {
    sounds.playTap();
    const s = stateRef.current;
    s.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    s.dir = { x: 0, y: -1 };
    s.nextDir = { x: 0, y: -1 };
    s.particles = [];
    s.score = 0;
    s.apples = 0;
    s.speed = 110;
    s.running = true;

    spawnFood();
    setScore(0);
    setApplesEaten(0);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    stateRef.current.running = false;
    setGameState('gameover');
    if (!soundMuted) sounds.playIncorrect();

    const finalScore = stateRef.current.score;
    const tokens = Math.floor(finalScore / 10) + 1;

    if (finalScore > currentHighScore) {
      setCurrentHighScore(finalScore);
      if (!soundMuted) sounds.playCelebration();
    }
    if (onGameOver) onGameOver(finalScore, tokens);
  }, [currentHighScore, onGameOver, soundMuted]);

  const changeDirection = useCallback((dx: number, dy: number) => {
    const s = stateRef.current;
    if (!s.running) return;
    // Disallow 180-degree immediate reversal
    if (s.dir.x + dx === 0 && s.dir.y + dy === 0) return;
    s.nextDir = { x: dx, y: dy };
  }, []);

  // Main game tick & render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const tileSize = width / tileCount;

      // Dark lush cyber-eden background
      ctx.fillStyle = '#06130b';
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, height);
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(width, i * tileSize);
        ctx.stroke();
      }

      if (s.running && time - s.lastTick > s.speed) {
        s.lastTick = time;
        s.dir = s.nextDir;

        // Head new position
        const head = s.snake[0];
        let nextX = head.x + s.dir.x;
        let nextY = head.y + s.dir.y;

        // Wrap around borders
        if (nextX < 0) nextX = tileCount - 1;
        if (nextX >= tileCount) nextX = 0;
        if (nextY < 0) nextY = tileCount - 1;
        if (nextY >= tileCount) nextY = 0;

        // Self-collision check
        const hitSelf = s.snake.some(seg => seg.x === nextX && seg.y === nextY);
        if (hitSelf) {
          endGame();
          return;
        }

        const newHead = { x: nextX, y: nextY };
        s.snake.unshift(newHead);

        // Check Food Eaten
        if (nextX === s.food.x && nextY === s.food.y) {
          const pts = s.food.type === 'scroll' ? 30 : s.food.type === 'gem' ? 20 : 10;
          s.score += pts;
          s.apples++;
          setScore(s.score);
          setApplesEaten(s.apples);
          if (!soundMuted) sounds.playCoinSound();

          // Speed up slightly as snake grows
          s.speed = Math.max(65, 110 - s.apples * 1.5);

          // Particles
          const pColor = s.food.type === 'scroll' ? '#38bdf8' : s.food.type === 'gem' ? '#f59e0b' : '#ef4444';
          for (let k = 0; k < 12; k++) {
            s.particles.push({
              x: (s.food.x + 0.5) * tileSize,
              y: (s.food.y + 0.5) * tileSize,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 1,
              color: pColor
            });
          }

          spawnFood();
        } else {
          s.snake.pop();
        }
      }

      // Render Food Item
      const fx = (s.food.x + 0.5) * tileSize;
      const fy = (s.food.y + 0.5) * tileSize;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.shadowColor = s.food.type === 'scroll' ? '#38bdf8' : s.food.type === 'gem' ? '#fbbf24' : '#ef4444';
      ctx.shadowBlur = 14;
      ctx.font = `${tileSize * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emoji = s.food.type === 'scroll' ? '📜' : s.food.type === 'gem' ? '💎' : '🍎';
      ctx.fillText(emoji, 0, 0);
      ctx.restore();

      // Render Snake Body
      s.snake.forEach((seg, idx) => {
        const sx = seg.x * tileSize + 1.5;
        const sy = seg.y * tileSize + 1.5;
        const segSize = tileSize - 3;

        ctx.save();
        if (idx === 0) {
          // Head (Glowing Emerald Dragon/Serpent)
          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(sx, sy, segSize, segSize, 6);
          ctx.fill();

          // Snake Eyes
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(sx + 3, sy + 3, 3, 3);
          ctx.fillRect(sx + segSize - 6, sy + 3, 3, 3);
        } else {
          // Gradient trailing body
          const progress = idx / s.snake.length;
          ctx.fillStyle = progress > 0.5 ? '#059669' : '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.roundRect(sx + progress, sy + progress, segSize - progress * 2, segSize - progress * 2, 4);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.04;
        if (pt.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 * pt.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [endGame, spawnFood, soundMuted]);

  // Touch swipe gestures
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 25) changeDirection(1, 0);
      else if (dx < -25) changeDirection(-1, 0);
    } else {
      if (dy > 25) changeDirection(0, 1);
      else if (dy < -25) changeDirection(0, -1);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); changeDirection(0, -1); }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); changeDirection(0, 1); }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); changeDirection(-1, 0); }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); changeDirection(1, 0); }
      if (e.code === 'Space' && (gameState === 'idle' || gameState === 'gameover')) startGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDirection]);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-lg mx-auto select-none">
      <div className="w-full flex items-center justify-between mb-3 text-stone-200">
        <button
          onClick={() => {
            sounds.playTap();
            if (onBack) onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Arcade Hub</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Best: {currentHighScore}</span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square max-h-[460px] rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-stone-950 touch-none"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="w-full h-full object-cover"
        />

        {gameState === 'playing' && (
          <div className="absolute top-3 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-lg shadow-lg">
              <span>{score}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-stone-950 font-black text-xs shadow-lg">
              <span>🍎 {applesEaten}</span>
            </div>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 mb-3 animate-pulse">
              🐍
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-emerald-200 via-white to-green-300 bg-clip-text text-transparent">
              Garden of Eden Cyber Snake
            </h2>
            <p className="text-xs text-emerald-200/80 max-w-xs mb-6">
              Swipe or use arrow keys/D-pad to steer. Eat golden apples, gems, and wisdom scrolls without crashing into your own tail!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>START SLITHERING</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-4xl mb-2">🍎</div>
            <h3 className="text-xl font-black text-white mb-1">Slither Finished</h3>
            <div className="bg-white/10 rounded-2xl p-4 w-full max-w-xs mb-4 border border-white/15">
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-xs text-stone-300">Score</span>
                <span className="text-lg font-black text-emerald-400">{score}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-xs text-stone-300">Items Eaten</span>
                <span className="text-sm font-black text-yellow-300">{applesEaten}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-stone-300">High Score</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile D-Pad */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-4">
        <div />
        <button
          onClick={() => changeDirection(0, -1)}
          className="p-3 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => changeDirection(-1, 0)}
          className="p-3 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => changeDirection(0, 1)}
          className="p-3 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <button
          onClick={() => changeDirection(1, 0)}
          className="p-3 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
