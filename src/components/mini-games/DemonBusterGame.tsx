import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft, Shield, Sparkles } from 'lucide-react';

interface DemonBusterGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
  vx: number;
  power: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  radius: number;
  type: 'dart' | 'shadow' | 'boss';
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'shield' | 'triple' | 'bomb';
  emoji: string;
}

export const DemonBusterGame: React.FC<DemonBusterGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [lives, setLives] = useState(3);
  const [shieldActive, setShieldActive] = useState(false);
  const [tripleActive, setTripleActive] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const stateRef = useRef({
    player: { x: 190, y: 510, width: 36, height: 36, vx: 0 },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    powerups: [] as PowerUp[],
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    stars: [] as Array<{ x: number; y: number; speed: number; size: number }>,
    score: 0,
    lives: 3,
    shieldTimer: 0,
    tripleTimer: 0,
    frame: 0,
    running: false,
    keys: { left: false, right: false, fire: false },
    touchX: null as number | null
  });

  const startGame = () => {
    sounds.playTap();
    const s = stateRef.current;
    s.player = { x: 190, y: 510, width: 36, height: 36, vx: 0 };
    s.bullets = [];
    s.enemies = [];
    s.powerups = [];
    s.particles = [];
    s.score = 0;
    s.lives = 3;
    s.shieldTimer = 120;
    s.tripleTimer = 0;
    s.frame = 0;
    s.running = true;

    s.stars = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 380,
      y: Math.random() * 580,
      speed: 0.5 + Math.random() * 2,
      size: 1 + Math.random() * 2
    }));

    setScore(0);
    setLives(3);
    setShieldActive(true);
    setTripleActive(false);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    stateRef.current.running = false;
    setGameState('gameover');
    if (!soundMuted) sounds.playIncorrect();

    const finalScore = stateRef.current.score;
    const tokens = Math.floor(finalScore / 5) + 1;

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

      ctx.fillStyle = '#05050d';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      s.stars.forEach((st) => {
        if (s.running) {
          st.y += st.speed;
          if (st.y > height) st.y = 0;
        }
        ctx.fillRect(st.x, st.y, st.size, st.size);
      });

      if (s.running) {
        s.frame++;

        if (s.shieldTimer > 0) {
          s.shieldTimer--;
          if (s.shieldTimer === 0) setShieldActive(false);
        }
        if (s.tripleTimer > 0) {
          s.tripleTimer--;
          if (s.tripleTimer === 0) setTripleActive(false);
        }

        if (s.touchX !== null) {
          const dx = s.touchX - s.player.x;
          s.player.x += dx * 0.18;
        } else {
          if (s.keys.left) s.player.x -= 6.5;
          if (s.keys.right) s.player.x += 6.5;
        }
        s.player.x = Math.max(25, Math.min(width - 25, s.player.x));

        // Auto Fire Lasers every 8 frames
        if (s.frame % 8 === 0) {
          if (s.tripleTimer > 0) {
            s.bullets.push(
              { x: s.player.x - 12, y: s.player.y - 12, vx: -1.5, vy: -10, power: 1, color: '#38bdf8' },
              { x: s.player.x, y: s.player.y - 16, vx: 0, vy: -11, power: 1.5, color: '#facc15' },
              { x: s.player.x + 12, y: s.player.y - 12, vx: 1.5, vy: -10, power: 1, color: '#38bdf8' }
            );
          } else {
            s.bullets.push({
              x: s.player.x,
              y: s.player.y - 15,
              vx: 0,
              vy: -10,
              power: 1,
              color: '#38bdf8'
            });
          }
        }

        // Spawn Enemies
        if (s.frame % 35 === 0) {
          const isShadow = Math.random() > 0.4;
          s.enemies.push({
            x: 30 + Math.random() * (width - 60),
            y: -20,
            vx: (Math.random() - 0.5) * 2.2,
            vy: 1.8 + Math.random() * 1.5,
            hp: isShadow ? 2 : 1,
            maxHp: isShadow ? 2 : 1,
            radius: isShadow ? 16 : 12,
            type: isShadow ? 'shadow' : 'dart',
            color: isShadow ? '#a855f7' : '#ef4444'
          });
        }

        // Spawn Boss every 500 frames
        if (s.frame % 500 === 0 && s.frame > 0) {
          s.enemies.push({
            x: width / 2,
            y: -40,
            vx: 1.8,
            vy: 0.8,
            hp: 24,
            maxHp: 24,
            radius: 28,
            type: 'boss',
            color: '#dc2626'
          });
        }

        // Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.y < -20) {
            s.bullets.splice(i, 1);
          }
        }

        // Update Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];
          e.x += e.vx;
          e.y += e.vy;

          if (e.x < e.radius || e.x > width - e.radius) {
            e.vx *= -1;
          }

          // Bullet hits Enemy
          for (let j = s.bullets.length - 1; j >= 0; j--) {
            const b = s.bullets[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < e.radius + 6) {
              e.hp -= b.power;
              s.bullets.splice(j, 1);

              s.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 0.7,
                color: '#38bdf8'
              });

              if (e.hp <= 0) break;
            }
          }

          if (e.hp <= 0) {
            if (!soundMuted) sounds.playCoinSound();
            const pts = e.type === 'boss' ? 50 : e.type === 'shadow' ? 5 : 2;
            s.score += pts;
            setScore(s.score);

            if (Math.random() < 0.2 || e.type === 'boss') {
              const types: Array<'shield' | 'triple' | 'bomb'> = ['shield', 'triple', 'bomb'];
              const chosen = types[Math.floor(Math.random() * types.length)];
              s.powerups.push({
                x: e.x,
                y: e.y,
                vy: 1.5,
                type: chosen,
                emoji: chosen === 'shield' ? '🛡️' : chosen === 'triple' ? '⚡' : '🕊️'
              });
            }

            for (let k = 0; k < (e.type === 'boss' ? 30 : 12); k++) {
              s.particles.push({
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: e.color
              });
            }

            s.enemies.splice(i, 1);
            continue;
          }

          // Player Collision
          const pDist = Math.hypot(s.player.x - e.x, s.player.y - e.y);
          if (pDist < e.radius + 14) {
            if (s.shieldTimer > 0) {
              e.hp = 0;
            } else {
              s.lives--;
              setLives(s.lives);
              s.enemies.splice(i, 1);

              if (!soundMuted) sounds.playIncorrect();
              s.shieldTimer = 90;
              setShieldActive(true);

              if (s.lives <= 0) {
                endGame();
                return;
              }
            }
          }

          if (e.y > height + 30) {
            s.enemies.splice(i, 1);
          }
        }

        // Update PowerUps
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.y += p.vy;

          const pDist = Math.hypot(s.player.x - p.x, s.player.y - p.y);
          if (pDist < 25) {
            if (!soundMuted) sounds.playLevelComplete();
            if (p.type === 'shield') {
              s.shieldTimer = 300;
              setShieldActive(true);
            } else if (p.type === 'triple') {
              s.tripleTimer = 360;
              setTripleActive(true);
            } else if (p.type === 'bomb') {
              s.enemies.forEach((en) => {
                s.score += 2;
                for (let k = 0; k < 8; k++) {
                  s.particles.push({
                    x: en.x,
                    y: en.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 1,
                    color: '#facc15'
                  });
                }
              });
              s.enemies = [];
              setScore(s.score);
            }
            s.powerups.splice(i, 1);
            continue;
          }

          if (p.y > height + 20) {
            s.powerups.splice(i, 1);
          }
        }
      }

      // Render Bullets
      s.bullets.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
      });

      // Render Enemies
      s.enemies.forEach((e) => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;

        if (e.type === 'dart') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, e.radius);
          ctx.lineTo(-e.radius * 0.7, -e.radius);
          ctx.lineTo(e.radius * 0.7, -e.radius);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === 'shadow') {
          ctx.fillStyle = '#9333ea';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f87171';
          ctx.fillRect(-6, -3, 3, 3);
          ctx.fillRect(3, -3, 3, 3);
        } else {
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(-24, -e.radius - 12, 48, 6);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-24, -e.radius - 12, 48 * (e.hp / e.maxHp), 6);
        }
        ctx.restore();
      });

      // Render PowerUps
      s.powerups.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
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

      // Render Player (Warrior Vessel)
      ctx.save();
      ctx.translate(s.player.x, s.player.y);

      if (s.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, 16);
      ctx.lineTo(0, 10);
      ctx.lineTo(-16, 16);
      ctx.closePath();
      ctx.fill();

      // Golden Cross
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -8, 4, 14);
      ctx.fillRect(-6, -4, 12, 4);

      // Thruster trail
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-6, 14);
      ctx.lineTo(0, 24 + Math.random() * 8);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [endGame, soundMuted]);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const relX = ((touch.clientX - rect.left) / rect.width) * 380;
    stateRef.current.touchX = relX;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 380;
    stateRef.current.touchX = relX;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = true;
      if (e.code === 'Space' && (gameState === 'idle' || gameState === 'gameover')) startGame();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') stateRef.current.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') stateRef.current.keys.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

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
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-500/30">
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
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
        onTouchEnd={() => { stateRef.current.touchX = null; }}
        className="relative w-full max-w-[420px] aspect-[380/580] mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-500/30 bg-stone-950 cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          width={380}
          height={580}
          className="w-full h-full block"
        />

        {gameState === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-6 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-lg shadow-lg">
                <span>{score}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: lives }).map((_, idx) => (
                  <span key={idx} className="text-sm">❤️</span>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              {shieldActive && (
                <div className="p-1.5 rounded-full bg-cyan-500/80 text-white shadow-lg animate-pulse">
                  <Shield className="w-4 h-4" />
                </div>
              )}
              {tripleActive && (
                <div className="p-1.5 rounded-full bg-amber-500/80 text-stone-950 shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30 mb-2 animate-pulse">
              ⚔️
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-transparent">
              Armor of God: Demon Buster
            </h2>
            <p className="text-xs text-cyan-200/80 max-w-md mb-4">
              Drag finger or use arrow keys across widescreen space. Extinguish fiery darts and pick up Shield of Faith & Holy Lightning!
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ENGAGE BATTLE</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-200">
            <div className="text-3xl mb-1">🛡️</div>
            <h3 className="text-xl font-black text-white mb-2">Battle Concluded</h3>
            <div className="bg-white/10 rounded-2xl p-3 w-full max-w-xs mb-3 border border-white/15">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Spirits Vanquished</span>
                <span className="text-lg font-black text-cyan-400">{score}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-xs text-stone-300">Personal Best</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY MISSION</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        🛡️ Collect glowing powerups: Shield of Faith for invincibility and Holy Lightning for triple laser spread!
      </p>
    </div>
  );
};
