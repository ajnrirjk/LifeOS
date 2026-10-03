import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../../services/soundEffects';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Sword,
  Scroll,
  Crown,
  Trophy,
  Flame,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  BookOpen,
  ChevronRight,
  Package,
  Layers,
  Sparkle,
  Plus,
  Lock
} from 'lucide-react';

interface PilgrimGoGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

// Equipment Types & Database
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'sacred';
export type ItemSlot = 'weapon' | 'armor' | 'ring' | 'amulet' | 'mount' | 'pet';

export interface Equipment {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  level: number;
  emoji: string;
  atk: number;
  hp: number;
  def: number;
  critRate?: number;
  specialTrait: string;
  priceGold?: number;
  priceGems?: number;
}

export const SHOP_ITEMS: Equipment[] = [
  { id: 'shepherd_staff', name: "Shepherd's Crook", slot: 'weapon', rarity: 'common', level: 1, emoji: '🦯', atk: 25, hp: 40, def: 5, specialTrait: '+5% Healing', priceGold: 120 },
  { id: 'david_sling', name: "David's Slingshot", slot: 'weapon', rarity: 'rare', level: 1, emoji: '🪨', atk: 55, hp: 80, def: 10, critRate: 15, specialTrait: '200% First Turn Strike', priceGold: 450 },
  { id: 'sword_gideon', name: 'Sword of Gideon', slot: 'weapon', rarity: 'epic', level: 1, emoji: '⚔️', atk: 120, hp: 150, def: 25, critRate: 25, specialTrait: '+35% Holy Slash DMG', priceGold: 1200 },
  { id: 'staff_moses', name: 'Staff of Moses', slot: 'weapon', rarity: 'sacred', level: 1, emoji: '⚡', atk: 280, hp: 350, def: 60, critRate: 35, specialTrait: 'Calls Red Sea Lightning', priceGems: 80 },

  { id: 'linen_tunic', name: 'Galilee Linen Robe', slot: 'armor', rarity: 'common', level: 1, emoji: '🥋', atk: 5, hp: 110, def: 18, specialTrait: '+10% Dodge', priceGold: 100 },
  { id: 'breastplate_faith', name: 'Breastplate of Faith', slot: 'armor', rarity: 'rare', level: 1, emoji: '🛡️', atk: 15, hp: 260, def: 45, specialTrait: 'Blocks 20% Damage', priceGold: 500 },
  { id: 'robe_righteousness', name: 'Robe of Righteousness', slot: 'armor', rarity: 'epic', level: 1, emoji: '🥻', atk: 40, hp: 580, def: 95, specialTrait: '+25% Max HP Shield', priceGold: 1400 },
  { id: 'armor_light', name: 'Celestial Armor of Light', slot: 'armor', rarity: 'sacred', level: 1, emoji: '✨', atk: 90, hp: 1200, def: 210, specialTrait: 'Immunity to Lethal Blows', priceGems: 100 },

  { id: 'olive_ring', name: 'Mount of Olives Ring', slot: 'ring', rarity: 'common', level: 1, emoji: '💍', atk: 15, hp: 50, def: 8, specialTrait: '+10% Gold Drops', priceGold: 150 },
  { id: 'ark_ring', name: 'Covenant Seal Ring', slot: 'ring', rarity: 'rare', level: 1, emoji: '💫', atk: 45, hp: 120, def: 20, critRate: 10, specialTrait: '+15% Critical Chance', priceGold: 600 },
  { id: 'solomon_ring', name: 'Ring of Solomon', slot: 'ring', rarity: 'legendary', level: 1, emoji: '👑', atk: 110, hp: 320, def: 55, specialTrait: '+30% Skill Trigger Rate', priceGold: 2200 },

  { id: 'mustard_seed', name: 'Mustard Seed Amulet', slot: 'amulet', rarity: 'rare', level: 1, emoji: '🌱', atk: 30, hp: 180, def: 25, specialTrait: 'Boosts Manna by 25%', priceGold: 550 },
  { id: 'dove_pendant', name: 'Holy Spirit Pendant', slot: 'amulet', rarity: 'epic', level: 1, emoji: '🕊️', atk: 75, hp: 420, def: 60, specialTrait: 'Regenerates 5% HP per Turn', priceGold: 1600 },

  { id: 'gentle_donkey', name: 'Faithful Colt Donkey', slot: 'mount', rarity: 'rare', level: 1, emoji: '🫏', atk: 35, hp: 200, def: 30, specialTrait: '+20% Travel Speed', priceGold: 700 },
  { id: 'lion_judah', name: 'Lion of Judah', slot: 'mount', rarity: 'sacred', level: 1, emoji: '🦁', atk: 180, hp: 650, def: 90, specialTrait: 'Roars every 3 turns for 400 DMG', priceGems: 150 },

  { id: 'peace_dove_pet', name: 'Peace Dove', slot: 'pet', rarity: 'rare', level: 1, emoji: '🕊️', atk: 20, hp: 150, def: 15, specialTrait: 'Heals 80 HP after combat', priceGold: 400 },
  { id: 'lamb_god_pet', name: 'Pure Lamb', slot: 'pet', rarity: 'legendary', level: 1, emoji: '🐑', atk: 60, hp: 450, def: 50, specialTrait: 'Grants +35% EXP & Tokens', priceGold: 2000 }
];

export interface SkillChoice {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Sacred';
  color: string;
  description: string;
  buffType: 'atk' | 'def' | 'hp' | 'lifesteal' | 'lightning' | 'shield' | 'crit';
  value: number;
}

