import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft, Zap } from 'lucide-react';

interface BabelStackerGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface FallingPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vy: number;
  vx: number;
  rotation: number;
  vRot: number;
}

const BLOCK_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#eab308', // yellow
];

export const BabelStackerGame: React.FC<BabelStackerGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [combo, setCombo] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);

  const stateRef = useRef({
    stack: [] as Block[],
    currentBlock: { x: 0, y: 0, width: 200, height: 26, color: '#f59e0b', vx: 3.5, direction: 1 },
    fallingPieces: [] as FallingPiece[],
    cameraY: 0,
    targetCameraY: 0,
    score: 0,
    combo: 0,
    coinsEarned: 0,
    blockHeight: 26,
    running: false,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>
  });

  const startGame = () => {
    sounds.playTap();
    const s = stateRef.current;
    const initialWidth = 190;
    const baseBlock: Block = {
      x: (380 - initialWidth) / 2,
      y: 420,
      width: initialWidth,
      height: 26,
      color: '#6366f1'
    };

    s.stack = [baseBlock];
    s.currentBlock = {
      x: 0,
      y: 420 - 26,
      width: initialWidth,
      height: 26,
      color: BLOCK_COLORS[1],
      vx: 3.8,
      direction: 1
    };
    s.fallingPieces = [];
    s.particles = [];
    s.cameraY = 0;
    s.targetCameraY = 0;
    s.score = 0;
    s.combo = 0;
    s.coinsEarned = 0;
    s.running = true;

    setScore(0);
    setCombo(0);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    stateRef.current.running = false;
    setGameState('gameover');
    if (!soundMuted) sounds.playIncorrect();

    const finalScore = stateRef.current.score;
    const tokens = Math.floor(finalScore / 3) + 1;

    if (finalScore > currentHighScore) {
      setCurrentHighScore(finalScore);
      if (!soundMuted) sounds.playCelebration();
    }
    if (onGameOver) onGameOver(finalScore, tokens);
  }, [currentHighScore, onGameOver, soundMuted]);

  const dropBlock = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    const current = s.currentBlock;
    const topBlock = s.stack[s.stack.length - 1];

    const diff = current.x - topBlock.x;
    const tolerance = 4; // Perfect drop threshold

    let newWidth = current.width - Math.abs(diff);
    let newX = current.x;

    if (Math.abs(diff) <= tolerance) {
      // PERFECT DROP!
      newWidth = topBlock.width;
      newX = topBlock.x;
      s.combo++;
      s.score += 2 + s.combo;
      if (!soundMuted) sounds.playLevelComplete();

      // Golden celebratory sparkles
      for (let i = 0; i < 15; i++) {
        s.particles.push({
          x: newX + Math.random() * newWidth,
          y: current.y,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4 - 2,
          life: 1,
          color: '#facc15'
        });
      }
    } else if (newWidth > 0) {
      // Normal Drop with Slicing!
      s.combo = 0;
      s.score += 1;
      if (!soundMuted) sounds.playTap();

      if (diff > 0) {
        // Cut off right piece
        newX = current.x;
        const fallingWidth = diff;
        s.fallingPieces.push({
          x: current.x + newWidth,
          y: current.y,
          width: fallingWidth,
          height: current.height,
          color: current.color,
          vy: 1,
          vx: 1.5,
          rotation: 0,
          vRot: 0.05
        });
      } else {
        // Cut off left piece
        newX = topBlock.x;
        const fallingWidth = -diff;
        s.fallingPieces.push({
          x: current.x,
          y: current.y,
          width: fallingWidth,
          height: current.height,
          color: current.color,
          vy: 1,
          vx: -1.5,
          rotation: 0,
          vRot: -0.05
        });
      }
    } else {
      // Complete Miss!
      s.fallingPieces.push({
        x: current.x,
        y: current.y,
        width: current.width,
        height: current.height,
        color: current.color,
        vy: 2,
        vx: current.direction * 2,
        rotation: 0,
        vRot: current.direction * 0.08
      });
      endGame();
      return;
    }

    // Add new placed block to stack
    const placedBlock: Block = {
      x: newX,
      y: current.y,
      width: newWidth,
      height: current.height,
      color: current.color
    };
    s.stack.push(placedBlock);

    setScore(s.score);
    setCombo(s.combo);

    // Speed increases with height
    const nextSpeed = Math.min(7.5, 3.8 + s.score * 0.12);
    const nextColor = BLOCK_COLORS[(s.stack.length) % BLOCK_COLORS.length];

    // Scroll camera up if stack goes above mid-screen
    if (placedBlock.y - s.cameraY < 240) {
      s.targetCameraY = 240 - placedBlock.y;
    }

    // Spawn next moving block
    s.currentBlock = {
      x: Math.random() > 0.5 ? 0 : 380 - newWidth,
      y: placedBlock.y - s.blockHeight,
      width: newWidth,
      height: s.blockHeight,
      color: nextColor,
      vx: nextSpeed,
      direction: Math.random() > 0.5 ? 1 : -1
    };
  }, [endGame, soundMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Smooth camera interpolation
      s.cameraY += (s.targetCameraY - s.cameraY) * 0.1;

      // Dark futuristic cyberpunk sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.6, '#1e1b4b');
      grad.addColorStop(1, '#311042');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Starfield / celestial particles in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 47) % width);
        const sy = ((i * 73 + s.cameraY * 0.3) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      ctx.save();
      ctx.translate(0, s.cameraY);

      // Update Moving Block
      if (s.running) {
        const cur = s.currentBlock;
        cur.x += cur.vx * cur.direction;

        if (cur.x + cur.width > width) {
          cur.x = width - cur.width;
          cur.direction = -1;
        } else if (cur.x < 0) {
          cur.x = 0;
          cur.direction = 1;
        }
      }

      // Render Stack Blocks
      s.stack.forEach((b, idx) => {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = idx === s.stack.length - 1 ? 12 : 4;
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Highlight top sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(b.x, b.y, b.width, 3);
        // Shadow base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(b.x, b.y + b.height - 3, b.width, 3);
      });

      // Render Active Moving Block
      if (s.running) {
        const cur = s.currentBlock;
        ctx.fillStyle = cur.color;
        ctx.shadowColor = cur.color;
        ctx.shadowBlur = 14;
        ctx.fillRect(cur.x, cur.y, cur.width, cur.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(cur.x, cur.y, cur.width, 3);
      }

      // Update & Render Falling Sliced Pieces
      for (let i = s.fallingPieces.length - 1; i >= 0; i--) {
        const p = s.fallingPieces[i];
        p.vy += 0.4;
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();

        if (p.y - s.cameraY > height + 100) {
          s.fallingPieces.splice(i, 1);
        }
      }

      // Render Sparkle Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;

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

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        e.preventDefault();
        if (gameState === 'playing') {
          dropBlock();
        } else if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, dropBlock]);

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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 font-black text-xs border border-violet-500/30">
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
        onClick={() => {
          if (gameState === 'playing') dropBlock();
        }}
        className="relative w-full aspect-[4/5] max-h-[520px] rounded-3xl overflow-hidden shadow-2xl border-2 border-violet-500/30 bg-stone-950 cursor-pointer touch-none"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={480}
          className="w-full h-full object-cover"
        />

        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-5 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-xl shadow-lg">
              <span>{score}</span>
            </div>
            {combo > 1 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs shadow-lg animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-stone-950" />
                <span>PERFECT x{combo}!</span>
              </div>
            )}
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-3xl shadow-xl shadow-violet-500/30 mb-3 animate-pulse">
              🧱
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-violet-200 via-white to-fuchsia-300 bg-clip-text text-transparent">
              Tower of Babel Stacker
            </h2>
            <p className="text-xs text-violet-200/80 max-w-xs mb-6">
              Tap precisely when the block aligns with the tower below. Slice off overhanging edges and aim for flawless perfection combos!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-xl shadow-violet-600/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START STACKING</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-4xl mb-2">🏛️</div>
            <h3 className="text-xl font-black text-white mb-1">Tower Reached</h3>
            <div className="bg-white/10 rounded-2xl p-4 w-full max-w-xs mb-4 border border-white/15">
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-xs text-stone-300">Floors Stacked</span>
                <span className="text-lg font-black text-violet-400">{score}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-xs text-stone-300">Max Combo</span>
                <span className="text-sm font-black text-yellow-300">x{combo}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-stone-300">All-Time High</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-sm shadow-xl shadow-violet-600/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-3 text-center">
        ⚡ Match the block within 4px of the top edge to trigger a golden harmony combo & score bonus!
      </p>
    </div>
  );
};
