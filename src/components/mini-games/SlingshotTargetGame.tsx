import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft } from 'lucide-react';

interface SlingshotTargetGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

interface TargetObj {
  x: number;
  y: number;
  radius: number;
  type: 'pot' | 'shield' | 'helmet' | 'gold_jar';
  hp: number;
  maxHp: number;
  pts: number;
  vx: number;
}

export const SlingshotTargetGame: React.FC<SlingshotTargetGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [stonesLeft, setStonesLeft] = useState(6);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [soundMuted, setSoundMuted] = useState(false);

  const slingshotAnchor = { x: 75, y: 500 };

  const stateRef = useRef({
    dragging: false,
    dragPos: { x: 75, y: 500 },
    stone: null as { x: number; y: number; vx: number; vy: number; active: boolean; radius: number } | null,
    targets: [] as TargetObj[],
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    score: 0,
    stones: 6,
    running: false
  });

  const spawnTargets = useCallback(() => {
    const s = stateRef.current;
    s.targets = [];

    // Target 1: Clay Pot
    s.targets.push({
      x: 240,
      y: 470,
      radius: 20,
      type: 'pot',
      hp: 1,
      maxHp: 1,
      pts: 20,
      vx: 0
    });

    // Target 2: Goliath Helmet
    s.targets.push({
      x: 290,
      y: 350,
      radius: 24,
      type: 'helmet',
      hp: 2,
      maxHp: 2,
      pts: 50,
      vx: 0
    });

    // Target 3: Floating Moving Bronze Shield
    s.targets.push({
      x: 220,
      y: 220,
      radius: 18,
      type: 'shield',
      hp: 1,
      maxHp: 1,
      pts: 35,
      vx: 1.2
    });

    // Target 4: High Golden Urn
    s.targets.push({
      x: 280,
      y: 130,
      radius: 16,
      type: 'gold_jar',
      hp: 1,
      maxHp: 1,
      pts: 100,
      vx: -1.0
    });
  }, []);

  const startGame = () => {
    sounds.playTap();
    const s = stateRef.current;
    s.stone = null;
    s.particles = [];
    s.score = 0;
    s.stones = 6;
    s.dragging = false;
    s.dragPos = { ...slingshotAnchor };
    s.running = true;

    spawnTargets();
    setScore(0);
    setStonesLeft(6);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    stateRef.current.running = false;
    setGameState('gameover');
    if (!soundMuted) sounds.playIncorrect();

    const finalScore = stateRef.current.score;
    const tokens = Math.floor(finalScore / 25) + 1;

    if (finalScore > currentHighScore) {
      setCurrentHighScore(finalScore);
      if (!soundMuted) sounds.playCelebration();
    }
    if (onGameOver) onGameOver(finalScore, tokens);
  }, [currentHighScore, onGameOver, soundMuted]);

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

      // Desert Valley Sunset Sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.5, '#7c2d12');
      sky.addColorStop(0.85, '#d97706');
      sky.addColorStop(1, '#fde68a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Valley Hills Widescreen
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, 310);
      ctx.quadraticCurveTo(240, 270, 480, 310);
      ctx.lineTo(width, 290);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Update Moving Targets
      if (s.running) {
        s.targets.forEach((t) => {
          t.x += t.vx;
          if (t.x < 280 || t.x > width - 35) {
            t.vx *= -1;
          }
        });

        // Update Flying Stone
        if (s.stone && s.stone.active) {
          s.stone.vy += 0.36; // gravity
          s.stone.x += s.stone.vx;
          s.stone.y += s.stone.vy;

          s.particles.push({
            x: s.stone.x,
            y: s.stone.y,
            vx: -s.stone.vx * 0.1,
            vy: -s.stone.vy * 0.1,
            life: 0.5,
            color: 'rgba(255, 255, 255, 0.5)'
          });

          for (let i = s.targets.length - 1; i >= 0; i--) {
            const t = s.targets[i];
            const dist = Math.hypot(s.stone.x - t.x, s.stone.y - t.y);

            if (dist < t.radius + s.stone.radius) {
              t.hp -= 1;
              if (!soundMuted) sounds.playTargetSmash();

              for (let k = 0; k < 18; k++) {
                s.particles.push({
                  x: t.x,
                  y: t.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 1,
                  color: t.type === 'gold_jar' ? '#facc15' : t.type === 'helmet' ? '#a3e635' : '#fb923c'
                });
              }

              if (t.hp <= 0) {
                s.score += t.pts;
                setScore(s.score);
                s.targets.splice(i, 1);
              }

              s.stone.active = false;
              break;
            }
          }

          if (s.stone.y > 350 || s.stone.x > width + 20 || s.stone.x < -20) {
            s.stone.active = false;
          }

          if (!s.stone.active) {
            s.stone = null;
            if (s.targets.length === 0) {
              spawnTargets();
              s.stones += 3;
              setStonesLeft(s.stones);
              if (!soundMuted) sounds.playCelebration();
            } else if (s.stones <= 0) {
              endGame();
            }
          }
        }
      }

      // Render Targets
      s.targets.forEach((t) => {
        ctx.save();
        ctx.translate(t.x, t.y);

        if (t.type === 'helmet') {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🪖', 0, 0);
        } else if (t.type === 'gold_jar') {
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 16;
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏺', 0, 0);
        } else if (t.type === 'shield') {
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 10;
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 0);
        } else {
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 8;
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏺', 0, 0);
        }
        ctx.restore();
      });

      // Render Slingshot Fork
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(slingshotAnchor.x, slingshotAnchor.y + 45);
      ctx.lineTo(slingshotAnchor.x, slingshotAnchor.y);
      ctx.lineTo(slingshotAnchor.x - 18, slingshotAnchor.y - 25);
      ctx.moveTo(slingshotAnchor.x, slingshotAnchor.y);
      ctx.lineTo(slingshotAnchor.x + 18, slingshotAnchor.y - 25);
      ctx.stroke();

      // Render Elastic Bands
      const currentDrag = s.dragging ? s.dragPos : slingshotAnchor;
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(slingshotAnchor.x - 18, slingshotAnchor.y - 25);
      ctx.lineTo(currentDrag.x, currentDrag.y);
      ctx.lineTo(slingshotAnchor.x + 18, slingshotAnchor.y - 25);
      ctx.stroke();

      // Render Trajectory Prediction Arc
      if (s.dragging) {
        const pullX = slingshotAnchor.x - s.dragPos.x;
        const pullY = slingshotAnchor.y - s.dragPos.y;
        const vx = pullX * 0.22;
        const vy = pullY * 0.22;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        let simX = slingshotAnchor.x;
        let simY = slingshotAnchor.y;
        let simVy = vy;

        for (let step = 0; step < 20; step++) {
          simX += vx;
          simY += simVy;
          simVy += 0.36;
          ctx.beginPath();
          ctx.arc(simX, simY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Stone
      if (s.stone && s.stone.active) {
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.stone.x, s.stone.y, s.stone.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.running && s.stones > 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(currentDrag.x, currentDrag.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

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

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [endGame, soundMuted, spawnTargets]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const s = stateRef.current;
    if (s.stone && s.stone.active) return;
    if (s.stones <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 380;
    const y = ((e.clientY - rect.top) / rect.height) * 580;

    const dist = Math.hypot(x - slingshotAnchor.x, y - slingshotAnchor.y);
    if (dist < 70) {
      s.dragging = true;
      s.dragPos = { x, y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 380;
    let y = ((e.clientY - rect.top) / rect.height) * 580;

    const maxPull = 85;
    const dx = x - slingshotAnchor.x;
    const dy = y - slingshotAnchor.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxPull) {
      x = slingshotAnchor.x + (dx / dist) * maxPull;
      y = slingshotAnchor.y + (dy / dist) * maxPull;
    }

    s.dragPos = { x, y };
  };

  const handlePointerUp = () => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.dragging = false;

    const pullX = slingshotAnchor.x - s.dragPos.x;
    const pullY = slingshotAnchor.y - s.dragPos.y;
    const power = Math.hypot(pullX, pullY);

    if (power > 15) {
      s.stones--;
      setStonesLeft(s.stones);
      if (!soundMuted) sounds.playSlingshotSnap();

      s.stone = {
        x: slingshotAnchor.x,
        y: slingshotAnchor.y,
        vx: pullX * 0.24,
        vy: pullY * 0.24,
        active: true,
        radius: 7
      };
    }
    s.dragPos = { ...slingshotAnchor };
  };

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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full max-w-[420px] aspect-[380/580] mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-stone-950 cursor-grab active:cursor-grabbing touch-none"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={580}
          className="w-full h-full block"
        />

        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-6 pointer-events-none">
            <div className="flex items-center gap-1 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-lg shadow-lg">
              <span>{score} pts</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-stone-950 font-black text-xs shadow-lg">
              <span>🪨 {stonesLeft} Stones</span>
            </div>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-3xl shadow-xl shadow-amber-600/30 mb-2 animate-pulse">
              🎯
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-amber-200 via-white to-yellow-300 bg-clip-text text-transparent">
              David's Slingshot Target Range
            </h2>
            <p className="text-xs text-amber-200/80 max-w-md mb-4">
              Drag back the smooth stone, line up the trajectory arc across the valley, and shatter Goliath targets & clay jars!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>START SLINGSHOT</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-3xl mb-1">🏆</div>
            <h3 className="text-xl font-black text-white mb-2">Target Range Cleared</h3>
            <div className="bg-white/10 rounded-2xl p-3 w-full max-w-xs mb-3 border border-white/15">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Total Score</span>
                <span className="text-lg font-black text-amber-400">{score}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-xs text-stone-300">Target Range Record</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>SHOOT AGAIN</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        🏹 Pull backwards and downwards to launch long-distance shots across the valley!
      </p>
    </div>
  );
};