const SKILL_POOL: SkillChoice[] = [
  { id: 'royal_crown', name: 'Crown of Glory', tagline: 'All Attributes Boost', emoji: '👑', rarity: 'Epic', color: 'from-amber-500 to-yellow-400', description: 'ATK +35%, DEF +25%, Max HP +30%', buffType: 'atk', value: 35 },
  { id: 'holy_lightning', name: "Elijah's Thunderbolt", tagline: 'Heavenly Smite', emoji: '⚡', rarity: 'Sacred', color: 'from-cyan-500 to-blue-500', description: 'Strikes enemies for 250% Holy ATK every 2 turns', buffType: 'lightning', value: 250 },
  { id: 'armor_god', name: 'Armor of God', tagline: 'Divine Barrier', emoji: '🛡️', rarity: 'Rare', color: 'from-blue-600 to-indigo-600', description: 'Reflects 30% incoming damage & gains 200 Shield', buffType: 'shield', value: 200 },
  { id: 'manna_lifesteal', name: 'Living Water Lifesteal', tagline: 'Renewal in Battle', emoji: '🕊️', rarity: 'Rare', color: 'from-emerald-500 to-teal-500', description: 'Restores 30% of all damage dealt as HP', buffType: 'lifesteal', value: 30 },
  { id: 'zealot_strike', name: 'Zeal of David', tagline: 'Unstoppable Momentum', emoji: '⚔️', rarity: 'Epic', color: 'from-rose-500 to-red-600', description: '+40% Critical Strike Rate & +50% Crit Damage', buffType: 'crit', value: 40 },
  { id: 'jericho_shout', name: 'Trumpet of Jericho', tagline: 'Wall Breaker', emoji: '🎺', rarity: 'Rare', color: 'from-orange-500 to-amber-500', description: 'Reduces enemy Defense by 50% permanently', buffType: 'def', value: 50 },
  { id: 'five_loaves', name: 'Multiplication Miracle', tagline: 'Abundant Grace', emoji: '🍞', rarity: 'Common', color: 'from-yellow-500 to-amber-600', description: 'Earn +50% Gold and restore 15% Max HP each day', buffType: 'hp', value: 15 },
  { id: 'parting_waters', name: 'Parting the Seas', tagline: 'Sweeping Wave', emoji: '🌊', rarity: 'Sacred', color: 'from-sky-500 to-cyan-600', description: 'AoE holy wave hits all foes for 300% Holy ATK', buffType: 'atk', value: 60 }
];

export interface WorldTheme {
  id: number;
  name: string;
  sub: string;
  skyGradient: [string, string];
  groundColor: string;
  treeColor: string;
  enemyTypes: Array<{ name: string; emoji: string; hpMult: number; atkMult: number }>;
}

const WORLDS: WorldTheme[] = [
  {
    id: 1,
    name: '1. Shores of Galilee',
    sub: 'Green pastures & calm waters',
    skyGradient: ['#38bdf8', '#bae6fd'],
    groundColor: '#4ade80',
    treeColor: '#15803d',
    enemyTypes: [
      { name: 'Playful Galilee Slime', emoji: '🟢', hpMult: 1, atkMult: 1 },
      { name: 'Lake Fisherman Bandit', emoji: '🎣', hpMult: 1.3, atkMult: 1.2 },
      { name: 'Roman Guard Scout', emoji: '🛡️', hpMult: 1.8, atkMult: 1.5 },
      { name: 'Desert Jackal', emoji: '🐺', hpMult: 1.5, atkMult: 1.4 }
    ]
  },
  {
    id: 2,
    name: '2. Valley of Elah',
    sub: 'Where stones defeat giants',
    skyGradient: ['#f59e0b', '#fed7aa'],
    groundColor: '#ca8a04',
    treeColor: '#78350f',
    enemyTypes: [
      { name: 'Canyon Scorpion', emoji: '🦂', hpMult: 2.2, atkMult: 2.0 },
      { name: 'Philistine Warrior', emoji: '🗡️', hpMult: 2.8, atkMult: 2.4 },
      { name: 'Giant Vanguard', emoji: '👹', hpMult: 4.5, atkMult: 3.2 }
    ]
  },
  {
    id: 3,
    name: '3. Wilderness of Temptation',
    sub: 'Fasting in the desert dunes',
    skyGradient: ['#7c2d12', '#fdba74'],
    groundColor: '#ea580c',
    treeColor: '#7c2d12',
    enemyTypes: [
      { name: 'Desert Shadow Spirit', emoji: '👥', hpMult: 3.8, atkMult: 3.5 },
      { name: 'Fiery Dart Phantom', emoji: '🔥', hpMult: 4.2, atkMult: 4.0 },
      { name: 'Dragon of Babylon Boss', emoji: '🐉', hpMult: 8.0, atkMult: 5.5 }
    ]
  },
  {
    id: 4,
    name: '4. Golden Gates of Jerusalem',
    sub: 'Holy temple city of victory',
    skyGradient: ['#a855f7', '#fbcfe8'],
    groundColor: '#eab308',
    treeColor: '#ca8a04',
    enemyTypes: [
      { name: 'Temple Inquisitor', emoji: '📜', hpMult: 5.5, atkMult: 5.0 },
      { name: 'Centurion Legatus', emoji: '⚔️', hpMult: 6.8, atkMult: 6.0 },
      { name: 'Celestial Gatekeeper', emoji: '👼', hpMult: 12.0, atkMult: 8.0 }
    ]
  }
];

