import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FighterId, CombatAction, Projectile, HitVfx, KeyBindings, MobileControlsConfig, AiDifficulty } from './types';
import { FIGHTERS, STAGES } from './CatFighterRoster';
import { catAudio } from './CatFighterAudio';
import { ArrowLeft, Volume2, VolumeX, Sliders, Shield, Zap, Sparkles, Award } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface CatFighterGameCanvasProps {
  p1FighterId: FighterId;
  p2FighterId: FighterId;
  isTwoPlayer: boolean;
  difficulty: AiDifficulty;
  stageIndex: number;
  p1Keys: KeyBindings;
  p2Keys: KeyBindings;
  mobileConfig: MobileControlsConfig;
  onOpenControls: () => void;
  onBack: () => void;
  onMatchEnd: (winner: 'p1' | 'p2') => void;
}

interface FighterState {
  id: FighterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  action: CombatAction;
  actionFrame: number;
  actionDuration: number;
  isGrounded: boolean;
  isCrouching: boolean;
  isBlocking: boolean;
  hp: number;
  maxHp: number;
  displayHp: number;
  superMeter: number; // 0 - 100
  comboCount: number;
  comboTimer: number;
  wins: number;
}

export const CatFighterGameCanvas: React.FC<CatFighterGameCanvasProps> = ({
  p1FighterId,
  p2FighterId,
  isTwoPlayer,
  difficulty,
  stageIndex,
  p1Keys,
  p2Keys,
  mobileConfig,
  onOpenControls,
  onBack,
  onMatchEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [roundState, setRoundState] = useState<'intro' | 'fight' | 'ko' | 'round_over' | 'match_end'>('intro');
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchTimer, setMatchTimer] = useState(99);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const [announcementText, setAnnouncementText] = useState<string>('ROUND 1');
  const [crtEffect, setCrtEffect] = useState(true);

  const stage = STAGES[stageIndex % STAGES.length];
  const p1Meta = FIGHTERS[p1FighterId];
  const p2Meta = FIGHTERS[p2FighterId];

  // Core 60fps simulation state
  const stateRef = useRef({
    p1: {
      id: p1FighterId,
      x: 180,
      y: 330,
      vx: 0,
      vy: 0,
      facing: 1 as 1 | -1,
      action: 'idle' as CombatAction,
      actionFrame: 0,
      actionDuration: 0,
      isGrounded: true,
      isCrouching: false,
      isBlocking: false,
      hp: 1000,
      maxHp: 1000,
      displayHp: 1000,
      superMeter: 0,
      comboCount: 0,
      comboTimer: 0,
      wins: 0
    } as FighterState,
    p2: {
      id: p2FighterId,
      x: 540,
      y: 330,
      vx: 0,
      vy: 0,
      facing: -1 as 1 | -1,
      action: 'idle' as CombatAction,
      actionFrame: 0,
      actionDuration: 0,
      isGrounded: true,
      isCrouching: false,
      isBlocking: false,
      hp: 1000,
      maxHp: 1000,
      displayHp: 1000,
      superMeter: 0,
      comboCount: 0,
      comboTimer: 0,
      wins: 0
    } as FighterState,
    projectiles: [] as Projectile[],
    vfx: [] as HitVfx[],
    keysDown: {} as Record<string, boolean>,
    screenShake: 0,
    slowMotion: 0,
    superFreeze: 0,
    timer: 99,
    timerFrames: 0,
    running: true,
    aiCooldown: 0
  });

  const triggerVibration = useCallback(() => {
    if (mobileConfig.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  }, [mobileConfig.haptics]);

  // Execute Fighter Action
  const triggerFighterAction = useCallback((fighterKey: 'p1' | 'p2', act: CombatAction) => {
    const s = stateRef.current;
    const f = fighterKey === 'p1' ? s.p1 : s.p2;
    const meta = fighterKey === 'p1' ? p1Meta : p2Meta;

    if (f.action === 'hit' || f.action === 'knockdown' || f.action === 'victory' || f.action === 'defeat') {
      return;
    }

    if (act === 'light_punch') {
      f.action = 'light_punch';
      f.actionFrame = 0;
      f.actionDuration = 14;
      catAudio.playLightHit();
      triggerVibration();
    } else if (act === 'heavy_punch') {
      f.action = 'heavy_punch';
      f.actionFrame = 0;
      f.actionDuration = 22;
      catAudio.playHeavyHit();
      triggerVibration();
    } else if (act === 'special') {
      f.action = 'special';
      f.actionFrame = 0;
      f.actionDuration = 28;
      catAudio.playSpecialFireball();
      triggerVibration();

      // Launch fighter projectile
      if (meta.specialMove.type === 'projectile') {
        setTimeout(() => {
          s.projectiles.push({
            id: Math.random().toString(),
            owner: fighterKey,
            x: f.x + f.facing * 35,
            y: f.y - 30,
            vx: f.facing * 7.5,
            vy: 0,
            radius: 16,
            color: meta.id === 'akuma_cat' ? '#a855f7' : '#38bdf8',
            glowColor: meta.id === 'akuma_cat' ? '#9333ea' : '#0284c7',
            damage: 130,
            active: true,
            type: meta.id === 'akuma_cat' ? 'dark_hadou' : 'yarn_hadou'
          });
        }, 120);
      }
    } else if (act === 'super_art') {
      if (f.superMeter >= 100) {
        f.superMeter = 0;
        f.action = 'super_art';
        f.actionFrame = 0;
        f.actionDuration = 45;
        s.superFreeze = 20;
        s.screenShake = 15;
        catAudio.playSuperFlash();
        triggerVibration();

        s.vfx.push({
          id: Math.random().toString(),
          x: f.x,
          y: f.y - 40,
          type: 'super_flash',
          color: meta.headbandColor || '#facc15',
          scale: 2.5,
          life: 25,
          maxLife: 25,
          text: 'SUPER ART ACTIVATED!'
        });
      }
    } else if (act === 'jump' && f.isGrounded) {
      f.vy = -13.5;
      f.isGrounded = false;
      f.action = 'jump';
      f.actionFrame = 0;
      f.actionDuration = 40;
    }
  }, [p1Meta, p2Meta, triggerVibration]);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gameKeys = new Set([
        p1Keys.up, p1Keys.down, p1Keys.left, p1Keys.right,
        p1Keys.lightPunch, p1Keys.heavyPunch, p1Keys.special, p1Keys.superArt,
        p2Keys.up, p2Keys.down, p2Keys.left, p2Keys.right,
        p2Keys.lightPunch, p2Keys.heavyPunch, p2Keys.special, p2Keys.superArt,
        'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
      ]);
      if (gameKeys.has(e.code)) {
        e.preventDefault();
      }

      catAudio.resume();

      stateRef.current.keysDown[e.code] = true;

      // P1 Actions
      if (e.code === p1Keys.lightPunch) triggerFighterAction('p1', 'light_punch');
      if (e.code === p1Keys.heavyPunch) triggerFighterAction('p1', 'heavy_punch');
      if (e.code === p1Keys.special) triggerFighterAction('p1', 'special');
      if (e.code === p1Keys.superArt) triggerFighterAction('p1', 'super_art');
      if (e.code === p1Keys.up) triggerFighterAction('p1', 'jump');

      // P2 Actions (if in 2-Player mode)
      if (isTwoPlayer) {
        if (e.code === p2Keys.lightPunch) triggerFighterAction('p2', 'light_punch');
        if (e.code === p2Keys.heavyPunch) triggerFighterAction('p2', 'heavy_punch');
        if (e.code === p2Keys.special) triggerFighterAction('p2', 'special');
        if (e.code === p2Keys.superArt) triggerFighterAction('p2', 'super_art');
        if (e.code === p2Keys.up) triggerFighterAction('p2', 'jump');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keysDown[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [p1Keys, p2Keys, isTwoPlayer, triggerFighterAction]);

  // Round controller
  const startNewRound = useCallback((round: number) => {
    const s = stateRef.current;
    s.p1.x = 180;
    s.p1.y = 330;
    s.p1.vx = 0;
    s.p1.vy = 0;
    s.p1.facing = 1;
    s.p1.action = 'idle';
    s.p1.hp = 1000;
    s.p1.displayHp = 1000;

    s.p2.x = 540;
    s.p2.y = 330;
    s.p2.vx = 0;
    s.p2.vy = 0;
    s.p2.facing = -1;
    s.p2.action = 'idle';
    s.p2.hp = 1000;
    s.p2.displayHp = 1000;

    s.projectiles = [];
    s.vfx = [];
    s.timer = 99;
    s.timerFrames = 0;
    s.running = true;

    setRoundNumber(round);
    setRoundState('intro');
    setAnnouncementText(`ROUND ${round}`);
    catAudio.playFightCall();

    setTimeout(() => {
      setAnnouncementText('FIGHT!');
      setRoundState('fight');
    }, 1200);
  }, []);

  useEffect(() => {
    startNewRound(1);
  }, [startNewRound]);

  // Main 60FPS Fighting Engine Loop
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
      const groundY = 330;

      // Screen Shake
      ctx.save();
      if (s.screenShake > 0) {
        const sx = (Math.random() - 0.5) * s.screenShake;
        const sy = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(sx, sy);
        s.screenShake = Math.max(0, s.screenShake - 0.8);
      }

      // 1. Draw Retro Stage Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, stage.skyGradient[0]);
      skyGrad.addColorStop(0.7, stage.skyGradient[1]);
      skyGrad.addColorStop(1, stage.skyGradient[2] || stage.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Cheering Cats & Props
      ctx.font = '28px sans-serif';
      stage.propsEmoji.forEach((emoji, i) => {
        ctx.fillText(emoji, 60 + i * 140, groundY - 45);
      });

      // Cheering Pixel Cats on Roofs
      stage.bgCats.forEach((cat, i) => {
        const bounce = Math.sin(Date.now() * 0.008 + i * 1.5) * 6;
        ctx.fillText(cat, 120 + i * 220, groundY - 80 + bounce);
      });

      // Ground Floor with Dojo Planks / Street Asphalt
      ctx.fillStyle = stage.groundColor;
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, groundY, width, 4);

      // Match Simulation Updates
      if (roundState === 'fight' && s.running) {
        s.timerFrames++;
        if (s.timerFrames % 60 === 0 && s.timer > 0) {
          s.timer--;
          setMatchTimer(s.timer);
        }

        // P1 Movement & Facing
        const keys = s.keysDown;
        const p1 = s.p1;
        const p2 = s.p2;

        p1.facing = p1.x < p2.x ? 1 : -1;
        p2.facing = p2.x < p1.x ? 1 : -1;

        // P1 Input Handling
        if (p1.action === 'idle' || p1.action === 'walk_fwd' || p1.action === 'walk_back' || p1.action === 'jump') {
          if (keys[p1Keys.left]) {
            p1.vx = -4.5;
            p1.action = p1.facing === 1 ? 'walk_back' : 'walk_fwd';
            p1.isBlocking = p1.facing === 1; // Auto block retreating
          } else if (keys[p1Keys.right]) {
            p1.vx = 4.5;
            p1.action = p1.facing === 1 ? 'walk_fwd' : 'walk_back';
            p1.isBlocking = p1.facing === -1;
          } else {
            p1.vx = 0;
            if (p1.isGrounded) p1.action = 'idle';
            p1.isBlocking = !!keys[p1Keys.block];
          }

          if (keys[p1Keys.down] && p1.isGrounded) {
            p1.isCrouching = true;
            p1.vx = 0;
            p1.action = 'crouch';
          } else {
            p1.isCrouching = false;
          }
        }

        // P2 AI Input Handling (if not 2P)
        if (!isTwoPlayer) {
          s.aiCooldown--;
          if (s.aiCooldown <= 0) {
            const dist = Math.abs(p2.x - p1.x);
            const aiAggression = difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.85;

            if (dist > 260) {
              // Walk toward player or throw special
              if (Math.random() < 0.4 * aiAggression) {
                triggerFighterAction('p2', 'special');
                s.aiCooldown = 45;
              } else {
                p2.vx = p2.facing * 3.8;
                p2.action = 'walk_fwd';
              }
            } else if (dist < 90) {
              // Close range brawling: punch or heavy
              const roll = Math.random();
              if (roll < 0.45 * aiAggression) {
                triggerFighterAction('p2', 'light_punch');
              } else if (roll < 0.8 * aiAggression) {
                triggerFighterAction('p2', 'heavy_punch');
              } else if (p2.superMeter >= 100) {
                triggerFighterAction('p2', 'super_art');
              } else {
                p2.isBlocking = true;
              }
              s.aiCooldown = 25;
            } else {
              // Mid range
              if (Math.random() < 0.3) {
                triggerFighterAction('p2', 'jump');
              }
              s.aiCooldown = 20;
            }
          }
        }

        // Apply Physics & Arena Boundaries
        [p1, p2].forEach((f) => {
          f.x += f.vx;
          f.vy += 0.65; // Gravity
          f.y += f.vy;

          if (f.y >= groundY) {
            f.y = groundY;
            f.vy = 0;
            f.isGrounded = true;
          }

          f.x = Math.max(40, Math.min(width - 40, f.x));

          // Action duration countdown
          if (f.actionDuration > 0) {
            f.actionFrame++;
            if (f.actionFrame >= f.actionDuration) {
              f.action = 'idle';
              f.actionDuration = 0;
            }
          }

          // Smooth Display HP Bar
          f.displayHp += (f.hp - f.displayHp) * 0.08;
        });

        // Hitbox Collision Detection (Melee Strikes)
        const checkHit = (attacker: FighterState, defender: FighterState, metaAttacker: typeof p1Meta) => {
          const dist = Math.abs(attacker.x - defender.x);
          const inRange = dist < 75 && Math.abs(attacker.y - defender.y) < 50;

          if (inRange && (attacker.action === 'light_punch' || attacker.action === 'heavy_punch' || attacker.action === 'super_art')) {
            if (attacker.actionFrame === 5) {
              const isSuper = attacker.action === 'super_art';
              const isHeavy = attacker.action === 'heavy_punch';
              let baseDamage = isSuper ? 320 : isHeavy ? 110 : 45;

              if (defender.isBlocking) {
                baseDamage *= 0.15; // 85% block reduction
                catAudio.playBlock();
                s.vfx.push({
                  id: Math.random().toString(),
                  x: (attacker.x + defender.x) / 2,
                  y: defender.y - 25,
                  type: 'block',
                  color: '#60a5fa',
                  scale: 1.2,
                  life: 12,
                  maxLife: 12,
                  text: 'BLOCKED!'
                });
              } else {
                defender.action = isHeavy || isSuper ? 'knockdown' : 'hit';
                defender.actionDuration = isSuper ? 30 : isHeavy ? 24 : 14;
                defender.actionFrame = 0;
                defender.vx = attacker.facing * (isSuper ? 12 : isHeavy ? 8 : 4);
                if (isHeavy || isSuper) defender.vy = -6;

                s.screenShake = isSuper ? 18 : isHeavy ? 10 : 4;
                if (isHeavy || isSuper) catAudio.playHeavyHit();
                else catAudio.playLightHit();

                attacker.comboCount++;
                attacker.superMeter = Math.min(100, attacker.superMeter + 15);
                defender.superMeter = Math.min(100, defender.superMeter + 10);

                s.vfx.push({
                  id: Math.random().toString(),
                  x: defender.x,
                  y: defender.y - 30,
                  type: 'spark',
                  color: metaAttacker.headbandColor || '#f59e0b',
                  scale: isSuper ? 2.5 : isHeavy ? 1.6 : 1.0,
                  life: 15,
                  maxLife: 15,
                  text: attacker.comboCount > 1 ? `${attacker.comboCount} HITS!` : undefined
                });
              }

              defender.hp = Math.max(0, defender.hp - baseDamage);
            }
          }
        };

        checkHit(p1, p2, p1Meta);
        checkHit(p2, p1, p2Meta);

        // Projectile Updates & Collision
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const pr = s.projectiles[i];
          pr.x += pr.vx;

          // Out of bounds
          if (pr.x < 0 || pr.x > width) {
            s.projectiles.splice(i, 1);
            continue;
          }

          const target = pr.owner === 'p1' ? p2 : p1;
          const hitTarget = Math.abs(pr.x - target.x) < 35 && Math.abs(pr.y - (target.y - 25)) < 40;

          if (hitTarget && pr.active) {
            pr.active = false;
            let dmg = pr.damage;

            if (target.isBlocking) {
              dmg *= 0.2;
              catAudio.playBlock();
            } else {
              target.action = 'hit';
              target.actionDuration = 18;
              target.actionFrame = 0;
              target.vx = pr.vx > 0 ? 6 : -6;
              s.screenShake = 8;
              catAudio.playHeavyHit();
            }

            target.hp = Math.max(0, target.hp - dmg);

            s.vfx.push({
              id: Math.random().toString(),
              x: pr.x,
              y: pr.y,
              type: 'spark',
              color: pr.color,
              scale: 1.8,
              life: 16,
              maxLife: 16
            });

            s.projectiles.splice(i, 1);
          }
        }

        // Check Round KO
        if (p1.hp <= 0 || p2.hp <= 0 || s.timer <= 0) {
          s.running = false;
          setRoundState('ko');
          catAudio.playKo();
          s.screenShake = 16;

          const winner = p1.hp > p2.hp ? 'p1' : 'p2';
          if (winner === 'p1') {
            s.p1.wins++;
            setP1Wins(s.p1.wins);
            s.p1.action = 'victory';
            s.p2.action = 'defeat';
            setAnnouncementText('P1 K.O. VICTORY!');
          } else {
            s.p2.wins++;
            setP2Wins(s.p2.wins);
            s.p2.action = 'victory';
            s.p1.action = 'defeat';
            setAnnouncementText('P2 K.O. VICTORY!');
          }

          setTimeout(() => {
            if (s.p1.wins >= 2 || s.p2.wins >= 2) {
              setRoundState('match_end');
              catAudio.playVictory();
              if (onMatchEnd) onMatchEnd(winner);
            } else {
              startNewRound(roundNumber + 1);
            }
          }, 2400);
        }
      }

      // 2. Render Animated Cat Fighters
      const drawCatFighter = (f: FighterState, meta: typeof p1Meta) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.facing * 1.25, 1.25); // Flip horizontally depending on facing

        // Shadow under cat
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const crouchingOffset = f.isCrouching ? 14 : 0;
        const attackReach = (f.action === 'light_punch' || f.action === 'heavy_punch') ? Math.sin((f.actionFrame / f.actionDuration) * Math.PI) * 22 : 0;
        const jumpOffset = !f.isGrounded ? -6 : 0;

        // Tail (Swishing)
        const tailWiggle = Math.sin(Date.now() * 0.01) * 8;
        ctx.strokeStyle = meta.stripeColor || meta.furColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-16, -18 + crouchingOffset);
        ctx.quadraticCurveTo(-34 + tailWiggle, -36, -26, -48 + tailWiggle);
        ctx.stroke();

        // Hind Legs & Feet
        ctx.fillStyle = meta.furColor;
        ctx.beginPath();
        ctx.roundRect(-18, -12 + crouchingOffset, 12, 12, 4);
        ctx.roundRect(-2, -12 + crouchingOffset, 12, 12, 4);
        ctx.fill();

        // Torso / Body (Martial Arts Robe / Fur)
        ctx.fillStyle = meta.furColor;
        ctx.beginPath();
        ctx.roundRect(-16, -38 + crouchingOffset, 32, 28, 8);
        ctx.fill();

        // Fur Stripes
        ctx.strokeStyle = meta.stripeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-8, -32 + crouchingOffset);
        ctx.lineTo(8, -32 + crouchingOffset);
        ctx.moveTo(-10, -24 + crouchingOffset);
        ctx.lineTo(6, -24 + crouchingOffset);
        ctx.stroke();

        // Front Paws / Claws (Punching Outward)
        ctx.fillStyle = meta.accentColor;
        ctx.beginPath();
        ctx.roundRect(-4 + attackReach, -28 + crouchingOffset, 18, 10, 5);
        ctx.fill();

        // Extended Sharp Claws on Hit
        if (attackReach > 8) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(14 + attackReach, -26 + crouchingOffset);
          ctx.lineTo(22 + attackReach, -28 + crouchingOffset);
          ctx.moveTo(14 + attackReach, -23 + crouchingOffset);
          ctx.lineTo(23 + attackReach, -23 + crouchingOffset);
          ctx.stroke();
        }

        // Cat Head
        ctx.fillStyle = meta.furColor;
        ctx.beginPath();
        ctx.arc(0, -48 + crouchingOffset + jumpOffset, 16, 0, Math.PI * 2);
        ctx.fill();

        // Cat Ears
        ctx.fillStyle = meta.furColor;
        ctx.beginPath();
        ctx.moveTo(-14, -58 + crouchingOffset);
        ctx.lineTo(-6, -68 + crouchingOffset);
        ctx.lineTo(-2, -54 + crouchingOffset);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(14, -58 + crouchingOffset);
        ctx.lineTo(6, -68 + crouchingOffset);
        ctx.lineTo(2, -54 + crouchingOffset);
        ctx.closePath();
        ctx.fill();

        // Inner Pink Ears
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(-11, -57 + crouchingOffset);
        ctx.lineTo(-6, -64 + crouchingOffset);
        ctx.lineTo(-4, -54 + crouchingOffset);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(11, -57 + crouchingOffset);
        ctx.lineTo(6, -64 + crouchingOffset);
        ctx.lineTo(4, -54 + crouchingOffset);
        ctx.fill();

        // Headband (Street Fighter style!)
        if (meta.headbandColor) {
          ctx.fillStyle = meta.headbandColor;
          ctx.fillRect(-15, -53 + crouchingOffset, 30, 5);
          // Headband knot ribbon trailing
          ctx.beginPath();
          ctx.moveTo(-15, -51 + crouchingOffset);
          ctx.lineTo(-26 + tailWiggle * 0.5, -46 + crouchingOffset);
          ctx.lineTo(-24 + tailWiggle * 0.5, -54 + crouchingOffset);
          ctx.fill();
        }

        // Eyes (Angry Fighter Slits)
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(5, -48 + crouchingOffset, 4, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(6, -48 + crouchingOffset, 1.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, -44 + crouchingOffset);
        ctx.lineTo(19, -46 + crouchingOffset);
        ctx.moveTo(8, -42 + crouchingOffset);
        ctx.lineTo(19, -41 + crouchingOffset);
        ctx.stroke();

        ctx.restore();
      };

      drawCatFighter(s.p1, p1Meta);
      drawCatFighter(s.p2, p2Meta);

      // 3. Render Projectiles (Yarn Hadoukens)
      s.projectiles.forEach((pr) => {
        ctx.save();
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.glowColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fill();

        // Spiraling Yarn / Energy Core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius * 0.6, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Render Hit VFX & Damage Numbers
      for (let i = s.vfx.length - 1; i >= 0; i--) {
        const fx = s.vfx[i];
        fx.life--;

        if (fx.life <= 0) {
          s.vfx.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(fx.x, fx.y);
        ctx.scale(fx.scale, fx.scale);
        ctx.fillStyle = fx.color;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 12;

        if (fx.type === 'spark') {
          for (let j = 0; j < 6; j++) {
            const ang = (j / 6) * Math.PI * 2;
            const len = (1 - fx.life / fx.maxLife) * 22;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
            ctx.strokeStyle = fx.color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }

        if (fx.text) {
          ctx.font = 'black 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText(fx.text, 0, -20 - (fx.maxLife - fx.life) * 1.5);
        }

        ctx.restore();
      }

      // CRT Scanline Overlay
      if (crtEffect) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [roundState, roundNumber, stage, p1Meta, p2Meta, p1Keys, p2Keys, isTwoPlayer, difficulty, crtEffect, startNewRound, onMatchEnd]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-4xl mx-auto select-none">
      {/* Top Street Fighter HUD Bar */}
      <div className="w-full flex items-center justify-between mb-2 text-stone-200">
        <button
          onClick={() => {
            sounds.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Fighter Select</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCrtEffect(!crtEffect)}
            className={`px-2.5 py-1 rounded-lg font-black text-[10px] tracking-wider uppercase border transition-all ${
              crtEffect ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/10 text-stone-400 border-white/10'
            }`}
          >
            CRT Scanlines
          </button>

          <button
            onClick={onOpenControls}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Controls</span>
          </button>

          <button
            onClick={() => {
              catAudio.muted = !soundMuted;
              setSoundMuted(!soundMuted);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Street Fighter Arena Viewport (Authentic 720:380 widescreen arcade proportions) */}
      <div className="relative w-full max-w-4xl mx-auto aspect-[720/380] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/40 bg-stone-950 flex flex-col justify-between touch-none select-none">
        <canvas
          ref={canvasRef}
          width={720}
          height={380}
          className="w-full h-full block"
        />

        {/* Live Street Fighter Overhead HUD */}
        <div className="absolute top-2 left-0 right-0 px-4 flex justify-between items-start pointer-events-none z-10">
          {/* Player 1 Health Bar & Super Meter */}
          <div className="flex flex-col gap-1 w-2/5">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs sm:text-sm text-amber-300 drop-shadow">{p1Meta.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} className={`text-xs ${i < p1Wins ? 'opacity-100' : 'opacity-30'}`}>🔴</span>
                ))}
              </div>
            </div>
            {/* HP Bar */}
            <div className="w-full h-4 bg-stone-950 rounded border-2 border-white/40 overflow-hidden shadow-lg relative">
              <div
                className="h-full bg-red-600 absolute right-0 transition-all duration-300"
                style={{ width: `${(stateRef.current.p1.displayHp / stateRef.current.p1.maxHp) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-green-500 absolute right-0"
                style={{ width: `${(stateRef.current.p1.hp / stateRef.current.p1.maxHp) * 100}%` }}
              />
            </div>
            {/* Super Meter */}
            <div className="w-3/4 h-2 bg-stone-950 rounded border border-blue-400/50 overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-300"
                style={{ width: `${stateRef.current.p1.superMeter}%` }}
              />
            </div>
          </div>

          {/* Central 90s Arcade Timer */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-10 rounded-xl bg-stone-950/90 border-2 border-amber-400 text-amber-300 font-black text-xl flex items-center justify-center shadow-2xl">
              {matchTimer}
            </div>
          </div>

          {/* Player 2 Health Bar & Super Meter */}
          <div className="flex flex-col gap-1 w-2/5">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} className={`text-xs ${i < p2Wins ? 'opacity-100' : 'opacity-30'}`}>🔴</span>
                ))}
              </div>
              <span className="font-black text-xs sm:text-sm text-blue-300 drop-shadow">{p2Meta.name}</span>
            </div>
            {/* HP Bar */}
            <div className="w-full h-4 bg-stone-950 rounded border-2 border-white/40 overflow-hidden shadow-lg relative">
              <div
                className="h-full bg-red-600 absolute left-0 transition-all duration-300"
                style={{ width: `${(stateRef.current.p2.displayHp / stateRef.current.p2.maxHp) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-yellow-400 absolute left-0"
                style={{ width: `${(stateRef.current.p2.hp / stateRef.current.p2.maxHp) * 100}%` }}
              />
            </div>
            {/* Super Meter */}
            <div className="w-3/4 h-2 bg-stone-950 rounded border border-blue-400/50 overflow-hidden mt-0.5 self-end">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-300"
                style={{ width: `${stateRef.current.p2.superMeter}%` }}
              />
            </div>
          </div>
        </div>

        {/* Central Fight / KO Banner Overlay */}
        {(roundState === 'intro' || roundState === 'ko') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="px-8 py-3 bg-black/80 backdrop-blur-md rounded-2xl border-2 border-amber-400 text-amber-300 font-black text-3xl sm:text-5xl tracking-widest shadow-2xl animate-pulse">
              {announcementText}
            </div>
          </div>
        )}

        {/* Virtual On-Screen Touch Arcade Buttons (Mobile friendly) */}
        <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-between items-end pointer-events-auto z-20 md:hidden">
          {/* Virtual D-Pad */}
          <div className="grid grid-cols-3 gap-1 w-32 h-32" style={{ opacity: mobileConfig.opacity, transform: `scale(${mobileConfig.buttonScale})` }}>
            <div />
            <button
              onTouchStart={() => triggerFighterAction('p1', 'jump')}
              className="bg-white/25 active:bg-amber-500/60 text-white rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
            >
              ⬆️
            </button>
            <div />
            <button
              onTouchStart={() => { stateRef.current.keysDown[p1Keys.left] = true; }}
              onTouchEnd={() => { stateRef.current.keysDown[p1Keys.left] = false; }}
              className="bg-white/25 active:bg-amber-500/60 text-white rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
            >
              ⬅️
            </button>
            <button
              onTouchStart={() => { stateRef.current.keysDown[p1Keys.down] = true; }}
              onTouchEnd={() => { stateRef.current.keysDown[p1Keys.down] = false; }}
              className="bg-white/25 active:bg-amber-500/60 text-white rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
            >
              ⬇️
            </button>
            <button
              onTouchStart={() => { stateRef.current.keysDown[p1Keys.right] = true; }}
              onTouchEnd={() => { stateRef.current.keysDown[p1Keys.right] = false; }}
              className="bg-white/25 active:bg-amber-500/60 text-white rounded-xl flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
            >
              ➡️
            </button>
          </div>

          {/* Action Buttons: PUNCH, KICK, SPECIAL, SUPER */}
          <div className="grid grid-cols-2 gap-2" style={{ opacity: mobileConfig.opacity, transform: `scale(${mobileConfig.buttonScale})` }}>
            <button
              onTouchStart={() => triggerFighterAction('p1', 'light_punch')}
              className="w-13 h-13 rounded-2xl bg-amber-500/90 text-stone-950 font-black text-xs shadow-lg flex flex-col items-center justify-center active:scale-90"
            >
              <span>🟡</span>
              <span className="text-[9px]">CLAW</span>
            </button>

            <button
              onTouchStart={() => triggerFighterAction('p1', 'heavy_punch')}
              className="w-13 h-13 rounded-2xl bg-rose-600/90 text-white font-black text-xs shadow-lg flex flex-col items-center justify-center active:scale-90"
            >
              <span>🔴</span>
              <span className="text-[9px]">SMASH</span>
            </button>

            <button
              onTouchStart={() => triggerFighterAction('p1', 'special')}
              className="w-13 h-13 rounded-2xl bg-blue-600/90 text-white font-black text-xs shadow-lg flex flex-col items-center justify-center active:scale-90"
            >
              <span>🔵</span>
              <span className="text-[9px]">HADOU</span>
            </button>

            <button
              onTouchStart={() => triggerFighterAction('p1', 'super_art')}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 font-black text-xs shadow-lg flex flex-col items-center justify-center active:scale-90 animate-pulse"
            >
              <span>⚡</span>
              <span className="text-[9px]">SUPER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
