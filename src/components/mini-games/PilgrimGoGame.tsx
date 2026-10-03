import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';

interface PilgrimGoGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

// Gear Types
interface GearItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'relic';
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  atkBonus: number;
  hpBonus: number;
  special: string;
}

// Companion Types
interface Companion {
  id: string;
  name: string;
  emoji: string;
  level: number;
  description: string;
  buffType: 'heal' | 'shield' | 'damage' | 'crit' | 'coins';
}

// Skill Blessings
interface HolySkill {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  category: 'attack' | 'defense' | 'utility' | 'passive';
}

const ALL_SKILLS_POOL: HolySkill[] = [
  { id: 'elijah_lightning', name: "Elijah's Heavenly Fire", tagline: 'Call down lightning from above', emoji: '⚡', rarity: 'rare', description: 'Strikes enemies for 150% Holy ATK every 3 turns', category: 'attack' },
  { id: 'shield_of_faith', name: 'Shield of Faith', tagline: 'Extinguish all fiery darts', emoji: '🛡️', rarity: 'rare', description: 'Reduces incoming damage by 30% and reflects 15% holy burn', category: 'defense' },
  { id: 'manna_lifesteal', name: 'Manna of Life', tagline: 'Spiritual renewal through battle', emoji: '🕊️', rarity: 'rare', description: 'Heals for 25% of all physical damage dealt', category: 'passive' },
  { id: 'sword_of_spirit', name: 'Sword of the Spirit', tagline: 'Sharp as a two-edged blade', emoji: '⚔️', rarity: 'epic', description: '+35% Critical Strike chance and bypasses armor', category: 'attack' },
  { id: 'loaves_fishes', name: 'Loaves & Fishes Bounty', tagline: 'Supernatural abundance', emoji: '🍞', rarity: 'common', description: 'Earn +40% more coins and start battles with +20 Max Shield', category: 'utility' },
  { id: 'jericho_trumpet', name: 'Trumpet of Jericho', tagline: 'Walls come tumbling down', emoji: '🎺', rarity: 'epic', description: 'Reduces enemy Defense by 40% and stuns on turn 1', category: 'attack' },
  { id: 'david_slingshot', name: "David's Five Smooth Stones", tagline: 'Faith over giants', emoji: '🪨', rarity: 'rare', description: 'Launches a 200% critical rock at the start of every combat', category: 'attack' },
  { id: 'fruit_of_spirit', name: 'Fruits of the Spirit', tagline: 'Gentle continuous restoration', emoji: '🌿', rarity: 'common', description: 'Regenerates 8% Max HP at the end of every combat turn', category: 'defense' },
  { id: 'parting_sea', name: 'Parting of the Red Sea', tagline: 'Clear a righteous path', emoji: '🌊', rarity: 'legendary', description: 'Deals 250% AoE Holy Damage to all foes and clears negative status', category: 'attack' },
  { id: 'crown_of_life', name: 'Crown of Life', tagline: 'Faithful until the end', emoji: '👑', rarity: 'legendary', description: 'Revives with 60% HP upon fatal defeat (once per run)', category: 'passive' },
  { id: 'samaritan_mercy', name: 'Samaritan Oil & Wine', tagline: 'Binding up all wounds', emoji: '🏺', rarity: 'common', description: 'Restores 35 HP immediately after every encounter', category: 'defense' },
  { id: 'lion_of_judah', name: 'Lion of Judah Fury', tagline: 'The righteous are bold as lions', emoji: '🦁', rarity: 'legendary', description: '+50% ATK when HP drops below 50%', category: 'attack' }
];

const COMPANIONS_POOL: Companion[] = [
  { id: 'dove', name: 'Peace Dove', emoji: '🕊️', level: 1, description: 'Heals 12 HP every 3 combat turns & grants +15% dodge.', buffType: 'heal' },
  { id: 'lamb', name: 'Gentle Lamb', emoji: '🐑', level: 1, description: 'Absorbs 1 fatal blow per run & increases gold by 30%.', buffType: 'coins' },
  { id: 'lion', name: 'Judah Lion', emoji: '🦁', level: 1, description: 'Roars every 4 turns to deal 80 Holy Damage to enemies.', buffType: 'damage' },
  { id: 'fish', name: 'Galilee Fish', emoji: '🐟', level: 1, description: '+20% Critical strike chance and +10% lifesteal.', buffType: 'crit' },
  { id: 'mastiff', name: "Shepherd's Mastiff", emoji: '🐕', level: 1, description: 'Bites enemies every turn for 40% player ATK.', buffType: 'damage' }
];

