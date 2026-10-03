import React, { useState, useEffect, useRef } from 'react';
import { MiniCat, CatAction, SanctuaryBackground, CatBreed, NekoShopGoodie } from '../../types/miniCats';
import { CAT_BREEDS, INITIAL_CATS, NEKO_SHOP_GOODIES } from '../../data/catBreedsData';
import { CAT_COSTUMES } from '../../data/catCostumesData';
import { MiniatureCatRenderer } from './MiniatureCatRenderer';
import { sounds } from '../../services/soundEffects';
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
} from 'lucide-react';

export const MiniCatsApp: React.FC = () => {
  // Cats state loaded from localStorage or defaults
  const [cats, setCats] = useState<MiniCat[]>(() => {
    try {
      const saved = localStorage.getItem('pocket_paws_sanctuary_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATS;
  });

  const [selectedCatId, setSelectedCatId] = useState<string | null>('cat_orange');
  const [background, setBackground] = useState<SanctuaryBackground>('garden');
  const [isMuted, setIsMuted] = useState(false);
  const [isDiscoParty, setIsDiscoParty] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });

  // Currencies like Neko Atsume (Silver Fish & Gold Fish)
  const [silverFish, setSilverFish] = useState(380);
  const [goldFish, setGoldFish] = useState(25);

  // Modals
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [isCatBookOpen, setIsCatBookOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const [selectedBreedForAdoption, setSelectedBreedForAdoption] = useState<string>(CAT_BREEDS[0].id);
  const [newCatName, setNewCatName] = useState('');
  const [catBookPage, setCatBookPage] = useState<number>(0);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [pettingHearts, setPettingHearts] = useState<{ id: number; x: number; y: number; text?: string }[]>([]);

  // Dragging state tracking
  const [draggingCatId, setDraggingCatId] = useState<string | null>(null);
  const sanctuaryRef = useRef<HTMLDivElement>(null);

  // Persist cats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pocket_paws_sanctuary_v2', JSON.stringify(cats));
    } catch {}
  }, [cats]);

  const selectedCat = cats.find((c) => c.id === selectedCatId) || cats[0];
  const selectedBreed = CAT_BREEDS.find((b) => b.id === (selectedCat?.breedId || 'orange_tabby')) || CAT_BREEDS[0];

  // Mouse & Touch Tracking for Dragging & Laser Pointer
  const handleMouseMoveSanctuary = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sanctuaryRef.current) return;
    const rect = sanctuaryRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

    if (isLaserActive) {
      setLaserPos({ x: xPct, y: yPct });
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
              isDragging: true,
            };
          }
          return c;
        })
      );
    }
  };

  const handleTouchMoveSanctuary = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sanctuaryRef.current || !draggingCatId) return;
    const touch = e.touches[0];
    const rect = sanctuaryRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((touch.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(15, Math.min(85, ((touch.clientY - rect.top) / rect.height) * 100));

    setCats((prev) =>
      prev.map((c) => {
        if (c.id === draggingCatId) {
          return {
            ...c,
            x: xPct,
            y: yPct,
            isDragging: true,
          };
        }
        return c;
      })
    );
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

  // BREED-SPECIFIC MEOW SOUND WHEN PETTING
  const handlePetCat = (e: React.MouseEvent | React.TouchEvent, catId: string) => {
    e.stopPropagation();
    setSelectedCatId(catId);

    const targetCat = cats.find((c) => c.id === catId);
    if (!targetCat) return;
    const breed = CAT_BREEDS.find((b) => b.id === targetCat.breedId) || CAT_BREEDS[0];

    // Emit unique breed-specific meow sound!
    if (!isMuted) {
      sounds.playBreedMeow(breed.id);
      setTimeout(() => sounds.playPurr(), 350);
    }

    // Award silver fish on petting like Neko Atsume gratitude
    setSilverFish((prev) => prev + Math.floor(Math.random() * 3) + 1);

    // Spawn floating heart + onomatopoeia sound text
    const heartId = Date.now() + Math.random();
    setPettingHearts((prev) => [
      ...prev,
      { id: heartId, x: targetCat.x, y: targetCat.y - 10, text: breed.meowOnomatopoeia },
    ]);
    setTimeout(() => {
      setPettingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1500);

    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              happiness: 100,
              thoughtBubble: `${breed.meowOnomatopoeia} 💕`,
            }
          : c
      )
    );
  };

  // Action Change for Individual Cat
  const handleSetCatAction = (catId: string, action: CatAction) => {
    const targetCat = cats.find((c) => c.id === catId);
    const breedId = targetCat?.breedId || 'orange_tabby';

    if (!isMuted) {
      if (action === 'eat') sounds.playMunch();
      else if (action === 'drink') sounds.playSlurp();
      else if (action === 'sleep') sounds.playPurr();
      else if (action === 'dance') sounds.playVictory();
      else sounds.playBreedMeow(breedId);
    }

    setCats((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              action,
              thoughtBubble: getActionThought(action),
            }
          : c
      )
    );
  };

  // Group Actions for ALL cats
  const handleSetAllAction = (action: CatAction) => {
    if (!isMuted) {
      if (action === 'dance') {
        sounds.playVictory();
        setIsDiscoParty(true);
      } else if (action === 'eat') {
        sounds.playMunch();
      } else if (action === 'drink') {
        sounds.playSlurp();
      } else if (action === 'sleep') {
        sounds.playPurr();
        setIsDiscoParty(false);
      } else if (action === 'loaf') {
        sounds.playPurr();
        setIsDiscoParty(false);
      } else {
        sounds.playTap();
        setIsDiscoParty(false);
      }
    }

    setCats((prev) =>
      prev.map((c) => ({
        ...c,
        action,
        thoughtBubble: getActionThought(action),
      }))
    );
  };

  const getActionThought = (action: CatAction): string => {
    switch (action) {
      case 'sleep':
        return 'Purrrrr... 💤';
      case 'loaf':
        return 'Loaf mode 🍞';
      case 'eat':
        return 'Yum! Nom nom! 🐟';
      case 'drink':
        return 'Refreshing! 🥛';
      case 'dance':
        return 'Groove time! 🕺';
      default:
        return 'Mew! ✨';
    }
  };

  // Silly Costumes
  const handleEquipCostume = (costumeId: string) => {
    if (!selectedCatId) return;
    if (!isMuted) sounds.playCostumeChime();
    setCats((prev) =>
      prev.map((c) =>
        c.id === selectedCatId
          ? {
              ...c,
              costumeId,
              thoughtBubble: 'Look at my outfit! ✨',
            }
          : c
      )
    );
  };

  const handleRandomizeCostumes = () => {
    if (!isMuted) sounds.playCostumeChime();
    const costumeIds = CAT_COSTUMES.map((c) => c.id);
    setCats((prev) =>
      prev.map((cat) => {
        const randCostume = costumeIds[Math.floor(Math.random() * costumeIds.length)];
        return {
          ...cat,
          costumeId: randCostume,
          thoughtBubble: 'Silly fashion! 🎭',
        };
      })
    );
  };

  // Adopt / Add Kitty
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
      y: 40 + Math.random() * 38,
      action: 'loaf',
      costumeId: randomCostume,
      scale: 0.95 + Math.random() * 0.15,
      facingLeft: Math.random() > 0.5,
      happiness: 100,
      hunger: 20,
      thirst: 20,
      energy: 90,
      thoughtBubble: `${breed.meowOnomatopoeia} Hi, I'm ${name}! 🐾`,
    };

    setCats((prev) => [...prev, newCat]);
    setSelectedCatId(newCat.id);
    setIsAdoptModalOpen(false);
    setNewCatName('');
    if (!isMuted) {
      sounds.playBreedMeow(breed.id);
    }
  };

  const handleRemoveCat = (catId: string) => {
    if (cats.length <= 1) return;
    if (!isMuted) sounds.playTap();
    setCats((prev) => prev.filter((c) => c.id !== catId));
    if (selectedCatId === catId) {
      const remaining = cats.filter((c) => c.id !== catId);
      setSelectedCatId(remaining[0]?.id || null);
    }
  };

  // Buy item from Neko Atsume Shop
  const handleBuyGoodie = (goodie: NekoShopGoodie) => {
    if (silverFish < goodie.costSilver) return;
    setSilverFish((prev) => prev - goodie.costSilver);
    if (!isMuted) sounds.playVictory();

    if (goodie.actionTrigger) {
      handleSetAllAction(goodie.actionTrigger);
    }
    setIsShopOpen(false);
  };

  // Photo Snapshot
  const handleTakeSnapshot = () => {
    if (!isMuted) sounds.playTap();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 300);
  };

  return (
    <div
      className="h-full flex flex-col bg-[#fdf6e2] text-stone-900 select-none overflow-hidden relative font-sans"
      onMouseMove={handleMouseMoveSanctuary}
      onTouchMove={handleTouchMoveSanctuary}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      {/* Photo Flash Overlay */}
      {photoFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* TOP HEADER CONTROLS BAR (Neko Atsume / Cat Snack Bar Warm Wooden Aesthetic) */}
      <div className="h-14 px-3 sm:px-5 bg-[#fff8e7] border-b-2 border-[#d97706]/30 shadow-sm flex items-center justify-between z-30 shrink-0">
        {/* Title with Neko Paw Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#fbbf24] border-2 border-[#b45309] flex items-center justify-center text-2xl shadow-sm">
            <span>🐾</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-[#78350f] flex items-center gap-2 tracking-tight">
              <span>Neko Atsume Sanctuary</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#d97706]/40">
                {cats.length} {cats.length === 1 ? 'cat' : 'cats'}
              </span>
            </h1>
            <p className="text-[11px] text-[#92400e]/80 font-bold hidden sm:block">
              Tap any cat for unique breed meow sounds · Silly dress-up · Feed & relax
            </p>
          </div>
        </div>

        {/* Currency & Primary Navigation Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fish Currency Counters */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#fffbeb] border-2 border-[#f59e0b]/40 shadow-inner text-xs font-black">
            <span className="flex items-center gap-1 text-slate-700" title="Silver Fish">
              <span>🐟</span>
              <span>{silverFish}</span>
            </span>
            <div className="w-px h-3.5 bg-amber-300" />
            <span className="flex items-center gap-1 text-amber-600" title="Gold Fish">
              <span>✨</span>
              <span>{goldFish}</span>
            </span>
          </div>

          {/* Cat Book (Cat-o-logue Album) */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsCatBookOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#fef3c7] hover:bg-[#fde68a] text-[#78350f] border-2 border-[#d97706]/40 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Open Cat Book (Neko Atsume Album)"
          >
            <BookOpen className="w-4 h-4 text-[#b45309]" />
            <span className="hidden sm:inline">Cat Book</span>
          </button>

          {/* Goodies Shop */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsShopOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#14532d] border-2 border-[#22c55e]/40 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Open Neko Treats & Toys Shop"
          >
            <ShoppingBag className="w-4 h-4 text-[#16a34a]" />
            <span className="hidden sm:inline">Shop</span>
          </button>

          {/* Laser Pointer */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsLaserActive((prev) => !prev);
            }}
            className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border-2 ${
              isLaserActive
                ? 'bg-rose-500 text-white border-rose-700 shadow-md animate-pulse'
                : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-[#d97706]/30'
            }`}
            title="Laser Pointer mode"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            <span className="hidden md:inline">Laser</span>
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleTakeSnapshot}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-2 border-[#d97706]/30 text-xs font-black flex items-center gap-1.5 transition-all"
            title="Take a photo snapshot"
          >
            <Camera className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">Photo</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsMuted((prev) => !prev);
              sounds.enabled = isMuted;
            }}
            className="p-2 rounded-xl bg-[#fffbeb] hover:bg-[#fef3c7] border-2 border-[#d97706]/30 text-[#78350f] transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Adopt Kitty Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsAdoptModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md border-2 border-[#b45309] transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adopt</span>
          </button>
        </div>
      </div>

      {/* ALL CATS QUICK GROUP ACTION BAR */}
      <div className="px-4 py-1.5 bg-[#fef3c7]/90 border-b border-[#d97706]/20 flex items-center justify-between text-xs font-extrabold overflow-x-auto gap-2 z-20 shrink-0">
        <div className="flex items-center gap-1 text-[#92400e] text-[11px] whitespace-nowrap">
          <span>Make All:</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleSetAllAction('loaf')}
            className="px-2.5 py-1 rounded-xl bg-amber-200/70 hover:bg-amber-300 text-amber-900 border border-amber-400 flex items-center gap-1 transition-all active:scale-95"
          >
            <span>Loaf 🍞</span>
          </button>
          <button
            onClick={() => handleSetAllAction('sleep')}
            className="px-2.5 py-1 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 flex items-center gap-1 transition-all active:scale-95"
          >
            <Moon className="w-3 h-3 text-indigo-600" />
            <span>Sleep 💤</span>
          </button>
          <button
            onClick={() => handleSetAllAction('eat')}
            className="px-2.5 py-1 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300 flex items-center gap-1 transition-all active:scale-95"
          >
            <Utensils className="w-3 h-3 text-orange-600" />
            <span>Feast 🐟</span>
          </button>
          <button
            onClick={() => handleSetAllAction('drink')}
            className="px-2.5 py-1 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 flex items-center gap-1 transition-all active:scale-95"
          >
            <Coffee className="w-3 h-3 text-cyan-600" />
            <span>Milk 🥛</span>
          </button>
          <button
            onClick={() => handleSetAllAction('dance')}
            className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300 flex items-center gap-1 transition-all active:scale-95"
          >
            <Music className="w-3 h-3 text-pink-600" />
            <span>Dance 🪩</span>
          </button>
          <button
            onClick={handleRandomizeCostumes}
            className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 flex items-center gap-1 transition-all active:scale-95"
          >
            <Shuffle className="w-3 h-3 text-purple-600" />
            <span>Mix Outfits</span>
          </button>
        </div>
      </div>

      {/* NEKO ATSUME YARD / SANCTUARY STAGE */}
      <div
        ref={sanctuaryRef}
        className="flex-1 relative overflow-hidden bg-[#e8eed9] select-none"
        onClick={() => setSelectedCatId(null)}
      >
        {/* Neko Atsume Japanese Engawa Porch & Garden Yard Art Layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 1. Left Indoor Room & Wooden Veranda Deck (Engawa) */}
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#d79a5b] border-r-4 border-[#8c5222] shadow-2xl">
            {/* Wooden Planks Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_92%,rgba(92,51,18,0.35)_100%)] bg-[length:100%_44px]" />
            
            {/* Sliding Shoji Screen / Wall at top */}
            <div className="absolute top-0 inset-x-0 h-24 bg-[#fff8e7] border-b-4 border-[#8c5222] flex items-center justify-around px-4 opacity-90">
              <div className="w-16 h-16 border-2 border-[#a66a38] bg-white/60 rounded" />
              <div className="w-16 h-16 border-2 border-[#a66a38] bg-white/60 rounded" />
              <div className="w-16 h-16 border-2 border-[#a66a38] bg-white/60 rounded" />
            </div>

            {/* Furniture Cabinet in room */}
            <div className="absolute top-28 left-6 w-36 h-24 rounded-lg bg-[#b4713a] border-3 border-[#5c3312] shadow-md flex flex-col justify-between p-2">
              <div className="w-8 h-8 rounded-full bg-white/80 border-2 border-[#5c3312] mx-auto -mt-6 shadow flex items-center justify-center text-xs">
                🌿
              </div>
              <div className="grid grid-cols-2 gap-1.5 h-12">
                <div className="border-2 border-[#5c3312] bg-[#d79a5b]/60 rounded" />
                <div className="border-2 border-[#5c3312] bg-[#d79a5b]/60 rounded" />
              </div>
            </div>

            {/* Fish Bowl on deck */}
            <div className="absolute top-44 left-48 text-3xl animate-bounce">
              🐟
            </div>

            {/* Round Green Clover Rug on deck */}
            <div className="absolute bottom-10 left-8 w-44 h-32 rounded-[50%] bg-[#a3c983] border-3 border-[#527933] shadow-inner flex items-center justify-center">
              <span className="text-xl opacity-40">☘️</span>
            </div>

            {/* Cardboard Box Cube ("Mikan Box") */}
            <div className="absolute bottom-16 left-12 w-20 h-20 rounded-xl bg-[#f59e0b] border-3 border-[#92400e] shadow-lg flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#78350f] border-2 border-[#92400e] flex items-center justify-center text-sm shadow-inner">
                🐱
              </div>
              <span className="text-[9px] font-black text-amber-950 mt-1">みかん</span>
            </div>

            {/* Red Silk Cushion on deck */}
            <div className="absolute bottom-8 left-48 w-24 h-16 rounded-2xl bg-[#dc2626] border-3 border-[#7f1d1d] shadow-md flex items-center justify-center">
              <div className="w-16 h-8 border border-yellow-300/60 rounded-xl border-dashed" />
            </div>
          </div>

          {/* 2. Right Garden Yard with Snow Patches & Stepping Stones */}
          <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#bcd69b] overflow-hidden">
            {/* Garden Fence / Wall at top */}
            <div className="absolute top-0 inset-x-0 h-28 bg-[#dfc09f] border-b-4 border-[#8c5222] p-3">
              <div className="w-full h-full border-2 border-dashed border-[#8c5222] rounded flex items-center justify-around">
                <span className="text-2xl">🌱</span>
                <span className="text-2xl">🌾</span>
              </div>
            </div>

            {/* Garden Stepping Stones (like in screenshot) */}
            <div className="absolute top-36 right-16 flex flex-col gap-3">
              <div className="w-20 h-12 rounded-2xl bg-[#e2e8f0] border-3 border-[#64748b] shadow" />
              <div className="w-24 h-14 rounded-2xl bg-[#cbd5e1] border-3 border-[#475569] shadow" />
              <div className="w-20 h-12 rounded-2xl bg-[#e2e8f0] border-3 border-[#64748b] shadow" />
            </div>

            {/* S-Track Toy with Ball (like in Neko Atsume screenshot) */}
            <div className="absolute bottom-16 right-16 w-32 h-20 rounded-3xl border-4 border-[#3b82f6] bg-[#bfdbfe]/80 shadow-md flex items-center justify-around px-2">
              <div className="w-5 h-5 rounded-full bg-indigo-600 border-2 border-white animate-bounce shadow" />
              <span className="text-xs font-black text-blue-900 tracking-widest">S-TRACK</span>
            </div>

            {/* Garden Beach Parasol */}
            <div className="absolute top-36 left-2 flex flex-col items-center z-10">
              <div className="w-32 h-14 rounded-t-full bg-gradient-to-r from-red-500 via-white to-emerald-500 border-3 border-[#2b1810] shadow-lg flex items-center justify-around">
                <div className="w-1.5 h-12 bg-white/40" />
              </div>
              <div className="w-2 h-24 bg-stone-700 border-x border-[#2b1810]" />
              <div className="w-12 h-3 rounded-full bg-stone-800 shadow" />
            </div>

            {/* Food Plates / Sushi Dish on yard floor */}
            <div className="absolute bottom-6 left-6 w-20 h-12 rounded-full bg-[#fef3c7] border-3 border-[#b45309] shadow-md flex items-center justify-center">
              <span className="text-base animate-pulse">🍣</span>
            </div>
          </div>
        </div>

        {/* Disco Ball during Dance Party */}
        {isDiscoParty && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 animate-in slide-in-from-top duration-500">
            <div className="w-1 h-10 bg-[#78350f]" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-200 via-pink-300 to-cyan-200 border-3 border-[#78350f] shadow-2xl animate-spin flex items-center justify-center text-xl">
              🪩
            </div>
          </div>
        )}

        {/* Laser Pointer Red Dot */}
        {isLaserActive && (
          <div
            className="absolute w-4 h-4 rounded-full bg-rose-600 shadow-[0_0_15px_#f43f5e] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 animate-ping"
            style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
          />
        )}

        {/* Floating Petting Hearts & Breed Meow Onomatopoeia Text */}
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

        {/* DRAGGABLE MINIATURE CATS */}
        {cats.map((cat) => {
          const breed = CAT_BREEDS.find((b) => b.id === cat.breedId) || CAT_BREEDS[0];
          const isSelected = selectedCatId === cat.id;

          return (
            <div
              key={cat.id}
              className={`absolute cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-opacity z-20 ${
                cat.isDragging ? 'z-40 scale-110' : ''
              }`}
              style={{
                left: `${cat.x}%`,
                top: `${cat.y}%`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedCatId(cat.id);
                setDraggingCatId(cat.id);
                handlePetCat(e, cat.id);
              }}
              onTouchStart={(e) => {
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
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#fff8e7]/95 text-[10px] font-black text-[#78350f] border-2 border-[#78350f] whitespace-nowrap shadow-sm pointer-events-none">
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

      {/* BOTTOM SELECTED CAT CONTROL PANEL / HUD */}
      {selectedCat && (
        <div className="px-4 py-2.5 bg-[#fff8e7] border-t-2 border-[#d97706]/30 z-30 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0 shadow-lg">
          {/* Selected Cat Profile info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={(e) => handlePetCat(e, selectedCat.id)}
              className="relative group p-0.5 rounded-2xl bg-[#fbbf24] border-2 border-[#b45309] shadow hover:scale-105 active:scale-95 transition-transform"
              title="Click to Pet Kitty & Hear Breed Meow!"
            >
              <div className="w-11 h-11 rounded-[12px] bg-[#fffbeb] flex items-center justify-center text-2xl">
                <span>🐱</span>
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-500 text-white text-[10px] shadow">
                💖
              </span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#78350f]">{selectedCat.name}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#d97706]/40">
                  {selectedBreed.name}
                </span>
                <span className="text-[11px] font-black text-rose-600 flex items-center gap-1">
                  <Volume1 className="w-3.5 h-3.5" />
                  <span>"{selectedBreed.meowOnomatopoeia}"</span>
                </span>
              </div>
              <p className="text-[11px] text-[#92400e]/80 font-semibold max-w-sm line-clamp-1">
                {selectedBreed.meowStyle} · Snack: {selectedBreed.favoriteSnack}
              </p>
            </div>
          </div>

          {/* Action Buttons for Selected Cat */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end overflow-x-auto">
            {/* Pet Button with Breed Sound */}
            <button
              onClick={(e) => handlePetCat(e, selectedCat.id)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black shadow flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Pet ({selectedBreed.meowOnomatopoeia})</span>
            </button>

            {/* Loaf */}
            <button
              onClick={() => handleSetCatAction(selectedCat.id, 'loaf')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                selectedCat.action === 'loaf'
                  ? 'bg-amber-400 text-amber-950 border-amber-600 shadow'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-amber-300'
              }`}
            >
              <span>Loaf 🍞</span>
            </button>

            {/* Sleep */}
            <button
              onClick={() => handleSetCatAction(selectedCat.id, 'sleep')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                selectedCat.action === 'sleep'
                  ? 'bg-indigo-500 text-white border-indigo-700 shadow'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-amber-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep</span>
            </button>

            {/* Eat */}
            <button
              onClick={() => handleSetCatAction(selectedCat.id, 'eat')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                selectedCat.action === 'eat'
                  ? 'bg-orange-500 text-white border-orange-700 shadow'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-amber-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Eat</span>
            </button>

            {/* Drink */}
            <button
              onClick={() => handleSetCatAction(selectedCat.id, 'drink')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                selectedCat.action === 'drink'
                  ? 'bg-cyan-500 text-white border-cyan-700 shadow'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-amber-300'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Drink</span>
            </button>

            {/* Dance */}
            <button
              onClick={() => handleSetCatAction(selectedCat.id, 'dance')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                selectedCat.action === 'dance'
                  ? 'bg-pink-500 text-white border-pink-700 shadow'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#78350f] border-amber-300'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Dance</span>
            </button>

            {/* Dress Up */}
            <button
              onClick={() => {
                sounds.playTap();
                setIsWardrobeOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black flex items-center gap-1.5 shadow border border-purple-800 transition-transform active:scale-95"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Costumes</span>
            </button>

            {/* Remove */}
            {cats.length > 1 && (
              <button
                onClick={() => handleRemoveCat(selectedCat.id)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Put kitty up for adoption"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* NEKO ATSUME CAT BOOK (CAT-O-LOGUE) MODAL */}
      {isCatBookOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fff8e7] border-4 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d97706]/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="text-base font-black text-[#78350f]">
                    Cat-o-logue Book (ねこ手帳)
                  </h2>
                  <p className="text-xs text-[#92400e] font-semibold">
                    16 Unique Cat Breeds & their distinct voice meow sounds!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCatBookOpen(false)}
                className="p-2 rounded-full hover:bg-amber-100 text-[#78350f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Cat Book Polaroid Cards */}
            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CAT_BREEDS.map((breed) => (
                <div
                  key={breed.id}
                  className="p-4 rounded-2xl bg-white border-2 border-[#d97706]/40 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-black text-[#78350f]">{breed.name}</h4>
                      <p className="text-[10px] text-[#92400e] font-bold">{breed.origin}</p>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playBreedMeow(breed.id);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#78350f] border border-amber-300 text-[11px] font-black flex items-center gap-1 transition-transform active:scale-90"
                      title="Play breed sound"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>{breed.meowOnomatopoeia}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-600 font-medium mb-2">
                    {breed.personality}
                  </p>

                  <div className="pt-2 border-t border-stone-200 text-[10px] flex items-center justify-between font-bold text-stone-500">
                    <span>Power Level: {breed.powerLevel || 100}</span>
                    <span className="text-amber-700">Fav Snack: {breed.favoriteSnack}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t-2 border-[#d97706]/30 flex items-center justify-end">
              <button
                onClick={() => setIsCatBookOpen(false)}
                className="px-6 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-black shadow transition-transform active:scale-95"
              >
                Close Cat Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEKO ATSUME SHOP MODAL */}
      {isShopOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fff8e7] border-4 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d97706]/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h2 className="text-base font-black text-[#78350f]">
                    Neko Goodies & Treats Shop (かいもの)
                  </h2>
                  <p className="text-xs text-[#92400e] font-semibold">
                    Buy delicious cat food and toys with your Silver 🐟 & Gold 🐟✨ Fish!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShopOpen(false)}
                className="p-2 rounded-full hover:bg-amber-100 text-[#78350f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Goodies Grid (matching Neko Atsume screenshot recipe cards) */}
            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {NEKO_SHOP_GOODIES.map((goodie) => (
                <div
                  key={goodie.id}
                  className="p-3.5 rounded-2xl bg-white border-2 border-[#d97706]/40 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-3xl">{goodie.emoji}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {goodie.japaneseName}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-[#78350f] mt-1">{goodie.name}</h4>
                    <p className="text-[10px] text-stone-600 mt-1 line-clamp-2">
                      {goodie.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleBuyGoodie(goodie)}
                    disabled={silverFish < goodie.costSilver}
                    className="mt-3 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95"
                  >
                    <span>Buy for {goodie.costSilver} 🐟</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t-2 border-[#d97706]/30 flex items-center justify-between">
              <div className="text-xs font-black text-[#78350f]">
                Your Balance: <strong>{silverFish} 🐟</strong> · <strong>{goldFish} ✨</strong>
              </div>
              <button
                onClick={() => setIsShopOpen(false)}
                className="px-6 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-black shadow transition-transform active:scale-95"
              >
                Done Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SILLY COSTUMES WARDROBE DRAWER MODAL */}
      {isWardrobeOpen && selectedCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fff8e7] border-4 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d97706]/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👗</span>
                <div>
                  <h2 className="text-base font-black text-[#78350f]">
                    Silly Costumes Wardrobe
                  </h2>
                  <p className="text-xs text-[#92400e] font-semibold">
                    Dress up <strong className="text-amber-800">{selectedCat.name}</strong> ({selectedBreed.name})!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWardrobeOpen(false)}
                className="p-2 rounded-full hover:bg-amber-100 text-[#78350f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Costumes Grid */}
            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAT_COSTUMES.map((costume) => {
                const isEquipped = selectedCat.costumeId === costume.id;

                return (
                  <button
                    key={costume.id}
                    onClick={() => handleEquipCostume(costume.id)}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 ${
                      isEquipped
                        ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-500 shadow-md'
                        : 'bg-white border-[#d97706]/30 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{costume.emoji}</span>
                      {isEquipped && (
                        <span className="p-1 rounded-full bg-purple-600 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#78350f]">{costume.name}</h4>
                      <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                        {costume.tagline}
                      </p>
                      <p className="text-[10px] text-stone-600 mt-1 line-clamp-2">
                        {costume.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t-2 border-[#d97706]/30 flex items-center justify-between">
              <button
                onClick={handleRandomizeCostumes}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-xs font-black text-[#78350f] flex items-center gap-1.5 border border-amber-300"
              >
                <Shuffle className="w-3.5 h-3.5 text-purple-600" />
                <span>Randomize All Cats</span>
              </button>
              <button
                onClick={() => setIsWardrobeOpen(false)}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow"
              >
                Done Dressing Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADOPT NEW KITTY MODAL */}
      {isAdoptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fff8e7] border-4 border-[#b45309] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d97706]/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <h2 className="text-base font-black text-[#78350f]">
                    Adopt a New Miniature Kitty
                  </h2>
                  <p className="text-xs text-[#92400e] font-semibold">
                    Select any of the 16 breeds with unique voice meows.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdoptModalOpen(false)}
                className="p-2 rounded-full hover:bg-amber-100 text-[#78350f] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Breed Picker List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CAT_BREEDS.map((breed) => {
                  const isSelected = selectedBreedForAdoption === breed.id;

                  return (
                    <button
                      key={breed.id}
                      onClick={() => {
                        sounds.playBreedMeow(breed.id);
                        setSelectedBreedForAdoption(breed.id);
                        if (!newCatName) setNewCatName(breed.name.split(' ')[0]);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500 shadow-md'
                          : 'bg-white border-[#d97706]/30 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-[#2b1810] shadow-inner"
                          style={{ backgroundColor: breed.bodyColor }}
                        />
                        <span className="text-[10px] font-black text-rose-600 flex items-center gap-0.5">
                          <Volume2 className="w-3 h-3" />
                          <span>{breed.meowOnomatopoeia}</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-[#78350f]">{breed.name}</h4>
                      <p className="text-[10px] text-stone-600 mt-0.5 line-clamp-1">
                        {breed.personality}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Name Input */}
              <div className="pt-2">
                <label className="block text-xs font-black text-[#78350f] mb-1.5">
                  Give your new kitty a name:
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Mikan, Cheddar, Wasabi, Marshmallow..."
                  className="w-full px-4 py-2 rounded-xl bg-white border-2 border-[#d97706]/40 text-sm font-black text-[#78350f] placeholder-stone-400 focus:outline-none focus:border-[#b45309] transition-colors"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t-2 border-[#d97706]/30 flex items-center justify-between">
              <button
                onClick={() => setIsAdoptModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#92400e] hover:bg-amber-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdoptKitty}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow border border-[#b45309] transition-transform active:scale-95"
              >
                Adopt & Bring Home 🐾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
