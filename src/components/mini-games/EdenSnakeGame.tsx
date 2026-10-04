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

  const tileCountX = 20;
  const tileCountY = 20;

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
    speed: 105,
    lastTick: 0,
    running: false
  });

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    let newX: number;
    let newY: number;
    let occupied = true;

    while (occupied) {
      newX = Math.floor(Math.random() * tileCountX);
      newY = Math.floor(Math.random() * tileCountY);
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
      { x: 18, y: 9 },
      { x: 18, y: 10 },
      { x: 18, y: 11 }
    ];
    s.dir = { x: 0, y: -1 };
    s.nextDir = { x: 0, y: -1 };
    s.particles = [];
    s.score = 0;
    s.apples = 0;
    s.speed = 105;
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
    if (s.dir.x + dx === 0 && s.dir.y + dy === 0) return;
    s.nextDir = { x: dx, y: dy };
  }, []);

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
      const tileSizeX = width / tileCountX;
      const tileSizeY = height / tileCountY;

      ctx.fillStyle = '#06130b';
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= tileCountX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSizeX, 0);
        ctx.lineTo(i * tileSizeX, height);
        ctx.stroke();
      }
      for (let j = 0; j <= tileCountY; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * tileSizeY);
        ctx.lineTo(width, j * tileSizeY);
        ctx.stroke();
      }

      if (s.running && time - s.lastTick > s.speed) {
        s.lastTick = time;
        s.dir = s.nextDir;

        const head = s.snake[0];
        let nextX = head.x + s.dir.x;
        let nextY = head.y + s.dir.y;

        if (nextX < 0) nextX = tileCountX - 1;
        if (nextX >= tileCountX) nextX = 0;
        if (nextY < 0) nextY = tileCountY - 1;
        if (nextY >= tileCountY) nextY = 0;

        const hitSelf = s.snake.some(seg => seg.x === nextX && seg.y === nextY);
        if (hitSelf) {
          endGame();
          return;
        }

        const newHead = { x: nextX, y: nextY };
        s.snake.unshift(newHead);

        if (nextX === s.food.x && nextY === s.food.y) {
          const pts = s.food.type === 'scroll' ? 30 : s.food.type === 'gem' ? 20 : 10;
          s.score += pts;
          s.apples++;
          setScore(s.score);
          setApplesEaten(s.apples);
          if (!soundMuted) sounds.playCoinSound();

          s.speed = Math.max(60, 105 - s.apples * 1.5);

          const pColor = s.food.type === 'scroll' ? '#38bdf8' : s.food.type === 'gem' ? '#f59e0b' : '#ef4444';
          for (let k = 0; k < 12; k++) {
            s.particles.push({
              x: (s.food.x + 0.5) * tileSizeX,
              y: (s.food.y + 0.5) * tileSizeY,
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
      const fx = (s.food.x + 0.5) * tileSizeX;
      const fy = (s.food.y + 0.5) * tileSizeY;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.shadowColor = s.food.type === 'scroll' ? '#38bdf8' : s.food.type === 'gem' ? '#fbbf24' : '#ef4444';
      ctx.shadowBlur = 14;
      ctx.font = `${tileSizeY * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emoji = s.food.type === 'scroll' ? '📜' : s.food.type === 'gem' ? '💎' : '🍎';
      ctx.fillText(emoji, 0, 0);
      ctx.restore();

      // Render Snake Body
      s.snake.forEach((seg, idx) => {
        const sx = seg.x * tileSizeX + 1.5;
        const sy = seg.y * tileSizeY + 1.5;
        const segSizeX = tileSizeX - 3;
        const segSizeY = tileSizeY - 3;

        ctx.save();
        if (idx === 0) {
          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(sx, sy, segSizeX, segSizeY, 6);
          ctx.fill();

          ctx.fillStyle = '#064e3b';
          ctx.fillRect(sx + 3, sy + 3, 3, 3);
          ctx.fillRect(sx + segSizeX - 6, sy + 3, 3, 3);
        } else {
          const progress = idx / s.snake.length;
          ctx.fillStyle = progress > 0.5 ? '#059669' : '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.roundRect(sx + progress, sy + progress, segSizeX - progress * 2, segSizeY - progress * 2, 4);
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
      if (dx > 20) changeDirection(1, 0);
      else if (dx < -20) changeDirection(-1, 0);
    } else {
      if (dy > 20) changeDirection(0, 1);
      else if (dy < -20) changeDirection(0, -1);
    }
  };

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
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-4xl mx-auto select-none">
      <div className="w-full flex items-center justify-between mb-2 text-stone-200">
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
        className="relative w-full max-w-[420px] aspect-square mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 bg-stone-950 touch-none"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full h-full block"
        />

        {gameState === 'playing' && (
          <div className="absolute top-3 left-0 right-0 flex justify-between px-6 pointer-events-none">
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 mb-2 animate-pulse">
              🐍
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-emerald-200 via-white to-green-300 bg-clip-text text-transparent">
              Garden of Eden Cyber Snake
            </h2>
            <p className="text-xs text-emerald-200/80 max-w-md mb-4">
              Swipe or use arrow keys/WASD across the widescreen garden. Eat golden apples and wisdom scrolls without crashing!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>START SLITHERING</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-3xl mb-1">🍎</div>
            <h3 className="text-xl font-black text-white mb-2">Slither Finished</h3>
            <div className="bg-white/10 rounded-2xl p-3 w-full max-w-xs mb-3 border border-white/15">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Score</span>
                <span className="text-lg font-black text-emerald-400">{score}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Items Eaten</span>
                <span className="text-sm font-black text-yellow-300">{applesEaten}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-xs text-stone-300">High Score</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm shadow-xl shadow-emerald-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Compact Landscape D-Pad for touch */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          onClick={() => changeDirection(-1, 0)}
          className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => changeDirection(0, -1)}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection(0, 1)}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => changeDirection(1, 0)}
          className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-emerald-500/40 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
