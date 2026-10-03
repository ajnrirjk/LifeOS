import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MiniCat, CatAction, SanctuaryBackground, CatBreed, NekoShopGoodie, CatQuest, MiniCatGameTab } from '../../types/miniCats';
import { CAT_BREEDS, INITIAL_CATS, NEKO_SHOP_GOODIES } from '../../data/catBreedsData';
import { CAT_COSTUMES } from '../../data/catCostumesData';
import { MiniatureCatRenderer } from './MiniatureCatRenderer';
import { LaserFrenzyMiniGame } from './LaserFrenzyMiniGame';
import { SnackCatcherMiniGame } from './SnackCatcherMiniGame';
import { SanctuaryQuestsView } from './SanctuaryQuestsView';
import { sounds } from '../../services/soundEffects';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Utensils,
  Moon,
  Coffee,
  Music,
  Plus,
  Shirt,
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Shuffle,
  Camera,
  Layers,
  Smile,
  X,
  Check,
  BookOpen,
  ShoppingBag,
  Volume1,
  Coins,
  Gamepad2,
  Home,
  CheckSquare,
  Award,
  Zap,
  Star,
  Info
} from 'lucide-react';

const LEVEL_TITLES = [
  'Kitten Helper',
  'Cat Cafe Host',
  'Sanctuary Guardian',
  'Feline Whisperer',
  'Master Caretaker',
  'Legendary Cat Saint'
];

const DEFAULT_QUESTS: CatQuest[] = [
  {
    id: 'q_pet',
    title: 'Warm Affection',
    description: 'Pet your sanctuary kitties 4 times',
    targetCount: 4,
    currentCount: 0,
    rewardSilver: 40,
    rewardGold: 1,
    rewardXp: 30,
    isClaimed: false,
    icon: '💖'
  },
  {
    id: 'q_feed',
    title: 'Tummy Feast',
    description: 'Serve a fresh food bowl in the yard',
    targetCount: 1,
    currentCount: 0,
    rewardSilver: 30,
    rewardXp: 25,
    isClaimed: false,
    icon: '🥣'
  },
  {
    id: 'q_laser',
    title: 'Laser Reflexes',
    description: 'Score 80+ points in Laser Frenzy Arcade',
    targetCount: 80,
    currentCount: 0,
    rewardSilver: 50,
    rewardGold: 3,
    rewardXp: 45,
    isClaimed: false,
    icon: '🔴'
  },
  {
    id: 'q_snack',
    title: 'Snack Basket Champion',
    description: 'Score 80+ points in Snack Catcher Arcade',
    targetCount: 80,
    currentCount: 0,
    rewardSilver: 50,
    rewardGold: 3,
    rewardXp: 45,
    isClaimed: false,
    icon: '🧺'
  },
  {
    id: 'q_costume',
    title: 'Haute Feline Fashion',
    description: 'Equip any costume on your cats',
    targetCount: 1,
    currentCount: 0,
    rewardSilver: 25,
    rewardXp: 20,
    isClaimed: false,
    icon: '🎩'
  }
];