interface EnemyData {
  name: string;
  emoji: string;
  maxHp: number;
  hp: number;
  atk: number;
  isBoss: boolean;
  rewardExp: number;
  rewardCoins: number;
}

const ENEMIES_BY_CHAPTER: Record<number, EnemyData[]> = {
  1: [
    { name: 'Desert Jackal', emoji: '🐺', maxHp: 65, hp: 65, atk: 12, isBoss: false, rewardExp: 25, rewardCoins: 15 },
    { name: 'Wild Marauder', emoji: '🗡️', maxHp: 80, hp: 80, atk: 14, isBoss: false, rewardExp: 30, rewardCoins: 20 },
    { name: 'Philistine Scout', emoji: '🏹', maxHp: 95, hp: 95, atk: 18, isBoss: false, rewardExp: 35, rewardCoins: 25 },
    { name: 'Giant of Gath', emoji: '👹', maxHp: 220, hp: 220, atk: 26, isBoss: true, rewardExp: 100, rewardCoins: 80 }
  ],
  2: [
    { name: 'Roman Legionary', emoji: '🛡️', maxHp: 130, hp: 130, atk: 22, isBoss: false, rewardExp: 45, rewardCoins: 35 },
    { name: 'Shadow Tempter', emoji: '👥', maxHp: 150, hp: 150, atk: 28, isBoss: false, rewardExp: 55, rewardCoins: 40 },
    { name: 'Scorpion of the Valley', emoji: '🦂', maxHp: 140, hp: 140, atk: 32, isBoss: false, rewardExp: 50, rewardCoins: 38 },
    { name: 'Centurion Commander', emoji: '⚔️', maxHp: 380, hp: 380, atk: 42, isBoss: true, rewardExp: 180, rewardCoins: 120 }
  ],
  3: [
    { name: 'Desert Phantom', emoji: '🌪️', maxHp: 220, hp: 220, atk: 38, isBoss: false, rewardExp: 75, rewardCoins: 60 },
    { name: 'Fiery Dart Archer', emoji: '🔥', maxHp: 240, hp: 240, atk: 46, isBoss: false, rewardExp: 85, rewardCoins: 70 },
    { name: 'Dragon of Babylon', emoji: '🐉', maxHp: 650, hp: 650, atk: 65, isBoss: true, rewardExp: 350, rewardCoins: 250 }
  ]
};

