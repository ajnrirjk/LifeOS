import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft } from 'lucide-react';

interface FlappyDoveGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

export const FlappyDoveGame: React.FC<FlappyDoveGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [soundMuted, setSoundMuted] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);

  // Game variables stored in refs for 60fps RAF loop
  const stateRef = useRef({
    dove: { x: 80, y: 260, vy: 0, radius: 14, wingAngle: 0 },
    gravity: 0.32,
    jumpPower: -6.5,
    pipes: [] as Array<{ x: number; top: number; bottom: number; passed: boolean; width: number }>,
    halos: [] as Array<{ x: number; y: number; collected: boolean; angle: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    gameSpeed: 2.6,
    frame: 0,
    score: 0,
    coins: 0,
    clouds: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    running: false
  });

  const triggerJump = useCallback(() => {
    if (stateRef.current.running) {
      stateRef.current.dove.vy = stateRef.current.jumpPower;
      if (!soundMuted) sounds.playWhoosh();
      // Burst feather particles
      for (let i = 0; i < 4; i++) {
        stateRef.current.particles.push({
          x: stateRef.current.dove.x - 10,
          y: stateRef.current.dove.y,
          vx: -Math.random() * 2 - 1,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          color: 'rgba(255, 255, 255, 0.8)'
        });
      }
    }
  }, [soundMuted]);

  const startGame = () => {
    sounds.playTap();
    const s = stateRef.current;
    s.dove = { x: 80, y: 260, vy: -4, radius: 14, wingAngle: 0 };
    s.pipes = [];
    s.halos = [];
    s.particles = [];
    s.gameSpeed = 2.6;
    s.frame = 0;
    s.score = 0;
    s.coins = 0;
    s.running = true;

    // Initialize clouds
    s.clouds = Array.from({ length: 6 }).map((_, i) => ({
      x: i * 80 + Math.random() * 40,
      y: 30 + Math.random() * 120,
      speed: 0.3 + Math.random() * 0.4,
      size: 26 + Math.random() * 20
    }));

    setScore(0);
    setCoinsCollected(0);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    stateRef.current.running = false;
    setGameState('gameover');
    if (!soundMuted) sounds.playIncorrect();

    const finalScore = stateRef.current.score;
    const finalCoins = stateRef.current.coins;

    if (finalScore > currentHighScore) {
      setCurrentHighScore(finalScore);
      if (!soundMuted) sounds.playCelebration();
    }
    if (onGameOver) onGameOver(finalScore, finalCoins);
  }, [currentHighScore, onGameOver, soundMuted]);

  // Main game loop
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

      // 1. Clear & Background Gradient (Heavenly Sunset Widescreen)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1a103c'); // deep twilight purple
      grad.addColorStop(0.5, '#4a1e6d'); // royal sunset
      grad.addColorStop(0.85, '#d97706'); // golden amber
      grad.addColorStop(1, '#f59e0b'); // radiant horizon
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax Clouds across widescreen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      s.clouds.forEach((c) => {
        if (s.running) {
          c.x -= c.speed;
          if (c.x < -c.size * 2) c.x = width + c.size;
        }
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.6, c.y - c.size * 0.2, c.size * 0.7, 0, Math.PI * 2);
        ctx.arc(c.x - c.size * 0.5, c.y + c.size * 0.1, c.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Mountains silhouette widescreen
      ctx.fillStyle = 'rgba(24, 15, 45, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 70);
      ctx.lineTo(80, height - 120);
      ctx.lineTo(160, height - 80);
      ctx.lineTo(260, height - 140);
      ctx.lineTo(380, height - 90);
      ctx.lineTo(500, height - 130);
      ctx.lineTo(620, height - 85);
      ctx.lineTo(720, height - 110);
      ctx.lineTo(720, height);
      ctx.closePath();
      ctx.fill();

      if (s.running) {
        s.frame++;

        // Update Dove Physics
        s.dove.vy += s.gravity;
        s.dove.y += s.dove.vy;
        s.dove.wingAngle = Math.sin(s.frame * 0.25) * 0.4;

        // Speed ramp slowly
        if (s.frame % 400 === 0 && s.gameSpeed < 4.8) {
          s.gameSpeed += 0.2;
        }

        // Spawn Pillars
        if (s.frame % 100 === 0) {
          const gap = 145;
          const minPipe = 60;
          const maxPipe = height - gap - minPipe - 30;
          const top = minPipe + Math.random() * (maxPipe - minPipe);
          const bottom = top + gap;

          s.pipes.push({
            x: width,
            top,
            bottom,
            passed: false,
            width: 58
          });

          // 65% chance to spawn glowing halo collectible
          if (Math.random() > 0.35) {
            s.halos.push({
              x: width + 29,
              y: top + gap / 2,
              collected: false,
              angle: 0
            });
          }
        }

        // Update Pipes
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= s.gameSpeed;

          // Score passing pipe
          if (!p.passed && p.x + p.width < s.dove.x) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            if (!soundMuted) sounds.playTap();
          }

          // Collision check with pipes
          const doveBox = {
            left: s.dove.x - s.dove.radius + 3,
            right: s.dove.x + s.dove.radius - 3,
            top: s.dove.y - s.dove.radius + 3,
            bottom: s.dove.y + s.dove.radius - 3
          };

          if (doveBox.right > p.x && doveBox.left < p.x + p.width) {
            if (doveBox.top < p.top || doveBox.bottom > p.bottom) {
              endGame();
            }
          }

          // Remove offscreen pipes
          if (p.x + p.width < -10) {
            s.pipes.splice(i, 1);
          }
        }

        // Update Collectibles (Golden Halos & Olive Leaves)
        for (let i = s.halos.length - 1; i >= 0; i--) {
          const h = s.halos[i];
          h.x -= s.gameSpeed;
          h.angle += 0.08;

          // Check pickup
          const dist = Math.hypot(s.dove.x - h.x, s.dove.y - h.y);
          if (dist < s.dove.radius + 15 && !h.collected) {
            h.collected = true;
            s.score += 5;
            s.coins += 1;
            setScore(s.score);
            setCoinsCollected(s.coins);
            if (!soundMuted) sounds.playCoinSound();

            // Burst golden sparks
            for (let k = 0; k < 12; k++) {
              s.particles.push({
                x: h.x,
                y: h.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#fde047'
              });
            }
            s.halos.splice(i, 1);
            continue;
          }

          if (h.x < -20) {
            s.halos.splice(i, 1);
          }
        }

        // Floor / Ceiling check
        if (s.dove.y + s.dove.radius > height - 14 || s.dove.y - s.dove.radius < 0) {
          endGame();
        }
      }

      // 4. Render Pillars (Marble Columns with gold trim)
      s.pipes.forEach((p) => {
        // Top Column
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(p.x, 0, p.width, p.top);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x - 4, p.top - 14, p.width + 8, 14);

        // Bottom Column
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(p.x, p.bottom, p.width, height - p.bottom);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x - 4, p.bottom, p.width + 8, 14);

        // Column ridges
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + 12, 0);
        ctx.lineTo(p.x + 12, p.top - 14);
        ctx.moveTo(p.x + p.width - 12, 0);
        ctx.lineTo(p.x + p.width - 12, p.top - 14);

        ctx.moveTo(p.x + 12, p.bottom + 14);
        ctx.lineTo(p.x + 12, height);
        ctx.moveTo(p.x + p.width - 12, p.bottom + 14);
        ctx.lineTo(p.x + p.width - 12, height);
        ctx.stroke();
      });

      // 5. Render Collectibles (Golden Halos)
      s.halos.forEach((h) => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);

        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', 0, 0);

        ctx.restore();
      });

      // 6. Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.035;

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

      // 7. Render Dove
      ctx.save();
      ctx.translate(s.dove.x, s.dove.y);
      const pitch = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, s.dove.vy * 0.08));
      ctx.rotate(pitch);

      ctx.shadowColor = 'rgba(253, 224, 71, 0.8)';
      ctx.shadowBlur = 16;

      // Dove Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing (Flapping)
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(-3, -3 + s.dove.wingAngle * 10, 12, 6, -0.4 + s.dove.wingAngle, 0, Math.PI * 2);
      ctx.fill();

      // Tail feather
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-24, -6);
      ctx.lineTo(-22, 2);
      ctx.closePath();
      ctx.fill();

      // Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(22, 0);
      ctx.lineTo(14, 3);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(9, -3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Olive Branch in Beak
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(19, 0);
      ctx.lineTo(26, 6);
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(27, 6, 3, 1.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 8. Ground Bar
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, height - 12, width, 12);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, height - 15, width, 3);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [endGame, soundMuted]);

  // Keyboard handler (Spacebar or Arrow Up)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'playing') {
          triggerJump();
        } else if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, triggerJump]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-4xl mx-auto select-none">
      {/* Top Header Bar */}
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

      {/* Responsive Canvas Container (Authentic 380:580 arcade portrait proportions) */}
      <div 
        onClick={() => {
          if (gameState === 'playing') triggerJump();
        }}
        className="relative w-full max-w-[420px] aspect-[380/580] mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-stone-950 cursor-pointer touch-none"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={580}
          className="w-full h-full block"
        />

        {/* Live In-Game HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-6 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-xl shadow-lg">
              <span>{score}</span>
            </div>
            {coinsCollected > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-stone-950 font-black text-sm shadow-lg animate-bounce">
                <span>✨ +{coinsCollected}</span>
              </div>
            )}
          </div>
        )}

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 mb-2 animate-pulse">
              🕊️
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent">
              Faith Flappy Dove
            </h2>
            <p className="text-xs text-amber-200/80 max-w-md mb-4">
              Tap screen or press Spacebar to flap wings. Glide through widescreen marble columns and collect glowing halos!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>START FLIGHT</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-3xl mb-1">🌿</div>
            <h3 className="text-xl font-black text-white mb-2">Flight Completed</h3>
            <div className="bg-white/10 rounded-2xl p-3 w-full max-w-xs mb-3 border border-white/15">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Final Score</span>
                <span className="text-lg font-black text-amber-400">{score}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Halos Collected</span>
                <span className="text-sm font-black text-yellow-300">+{coinsCollected} tokens</span>
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
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        💡 Pro-tip: Tap gently to maintain smooth altitude control through holy pillars!
      </p>
    </div>
  );
};