export const MiniCatsApp: React.FC = () => {
  // Current game tab: 'yard' | 'arcade' | 'quests' | 'shop' | 'catdex'
  const [activeTab, setActiveTab] = useState<MiniCatGameTab>('yard');

  // Cats state loaded from localStorage or defaults
  const [cats, setCats] = useState<MiniCat[]>(() => {
    try {
      const saved = localStorage.getItem('pocket_paws_sanctuary_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATS;
  });

  const [selectedCatId, setSelectedCatId] = useState<string | null>('cat_orange');
  const [background, setBackground] = useState<SanctuaryBackground>('garden');
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);
  const [isDiscoParty, setIsDiscoParty] = useState(false);

  // Yard Laser Pointer
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });

  // Currencies & Progression
  const [silverFish, setSilverFish] = useState(() => {
    try {
      const val = localStorage.getItem('pocket_paws_silver');
      return val ? Number(val) : 450;
    } catch {
      return 450;
    }
  });

  const [goldFish, setGoldFish] = useState(() => {
    try {
      const val = localStorage.getItem('pocket_paws_gold');
      return val ? Number(val) : 30;
    } catch {
      return 30;
    }
  });

  const [sanctuaryXp, setSanctuaryXp] = useState(() => {
    try {
      const val = localStorage.getItem('pocket_paws_xp');
      return val ? Number(val) : 60;
    } catch {
      return 60;
    }
  });

  const [level, setLevel] = useState(() => {
    try {
      const val = localStorage.getItem('pocket_paws_level');
      return val ? Number(val) : 1;
    } catch {
      return 1;
    }
  });

  // Daily Quests
  const [quests, setQuests] = useState<CatQuest[]>(() => {
    try {
      const val = localStorage.getItem('pocket_paws_quests_v2');
      if (val) return JSON.parse(val);
    } catch {}
    return DEFAULT_QUESTS;
  });

  // Active Mini-Game launcher
  const [activeMiniGame, setActiveMiniGame] = useState<'laser' | 'snack' | null>(null);

  // Yard Food Dish State
  const [foodBowl, setFoodBowl] = useState<{ active: boolean; type: 'kibble' | 'tuna' | 'salmon'; x: number; y: number; servings: number } | null>(null);

  // Modals
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [isFoodMenuOpen, setIsFoodMenuOpen] = useState(false);

  const [selectedBreedForAdoption, setSelectedBreedForAdoption] = useState<string>(CAT_BREEDS[0].id);
  const [newCatName, setNewCatName] = useState('');
  const [photoFlash, setPhotoFlash] = useState(false);
  const [pettingHearts, setPettingHearts] = useState<{ id: number; x: number; y: number; text?: string }[]>([]);
  const [levelUpNotice, setLevelUpNotice] = useState<string | null>(null);

  // Dragging state tracking
  const [draggingCatId, setDraggingCatId] = useState<string | null>(null);
  const sanctuaryRef = useRef<HTMLDivElement>(null);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem('pocket_paws_sanctuary_v3', JSON.stringify(cats));
      localStorage.setItem('pocket_paws_silver', silverFish.toString());
      localStorage.setItem('pocket_paws_gold', goldFish.toString());
      localStorage.setItem('pocket_paws_xp', sanctuaryXp.toString());
      localStorage.setItem('pocket_paws_level', level.toString());
      localStorage.setItem('pocket_paws_quests_v2', JSON.stringify(quests));
    } catch {}
  }, [cats, silverFish, goldFish, sanctuaryXp, level, quests]);

  // Clean BGM on unmount
  useEffect(() => {
    return () => {
      sounds.stopCatBgm();
    };
  }, []);

  const selectedCat = cats.find((c) => c.id === selectedCatId) || cats[0];
  const selectedBreed = CAT_BREEDS.find((b) => b.id === (selectedCat?.breedId || 'orange_tabby')) || CAT_BREEDS[0];

  // Award XP and check Level-up
  const addXp = (amount: number) => {
    setSanctuaryXp((prev) => {
      const nextXp = prev + amount;
      const xpNeeded = level * 100;
      if (nextXp >= xpNeeded) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setGoldFish((g) => g + 5);
        setSilverFish((s) => s + 50);
        sounds.playVictory();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
        const title = LEVEL_TITLES[Math.min(nextLevel - 1, LEVEL_TITLES.length - 1)];
        setLevelUpNotice(`🎉 LEVEL UP! You are now a ${title} (Lv. ${nextLevel})! +5 🪙 Gold Fish`);
        setTimeout(() => setLevelUpNotice(null), 5000);
        return nextXp - xpNeeded;
      }
      return nextXp;
    });
  };

  // Progress a Quest
  const updateQuestProgress = (questId: string, amount: number = 1, isAbsolute: boolean = false) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.isClaimed) {
          const nextCount = isAbsolute ? Math.max(q.currentCount, amount) : q.currentCount + amount;
          return {
            ...q,
            currentCount: Math.min(q.targetCount, nextCount)
          };
        }
        return q;
      })
    );
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.isClaimed || quest.currentCount < quest.targetCount) return;

    sounds.playCoin();
    setSilverFish((s) => s + quest.rewardSilver);
    if (quest.rewardGold) {
      const goldAmt = quest.rewardGold;
      setGoldFish((g) => g + goldAmt);
    }
    addXp(quest.rewardXp);

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );
  };

  // Toggle Cozy BGM
  const handleToggleBgm = () => {
    sounds.playTap();
    if (isBgmActive) {
      sounds.stopCatBgm();
      setIsBgmActive(false);
    } else {
      sounds.startCatBgm();
      setIsBgmActive(true);
    }
  };

  // Cat Wandering AI Loop (cozy real behavior in yard)
  useEffect(() => {
    if (activeTab !== 'yard' || isDiscoParty) return;

    const wanderTimer = setInterval(() => {
      if (Math.random() < 0.45 && cats.length > 0) {
        const randomIdx = Math.floor(Math.random() * cats.length);
        const target = cats[randomIdx];
        if (target.action === 'sleep' || target.isDragging) return;

        const newX = Math.max(10, Math.min(90, target.x + (Math.random() - 0.5) * 22));
        const newY = Math.max(25, Math.min(80, target.y + (Math.random() - 0.5) * 16));
        const facingLeft = newX < target.x;

        setCats((prev) =>
          prev.map((c, i) =>
            i === randomIdx
              ? {
                  ...c,
                  x: newX,
                  y: newY,
                  facingLeft,
                  thoughtBubble: Math.random() < 0.3 ? 'Sniffing around... 🌸' : undefined
                }
              : c
          )
        );
      }
    }, 4500);

    return () => clearInterval(wanderTimer);
  }, [activeTab, cats, isDiscoParty]);

  // Yard Feeding Logic: Cats walk to food bowl
  const handleServeFoodBowl = (type: 'kibble' | 'tuna' | 'salmon') => {
    sounds.playTap();
    sounds.playMunch();
    setIsFoodMenuOpen(false);

    const cost = type === 'salmon' ? 30 : type === 'tuna' ? 15 : 0;
    if (silverFish < cost) return;
    setSilverFish((s) => s - cost);

    const bowlX = 50;
    const bowlY = 70;
    setFoodBowl({ active: true, type, x: bowlX, y: bowlY, servings: 3 });
    updateQuestProgress('q_feed', 1);
    addXp(25);

    // Nearby cats rush to the bowl!
    setCats((prev) =>
      prev.map((c, idx) => {
        const offset = (idx - 1) * 14;
        return {
          ...c,
          x: Math.max(15, Math.min(85, bowlX + offset)),
          y: bowlY - 4,
          facingLeft: offset > 0,
          action: 'eat',
          happiness: 100,
          thoughtBubble: type === 'salmon' ? 'DELUXE SALMON! 🍣' : 'Yum! Nom nom! 🐟'
        };
      })
    );
  };

  // Mouse & Touch Tracking for Dragging & Laser Pointer
  const handleMouseMoveSanctuary = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sanctuaryRef.current) return;
    const rect = sanctuaryRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

    if (isLaserActive) {
      setLaserPos({ x: xPct, y: yPct });
      // Laser chase response from nearby cats
      setCats((prev) =>
        prev.map((c) => {
          const dist = Math.hypot(c.x - xPct, c.y - yPct);
          if (dist < 20 && c.action !== 'sleep') {
            return {
              ...c,
              x: c.x + (xPct - c.x) * 0.15,
              y: c.y + (yPct - c.y) * 0.15,
              facingLeft: xPct < c.x,
              thoughtBubble: 'CATCH IT! 🔴'
            };
          }
          return c;
        })
      );
    }

    if (draggingCatId) {
      setCats((prev) =>
        prev.map((c) => {
          if (c.id === draggingCatId) {
            const facingLeft = xPct < c.x;
            return {
              ...c,
              x: xPct,
              y: yPct,
              facingLeft,
              isDragging: true
            };
          }
          return c;
        })
      );
    }
  };

  const handlePointerUp = () => {
    if (draggingCatId) {
      if (!isMuted) sounds.playDropSquish();
      setCats((prev) =>
        prev.map((c) => (c.id === draggingCatId ? { ...c, isDragging: false } : c))
      );
      setDraggingCatId(null);
    }
  };

  // Petting with real Breed-Specific Meow Sound & Hearts
  const handlePetCat = (e: React.MouseEvent | React.TouchEvent, catId: string) => {
    e.stopPropagation();
    setSelectedCatId(catId);

    const targetCat = cats.find((c) => c.id === catId);
    if (!targetCat) return;
    const breed = CAT_BREEDS.find((b) => b.id === targetCat.breedId) || CAT_BREEDS[0];

    if (!isMuted) {
      sounds.playBreedMeow(breed.id);
      setTimeout(() => sounds.playPurr(), 300);
    }

    // Award silver fish and progress quest
    setSilverFish((prev) => prev + Math.floor(Math.random() * 3) + 2);
    addXp(12);
    updateQuestProgress('q_pet', 1);

    // Floating heart
    const heartId = Date.now() + Math.random();
    setPettingHearts((prev) => [
      ...prev,
      { id: heartId, x: targetCat.x, y: targetCat.y - 10, text: breed.meowOnomatopoeia }
    ]);
    setTimeout(() => {
      setPettingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1400);

    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              happiness: 100,
              thoughtBubble: `${breed.meowOnomatopoeia} 💕`
            }
          : c
      )
    );
  };

  // Finish an arcade game
  const handleFinishArcadeGame = (score: number, silverEarned: number, goldEarned: number, xpEarned: number) => {
    setSilverFish((s) => s + silverEarned);
    setGoldFish((g) => g + goldEarned);
    addXp(xpEarned);

    if (activeMiniGame === 'laser') {
      updateQuestProgress('q_laser', score, true);
    } else if (activeMiniGame === 'snack') {
      updateQuestProgress('q_snack', score, true);
    }
  };

  // Silly Costumes
  const handleEquipCostume = (costumeId: string) => {
    if (!selectedCatId) return;
    if (!isMuted) sounds.playCostumeChime();
    updateQuestProgress('q_costume', 1);
    addXp(15);

    setCats((prev) =>
      prev.map((c) =>
        c.id === selectedCatId
          ? {
              ...c,
              costumeId,
              thoughtBubble: 'Look at my stylish outfit! ✨'
            }
          : c
      )
    );
  };

  // Adopt Kitty
  const handleAdoptKitty = () => {
    const breed = CAT_BREEDS.find((b) => b.id === selectedBreedForAdoption) || CAT_BREEDS[0];
    const name = newCatName.trim() || breed.name.split(' ')[0];
    const costumeIds = ['none', 'wizard', 'taco', 'crown', 'dino', 'bread', 'banana', 'chef', 'sunglasses'];
    const randomCostume = costumeIds[Math.floor(Math.random() * costumeIds.length)];

    const newCat: MiniCat = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      breedId: breed.id,
      x: 25 + Math.random() * 50,
      y: 40 + Math.random() * 35,
      action: 'loaf',
      costumeId: randomCostume,
      scale: 0.95 + Math.random() * 0.15,
      facingLeft: Math.random() > 0.5,
      happiness: 100,
      hunger: 20,
      thirst: 20,
      energy: 90,
      thoughtBubble: `${breed.meowOnomatopoeia} Hello, I'm ${name}! 🐾`
    };

    setCats((prev) => [...prev, newCat]);
    setSelectedCatId(newCat.id);
    setIsAdoptModalOpen(false);
    setNewCatName('');
    sounds.playVictory();
    addXp(40);
  };

  const handleTakeSnapshot = () => {
    if (!isMuted) sounds.playTap();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 250);
  };

  // Background CSS styles
  const bgClasses: Record<SanctuaryBackground, string> = {
    garden: 'from-[#ecfccb] via-[#fef08a] to-[#fed7aa]',
    living_room: 'from-[#ffedd5] via-[#fed7aa] to-[#fef3c7]',
    cat_cafe: 'from-[#fef3c7] via-[#fde68a] to-[#fed7aa]',
    tatami: 'from-[#f5f5f4] via-[#e7e5e4] to-[#d6d3d1]',
    cosmic: 'from-[#1e1b4b] via-[#31104b] to-[#0f172a]'
  };

  return (
    <div
      className="h-full flex flex-col bg-[#fffbeb] text-stone-900 select-none overflow-hidden relative font-sans"
      onMouseMove={handleMouseMoveSanctuary}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      {/* Level-Up Banner Notification */}
      <AnimatePresence>
        {levelUpNotice && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-black text-xs sm:text-sm shadow-2xl border-2 border-white flex items-center gap-2 whitespace-nowrap animate-bounce"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{levelUpNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snapshot Flash Overlay */}
      {photoFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* TOP SYSTEM & GAME STATS HUD */}
      <header className="px-3 sm:px-6 py-2 bg-[#fef3c7] dark:bg-stone-900 border-b-2 border-[#b45309]/30 flex flex-wrap items-center justify-between gap-2.5 z-30 shrink-0">
        {/* Left: Sanctuary Rank & Level */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-[#b45309] flex items-center justify-center text-xl shadow-sm">
            🐱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#78350f] dark:text-amber-200">
                Lv. {level} {LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold">
                ({sanctuaryXp}/{level * 100} XP)
              </span>
            </div>
            {/* Level XP Bar */}
            <div className="w-36 h-2 rounded-full bg-amber-200 dark:bg-stone-700 overflow-hidden mt-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                animate={{ width: `${Math.min(100, (sanctuaryXp / (level * 100)) * 100)}%` }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </div>
          </div>
        </div>

        {/* Center: Currency Display (Silver & Gold Fish) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/80 dark:bg-stone-800 border border-[#b45309]/30 shadow-inner text-xs font-black">
          <span className="flex items-center gap-1 text-slate-700 dark:text-stone-200" title="Silver Fish (Earned from petting & games)">
            <span>🐟</span>
            <span>{silverFish}</span>
          </span>
          <div className="w-px h-3 bg-amber-300" />
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Gold Fish (Rare currency)">
            <span>🪙</span>
            <span>{goldFish}</span>
          </span>
        </div>

        {/* Right: Audio Toggles & Adopt Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Lo-Fi Cat BGM button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleBgm}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 transition-all ${
              isBgmActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm animate-pulse'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#b45309]/20'
            }`}
            title={isBgmActive ? 'Stop Cozy BGM' : 'Play Cozy Lo-Fi Cat Sanctuary BGM'}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BGM {isBgmActive ? 'ON' : 'OFF'}</span>
          </motion.button>

          {/* SFX Toggle */}
          <button
            onClick={() => {
              setIsMuted((prev) => !prev);
              sounds.enabled = isMuted;
            }}
            className="p-1.5 rounded-xl bg-white dark:bg-stone-800 border border-[#b45309]/20 text-stone-700 dark:text-stone-300"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Adopt Kitty */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playTap();
              setIsAdoptModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adopt</span>
          </motion.button>
        </div>
      </header>

      {/* GAME MODE NAVIGATION TABS */}
      <nav className="h-10 px-3 sm:px-6 bg-[#fde68a] dark:bg-stone-800 border-b border-[#b45309]/20 flex items-center justify-between shrink-0 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          {/* 1. Yard */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('yard');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'yard'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#78350f] dark:text-stone-300 hover:bg-amber-300/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Yard Habitat</span>
          </button>

          {/* 2. Arcade Games */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('arcade');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'arcade'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[#78350f] dark:text-stone-300 hover:bg-amber-300/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Arcade Games</span>
          </button>

          {/* 3. Daily Quests */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('quests');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'quests'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#78350f] dark:text-stone-300 hover:bg-amber-300/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Quests</span>
            {quests.some((q) => !q.isClaimed && q.currentCount >= q.targetCount) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {/* 4. CatDex (Encyclopedia) */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('catdex');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'catdex'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[#78350f] dark:text-stone-300 hover:bg-amber-300/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CatDex</span>
          </button>

          {/* 5. Neko Shop */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('shop');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'shop'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#78350f] dark:text-stone-300 hover:bg-amber-300/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop</span>
          </button>
        </div>

        {/* Quick Yard Tools when in Yard mode */}
        {activeTab === 'yard' && (
          <div className="flex items-center gap-1.5">
            {/* Serve Food Dish Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFoodMenuOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black flex items-center gap-1 shadow-sm"
            >
              <Utensils className="w-3 h-3" />
              <span>Serve Food</span>
            </motion.button>

            {/* Laser pointer button */}
            <button
              onClick={() => {
                sounds.playTap();
                setIsLaserActive((prev) => !prev);
              }}
              className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 border ${
                isLaserActive
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Laser</span>
            </button>

            {/* Snapshot */}
            <button
              onClick={handleTakeSnapshot}
              className="p-1 rounded-xl bg-white dark:bg-stone-700 border border-amber-300 text-stone-700 dark:text-stone-300"
              title="Take Photo"
            >
              <Camera className="w-3.5 h-3.5 text-blue-500" />
            </button>
          </div>
        )}
      </nav>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* 1. YARD HABITAT VIEW */}
        {activeTab === 'yard' && (
          <div
            ref={sanctuaryRef}
            className={`flex-1 relative bg-gradient-to-b ${bgClasses[background]} overflow-hidden`}
          >
            {/* Yard Environment Props */}
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* Wooden Fence on Garden */}
              <div className="absolute top-16 left-0 right-0 h-10 border-b-4 border-[#b45309]/30 flex justify-around opacity-40">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-3 h-10 bg-[#b45309] rounded-t-sm" />
                ))}
              </div>

              {/* Cat Tree Tower on Right */}
              <div className="absolute top-20 right-6 flex flex-col items-center opacity-90">
                <div className="w-16 h-4 rounded-full bg-amber-800" />
                <div className="w-3 h-28 bg-[#92400e]" />
                <div className="w-20 h-5 rounded-full bg-amber-800" />
                <div className="w-3 h-24 bg-[#92400e]" />
                <div className="w-24 h-5 rounded-full bg-amber-900" />
              </div>

              {/* Cozy Rug in Middle */}
              <div className="absolute top-44 left-1/2 -translate-x-1/2 w-80 h-36 rounded-full border-4 border-dashed border-[#b45309]/20 flex items-center justify-center opacity-30">
                <span className="text-6xl font-serif">🐾</span>
              </div>
            </div>

            {/* Live Food Bowl on Yard Ground */}
            {foodBowl && foodBowl.active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${foodBowl.x}%`, top: `${foodBowl.y}%` }}
              >
                <div className="px-2 py-0.5 rounded-full bg-white text-[10px] font-black text-orange-600 border border-orange-300 shadow-sm animate-bounce mb-1">
                  Fresh Bowl 🥣
                </div>
                <div className="w-14 h-9 rounded-full bg-amber-100 border-2 border-amber-500 shadow-md flex items-center justify-center text-lg">
                  {foodBowl.type === 'salmon' ? '🍣' : foodBowl.type === 'tuna' ? '🐟' : '🥣'}
                </div>
              </motion.div>
            )}

            {/* Laser Pointer Red Dot in Yard */}
            {isLaserActive && (
              <div
                className="absolute w-5 h-5 rounded-full bg-rose-600 shadow-[0_0_20px_#f43f5e] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 animate-ping"
                style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
              />
            )}

            {/* Floating Petting Hearts & Meow Sound Texts */}
            {pettingHearts.map((item) => (
              <div
                key={item.id}
                className="absolute pointer-events-none z-40 flex flex-col items-center animate-out fade-out slide-out-to-top duration-1000 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <span className="text-2xl animate-bounce">💖</span>
                {item.text && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white text-[#78350f] border-2 border-[#78350f] shadow-md whitespace-nowrap">
                    {item.text}
                  </span>
                )}
              </div>
            ))}

            {/* DRAGGABLE & INTERACTIVE CATS */}
            {cats.map((cat) => {
              const breed = CAT_BREEDS.find((b) => b.id === cat.breedId) || CAT_BREEDS[0];
              const isSelected = selectedCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`absolute cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 ${
                    cat.isDragging ? 'z-40 scale-110 duration-0' : ''
                  }`}
                  style={{
                    left: `${cat.x}%`,
                    top: `${cat.y}%`
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedCatId(cat.id);
                    setDraggingCatId(cat.id);
                    handlePetCat(e, cat.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePetCat(e, cat.id);
                  }}
                >
                  {/* Name Tag */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-[#78350f] border border-[#b45309]/40 whitespace-nowrap shadow-sm pointer-events-none">
                    {cat.name}
                  </div>

                  {/* Cat Vector Body */}
                  <MiniatureCatRenderer
                    cat={cat}
                    breed={breed}
                    isSelected={isSelected}
                    onPet={(e) => handlePetCat(e, cat.id)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 2. ARCADE GAMES LAUNCHER VIEW */}
        {activeTab === 'arcade' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fffbeb] dark:bg-stone-900 select-none">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-[#78350f] dark:text-amber-300">
                  Feline Arcade Center 🎮
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-bold mt-1">
                  Test your reflexes with real mini-games, set high scores, and win Fish Coins & XP!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Game 1: Laser Frenzy */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-orange-500/10 border-2 border-rose-400 rounded-3xl shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-3xl shadow-md">
                      🔴
                    </div>
                    <div>
                      <h3 className="text-base font-black text-stone-900 dark:text-white">
                        Laser Frenzy
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Guide your red laser dot and tap darting yarn balls, clockwork mice, and catnip moths in 30 seconds!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-black pt-3 border-t border-rose-200 dark:border-rose-900">
                    <span className="text-amber-600">🏆 Rewards: 🐟 + 🪙 + ⭐</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveMiniGame('laser')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md"
                    >
                      PLAY (30s)
                    </motion.button>
                  </div>
                </motion.div>

                {/* Game 2: Snack Catcher */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-400 rounded-3xl shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-md">
                      🧺
                    </div>
                    <div>
                      <h3 className="text-base font-black text-stone-900 dark:text-white">
                        Snack Catcher
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Move {selectedCat?.name || 'kitty'} along the bottom to catch falling tuna, salmon & catnip while avoiding water drops!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-black pt-3 border-t border-emerald-200 dark:border-emerald-900">
                    <span className="text-emerald-600">🏆 Fast Reflex Arcade</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveMiniGame('snack')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
                    >
                      PLAY (30s)
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* 3. QUESTS VIEW */}
        {activeTab === 'quests' && (
          <SanctuaryQuestsView
            quests={quests}
            onClaimQuest={handleClaimQuest}
            silverFish={silverFish}
            goldFish={goldFish}
          />
        )}

        {/* 4. CATDEX ENCYCLOPEDIA */}
        {activeTab === 'catdex' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fffbeb] dark:bg-stone-900 select-none">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl font-black text-[#78350f] dark:text-amber-300">
                  Illustrated CatDex Catalog 📖
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-bold">
                  Discover all {CAT_BREEDS.length} distinct miniature breeds and their vocal meow personalities!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {CAT_BREEDS.map((breed) => {
                  const isUnlocked = cats.some((c) => c.breedId === breed.id);

                  return (
                    <motion.div
                      key={breed.id}
                      whileHover={{ y: -3 }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isUnlocked
                          ? 'bg-white dark:bg-stone-800 border-[#b45309]/30 shadow-md'
                          : 'bg-stone-100 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl border-2 border-stone-800 flex items-center justify-center text-2xl shadow-sm shrink-0"
                          style={{ backgroundColor: breed.bodyColor }}
                        >
                          🐱
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-[#78350f] dark:text-stone-100">
                            {breed.name}
                          </h3>
                          <span className="text-[10px] font-bold text-stone-400 block">
                            Origin: {breed.origin}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 font-medium line-clamp-2">
                        {breed.personality}
                      </p>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
                        <button
                          onClick={() => sounds.playBreedMeow(breed.id)}
                          className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-xs font-black flex items-center gap-1"
                        >
                          <Volume1 className="w-3.5 h-3.5" />
                          <span>"{breed.meowOnomatopoeia}"</span>
                        </button>

                        <span className="text-[11px] font-black text-amber-600">
                          Power: {breed.powerLevel || 100}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. NEKO SHOP */}
        {activeTab === 'shop' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fffbeb] dark:bg-stone-900 select-none">
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl font-black text-[#78350f] dark:text-amber-300">
                  Neko Treats & Goodies Shop 🛍️
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-bold">
                  Spend your earned Silver and Gold Fish on tasty food, cushions, and scratchers!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {NEKO_SHOP_GOODIES.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-[#b45309]/30 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-700 flex items-center justify-center text-3xl shrink-0">
                        {item.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#78350f] dark:text-stone-100">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (silverFish >= item.costSilver) {
                          setSilverFish((s) => s - item.costSilver);
                          sounds.playVictory();
                          addXp(20);
                        } else {
                          sounds.playIncorrect();
                        }
                      }}
                      disabled={silverFish < item.costSilver}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-xs shrink-0 shadow"
                    >
                      {item.costSilver} 🐟
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SELECTED CAT CONTROL PANEL */}
      {selectedCat && activeTab === 'yard' && (
        <footer className="px-4 py-2 bg-[#fff8e7] dark:bg-stone-900 border-t-2 border-[#b45309]/30 z-30 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handlePetCat(e, selectedCat.id)}
              className="w-11 h-11 rounded-2xl bg-amber-400 hover:scale-105 active:scale-95 border-2 border-[#b45309] shadow flex items-center justify-center text-2xl transition-transform"
              title="Click to Pet Kitty!"
            >
              🐱
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#78350f] dark:text-amber-200">
                  {selectedCat.name}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fef3c7] dark:bg-stone-800 text-[#92400e] dark:text-stone-300 border border-[#d97706]/40">
                  {selectedBreed.name}
                </span>
              </div>
              <p className="text-[11px] text-[#92400e]/80 dark:text-stone-400 font-semibold">
                Favorite: {selectedBreed.favoriteSnack} · Meow: "{selectedBreed.meowOnomatopoeia}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handlePetCat(e, selectedCat.id)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Pet ({selectedBreed.meowOnomatopoeia})</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWardrobeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black flex items-center gap-1 shadow"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Costumes</span>
            </motion.button>
          </div>
        </footer>
      )}

      {/* SERVE FOOD DISH MODAL */}
      <AnimatePresence>
        {isFoodMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#fffbeb] dark:bg-stone-900 border-3 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#b45309]/30">
                <h3 className="text-base font-black text-[#78350f] dark:text-amber-200 flex items-center gap-2">
                  <span>🥣</span>
                  <span>Serve Fresh Bowl</span>
                </h3>
                <button
                  onClick={() => setIsFoodMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 text-stone-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleServeFoodBowl('kibble')}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-300 hover:border-amber-500 flex items-center justify-between text-left transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🥣</span>
                    <div>
                      <h4 className="text-xs font-black">Daily Dry Kibble</h4>
                      <p className="text-[10px] text-stone-500">Satisfies hungry cats</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">FREE</span>
                </button>

                <button
                  onClick={() => handleServeFoodBowl('tuna')}
                  disabled={silverFish < 15}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-300 hover:border-amber-500 disabled:opacity-40 flex items-center justify-between text-left transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🐟</span>
                    <div>
                      <h4 className="text-xs font-black">Tuna Bonito Bowl</h4>
                      <p className="text-[10px] text-stone-500">+15 XP & high delight</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600">15 🐟</span>
                </button>

                <button
                  onClick={() => handleServeFoodBowl('salmon')}
                  disabled={silverFish < 30}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-300 hover:border-amber-500 disabled:opacity-40 flex items-center justify-between text-left transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🍣</span>
                    <div>
                      <h4 className="text-xs font-black">Deluxe Sashimi Feast</h4>
                      <p className="text-[10px] text-stone-500">+30 XP & purr party</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600">30 🐟</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADOPT KITTY MODAL */}
      <AnimatePresence>
        {isAdoptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#fffbeb] dark:bg-stone-900 border-3 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#b45309]/30">
                <h3 className="text-base font-black text-[#78350f] dark:text-amber-200 flex items-center gap-2">
                  <span>🐾</span>
                  <span>Adopt a New Kitty</span>
                </h3>
                <button
                  onClick={() => setIsAdoptModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 text-stone-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-[#78350f] dark:text-stone-300">Cat Name:</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Biscuit, Nala, Oreo..."
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border-2 border-amber-300 focus:outline-none focus:border-amber-500 text-xs font-bold"
                />
              </div>

              {/* Breed Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#78350f] dark:text-stone-300">Choose Breed:</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {CAT_BREEDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBreedForAdoption(b.id)}
                      className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-left text-xs font-black transition-all ${
                        selectedBreedForAdoption === b.id
                          ? 'bg-amber-100 dark:bg-stone-700 border-amber-500 text-[#78350f] dark:text-amber-300 shadow-sm'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="text-xl">🐱</span>
                      <span className="truncate">{b.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAdoptKitty}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm shadow-md"
              >
                Welcome Kitty Home (+40 ⭐)
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WARDROBE / COSTUME MODAL */}
      <AnimatePresence>
        {isWardrobeOpen && selectedCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#fffbeb] dark:bg-stone-900 border-3 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#b45309]/30">
                <h3 className="text-base font-black text-[#78350f] dark:text-amber-200 flex items-center gap-2">
                  <span>🎩</span>
                  <span>Dress Up {selectedCat.name}</span>
                </h3>
                <button
                  onClick={() => setIsWardrobeOpen(false)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 text-stone-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CAT_COSTUMES.map((costume) => {
                  const isEquipped = selectedCat.costumeId === costume.id;

                  return (
                    <button
                      key={costume.id}
                      onClick={() => handleEquipCostume(costume.id)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                        isEquipped
                          ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-500 shadow-sm'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-3xl">{costume.emoji}</span>
                      <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                        {costume.name}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">
                          Equipped ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsWardrobeOpen(false)}
                className="w-full py-2.5 rounded-xl bg-stone-800 text-white font-black text-xs"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE ARCADE MINI-GAME MODALS */}
      <AnimatePresence>
        {activeMiniGame === 'laser' && (
          <LaserFrenzyMiniGame
            onClose={() => setActiveMiniGame(null)}
            onFinishGame={handleFinishArcadeGame}
            catName={selectedCat?.name || 'Pumpkin'}
            breedEmoji={selectedBreed?.meowOnomatopoeia ? '🐱' : '🐈'}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMiniGame === 'snack' && (
          <SnackCatcherMiniGame
            onClose={() => setActiveMiniGame(null)}
            onFinishGame={handleFinishArcadeGame}
            catName={selectedCat?.name || 'Pumpkin'}
            breedEmoji={selectedBreed?.meowOnomatopoeia ? '🐱' : '🐈'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
