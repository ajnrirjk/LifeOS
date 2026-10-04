import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft, Zap, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface SamsonSmashGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vy: number;
}

interface RubbleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  life: number;
}

const PILLAR_TEMPLATES = [
  { name: 'Limestone Column', maxHp: 500, color: '#d6c7a1', accent: '#bfa776', emoji: '🏛️' },
  { name: 'Bronze-Bound Pillar', maxHp: 850, color: '#cd7f32', accent: '#8c531b', emoji: '🛡️' },
  { name: 'Philistine Obsidian Colossus', maxHp: 1350, color: '#332f38', accent: '#695d73', emoji: '⚔️' },
  { name: 'Temple of Dagon Pillar', maxHp: 2000, color: '#7b1113', accent: '#d4af37', emoji: '⚡' },
  { name: 'Titan Arch of Iron', maxHp: 2800, color: '#4a5568', accent: '#a0aec0', emoji: '🔥' },
];

export const SamsonSmashGame: React.FC<SamsonSmashGameProps> = ({ onGameOver, onBack, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [pillarsShattered, setPillarsShattered] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(35);
  const [combo, setCombo] = useState(0);
  const [furyMeter, setFuryMeter] = useState(0); // 0 to 100
  const [isFuryActive, setIsFuryActive] = useState(false);
  const [pillarHp, setPillarHp] = useState(500);
  const [pillarMaxHp, setPillarMaxHp] = useState(500);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // Meter oscillation state
  const meterPosRef = useRef(0); // 0 to 1
  const meterDirRef = useRef(1); // 1 or -1
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<RubbleParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lastTimeRef = useRef(0);

  // Game internal state ref
  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'playing' | 'gameover',
    score: 0,
    pillarsShattered: 0,
    stage: 1,
    pillarHp: 500,
    pillarMaxHp: 500,
    combo: 0,
    furyMeter: 0,
    isFuryActive: false,
    furyTimer: 0,
    timeLeft: 35,
    cracks: [] as Array<{ x1: number; y1: number; x2: number; y2: number }>
  });

  const getPillarConfig = (stageNum: number) => {
    const idx = Math.min(PILLAR_TEMPLATES.length - 1, (stageNum - 1) % PILLAR_TEMPLATES.length);
    const template = PILLAR_TEMPLATES[idx];
    const multiplier = 1 + Math.floor((stageNum - 1) / PILLAR_TEMPLATES.length) * 0.5;
    return {
      name: `${template.name} ${stageNum > PILLAR_TEMPLATES.length ? `(Tier ${Math.floor((stageNum - 1) / PILLAR_TEMPLATES.length) + 1})` : ''}`,
      maxHp: Math.round(template.maxHp * multiplier),
      color: template.color,
      accent: template.accent,
      emoji: template.emoji,
    };
  };

  const generateCracks = (count: number) => {
    const cracks: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < count; i++) {
      const cx = 150 + Math.random() * 100;
      const cy = 100 + Math.random() * 260;
      cracks.push({
        x1: cx,
        y1: cy,
        x2: cx + (Math.random() - 0.5) * 60,
        y2: cy + (Math.random() - 0.5) * 60,
      });
    }
    return cracks;
  };

  const spawnRubble = (x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 12,
        color: Math.random() > 0.4 ? color : '#ffd700',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        life: 1.0,
      });
    }
  };

  const addFloatingText = (text: string, x: number, y: number, color: string, size: number = 20) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
      size,
      alpha: 1,
      vy: -1.8,
    });
  };

  const startGame = useCallback(() => {
    sounds.playTap();
    const config = getPillarConfig(1);
    stateRef.current = {
      gameState: 'playing',
      score: 0,
      pillarsShattered: 0,
      stage: 1,
      pillarHp: config.maxHp,
      pillarMaxHp: config.maxHp,
      combo: 0,
      furyMeter: 0,
      isFuryActive: false,
      furyTimer: 0,
      timeLeft: 35,
      cracks: [],
    };

    setGameState('playing');
    setScore(0);
    setPillarsShattered(0);
    setStage(1);
    setPillarHp(config.maxHp);
    setPillarMaxHp(config.maxHp);
    setCombo(0);
    setFuryMeter(0);
    setIsFuryActive(false);
    setTimeLeft(35);
    particlesRef.current = [];
    floatingTextsRef.current = [];
  }, []);

  const triggerSmash = useCallback(() => {
    if (stateRef.current.gameState !== 'playing') return;

    const s = stateRef.current;
    const pos = meterPosRef.current; // 0 to 1
    const distFromCenter = Math.abs(pos - 0.5); // 0 (dead center) to 0.5 (far edges)

    let quality: 'perfect' | 'great' | 'good' | 'miss' = 'miss';
    let baseDamage = 0;
    let scoreGain = 0;
    let timeBonus = 0;
    let furyGain = 0;

    // Sweet spot zones
    if (s.isFuryActive) {
      // Automatic super crit
      quality = 'perfect';
      baseDamage = 260;
      scoreGain = 600;
      timeBonus = 2.5;
      furyGain = 0;
    } else if (distFromCenter < 0.08) {
      // Golden center
      quality = 'perfect';
      baseDamage = 180 + s.combo * 15;
      scoreGain = 350 + s.combo * 50;
      timeBonus = 2.5;
      furyGain = 25;
    } else if (distFromCenter < 0.20) {
      // Great zone
      quality = 'great';
      baseDamage = 110 + s.combo * 8;
      scoreGain = 180 + s.combo * 25;
      timeBonus = 1.5;
      furyGain = 12;
    } else if (distFromCenter < 0.35) {
      // Good zone
      quality = 'good';
      baseDamage = 60;
      scoreGain = 80;
      timeBonus = 0.5;
      furyGain = 5;
    } else {
      // Miss / Glancing blow
      quality = 'miss';
      baseDamage = 20;
      scoreGain = 20;
      timeBonus = 0;
      furyGain = 0;
    }

    // Apply Damage
    s.pillarHp = Math.max(0, s.pillarHp - baseDamage);
    s.score += scoreGain;
    s.timeLeft = Math.min(60, s.timeLeft + timeBonus);

    // Audio & Haptics
    if (quality === 'perfect') {
      sounds.playTargetSmash();
      sounds.playBlockStack(s.combo + 2);
      setShakeIntensity(12);
      setTimeout(() => setShakeIntensity(0), 180);
    } else if (quality === 'great') {
      sounds.playTargetSmash();
      setShakeIntensity(6);
      setTimeout(() => setShakeIntensity(0), 120);
    } else if (quality === 'good') {
      sounds.playLaserShot();
      setShakeIntensity(3);
      setTimeout(() => setShakeIntensity(0), 80);
    } else {
      sounds.playTap();
    }

    // Combo handling
    if (quality === 'perfect' || quality === 'great') {
      s.combo += 1;
    } else if (quality === 'miss') {
      s.combo = 0;
    }

    // Fury handling
    if (!s.isFuryActive) {
      s.furyMeter = Math.min(100, s.furyMeter + furyGain);
      if (s.furyMeter >= 100) {
        s.isFuryActive = true;
        s.furyTimer = 5; // 5 seconds of Spirit of the LORD fury!
        sounds.playCelebration();
        addFloatingText('🔥 SPIRIT OF THE LORD ACTIVATED! 🔥', 200, 160, '#f59e0b', 24);
      }
    }

    // Floating text feedback
    const hitY = 220 + Math.random() * 40;
    if (quality === 'perfect') {
      addFloatingText(`⚡ DIVINE CRIT! +${scoreGain}`, 200, hitY, '#fbbf24', 22);
    } else if (quality === 'great') {
      addFloatingText(`💥 GREAT SMASH! +${scoreGain}`, 200, hitY, '#38bdf8', 19);
    } else if (quality === 'good') {
      addFloatingText(`SOLID HIT +${scoreGain}`, 200, hitY, '#a3e635', 16);
    } else {
      addFloatingText(`GLANCING HIT +${scoreGain}`, 200, hitY, '#94a3b8', 14);
    }

    // Spawn rubble & cracks
    const pillarColor = getPillarConfig(s.stage).color;
    spawnRubble(200 + (Math.random() - 0.5) * 60, hitY, quality === 'perfect' ? 18 : 8, pillarColor);
    s.cracks.push(...generateCracks(quality === 'perfect' ? 4 : 2));

    // Check if Pillar Shattered
    if (s.pillarHp <= 0) {
      s.pillarsShattered += 1;
      s.score += 1000 + s.stage * 300;
      s.timeLeft = Math.min(60, s.timeLeft + 10);
      sounds.playExplosion();
      sounds.playCelebration();
      setShakeIntensity(18);
      setTimeout(() => setShakeIntensity(0), 300);

      // Huge explosion rubble
      spawnRubble(200, 220, 45, pillarColor);
      addFloatingText(`🏛️ PILLAR SHATTERED! +${1000 + s.stage * 300}`, 200, 140, '#ffd700', 26);

      // Advance stage
      s.stage += 1;
      const nextConf = getPillarConfig(s.stage);
      s.pillarHp = nextConf.maxHp;
      s.pillarMaxHp = nextConf.maxHp;
      s.cracks = [];
    }

    // Sync React states
    setScore(s.score);
    setPillarsShattered(s.pillarsShattered);
    setStage(s.stage);
    setPillarHp(s.pillarHp);
    setPillarMaxHp(s.pillarMaxHp);
    setCombo(s.combo);
    setFuryMeter(s.furyMeter);
    setIsFuryActive(s.isFuryActive);
    setTimeLeft(Math.ceil(s.timeLeft));
  }, []);

  // Keyboard spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (stateRef.current.gameState === 'idle') {
          startGame();
        } else if (stateRef.current.gameState === 'playing') {
          triggerSmash();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, triggerSmash]);

  // Main Game Loop (Canvas + Oscillating Needle + Timer)
  useEffect(() => {
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const dt = Math.min(0.1, (stamp - lastStamp) / 1000);
      lastStamp = stamp;

      const s = stateRef.current;

      if (s.gameState === 'playing') {
        // Meter oscillation: base speed increases with stage
        const baseSpeed = 1.4 + (s.stage - 1) * 0.15;
        meterPosRef.current += meterDirRef.current * baseSpeed * dt;
        if (meterPosRef.current >= 1) {
          meterPosRef.current = 1;
          meterDirRef.current = -1;
        } else if (meterPosRef.current <= 0) {
          meterPosRef.current = 0;
          meterDirRef.current = 1;
        }

        // Timer decrement
        s.timeLeft -= dt;
        if (s.timeLeft <= 0) {
          s.timeLeft = 0;
          s.gameState = 'gameover';
          setGameState('gameover');
          sounds.playIncorrect();

          const tokensEarned = Math.max(10, Math.floor(s.score / 60) + s.pillarsShattered * 15);
          if (s.score > currentHighScore) {
            setCurrentHighScore(s.score);
          }
          if (onGameOver) {
            onGameOver(s.score, tokensEarned);
          }
        }

        // Fury timer decrement
        if (s.isFuryActive) {
          s.furyTimer -= dt;
          if (s.furyTimer <= 0) {
            s.isFuryActive = false;
            s.furyMeter = 0;
            setIsFuryActive(false);
            setFuryMeter(0);
          }
        }

        setTimeLeft(Math.ceil(s.timeLeft));
      }

      // Draw Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear Canvas
          ctx.clearRect(0, 0, w, h);

          // Temple Background
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#1c1917');
          bgGrad.addColorStop(0.5, '#0c0a09');
          bgGrad.addColorStop(1, '#1c1917');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          // Distant temple background columns
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(40, 40, 24, h - 80);
          ctx.fillRect(w - 64, 40, 24, h - 80);

          // Floor stones
          ctx.fillStyle = '#292524';
          ctx.fillRect(0, h - 70, w, 70);
          ctx.fillStyle = '#44403c';
          ctx.fillRect(0, h - 70, w, 4);

          // Main Pillar Config
          const conf = getPillarConfig(s.stage);
          const pillarX = w / 2 - 45;
          const pillarWidth = 90;
          const pillarTop = 60;
          const pillarBottom = h - 70;
          const pillarHeight = pillarBottom - pillarTop;

          // Capital & Base (Greek/Biblical Doric pediment)
          ctx.fillStyle = conf.accent;
          ctx.fillRect(pillarX - 15, pillarTop - 15, pillarWidth + 30, 16);
          ctx.fillRect(pillarX - 8, pillarTop - 2, pillarWidth + 16, 8);
          ctx.fillRect(pillarX - 15, pillarBottom, pillarWidth + 30, 20);

          // Pillar Shaft Gradient
          const pillarGrad = ctx.createLinearGradient(pillarX, 0, pillarX + pillarWidth, 0);
          pillarGrad.addColorStop(0, conf.accent);
          pillarGrad.addColorStop(0.3, conf.color);
          pillarGrad.addColorStop(0.7, conf.color);
          pillarGrad.addColorStop(1, conf.accent);

          ctx.fillStyle = pillarGrad;
          ctx.fillRect(pillarX, pillarTop, pillarWidth, pillarHeight);

          // Fluting lines
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          for (let f = 1; f <= 5; f++) {
            ctx.fillRect(pillarX + f * (pillarWidth / 6), pillarTop, 3, pillarHeight);
          }

          // Cracks rendering
          ctx.strokeStyle = '#1a1005';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          s.cracks.forEach((c) => {
            ctx.moveTo(c.x1, c.y1);
            ctx.lineTo(c.x2, c.y2);
          });
          ctx.stroke();

          // Holy aura if Fury active
          if (s.isFuryActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 14;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 25;
            ctx.strokeRect(pillarX - 5, pillarTop, pillarWidth + 10, pillarHeight);
            ctx.restore();
          }

          // Samson Push Silhouettes / Arms
          ctx.fillStyle = '#f59e0b';
          // Left hand pushing
          ctx.beginPath();
          ctx.arc(pillarX - 14, h / 2 - 10, 14, 0, Math.PI * 2);
          ctx.fill();
          // Right hand pushing
          ctx.beginPath();
          ctx.arc(pillarX + pillarWidth + 14, h / 2 - 10, 14, 0, Math.PI * 2);
          ctx.fill();

          // Update & draw Rubble Particles
          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // gravity
            p.rotation += p.vRot;
            p.life -= dt * 1.5;

            if (p.life > 0) {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(0, p.life);
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
              ctx.restore();
            }
          });
          particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

          // Update & draw Floating Texts
          floatingTextsRef.current.forEach((t) => {
            t.y += t.vy;
            t.alpha -= dt * 1.2;

            if (t.alpha > 0) {
              ctx.save();
              ctx.font = `bold ${t.size}px system-ui, -apple-system, sans-serif`;
              ctx.fillStyle = t.color;
              ctx.globalAlpha = Math.max(0, t.alpha);
              ctx.textAlign = 'center';
              ctx.shadowColor = '#000000';
              ctx.shadowBlur = 6;
              ctx.fillText(t.text, t.x, t.y);
              ctx.restore();
            }
          });
          floatingTextsRef.current = floatingTextsRef.current.filter((t) => t.alpha > 0);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentHighScore, onGameOver]);

  const currentPillarMeta = getPillarConfig(stage);
  const hpPercent = Math.max(0, Math.min(100, (pillarHp / pillarMaxHp) * 100));

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-stone-950 text-white select-none overflow-hidden relative">
      {/* Top HUD Bar */}
      <div className="shrink-0 bg-stone-900/90 border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              sounds.playTap();
              if (onBack) onBack();
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Arcade Vault</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base">{currentPillarMeta.emoji}</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">{currentPillarMeta.name}</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                Stage {stage}
              </span>
            </div>
            <div className="text-[10px] text-stone-400">Pillars Toppled: {pillarsShattered}</div>
          </div>
        </div>

        {/* Center Timer & Score */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-stone-400">Time Left</div>
            <div className={`text-base sm:text-xl font-black font-mono ${timeLeft <= 8 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
              {timeLeft}s
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-stone-400">Score</div>
            <div className="text-base sm:text-xl font-black text-white font-mono">{score}</div>
          </div>

          {combo > 1 && (
            <div className="px-2 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black animate-bounce flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>{combo}x COMBO</span>
            </div>
          )}
        </div>

        {/* Sound toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSoundMuted(!soundMuted);
              sounds.setEnabled(soundMuted);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300"
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Play Area */}
      <div 
        className="flex-1 relative flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden"
        style={{
          transform: shakeIntensity > 0 ? `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)` : 'none'
        }}
      >
        {/* Pillar Health Bar */}
        <div className="w-full max-w-md mx-auto z-10 shrink-0">
          <div className="flex items-center justify-between text-xs font-black mb-1 px-1">
            <span className="text-stone-300">Pillar Structural Integrity</span>
            <span className={hpPercent < 30 ? 'text-rose-400' : 'text-amber-400'}>
              {pillarHp} / {pillarMaxHp} HP ({Math.round(hpPercent)}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-stone-900 border border-white/10 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : hpPercent > 20
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Divine Fury Charge Bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Spirit of God Fury:
            </span>
            <div className="flex-1 h-2 rounded-full bg-stone-900 border border-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  isFuryActive ? 'bg-gradient-to-r from-amber-400 to-yellow-200 animate-pulse' : 'bg-amber-500'
                }`}
                style={{ width: `${isFuryActive ? 100 : furyMeter}%` }}
              />
            </div>
            {isFuryActive && (
              <span className="text-[10px] font-black text-amber-300 animate-pulse">🔥 ACTIVE (3X CRIT)</span>
            )}
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div 
          onClick={triggerSmash}
          className="relative my-auto flex items-center justify-center cursor-pointer w-full max-w-md h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-stone-950"
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-full object-contain"
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
              <span className="text-5xl mb-2 animate-bounce">🏛️</span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300">Samson's Pillar Smash</h2>
              <p className="text-xs text-stone-300 max-w-xs mt-1 mb-5 leading-relaxed">
                Time the power meter and hit the golden center sweet spot to crumble the Philistine temple columns!
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>START SMASHING (Spacebar)</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Oscillating Rhythm Power Meter & Big Smash Button */}
        {gameState === 'playing' && (
          <div className="w-full max-w-md mx-auto flex flex-col gap-2.5 z-10 shrink-0 pb-2">
            {/* Meter Bar */}
            <div className="relative w-full h-10 rounded-2xl bg-stone-900 border border-white/20 overflow-hidden shadow-inner flex items-center">
              {/* Sweet Spot Zones */}
              <div className="absolute inset-y-0 left-0 w-[30%] bg-stone-800/40" />
              <div className="absolute inset-y-0 left-[30%] w-[15%] bg-blue-500/30 border-r border-blue-400/30" />
              <div className="absolute inset-y-0 left-[45%] w-[10%] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-lg shadow-amber-400/50 border-x-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-black text-stone-950 uppercase tracking-tighter">PERFECT</span>
              </div>
              <div className="absolute inset-y-0 left-[55%] w-[15%] bg-blue-500/30 border-l border-blue-400/30" />
              <div className="absolute inset-y-0 right-0 w-[30%] bg-stone-800/40" />

              {/* Moving Indicator Needle */}
              <div
                className="absolute top-0 bottom-0 w-3 rounded-full bg-white shadow-[0_0_12px_#ffffff] -ml-1.5 transition-transform"
                style={{
                  left: `${meterPosRef.current * 100}%`
                }}
              />
            </div>

            {/* Massive Touch/Click Smash Button */}
            <button
              onClick={triggerSmash}
              className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-base tracking-wider uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border ${
                isFuryActive
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 text-stone-950 border-white shadow-amber-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white border-amber-400/50'
              }`}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{isFuryActive ? 'DIVINE SMASH! (SPACEBAR)' : 'SMASH PILLAR! (SPACEBAR)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="max-w-md w-full bg-stone-900 border border-white/15 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-white">Temple Tremors Settled</h3>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              Samson used all divine strength to topple pagan altars.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-white/10 flex flex-col items-center">
                <span className="text-xs text-stone-400 font-bold uppercase">Final Score</span>
                <span className="text-2xl font-black text-amber-300 mt-0.5">{score}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-white/10 flex flex-col items-center">
                <span className="text-xs text-stone-400 font-bold uppercase">Pillars Toppled</span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5">{pillarsShattered}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold w-full mb-6 flex items-center justify-center gap-2">
              <span className="text-lg">🪙</span>
              <span>Earned +{Math.max(10, Math.floor(score / 60) + pillarsShattered * 15)} Arcade Tokens!</span>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Smash Again</span>
              </button>
              <button
                onClick={onBack}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs active:scale-95 transition-all"
              >
                Vault Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