export const PilgrimGoGame: React.FC<PilgrimGoGameProps> = ({ onGameOver, onBack, highScore }) => {
  // Game Loop State
  const [day, setDay] = useState(1);
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<1 | 2 | 3>(1);
  const [soundMuted, setSoundMuted] = useState(false);

  // Hero Stats
  const [hero, setHero] = useState({
    name: 'Faithful Pilgrim',
    level: 1,
    exp: 0,
    maxExp: 60,
    hp: 120,
    maxHp: 120,
    atk: 25,
    def: 8,
    coins: 50,
    graceTokens: 0,
    hasRevived: false
  });

  // Equipped Skills & Gear & Companions
  const [activeSkills, setActiveSkills] = useState<HolySkill[]>([]);
  const [equippedGear, setEquippedGear] = useState<{
    weapon: GearItem | null;
    armor: GearItem | null;
    helmet: GearItem | null;
    relic: GearItem | null;
  }>({
    weapon: { id: 'crook', name: "Shepherd's Staff", type: 'weapon', emoji: '🦯', rarity: 'common', atkBonus: 8, hpBonus: 0, special: '+5% Healing' },
    armor: { id: 'robe', name: 'Linen Tunic', type: 'armor', emoji: '🥋', rarity: 'common', atkBonus: 0, hpBonus: 30, special: '+3 Armor' },
    helmet: null,
    relic: null
  });
  const [activeCompanion, setActiveCompanion] = useState<Companion>(COMPANIONS_POOL[0]);

  // Current Encounter State
  const [currentEvent, setCurrentEvent] = useState<{
    type: 'idle_walk' | 'combat' | 'parable' | 'treasure' | 'campfire' | 'level_up' | 'game_over';
    title: string;
    description: string;
    enemy?: EnemyData;
    choices?: Array<{ text: string; action: () => void }>;
    rewards?: { coins: number; exp: number; item?: GearItem };
  }>({
    type: 'idle_walk',
    title: 'Beginning the Pilgrimage',
    description: 'The morning sun rises over the Sea of Galilee. Take your staff and step forward in faith.'
  });

  // 3-Skill Choice Selection Modal
  const [skillChoices, setSkillChoices] = useState<HolySkill[] | null>(null);

  // Combat Log & Animation
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [combatTurn, setCombatTurn] = useState(0);
  const [combatRoundHeroHit, setCombatRoundHeroHit] = useState(false);
  const [combatRoundEnemyHit, setCombatRoundEnemyHit] = useState(false);
  const [damageNumber, setDamageNumber] = useState<{ val: number; isCrit: boolean; isEnemy: boolean } | null>(null);

  // Chapter calculation
  const chapter = day <= 5 ? 1 : day <= 10 ? 2 : 3;

  // Total Atk & MaxHp with Gear Buffs
  const totalAtk = hero.atk + (equippedGear.weapon?.atkBonus || 0) + (equippedGear.helmet?.atkBonus || 0) + (equippedGear.relic?.atkBonus || 0);
  const totalMaxHp = hero.maxHp + (equippedGear.armor?.hpBonus || 0) + (equippedGear.helmet?.hpBonus || 0) + (equippedGear.relic?.hpBonus || 0);

  // Trigger 3-Skill Selection
  const triggerSkillSelection = () => {
    // Pick 3 random skills not already at max
    const shuffled = [...ALL_SKILLS_POOL].sort(() => 0.5 - Math.random());
    setSkillChoices(shuffled.slice(0, 3));
    if (!soundMuted) sounds.playLevelComplete();
  };

  const handleChooseSkill = (skill: HolySkill) => {
    sounds.playTap();
    setActiveSkills((prev) => [...prev, skill]);
    setSkillChoices(null);

    // Continue Journey
    advanceDay();
  };

  // Advance Day & Spawn Encounter
  const advanceDay = () => {
    const nextDay = day + 1;
    setDay(nextDay);
    if (!soundMuted) sounds.playWhoosh();

    // Check boss encounter every 5 days
    if (nextDay % 5 === 0) {
      const enemies = ENEMIES_BY_CHAPTER[chapter] || ENEMIES_BY_CHAPTER[3];
      const boss = enemies.find(e => e.isBoss) || enemies[enemies.length - 1];
      startCombat({ ...boss, hp: boss.maxHp });
      return;
    }

    // Roll random encounter
    const roll = Math.random();
    if (roll < 0.45) {
      // Combat encounter
      const enemies = ENEMIES_BY_CHAPTER[chapter] || ENEMIES_BY_CHAPTER[1];
      const standardEnemies = enemies.filter(e => !e.isBoss);
      const enemy = standardEnemies[Math.floor(Math.random() * standardEnemies.length)];
      startCombat({ ...enemy, hp: enemy.maxHp });
    } else if (roll < 0.70) {
      // Parable / Story Choice Encounter
      triggerParableEvent(nextDay);
    } else if (roll < 0.88) {
      // Holy Treasure Chest
      triggerTreasureEvent();
    } else {
      // Campfire & Meditation
      triggerCampfireEvent();
    }
  };

  // Start Combat Encounter
  const startCombat = (enemy: EnemyData) => {
    setCombatTurn(1);
    setCombatLog([`⚔️ You encountered ${enemy.name}! Prepare your heart and shield.`]);
    setCurrentEvent({
      type: 'combat',
      title: enemy.isBoss ? `⚠️ BOSS BATTLE: ${enemy.name}` : `Combat: ${enemy.name}`,
      description: enemy.isBoss ? 'A mighty champion blocks your path. Stand firm in the armor of God!' : 'Dark forces challenge your pilgrimage.',
      enemy: { ...enemy }
    });
  };

  // Automated Combat Turn Execution
  useEffect(() => {
    if (currentEvent.type !== 'combat' || !currentEvent.enemy) return;

    const timer = setTimeout(() => {
      executeCombatTurn();
    }, 1100 / gameSpeed);

    return () => clearTimeout(timer);
  }, [currentEvent, combatTurn, gameSpeed]);

  const executeCombatTurn = () => {
    if (!currentEvent.enemy) return;
    const enemy = { ...currentEvent.enemy };

    // 1. Hero Attacks Enemy
    const isCrit = Math.random() < 0.25 || activeSkills.some(s => s.id === 'sword_of_spirit');
    let heroDamage = Math.round(totalAtk * (isCrit ? 1.75 : 1.0) + (Math.random() * 6 - 3));
    if (activeSkills.some(s => s.id === 'david_slingshot') && combatTurn === 1) {
      heroDamage = Math.round(heroDamage * 2);
    }

    // Companion buff
    if (activeCompanion.id === 'mastiff') {
      heroDamage += Math.round(totalAtk * 0.4);
    }
    if (activeCompanion.id === 'lion' && combatTurn % 4 === 0) {
      heroDamage += 80;
    }

    const nextEnemyHp = Math.max(0, enemy.hp - heroDamage);
    enemy.hp = nextEnemyHp;

    // Visual animation
    setCombatRoundEnemyHit(true);
    setDamageNumber({ val: heroDamage, isCrit, isEnemy: true });
    setTimeout(() => {
      setCombatRoundEnemyHit(false);
      setDamageNumber(null);
    }, 400);

    // Life Steal Skill
    if (activeSkills.some(s => s.id === 'manna_lifesteal')) {
      const healAmt = Math.round(heroDamage * 0.25);
      setHero(h => ({ ...h, hp: Math.min(totalMaxHp, h.hp + healAmt) }));
    }

    // Check Enemy Defeated
    if (nextEnemyHp <= 0) {
      if (!soundMuted) sounds.playCorrect();
      const earnedExp = enemy.rewardExp;
      const earnedCoins = enemy.rewardCoins;

      setCombatLog(prev => [`🏆 Victory! Defeated ${enemy.name}! (+${earnedCoins} coins, +${earnedExp} EXP)`, ...prev.slice(0, 3)]);

      // Add EXP & Coins
      setHero(h => {
        let newExp = h.exp + earnedExp;
        let newLvl = h.level;
        let newMaxExp = h.maxExp;
        let newAtk = h.atk;
        let newHp = h.maxHp;

        if (newExp >= newMaxExp) {
          newExp -= newMaxExp;
          newLvl += 1;
          newMaxExp = Math.round(newMaxExp * 1.5);
          newAtk += 6;
          newHp += 25;
        }

        return {
          ...h,
          coins: h.coins + earnedCoins,
          level: newLvl,
          exp: newExp,
          maxExp: newMaxExp,
          atk: newAtk,
          maxHp: newHp,
          hp: Math.min(newHp, h.hp + 20)
        };
      });

      // Boss or Level Up triggers 3-skill choice!
      if (enemy.isBoss || hero.exp + earnedExp >= hero.maxExp) {
        triggerSkillSelection();
      } else {
        setCurrentEvent({
          type: 'idle_walk',
          title: `Victory over ${enemy.name}!`,
          description: `You gave thanks to God and continued your holy pilgrimage along the path.`
        });
        if (isAutoWalking) {
          setTimeout(advanceDay, 1200 / gameSpeed);
        }
      }
      return;
    }

    // 2. Enemy Attacks Hero
    let enemyDmg = Math.max(4, enemy.atk - hero.def);
    if (activeSkills.some(s => s.id === 'shield_of_faith')) {
      enemyDmg = Math.round(enemyDmg * 0.7);
    }
    // Companion dodge
    if (activeCompanion.id === 'dove' && Math.random() < 0.2) {
      enemyDmg = 0;
    }

    const nextHeroHp = hero.hp - enemyDmg;

    setCombatRoundHeroHit(true);
    if (!soundMuted) sounds.playTap();
    setTimeout(() => setCombatRoundHeroHit(false), 400);

    // Turn regeneration
    let regenHp = nextHeroHp;
    if (activeSkills.some(s => s.id === 'fruit_of_spirit')) {
      regenHp = Math.min(totalMaxHp, regenHp + Math.round(totalMaxHp * 0.08));
    }
    if (activeCompanion.id === 'dove' && combatTurn % 3 === 0) {
      regenHp = Math.min(totalMaxHp, regenHp + 14);
    }

    // Check Hero Defeat
    if (nextHeroHp <= 0) {
      // Crown of Life Revive Check
      if (activeSkills.some(s => s.id === 'crown_of_life') && !hero.hasRevived) {
        setHero(h => ({ ...h, hp: Math.round(totalMaxHp * 0.6), hasRevived: true }));
        setCombatLog(prev => ['👑 Crown of Life triggered! You are raised back up in faith!', ...prev]);
        setCurrentEvent(curr => ({ ...curr, enemy }));
        setCombatTurn(t => t + 1);
        return;
      }

      // Game Over
      if (!soundMuted) sounds.playIncorrect();
      setCurrentEvent({
        type: 'game_over',
        title: 'Pilgrimage Rested',
        description: `You completed ${day} Days on the Holy Journey to Jerusalem!`
      });
      setIsAutoWalking(false);

      if (onGameOver) onGameOver(day, Math.floor(hero.coins / 5) + day);
      return;
    }

    setHero(h => ({ ...h, hp: regenHp }));
    setCurrentEvent(curr => ({ ...curr, enemy }));
    setCombatTurn(t => t + 1);
  };

  // Parable Events (Story Choice)
  const triggerParableEvent = (currentDay: number) => {
    const events = [
      {
        title: 'The Good Samaritan on the Jericho Road',
        description: 'You find an injured traveler beaten on the side of the road. How will you show mercy?',
        choices: [
          {
            text: '🍷 Pour oil & wine, bandage wounds (-10 coins)',
            action: () => {
              sounds.playTap();
              setHero(h => ({ ...h, coins: Math.max(0, h.coins - 10), hp: totalMaxHp, atk: h.atk + 4 }));
              advanceDay();
            }
          },
          {
            text: '🙏 Lay hands & pray in faith (+40 EXP, +15 Max HP)',
            action: () => {
              sounds.playTap();
              setHero(h => ({ ...h, maxHp: h.maxHp + 15, hp: h.hp + 15, exp: h.exp + 40 }));
              advanceDay();
            }
          }
        ]
      },
      {
        title: 'Miracle of the Loaves and Fishes',
        description: 'A hungry multitude gathers by the lake. A young boy offers five barley loaves and two fish.',
        choices: [
          {
            text: '✨ Lift up the basket in thanksgiving (Full Heal & +50 Coins)',
            action: () => {
              if (!soundMuted) sounds.playCorrect();
              setHero(h => ({ ...h, coins: h.coins + 50, hp: totalMaxHp }));
              advanceDay();
            }
          }
        ]
      },
      {
        title: "Jacob's Well in Sychar",
        description: 'You rest under the midday sun. Jesus offers water so that you will never thirst again.',
        choices: [
          {
            text: '💧 Drink the Living Water (+50 Max HP, +10 ATK)',
            action: () => {
              if (!soundMuted) sounds.playCorrect();
              setHero(h => ({ ...h, maxHp: h.maxHp + 50, hp: h.maxHp + 50, atk: h.atk + 10 }));
              advanceDay();
            }
          }
        ]
      }
    ];

    const chosen = events[Math.floor(Math.random() * events.length)];
    setCurrentEvent({
      type: 'parable',
      title: chosen.title,
      description: chosen.description,
      choices: chosen.choices
    });
  };

  // Treasure Event
  const triggerTreasureEvent = () => {
    const rewards: GearItem[] = [
      { id: 'sword_spirit', name: 'Sword of Truth', type: 'weapon', emoji: '⚔️', rarity: 'rare', atkBonus: 22, hpBonus: 10, special: '+15% Crit' },
      { id: 'breastplate', name: 'Breastplate of Righteousness', type: 'armor', emoji: '🛡️', rarity: 'epic', atkBonus: 5, hpBonus: 70, special: '+12 Defense' },
      { id: 'helmet_salv', name: 'Helmet of Salvation', type: 'helmet', emoji: '🪖', rarity: 'rare', atkBonus: 10, hpBonus: 40, special: '+10% Block' },
      { id: 'ark_relic', name: 'Altar Incense Censer', type: 'relic', emoji: '🏺', rarity: 'legendary', atkBonus: 25, hpBonus: 50, special: '+25% Holy Damage' }
    ];

    const loot = rewards[Math.floor(Math.random() * rewards.length)];

    setCurrentEvent({
      type: 'treasure',
      title: 'Ark of the Covenant Altar',
      description: `You found a sacred treasure chest on the mountain trail! You received: ${loot.emoji} ${loot.name} (${loot.rarity.toUpperCase()})!`,
      choices: [
        {
          text: `Equip ${loot.name} (+${loot.atkBonus} ATK, +${loot.hpBonus} HP)`,
          action: () => {
            sounds.playTap();
            setEquippedGear(prev => ({ ...prev, [loot.type]: loot }));
            advanceDay();
          }
        }
      ]
    });
  };

  // Campfire Event
  const triggerCampfireEvent = () => {
    setCurrentEvent({
      type: 'campfire',
      title: 'Olive Grove Campfire',
      description: 'You set up camp under starry skies. Meditating upon Psalm 23 restores your soul.',
      choices: [
        {
          text: '📖 Meditate on Scripture (Restore 50 HP & +30 EXP)',
          action: () => {
            sounds.playTap();
            setHero(h => ({ ...h, hp: Math.min(totalMaxHp, h.hp + 50), exp: h.exp + 30 }));
            advanceDay();
          }
        },
        {
          text: '🍖 Share fellowship with companions (+35 Coins)',
          action: () => {
            sounds.playTap();
            setHero(h => ({ ...h, coins: h.coins + 35 }));
            advanceDay();
          }
        }
      ]
    });
  };

  // Auto Walking interval
  useEffect(() => {
    if (!isAutoWalking || currentEvent.type !== 'idle_walk') return;

    const timer = setTimeout(() => {
      advanceDay();
    }, 1500 / gameSpeed);

    return () => clearTimeout(timer);
  }, [isAutoWalking, currentEvent, gameSpeed]);

  const restartRun = () => {
    sounds.playTap();
    setDay(1);
    setHero({
      name: 'Faithful Pilgrim',
      level: 1,
      exp: 0,
      maxExp: 60,
      hp: 120,
      maxHp: 120,
      atk: 25,
      def: 8,
      coins: 50,
      graceTokens: 0,
      hasRevived: false
    });
    setActiveSkills([]);
    setCurrentEvent({
      type: 'idle_walk',
      title: 'Beginning the Pilgrimage',
      description: 'The morning sun rises over the Sea of Galilee. Take your staff and step forward in faith.'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-5xl mx-auto select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between mb-2 text-stone-200">
        <div className="flex items-center gap-2">
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

          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30 flex items-center gap-1">
            <span>☀️ DAY {day}</span>
            <span className="opacity-60">• Chapter {chapter}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={() => {
              sounds.playTap();
              setGameSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1));
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs"
            title="Game Speed"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>{gameSpeed}x</span>
          </button>

          {/* Auto Walk Toggle */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsAutoWalking(!isAutoWalking);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
              isAutoWalking
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/30'
                : 'bg-white/10 text-stone-300 hover:text-white'
            }`}
          >
            {isAutoWalking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoWalking ? 'AUTO ON' : 'AUTO WALK'}</span>
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Widescreen Landscape Game Container (16:9) */}
      <div className="relative w-full aspect-[16/9] max-h-[66vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-stone-950 flex flex-col justify-between p-4 sm:p-5">
        {/* Animated Background Landscape (Galilee / Judea / Jerusalem) */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-amber-950 to-stone-950 opacity-90 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        {/* Top HUD: Hero Status Bar & Stats */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 sm:p-3">
          {/* Hero Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg shrink-0">
              🚶‍♂️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{hero.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-300 font-bold text-[10px]">
                  Lv.{hero.level}
                </span>
              </div>
              {/* HP Bar */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <div className="w-24 sm:w-36 h-2 rounded-full bg-stone-800 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (hero.hp / totalMaxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-stone-300">{hero.hp}/{totalMaxHp}</span>
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 border border-white/10 text-rose-300 font-black">
              <Sword className="w-3.5 h-3.5 text-rose-400" />
              <span>{totalAtk} ATK</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 border border-white/10 text-cyan-300 font-black">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hero.def} DEF</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black">
              <span>🪙 {hero.coins}</span>
            </div>
          </div>

          {/* Active Companion */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold">
            <span className="text-base">{activeCompanion.emoji}</span>
            <span className="hidden sm:inline">{activeCompanion.name}</span>
          </div>
        </div>

        {/* Center Stage: Dynamic Encounter View */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-3 text-center">
          {/* 1. Combat View */}
          {currentEvent.type === 'combat' && currentEvent.enemy && (
            <div className="w-full max-w-lg flex flex-col items-center">
              {/* Battle Arena Avatars */}
              <div className="flex items-center justify-around w-full px-6 py-2">
                {/* Hero Avatar */}
                <motion.div
                  animate={{
                    x: combatRoundHeroHit ? [0, -12, 12, 0] : 0,
                    scale: combatRoundHeroHit ? [1, 0.9, 1] : 1
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 border-2 border-white/30">
                    🚶‍♂️
                  </div>
                  <span className="text-xs font-bold text-white mt-1">Pilgrim</span>
                </motion.div>

                {/* VS Holy Light */}
                <div className="flex flex-col items-center">
                  <div className="text-xl font-black text-amber-400 drop-shadow animate-pulse">VS</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Round {combatTurn}</div>
                  {damageNumber && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ opacity: 1, y: -20, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      className={`font-black text-lg drop-shadow ${
                        damageNumber.isCrit ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      -{damageNumber.val} {damageNumber.isCrit && '⚡ CRIT!'}
                    </motion.div>
                  )}
                </div>

                {/* Enemy Avatar */}
                <motion.div
                  animate={{
                    x: combatRoundEnemyHit ? [0, 12, -12, 0] : 0,
                    scale: combatRoundEnemyHit ? [1, 0.9, 1] : 1
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-800 flex items-center justify-center text-3xl shadow-xl shadow-rose-600/30 border-2 border-white/30">
                    {currentEvent.enemy.emoji}
                  </div>
                  <span className="text-xs font-bold text-rose-300 mt-1">{currentEvent.enemy.name}</span>
                  {/* Enemy HP */}
                  <div className="w-24 h-1.5 rounded-full bg-stone-800 overflow-hidden mt-1 border border-white/10">
                    <div
                      className="h-full bg-rose-500 transition-all duration-200"
                      style={{ width: `${Math.max(0, (currentEvent.enemy.hp / currentEvent.enemy.maxHp) * 100)}%` }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Combat Log Text */}
              <div className="mt-2 text-xs text-stone-300 bg-black/60 px-4 py-1.5 rounded-xl border border-white/10 max-w-md truncate">
                {combatLog[0] || 'Trading holy strikes...'}
              </div>
            </div>
          )}

          {/* 2. Parable / Story Choices */}
          {currentEvent.type === 'parable' && (
            <div className="max-w-md bg-stone-900/90 backdrop-blur-md border border-amber-500/30 rounded-3xl p-5 shadow-2xl">
              <div className="text-3xl mb-1">📜</div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 mb-1">{currentEvent.title}</h3>
              <p className="text-xs text-stone-300 mb-4 leading-relaxed">{currentEvent.description}</p>

              <div className="flex flex-col gap-2">
                {currentEvent.choices?.map((c, i) => (
                  <button
                    key={i}
                    onClick={c.action}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition-all text-left"
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Treasure & Campfire View */}
          {(currentEvent.type === 'treasure' || currentEvent.type === 'campfire') && (
            <div className="max-w-md bg-stone-900/90 backdrop-blur-md border border-amber-500/30 rounded-3xl p-5 shadow-2xl">
              <div className="text-3xl mb-1">{currentEvent.type === 'treasure' ? '🎁' : '⛺'}</div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 mb-1">{currentEvent.title}</h3>
              <p className="text-xs text-stone-300 mb-4 leading-relaxed">{currentEvent.description}</p>

              <div className="flex flex-col gap-2">
                {currentEvent.choices?.map((c, i) => (
                  <button
                    key={i}
                    onClick={c.action}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition-all text-center"
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Idle Walk View */}
          {currentEvent.type === 'idle_walk' && (
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 border-2 border-white/30 mb-2"
              >
                🚶‍♂️
              </motion.div>
              <h3 className="text-lg font-black text-white">{currentEvent.title}</h3>
              <p className="text-xs text-stone-300 max-w-sm mt-0.5">{currentEvent.description}</p>

              <button
                onClick={() => {
                  sounds.playTap();
                  advanceDay();
                }}
                className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs shadow-xl shadow-amber-500/40 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-stone-950" />
                <span>STEP FORWARD TO DAY {day + 1}</span>
              </button>
            </div>
          )}

          {/* 5. Game Over View */}
          {currentEvent.type === 'game_over' && (
            <div className="max-w-md bg-black/85 backdrop-blur-md border border-rose-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="text-4xl mb-1">🕊️</div>
              <h3 className="text-xl font-black text-white mb-1">Pilgrimage Concluded</h3>
              <p className="text-xs text-stone-300 mb-3">{currentEvent.description}</p>

              <div className="bg-white/10 rounded-2xl p-3 mb-4 text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-stone-300">Days Traveled:</span>
                  <span className="font-bold text-amber-300">Day {day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-300">Hero Level:</span>
                  <span className="font-bold text-white">Level {hero.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-300">Grace Tokens Earned:</span>
                  <span className="font-bold text-yellow-300">+{Math.floor(hero.coins / 5) + day} Tokens</span>
                </div>
              </div>

              <button
                onClick={restartRun}
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs shadow-xl shadow-amber-500/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>START NEW PILGRIMAGE</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Gear & Skills Bar */}
        <div className="relative z-10 flex items-center justify-between gap-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-2 sm:p-2.5 overflow-x-auto">
          {/* Equipped Gear Slots */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-stone-400">Gear:</span>
            <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center text-sm" title={equippedGear.weapon?.name || 'Weapon slot'}>
              {equippedGear.weapon ? equippedGear.weapon.emoji : '⚔️'}
            </div>
            <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center text-sm" title={equippedGear.armor?.name || 'Armor slot'}>
              {equippedGear.armor ? equippedGear.armor.emoji : '🥋'}
            </div>
            <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center text-sm" title={equippedGear.helmet?.name || 'Helmet slot'}>
              {equippedGear.helmet ? equippedGear.helmet.emoji : '🪖'}
            </div>
            <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center text-sm" title={equippedGear.relic?.name || 'Relic slot'}>
              {equippedGear.relic ? equippedGear.relic.emoji : '🏺'}
            </div>
          </div>

          {/* Active Holy Skills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-stone-400">Blessings ({activeSkills.length}):</span>
            {activeSkills.length === 0 ? (
              <span className="text-[10px] text-stone-500 italic">None yet</span>
            ) : (
              activeSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold"
                  title={`${s.name}: ${s.description}`}
                >
                  {s.emoji} {s.name.split(' ')[0]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 3-Skill Choice Roguelike Modal Overlay */}
        <AnimatePresence>
          {skillChoices && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white"
            >
              <div className="text-3xl mb-1 animate-bounce">✨</div>
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent">
                Choose a Holy Blessing
              </h2>
              <p className="text-xs text-stone-300 max-w-sm mb-4">
                Level up! Select 1 divine blessing to empower your pilgrim on the journey:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {skillChoices.map((skill) => (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleChooseSkill(skill)}
                    className="p-4 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/40 hover:border-amber-400 flex flex-col justify-between text-left cursor-pointer shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{skill.emoji}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {skill.rarity}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">{skill.name}</h4>
                      <p className="text-[11px] text-stone-300 mt-1 leading-snug">{skill.description}</p>
                    </div>

                    <button className="mt-3 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs text-center">
                      SELECT BLESSING
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        🛡️ Capybara-Go style biblical roguelike: Equip holy armor, level up blessings, and journey toward Jerusalem!
      </p>
    </div>
  );
};