export const PilgrimGoGame: React.FC<PilgrimGoGameProps> = ({ onGameOver, onBack, highScore }) => {
  // Navigation Tabs (Like Capybara Go bottom bar)
  const [activeTab, setActiveTab] = useState<'adventure' | 'equip' | 'shop' | 'talents'>('adventure');

  // Player Currencies & Global Progress
  const [gold, setGold] = useState(() => {
    try { return Number(localStorage.getItem('jesus_go_gold')) || 650; } catch { return 650; }
  });
  const [gems, setGems] = useState(() => {
    try { return Number(localStorage.getItem('jesus_go_gems')) || 45; } catch { return 45; }
  });
  const [energy, setEnergy] = useState(30);
  const [maxEnergy] = useState(30);
  const [longestSurvived, setLongestSurvived] = useState(() => {
    try { return Number(localStorage.getItem('jesus_go_max_day')) || 12; } catch { return 12; }
  });

  // Equipped Gear Inventory
  const [equipped, setEquipped] = useState<Record<ItemSlot, Equipment | null>>({
    weapon: SHOP_ITEMS[0],
    armor: SHOP_ITEMS[4],
    ring: SHOP_ITEMS[8],
    amulet: null,
    mount: SHOP_ITEMS[12],
    pet: SHOP_ITEMS[14]
  });

  const [inventory, setInventory] = useState<Equipment[]>([
    SHOP_ITEMS[0],
    SHOP_ITEMS[4],
    SHOP_ITEMS[8],
    SHOP_ITEMS[12],
    SHOP_ITEMS[14]
  ]);

  // Persistent Save
  useEffect(() => {
    try {
      localStorage.setItem('jesus_go_gold', String(gold));
      localStorage.setItem('jesus_go_gems', String(gems));
      localStorage.setItem('jesus_go_max_day', String(longestSurvived));
    } catch {}
  }, [gold, gems, longestSurvived]);

  // Current In-Run Adventure State
  const [inRun, setInRun] = useState(false);
  const [worldIndex, setWorldIndex] = useState(0);
  const [day, setDay] = useState(1);
  const [autoWalk, setAutoWalk] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 2>(1);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [storyLogs, setStoryLogs] = useState<Array<{ day: number; text: string; type: 'story' | 'battle' | 'victory' | 'skill' }>>([]);

  // In-Run Hero Stats
  const [heroLevel, setHeroLevel] = useState(1);
  const [heroExp, setHeroExp] = useState(0);
  const [heroMaxExp, setHeroMaxExp] = useState(50);
  const [heroHp, setHeroHp] = useState(500);
  const [heroMaxHp, setHeroMaxHp] = useState(500);
  const [heroShield, setHeroShield] = useState(0);

  // In-Run Chosen Skills
  const [learnedSkills, setLearnedSkills] = useState<SkillChoice[]>([]);
  const [showSkillSelect, setShowSkillSelect] = useState(false);
  const [offeredSkills, setOfferedSkills] = useState<SkillChoice[]>([]);
  const [skillRefreshes, setSkillRefreshes] = useState(1);

  // In-Run Combat / Event Status
  const [runStage, setRunStage] = useState<'walking' | 'event' | 'battling' | 'victory' | 'gameover'>('walking');
  const [eventText, setEventText] = useState('Jesus begins walking across the shores of Galilee...');
  const [activeEnemy, setActiveEnemy] = useState<{
    name: string;
    emoji: string;
    hp: number;
    maxHp: number;
    atk: number;
  } | null>(null);

  const [battleRound, setBattleRound] = useState(1);
  const [heroAttacking, setHeroAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<{ val: number; isCrit: boolean; isHero: boolean } | null>(null);
  const [hitsCount, setHitsCount] = useState(0);

  // Canvas Ref for Parallax Animated World
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | 0>(0);
  const scrollOffsetRef = useRef(0);
  const walkCycleRef = useRef(0);

  const currentWorld = WORLDS[worldIndex % WORLDS.length];

  // Base Stats calculation from equipment
  const baseAtk = Object.values(equipped).reduce((sum, item) => sum + (item?.atk || 0), 30);
  const baseHp = Object.values(equipped).reduce((sum, item) => sum + (item?.hp || 0), 280);
  const baseDef = Object.values(equipped).reduce((sum, item) => sum + (item?.def || 0), 15);
  const powerRating = Math.round(baseAtk * 12 + baseHp * 3.5 + baseDef * 8);

  // Start Adventure Run
  const startAdventure = () => {
    if (energy < 5) {
      alert('⚡ Not enough energy! Wait for it to restore or pray for grace.');
      return;
    }
    setEnergy(e => e - 5);
    sounds.playTap();
    setDay(1);
    setHeroLevel(1);
    setHeroExp(0);
    setHeroMaxExp(60);
    setHeroHp(baseHp);
    setHeroMaxHp(baseHp);
    setHeroShield(0);
    setLearnedSkills([]);
    setRunStage('walking');
    const initialText = `Day 1: Jesus and His disciples step out on the ${currentWorld.name}.`;
    setEventText(initialText);
    setStoryLogs([{ day: 1, text: initialText, type: 'story' }]);
    setInRun(true);
  };

  // Battle VFX & Animation State
  const fxListRef = useRef<Array<any>>([]);
  const screenShakeRef = useRef(0);
  const heroLungeRef = useRef(0);
  const enemyLungeRef = useRef(0);
  const enemyHitFlashRef = useRef(0);
  const heroHitFlashRef = useRef(0);

  // Trigger VFX Helper
  const spawnVFX = (type: 'ring' | 'slash' | 'lightning' | 'sparks' | 'shield' | 'projectile' | 'manna', x: number, y: number, extra?: any) => {
    if (type === 'ring') {
      fxListRef.current.push({ type: 'ring', x, y, radius: 10, maxRadius: 110, alpha: 1, color: extra?.color || '#facc15' });
    } else if (type === 'slash') {
      fxListRef.current.push({ type: 'slash', x, y, progress: 0, color: extra?.color || '#38bdf8' });
    } else if (type === 'lightning') {
      fxListRef.current.push({ type: 'lightning', x, y, progress: 0, alpha: 1 });
      screenShakeRef.current = 8;
    } else if (type === 'sparks') {
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        const speed = 2 + Math.random() * 4;
        fxListRef.current.push({
          type: 'spark',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() < 0.5 ? '#facc15' : '#ef4444',
          life: 1,
          size: 3 + Math.random() * 3
        });
      }
    } else if (type === 'shield') {
      fxListRef.current.push({ type: 'shield', x, y, life: 1, maxLife: 1 });
    } else if (type === 'manna') {
      for (let i = 0; i < 5; i++) {
        fxListRef.current.push({
          type: 'manna',
          sx: x + (Math.random() * 20 - 10),
          sy: y + (Math.random() * 20 - 10),
          tx: extra?.tx || x - 180,
          ty: extra?.ty || y,
          progress: 0,
          speed: 0.04 + Math.random() * 0.02
        });
      }
    }
  };

  // 2D Canvas Parallax Animation for Walking Jesus & Worlds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrame = 0;

    const render = () => {
      localFrame++;
      const width = canvas.width;
      const height = canvas.height;

      // Screen Shake
      ctx.save();
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current * 1.5;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current * 1.5;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.4);
      }

      // Parallax scroll speed
      if (runStage === 'walking') {
        scrollOffsetRef.current += 1.8 * speedMultiplier;
        walkCycleRef.current += 0.12 * speedMultiplier;
      }

      const offset = scrollOffsetRef.current;
      const walk = Math.sin(walkCycleRef.current);

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, currentWorld.skyGradient[0]);
      skyGrad.addColorStop(1, currentWorld.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Distant Clouds & Mountains
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 180 - offset * 0.2) % (width + 200)) - 100;
        ctx.beginPath();
        ctx.arc(cx, 40 + (i % 3) * 15, 30, 0, Math.PI * 2);
        ctx.arc(cx + 25, 32 + (i % 3) * 15, 22, 0, Math.PI * 2);
        ctx.arc(cx - 20, 42 + (i % 3) * 15, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Middleground Hills & Olive Trees
      ctx.fillStyle = currentWorld.treeColor;
      for (let i = 0; i < 8; i++) {
        const tx = ((i * 120 - offset * 0.6) % (width + 150)) - 50;
        ctx.beginPath();
        ctx.arc(tx, height - 90, 24, 0, Math.PI * 2);
        ctx.arc(tx + 18, height - 100, 20, 0, Math.PI * 2);
        ctx.fill();
        // Tree trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tx + 6, height - 75, 8, 25);
        ctx.fillStyle = currentWorld.treeColor;
      }

      // 4. Foreground Walking Path
      const groundY = height - 75;
      ctx.fillStyle = currentWorld.groundColor;
      ctx.fillRect(0, groundY, width, 75);

      // Road dirt track
      ctx.fillStyle = '#fef08a33';
      ctx.fillRect(0, groundY + 12, width, 36);

      // Dynamic Character Positions (Unobstructed in Arena)
      let baseCharX = runStage === 'battling' ? width * 0.28 : width * 0.45;
      if (heroLungeRef.current > 0) {
        baseCharX += Math.sin(heroLungeRef.current * Math.PI) * 90;
      }
      const charY = groundY + 10 + (runStage === 'walking' ? Math.abs(walk) * -6 : (heroLungeRef.current > 0 ? -15 : 0));

      let baseEnemyX = width * 0.74;
      if (enemyLungeRef.current > 0) {
        baseEnemyX -= Math.sin(enemyLungeRef.current * Math.PI) * 80;
      } else if (enemyHitFlashRef.current > 0) {
        baseEnemyX += Math.sin(localFrame * 0.8) * 10 + 18;
      }
      const enemyY = groundY + 10;

      // 5. Draw Jesus & Mount Character (Scaled Up for High Visibility)
      if (equipped.mount) {
        ctx.save();
        ctx.translate(baseCharX, charY + 14);
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equipped.mount.emoji, 0, 0);
        ctx.restore();
      }

      // Draw Jesus (Capybara-Go Chibi Art Style)
      ctx.save();
      ctx.translate(baseCharX, equipped.mount ? charY - 18 : charY);
      ctx.scale(1.25, 1.25); // Scale up Jesus for high visibility!

      if (heroHitFlashRef.current > 0) {
        ctx.filter = 'brightness(1.8) drop-shadow(0 0 12px #ef4444)';
      }

      // Golden Radiant Halo (Glowing pulsing)
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16 + Math.sin(localFrame * 0.1) * 6;
      ctx.beginPath();
      ctx.arc(0, -26, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Head & Face
      ctx.fillStyle = '#fed7aa'; // skin
      ctx.beginPath();
      ctx.arc(0, -8, 14, 0, Math.PI * 2);
      ctx.fill();

      // Hair & Beard
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(-8, -12, 6, 0, Math.PI * 2);
      ctx.arc(8, -12, 6, 0, Math.PI * 2);
      ctx.arc(0, 0, 10, 0, Math.PI); // beard
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(-4, -8, 2, 0, Math.PI * 2);
      ctx.arc(4, -8, 2, 0, Math.PI * 2);
      ctx.fill();

      // Flowing White Robe & Red Sash
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-12, 2, 24, 20, 6);
      ctx.fill();

      // Red Sash
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(8, 22);
      ctx.lineTo(12, 22);
      ctx.lineTo(-6, 2);
      ctx.closePath();
      ctx.fill();

      // Equipped Weapon with Swing Rotation
      if (equipped.weapon) {
        ctx.save();
        ctx.translate(14, 0);
        const weaponAngle = heroLungeRef.current > 0 ? (heroLungeRef.current * 1.8 - 0.5) : -0.4;
        ctx.rotate(weaponAngle);
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equipped.weapon.emoji, 0, 0);
        ctx.restore();
      }

      ctx.restore();

      // Draw Pet trailing behind
      if (equipped.pet) {
        ctx.save();
        ctx.translate(baseCharX - 42, charY + 10 + Math.sin(localFrame * 0.1) * 3);
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equipped.pet.emoji, 0, 0);
        ctx.restore();
      }

      // 6. Draw Battling Enemy on Right
      if (runStage === 'battling' && activeEnemy) {
        ctx.save();
        ctx.translate(baseEnemyX, enemyY);

        if (enemyHitFlashRef.current > 0) {
          ctx.filter = 'brightness(2.2) drop-shadow(0 0 16px #ef4444)';
          ctx.scale(1.25, 0.82); // squash on hit
        }

        ctx.font = '52px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeEnemy.emoji, 0, 0);

        // Enemy HP Bar in 2D space
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(-34, -42, 68, 9);
        ctx.fillStyle = '#ef4444';
        const hpPercent = Math.max(0, activeEnemy.hp / activeEnemy.maxHp);
        ctx.fillRect(-34, -42, 68 * hpPercent, 9);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-34, -42, 68, 9);
        ctx.restore();
      }

      // 7. RENDER ANIMATED VFX PARTICLES (Rings, Slashes, Lightning, Sparks)
      for (let i = fxListRef.current.length - 1; i >= 0; i--) {
        const fx = fxListRef.current[i];

        if (fx.type === 'ring') {
          fx.radius += 7;
          fx.alpha -= 0.05;
          ctx.save();
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
          ctx.strokeStyle = fx.color;
          ctx.lineWidth = 5;
          ctx.globalAlpha = Math.max(0, fx.alpha);
          ctx.shadowColor = fx.color;
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Inner rotating energy spikes
          ctx.beginPath();
          for (let a = 0; a < 8; a++) {
            const rot = (Math.PI * 2 * a) / 8 + fx.radius * 0.08;
            const rx = fx.x + Math.cos(rot) * fx.radius;
            const ry = fx.y + Math.sin(rot) * fx.radius;
            ctx.arc(rx, ry, 4, 0, Math.PI * 2);
          }
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();

          if (fx.alpha <= 0) fxListRef.current.splice(i, 1);
        } else if (fx.type === 'slash') {
          fx.progress += 0.12;
          ctx.save();
          ctx.translate(fx.x, fx.y);
          ctx.strokeStyle = fx.color;
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.shadowColor = fx.color;
          ctx.shadowBlur = 20;
          ctx.globalAlpha = Math.max(0, 1 - fx.progress);
          ctx.beginPath();
          ctx.arc(0, 0, 48, -Math.PI * 0.4 + fx.progress * 2, Math.PI * 0.4 + fx.progress * 2);
          ctx.stroke();
          ctx.restore();

          if (fx.progress >= 1) fxListRef.current.splice(i, 1);
        } else if (fx.type === 'lightning') {
          fx.progress += 0.15;
          fx.alpha -= 0.08;
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 24;
          ctx.globalAlpha = Math.max(0, fx.alpha);

          ctx.beginPath();
          ctx.moveTo(fx.x, 0);
          ctx.lineTo(fx.x - 15, fx.y * 0.35);
          ctx.lineTo(fx.x + 20, fx.y * 0.65);
          ctx.lineTo(fx.x, fx.y);
          ctx.stroke();

          // White hot core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();

          if (fx.alpha <= 0) fxListRef.current.splice(i, 1);
        } else if (fx.type === 'spark') {
          fx.x += fx.vx;
          fx.y += fx.vy;
          fx.life -= 0.04;
          ctx.save();
          ctx.fillStyle = fx.color;
          ctx.globalAlpha = Math.max(0, fx.life);
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, fx.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (fx.life <= 0) fxListRef.current.splice(i, 1);
        } else if (fx.type === 'shield') {
          fx.life -= 0.03;
          ctx.save();
          ctx.translate(fx.x, fx.y);
          ctx.beginPath();
          ctx.arc(0, -10, 36, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.globalAlpha = Math.max(0, fx.life);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          if (fx.life <= 0) fxListRef.current.splice(i, 1);
        } else if (fx.type === 'manna') {
          fx.progress += fx.speed;
          const currX = fx.sx + (fx.tx - fx.sx) * fx.progress;
          const currY = fx.sy + (fx.ty - fx.sy) * fx.progress + Math.sin(fx.progress * Math.PI) * -35;
          ctx.save();
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(currX, currY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (fx.progress >= 1) fxListRef.current.splice(i, 1);
        }
      }

      ctx.restore(); // restore screen shake

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [runStage, speedMultiplier, activeEnemy, currentWorld, equipped]);

  // Advance Day Loop in Run
  const advanceDay = useCallback(() => {
    sounds.playTap();
    const nextDay = day + 1;
    setDay(nextDay);
    if (nextDay > longestSurvived) setLongestSurvived(nextDay);

    // Roll random encounter
    const roll = Math.random();

    // 50% Combat encounter
    if (roll < 0.55 || nextDay % 5 === 0) {
      const enemyPool = currentWorld.enemyTypes;
      const chosen = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      const scale = 1 + (nextDay * 0.18);
      const enemyHp = Math.round(180 * chosen.hpMult * scale);
      const enemyAtk = Math.round(22 * chosen.atkMult * scale);

      setActiveEnemy({
        name: chosen.name,
        emoji: chosen.emoji,
        hp: enemyHp,
        maxHp: enemyHp,
        atk: enemyAtk
      });
      setBattleRound(1);
      setRunStage('battling');
      const bText = `Day ${nextDay}: A ${chosen.name} ${chosen.emoji} appeared singing battle cries!`;
      setEventText(bText);
      setStoryLogs(prev => [{ day: nextDay, text: bText, type: 'battle' }, ...prev]);
      if (!soundMuted) sounds.playWhoosh();
    } else {
      // Story Parable / Treasure / Small Fortune
      setRunStage('event');
      const rewardsGold = 45 + nextDay * 8;
      const rewardsExp = 35 + nextDay * 5;
      setGold(g => g + rewardsGold);
      setHeroExp(e => {
        const nextExp = e + rewardsExp;
        if (nextExp >= heroMaxExp) {
          triggerLevelUp();
          return nextExp - heroMaxExp;
        }
        return nextExp;
      });

      const events = [
        `Day ${nextDay}: You met a weary Samaritan on the road and shared blessed bread (+${rewardsGold} Gold, +${rewardsExp} EXP).`,
        `Day ${nextDay}: Resting by Jacob's well restored your spirit and filled your waterskins (+${rewardsGold} Gold).`,
        `Day ${nextDay}: A fisherman brought fresh catch from the Sea of Galilee (+${rewardsExp} EXP).`,
        `Day ${nextDay}: Meditating upon the Mount of Beatitudes brought deep peace and heavenly favor (+${rewardsGold} Gold).`,
        `Day ${nextDay}: A shepherd shared olive oil and dates with your company under the shade of palm trees (+${rewardsExp} EXP).`
      ];
      const chosenEvent = events[Math.floor(Math.random() * events.length)];
      setEventText(chosenEvent);
      setStoryLogs(prev => [{ day: nextDay, text: chosenEvent, type: 'story' }, ...prev]);
    }
  }, [day, longestSurvived, currentWorld, heroMaxExp, soundMuted]);

  // Trigger Roguelike 3-Skill Selection (Capybara Go Style)
  const triggerLevelUp = () => {
    setHeroLevel(l => l + 1);
    setHeroMaxExp(m => Math.round(m * 1.4));
    setHeroMaxHp(h => h + 45);
    setHeroHp(h => h + 45);

    const shuffled = [...SKILL_POOL].sort(() => 0.5 - Math.random());
    setOfferedSkills(shuffled.slice(0, 3));
    setShowSkillSelect(true);
    if (!soundMuted) sounds.playLevelComplete();
  };

  const handleSelectSkill = (skill: SkillChoice) => {
    sounds.playTap();
    setLearnedSkills(prev => [...prev, skill]);
    setStoryLogs(prev => [{ day, text: `Learned Holy Skill: ${skill.emoji} ${skill.name} (${skill.description})`, type: 'skill' }, ...prev]);
    setShowSkillSelect(false);
  };

  const refreshSkills = () => {
    if (skillRefreshes <= 0 && gems < 5) return;
    if (skillRefreshes > 0) {
      setSkillRefreshes(r => r - 1);
    } else {
      setGems(g => g - 5);
    }
    const shuffled = [...SKILL_POOL].sort(() => 0.5 - Math.random());
    setOfferedSkills(shuffled.slice(0, 3));
    sounds.playTap();
  };

  // Turn-based Combat Auto-Resolution Loop (Animated Capybara-Go Style)
  useEffect(() => {
    if (runStage !== 'battling' || !activeEnemy || showSkillSelect) return;

    const timer = setTimeout(() => {
      // 1. HERO ATTACK PHASE (Lunge forward + Ring Shockwave + Slash Arc + Hit Sparks)
      setHeroAttacking(true);
      heroLungeRef.current = 1;

      // Spawn Holy Ring & Slash
      spawnVFX('ring', 250, 320, { color: '#facc15' });
      spawnVFX('slash', 520, 320, { color: '#38bdf8' });

      const isCrit = Math.random() < 0.25 || learnedSkills.some(s => s.id === 'zealot_strike');
      if (isCrit || learnedSkills.some(s => s.id === 'holy_lightning')) {
        spawnVFX('lightning', 520, 320);
      }

      // Hit Sparks on Enemy
      spawnVFX('sparks', 520, 320);
      enemyHitFlashRef.current = 1;
      screenShakeRef.current = isCrit ? 10 : 5;

      const heroDmg = Math.round((baseAtk + learnedSkills.length * 15) * (isCrit ? 1.8 : 1.0) + Math.random() * 10);
      const nextEnemyHp = Math.max(0, activeEnemy.hp - heroDmg);

      setFloatingDamage({ val: heroDmg, isCrit, isHero: false });
      setHitsCount(h => h + 1);

      // Lifesteal particles
      if (learnedSkills.some(s => s.buffType === 'lifesteal')) {
        spawnVFX('manna', 520, 320, { tx: 220, ty: 320 });
        setHeroHp(h => Math.min(heroMaxHp, h + Math.round(heroDmg * 0.3)));
      }

      // Smooth lunge recovery
      setTimeout(() => {
        heroLungeRef.current = 0;
        enemyHitFlashRef.current = 0;
        setHeroAttacking(false);
      }, 350);

      if (nextEnemyHp <= 0) {
        // Victory!
        if (!soundMuted) sounds.playCorrect();
        const earnedGold = 60 + day * 12;
        const earnedExp = 45 + day * 8;
        setGold(g => g + earnedGold);
        setRunStage('victory');
        const vText = `Victory! Defeated ${activeEnemy.name}! Gained +${earnedGold} Gold & +${earnedExp} EXP.`;
        setEventText(vText);
        setStoryLogs(prev => [{ day, text: vText, type: 'victory' }, ...prev]);

        setHeroExp(e => {
          const nExp = e + earnedExp;
          if (nExp >= heroMaxExp) {
            triggerLevelUp();
            return nExp - heroMaxExp;
          }
          return nExp;
        });

        setActiveEnemy(null);
        return;
      }

      // 2. ENEMY ATTACK PHASE (Enemy lunges + Claw slash + Shield barrier)
      setTimeout(() => {
        setEnemyAttacking(true);
        enemyLungeRef.current = 1;

        // Enemy slash & Hero shield
        spawnVFX('slash', 220, 320, { color: '#ef4444' });
        spawnVFX('shield', 220, 320);
        heroHitFlashRef.current = 1;
        screenShakeRef.current = 5;

        const enemyDmg = Math.max(5, activeEnemy.atk - Math.round(baseDef * 0.4));
        const nextHeroHp = heroHp - enemyDmg;

        setFloatingDamage({ val: enemyDmg, isCrit: false, isHero: true });

        setTimeout(() => {
          enemyLungeRef.current = 0;
          heroHitFlashRef.current = 0;
          setEnemyAttacking(false);
          setFloatingDamage(null);
        }, 350);

        if (nextHeroHp <= 0) {
          // Defeat
          if (!soundMuted) sounds.playIncorrect();
          setHeroHp(0);
          setRunStage('gameover');
          const defeatText = `Pilgrimage ended on Day ${day}. Longest survived: ${Math.max(day, longestSurvived)} days.`;
          setEventText(defeatText);
          setStoryLogs(prev => [{ day, text: defeatText, type: 'story' }, ...prev]);
          if (onGameOver) onGameOver(day, Math.floor(gold / 10));
          return;
        }

        setHeroHp(nextHeroHp);
        setActiveEnemy({ ...activeEnemy, hp: nextEnemyHp });
        setBattleRound(r => r + 1);
      }, 700 / speedMultiplier);

    }, 1600 / speedMultiplier);

    return () => clearTimeout(timer);
  }, [runStage, activeEnemy, heroHp, baseAtk, baseDef, heroMaxHp, day, speedMultiplier, showSkillSelect, soundMuted]);

  // Auto-advance loop when walking (Comfortable 5.0 seconds per event on 1x, 10s on 0.5x)
  useEffect(() => {
    if (!inRun || !autoWalk || runStage === 'battling' || runStage === 'gameover' || showSkillSelect) return;

    const timer = setTimeout(() => {
      advanceDay();
    }, 5000 / speedMultiplier);

    return () => clearTimeout(timer);
  }, [inRun, autoWalk, runStage, showSkillSelect, speedMultiplier, advanceDay]);

  // Buy Shop Equipment
  const handleBuyItem = (item: Equipment) => {
    if (typeof item.priceGems === 'number') {
      if (gems < item.priceGems) {
        alert('💎 Not enough Grace Gems!');
        return;
      }
      setGems(g => g - item.priceGems!);
    } else if (typeof item.priceGold === 'number') {
      if (gold < item.priceGold) {
        alert('🪙 Not enough Gold Coins!');
        return;
      }
      setGold(g => g - item.priceGold!);
    }

    sounds.playCoinSound();
    setInventory(inv => [...inv, { ...item, id: `${item.id}_${Date.now()}` }]);
    setEquipped(prev => ({ ...prev, [item.slot]: item }));
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-3 w-full max-w-5xl mx-auto select-none font-sans text-white">
      {/* Top Capybara-Go Style Global Header Bar */}
      <div className="w-full flex items-center justify-between bg-stone-900/90 border border-stone-800 rounded-2xl px-4 py-2 mb-2 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              if (inRun) setInRun(false);
              else if (onBack) onBack();
            }}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">👑</span>
            <div>
              <div className="text-xs font-black text-amber-300 leading-none">Jesus Go: Holy Adventure</div>
              <div className="text-[10px] text-stone-400 font-bold">Power: {powerRating.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Currencies: Energy, Gems, Gold */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-black">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
            <span>{energy}/{maxEnergy}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <span>💎 {gems}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span>🪙 {gold.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen (16:9 Landscape Layout) */}
      <div className="relative w-full aspect-[16/9] max-h-[66vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/40 bg-stone-950 flex flex-col justify-between">
        {/* VIEW 1: ACTIVE IN-RUN GAMEPLAY (Exact Capybara Go Screen) */}
        {inRun ? (
          <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-3 bg-stone-950 gap-2">
            {/* 1. Top In-Run Day Progress Tracker */}
            <div className="shrink-0 flex items-center justify-between bg-black/75 backdrop-blur-md rounded-2xl px-3.5 py-1.5 border border-white/10 text-xs font-bold shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-sm">DAY {day}</span>
                <span className="text-stone-400 text-[11px] truncate max-w-[140px] sm:max-w-none">• {currentWorld.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Story Log History Button */}
                <button
                  onClick={() => setShowLogModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-black text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                  title="View full story and adventure log history"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Story Log</span>
                  <span>({storyLogs.length})</span>
                </button>

                {/* Speed Multiplier (0.5x, 1x, 2x) */}
                <button
                  onClick={() => setSpeedMultiplier(s => (s === 0.5 ? 1 : s === 1 ? 2 : 0.5))}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-black text-[11px] flex items-center gap-1"
                  title="Cycle Game Speed: 0.5x (Story Read), 1x (Normal), 2x (Fast)"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{speedMultiplier === 0.5 ? '0.5x' : `${speedMultiplier}x`}</span>
                </button>

                {/* Auto Walk Toggle */}
                <button
                  onClick={() => setAutoWalk(!autoWalk)}
                  className={`px-3 py-1 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all active:scale-95 ${
                    autoWalk ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/30' : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  {autoWalk ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoWalk ? 'AUTO' : 'MANUAL'}</span>
                </button>
              </div>
            </div>

            {/* 2. Middle Dedicated Battle Stage Arena (100% Unobstructed Viewport) */}
            <div className="relative w-full flex-1 min-h-[200px] sm:min-h-[250px] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-sky-950">
              <canvas
                ref={canvasRef}
                width={800}
                height={320}
                className="w-full h-full object-cover"
              />

              {/* In-Battle Overhead Badges (Round & Hits Counter like Capybara Go) */}
              {runStage === 'battling' && (
                <div className="absolute top-2 left-0 right-0 z-10 flex items-center justify-between px-4 pointer-events-none">
                  <div className="px-3 py-1 rounded-xl bg-black/80 border border-amber-400 text-amber-300 font-black text-xs shadow-xl flex items-center gap-1.5 animate-pulse">
                    <span>⚔️</span>
                    <span>Round {battleRound}/30</span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-black/80 border border-rose-500 text-rose-300 font-black text-xs shadow-xl flex items-center gap-1.5">
                    <span>💥</span>
                    <span>Hits: {hitsCount}</span>
                  </div>
                </div>
              )}

              {/* Combat Hit FX & Floating Numbers */}
              {floatingDamage && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className={`absolute z-20 font-black text-2xl drop-shadow-[0_4px_10px_rgba(0,0,0,1)] pointer-events-none ${
                    floatingDamage.isHero
                      ? 'left-[26%] top-[30%] text-rose-400'
                      : 'right-[22%] top-[25%] text-yellow-300'
                  }`}
                >
                  -{floatingDamage.val} {floatingDamage.isCrit && '⚡ CRITICAL!'}
                </motion.div>
              )}
            </div>

            {/* 3. Bottom In-Run Controls & Dialogue (Placed OUTSIDE the Arena Canvas) */}
            <div className="shrink-0 flex flex-col gap-1.5">
              {/* Stats Bar */}
              <div className="flex items-center justify-between bg-stone-900/95 border border-white/10 rounded-xl px-3.5 py-1 text-xs font-bold shadow-md">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-[10px]">
                    EXP Lv.{heroLevel}
                  </span>
                  <div className="flex items-center gap-1 text-rose-300">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{heroHp}/{heroMaxHp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-rose-300 flex items-center gap-1">⚔️ {baseAtk + learnedSkills.length * 15}</span>
                  <span className="text-cyan-300 flex items-center gap-1">🛡️ {baseDef}</span>
                  <span className="text-amber-300">✨ Blessings: {learnedSkills.length}</span>
                </div>
              </div>

              {/* Event Text Dialogue Log (Capybara Go style yellow box) */}
              <div className="bg-amber-100 text-stone-900 border-2 border-amber-400 rounded-xl px-3.5 py-2 text-xs font-bold shadow-lg flex items-center justify-between">
                <p className="leading-snug truncate pr-2">{eventText}</p>

                {runStage !== 'battling' && runStage !== 'gameover' && (
                  <button
                    onClick={advanceDay}
                    className="shrink-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-xs shadow-md active:scale-95 transition-all"
                  >
                    NEXT DAY ➔
                  </button>
                )}

                {runStage === 'battling' && (
                  <span className="shrink-0 px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-[11px] animate-pulse">
                    BATTLING...
                  </span>
                )}
              </div>
            </div>

            {/* 3-SKILL ROGUELIKE CHOICE MODAL (Exact Capybara Go Popup) */}
            <AnimatePresence>
              {showSkillSelect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center"
                >
                  <div className="text-3xl mb-1">✨</div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    Choose a Holy Skill
                  </h3>
                  <p className="text-xs text-stone-300 mb-3">Level up! Select 1 divine blessing to empower Jesus on the road:</p>

                  <div className="grid grid-cols-3 gap-2.5 w-full max-w-xl mb-3">
                    {offeredSkills.map(skill => (
                      <motion.div
                        key={skill.id}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSelectSkill(skill)}
                        className="bg-stone-900 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-3 flex flex-col justify-between text-left cursor-pointer shadow-xl transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{skill.emoji}</span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                              {skill.rarity}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white">{skill.name}</h4>
                          <p className="text-[10px] text-stone-300 mt-1 leading-snug">{skill.description}</p>
                        </div>

                        <button className="mt-2 w-full py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-[10px] text-center">
                          SELECT
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={refreshSkills}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh ({skillRefreshes > 0 ? `${skillRefreshes} Free` : '💎 5 Gems'})</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STORY & ADVENTURE LOG HISTORY MODAL */}
            <AnimatePresence>
              {showLogModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col p-4 text-white"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-black text-amber-300 uppercase">Pilgrimage Story & Battle Log</h3>
                    </div>
                    <button
                      onClick={() => setShowLogModal(false)}
                      className="px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                    {storyLogs.length === 0 ? (
                      <div className="text-stone-400 italic text-center py-8">No logs recorded yet.</div>
                    ) : (
                      storyLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`p-2.5 rounded-xl border ${
                            log.type === 'battle'
                              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                              : log.type === 'victory'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                              : log.type === 'skill'
                              ? 'bg-purple-950/40 border-purple-500/30 text-purple-200'
                              : 'bg-stone-900 border-white/10 text-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-black text-[10px] text-amber-400">DAY {log.day}</span>
                            <span className="text-[9px] uppercase font-bold text-stone-400">{log.type}</span>
                          </div>
                          <p className="leading-snug">{log.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* VIEW 2: LOBBY & TABS (Adventure / Equip / Shop / Talents) */
          <div className="relative w-full h-full flex flex-col justify-between p-4 overflow-y-auto">
            {/* TAB 1: ADVENTURE WORLD HUB */}
            {activeTab === 'adventure' && (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    {currentWorld.name}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mb-3">Longest Survived: {longestSurvived} Days</div>

                {/* Animated Character Preview */}
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-sky-800 to-amber-900 border-2 border-amber-500/40 flex items-center justify-center text-5xl shadow-2xl mb-4">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] shadow">
                    WALKING HERO
                  </div>
                  <span>🚶‍♂️</span>
                  {equipped.mount && <span className="absolute -bottom-2 text-2xl">{equipped.mount.emoji}</span>}
                </div>

                {/* Big Chunky Capybara Go Start Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startAdventure}
                  className="px-10 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-base shadow-xl shadow-amber-500/40 flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-black tracking-wider">START JOURNEY</span>
                  <span className="text-[11px] font-bold flex items-center gap-1 opacity-90">
                    <Zap className="w-3 h-3 fill-stone-950" /> 5 Energy
                  </span>
                </motion.button>
              </div>
            )}

            {/* TAB 2: EQUIPMENT / ARMORY (Exact Capybara Go Layout) */}
            {activeTab === 'equip' && (
              <div className="flex flex-col flex-1 overflow-y-auto pr-1">
                {/* Hero Equipped Character Center */}
                <div className="grid grid-cols-3 gap-2 items-center bg-stone-900/80 p-3 rounded-2xl border border-white/10 mb-3">
                  {/* Left Slots */}
                  <div className="flex flex-col gap-2">
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.weapon?.emoji || '⚔️'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Weapon</div>
                        <div className="text-xs font-black text-white truncate">{equipped.weapon?.name || 'Empty'}</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.ring?.emoji || '💍'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Ring</div>
                        <div className="text-xs font-black text-white truncate">{equipped.ring?.name || 'Empty'}</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.mount?.emoji || '🫏'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Mount</div>
                        <div className="text-xs font-black text-white truncate">{equipped.mount?.name || 'Empty'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Center Hero Avatar */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-xl border-2 border-white">
                      🚶‍♂️
                    </div>
                    <div className="mt-1 text-xs font-black text-amber-300">⚔️ {powerRating}</div>
                  </div>

                  {/* Right Slots */}
                  <div className="flex flex-col gap-2">
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.armor?.emoji || '🥋'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Armor</div>
                        <div className="text-xs font-black text-white truncate">{equipped.armor?.name || 'Empty'}</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.amulet?.emoji || '🌱'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Amulet</div>
                        <div className="text-xs font-black text-white truncate">{equipped.amulet?.name || 'Empty'}</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center gap-2">
                      <span className="text-xl">{equipped.pet?.emoji || '🕊️'}</span>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold">Pet</div>
                        <div className="text-xs font-black text-white truncate">{equipped.pet?.name || 'Empty'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Grid */}
                <div className="text-xs font-black text-stone-300 mb-1">Inventory ({inventory.length} items)</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {inventory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playTap();
                        setEquipped(prev => ({ ...prev, [item.slot]: item }));
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        equipped[item.slot]?.id === item.id
                          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400'
                          : 'bg-stone-900 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-[10px] font-bold text-stone-300 truncate w-full text-center mt-1">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HOLY SHOP (Buy Weapons, Armor & Mounts) */}
            {activeTab === 'shop' && (
              <div className="flex flex-col flex-1 overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-300 uppercase">Holy Armory & Weapon Shop</span>
                  <span className="text-[10px] text-stone-400">Restocks with biblical artifacts</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SHOP_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-stone-900 border border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {item.rarity}
                          </span>
                        </div>
                        <div className="text-xs font-black text-white">{item.name}</div>
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+{item.atk} ATK • +{item.hp} HP</div>
                        <div className="text-[10px] text-stone-400 italic">{item.specialTrait}</div>
                      </div>

                      <button
                        onClick={() => handleBuyItem(item)}
                        className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        {item.priceGems ? `💎 ${item.priceGems} Gems` : `🪙 ${item.priceGold} Gold`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TALENTS & GRACE GIFTS */}
            {activeTab === 'talents' && (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl mb-2">
                  ✨
                </div>
                <h4 className="text-sm font-black text-white">Temple Talents & Blessings</h4>
                <p className="text-xs text-stone-400 max-w-sm mb-4">
                  Permanent upgrades for your adventure runs:
                </p>

                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  <div className="p-3 rounded-xl bg-stone-900 border border-white/10 text-left">
                    <div className="text-xs font-black text-rose-300">⚔️ Holy Might (+15 ATK)</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Increases base attack damage</div>
                    <button
                      onClick={() => {
                        if (gold >= 300) {
                          setGold(g => g - 300);
                          sounds.playCoinSound();
                        }
                      }}
                      className="mt-2 px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-[10px]"
                    >
                      Upgrade (🪙 300)
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-white/10 text-left">
                    <div className="text-xs font-black text-emerald-300">❤️ Divine Health (+80 HP)</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Boosts maximum health pool</div>
                    <button
                      onClick={() => {
                        if (gold >= 300) {
                          setGold(g => g - 300);
                          sounds.playCoinSound();
                        }
                      }}
                      className="mt-2 px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-[10px]"
                    >
                      Upgrade (🪙 300)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Capybara-Go Style Tab Bar (Hidden in Active Combat Run) */}
        {!inRun && (
          <div className="relative z-10 grid grid-cols-4 bg-stone-900 border-t border-stone-800 p-1.5 text-xs font-black">
            <button
              onClick={() => { sounds.playTap(); setActiveTab('adventure'); }}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'adventure' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="text-base">⚔️</span>
              <span className="text-[10px]">Adventure</span>
            </button>

            <button
              onClick={() => { sounds.playTap(); setActiveTab('equip'); }}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'equip' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="text-base">🪖</span>
              <span className="text-[10px]">Equip</span>
            </button>

            <button
              onClick={() => { sounds.playTap(); setActiveTab('shop'); }}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'shop' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="text-base">🏪</span>
              <span className="text-[10px]">Shop</span>
            </button>

            <button
              onClick={() => { sounds.playTap(); setActiveTab('talents'); }}
              className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                activeTab === 'talents' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span className="text-base">✨</span>
              <span className="text-[10px]">Talents</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        👑 Capybara-Go gameplay: Animated Jesus walking across biblical worlds, buyable armor & weapons, 3-skill roguelike choices!
      </p>
    </div>
  );
};
