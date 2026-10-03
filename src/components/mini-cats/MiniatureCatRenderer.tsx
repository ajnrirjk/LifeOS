import React from 'react';
import { MiniCat, CatBreed } from '../../types/miniCats';

interface Props {
  cat: MiniCat;
  breed: CatBreed;
  isSelected?: boolean;
  onPet?: (e: React.MouseEvent) => void;
}

export const MiniatureCatRenderer: React.FC<Props> = ({ cat, breed, isSelected, onPet }) => {
  const isSleep = cat.action === 'sleep';
  const isLoaf = cat.action === 'loaf';
  const isEat = cat.action === 'eat';
  const isDrink = cat.action === 'drink';
  const isDance = cat.action === 'dance';
  const isDragging = cat.isDragging;

  const outlineColor = '#2b1810'; // Warm Neko Atsume hand-drawn ink outline

  return (
    <div
      className={`relative select-none transition-transform duration-150 ${
        cat.facingLeft ? '-scale-x-100' : 'scale-x-100'
      }`}
      style={{
        transform: `scale(${cat.scale}) ${cat.facingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
      }}
    >
      {/* Floating Action / Sound Particles */}
      {isSleep && (
        <div className="absolute -top-7 right-2 flex flex-col items-center animate-bounce z-20 pointer-events-none">
          <span className="text-xs font-black text-indigo-500 dark:text-indigo-300 drop-shadow-sm animate-pulse">
            Z<span className="text-[10px]">z</span><span className="text-[8px]">z</span>
          </span>
          <span className="text-sm">💤</span>
        </div>
      )}

      {isLoaf && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-700 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shadow-sm z-20 pointer-events-none whitespace-nowrap animate-pulse">
          Loafing 🍞
        </div>
      )}

      {isEat && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-amber-600 bg-amber-50/90 border border-amber-300 px-2 py-0.5 rounded-full shadow-sm z-20 pointer-events-none whitespace-nowrap animate-pulse">
          Nom nom! 🐟
        </div>
      )}

      {isDrink && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-cyan-600 bg-cyan-50/90 border border-cyan-300 px-2 py-0.5 rounded-full shadow-sm z-20 pointer-events-none whitespace-nowrap animate-pulse">
          Slurp! 🥛
        </div>
      )}

      {isDance && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 text-sm animate-bounce z-20 pointer-events-none">
          <span className="text-pink-500 animate-pulse">🎵</span>
          <span className="text-amber-400">✨</span>
          <span className="text-purple-400 animate-pulse">🎶</span>
        </div>
      )}

      {/* Thought / Speech Bubble */}
      {cat.thoughtBubble && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white/95 text-stone-900 text-[10px] font-black px-2.5 py-1 rounded-2xl shadow-xl border-2 border-stone-800 whitespace-nowrap z-30 animate-in fade-in zoom-in-75 pointer-events-none">
          {cat.thoughtBubble}
          <div className="w-2 h-2 bg-white border-r-2 border-b-2 border-stone-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* NEKO ATSUME / CAT SNACK BAR CHONKY VECTOR SPRITE */}
      <svg
        viewBox="0 0 100 80"
        className={`w-20 h-16 sm:w-24 sm:h-20 overflow-visible transition-transform duration-200 ${
          isDance ? 'animate-[bounce_0.6s_infinite]' : ''
        } ${isDragging ? '-translate-y-2 scale-105 drop-shadow-2xl' : ''}`}
      >
        <defs>
          {/* Subtle drop shadow */}
          <filter id={`shadow-${cat.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#2b1810" floodOpacity="0.2" />
          </filter>

          {/* Rainbow gradient for unicorn */}
          <linearGradient id="unicornRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="33%" stopColor="#c084fc" />
            <stop offset="66%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Gold gradient for crowns & chains */}
          <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* 1. Tail */}
        <g className={isDance ? 'animate-[spin_2s_ease-in-out_infinite]' : ''}>
          {breed.tailType === 'thin' ? (
            /* Japanese Bobtail: Cute Pom-pom rabbit bunny tail */
            <circle
              cx="20"
              cy="52"
              r="6"
              fill={breed.secondaryColor || breed.bodyColor}
              stroke={outlineColor}
              strokeWidth="2.4"
            />
          ) : isLoaf || isSleep ? (
            /* Curled cozy tail alongside body */
            <path
              d="M 24 56 C 14 55 12 65 24 65"
              fill="none"
              stroke={breed.bodyColor}
              strokeWidth="6"
              strokeLinecap="round"
            />
          ) : (
            /* Upright cheerful curved tail with thick outline */
            <path
              d="M 24 52 C 10 46 6 28 16 18 C 21 14 26 22 20 28 C 16 34 18 46 25 54"
              fill={breed.bodyColor}
              stroke={outlineColor}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* 2. Main Chonky Body */}
        {isLoaf ? (
          /* Neko Atsume Classic Loaf Silhouette */
          <ellipse
            cx="48"
            cy="54"
            rx="26"
            ry="18"
            fill={breed.bodyColor}
            stroke={outlineColor}
            strokeWidth="2.8"
            filter={`url(#shadow-${cat.id})`}
          />
        ) : isSleep ? (
          /* Stretched out cozy sleeping bean */
          <ellipse
            cx="48"
            cy="54"
            rx="25"
            ry="16"
            fill={breed.bodyColor}
            stroke={outlineColor}
            strokeWidth="2.8"
            filter={`url(#shadow-${cat.id})`}
          />
        ) : (
          /* Chonky Sitting / Walking Body */
          <ellipse
            cx="48"
            cy="50"
            rx="23"
            ry="18"
            fill={breed.bodyColor}
            stroke={outlineColor}
            strokeWidth="2.8"
            filter={`url(#shadow-${cat.id})`}
          />
        )}

        {/* Tabby Stripes / Markings */}
        {breed.pattern === 'tabby' && breed.stripeColor && (
          <g stroke={breed.stripeColor} strokeWidth="3" strokeLinecap="round" opacity="0.9">
            <path d="M 38 40 Q 40 48 36 54" />
            <path d="M 46 38 Q 48 46 44 55" />
            <path d="M 54 40 Q 56 48 52 54" />
          </g>
        )}

        {/* Bengal Leopard Spots */}
        {breed.pattern === 'spots' && breed.stripeColor && (
          <g fill={breed.stripeColor} stroke={outlineColor} strokeWidth="0.8" opacity="0.9">
            <circle cx="36" cy="44" r="3" />
            <circle cx="46" cy="42" r="3.5" />
            <circle cx="56" cy="46" r="3" />
            <circle cx="42" cy="53" r="2.5" />
            <circle cx="50" cy="55" r="2.8" />
          </g>
        )}

        {/* Calico Patches */}
        {breed.pattern === 'calico' && (
          <g>
            <path
              d="M 32 40 Q 40 36 44 45 Q 38 53 30 47 Z"
              fill={breed.secondaryColor || '#ea580c'}
              stroke={outlineColor}
              strokeWidth="2"
            />
            <path
              d="M 46 38 Q 54 36 56 44 Q 50 50 44 46 Z"
              fill={breed.stripeColor || '#1e293b'}
              stroke={outlineColor}
              strokeWidth="2"
            />
          </g>
        )}

        {/* Tuxedo White Bib Chest */}
        {breed.pattern === 'bicolor' && (
          <path
            d="M 50 40 Q 62 42 64 56 Q 56 64 46 62 Q 44 50 50 40 Z"
            fill={breed.bellyColor}
            stroke={outlineColor}
            strokeWidth="2"
          />
        )}

        {/* Paws */}
        {!isLoaf && !isSleep && (
          <g fill={breed.bellyColor || breed.bodyColor} stroke={outlineColor} strokeWidth="2.4">
            {/* Front Left Paw */}
            <ellipse
              cx={isDance ? '66' : '64'}
              cy={isDance ? '56' : '64'}
              rx="5"
              ry="4"
            />
            {/* Front Right Paw */}
            <ellipse
              cx={isDance ? '54' : '52'}
              cy={isDance ? '54' : '65'}
              rx="5"
              ry="4"
            />
            {/* Back Paw */}
            <ellipse
              cx="34"
              cy="64"
              rx="5"
              ry="4"
            />
          </g>
        )}

        {/* Paws tucked underneath for Loaf */}
        {isLoaf && (
          <g fill={breed.bellyColor || breed.bodyColor} stroke={outlineColor} strokeWidth="2.2">
            <ellipse cx="60" cy="65" rx="5" ry="3" />
            <ellipse cx="48" cy="65" rx="5" ry="3" />
          </g>
        )}

        {/* 3. Cat Head */}
        <g
          className={
            isDance
              ? 'animate-[wiggle_0.4s_ease-in-out_infinite]'
              : isSleep
              ? 'animate-pulse'
              : ''
          }
        >
          {/* Ears */}
          {breed.earType === 'folded' ? (
            /* Scottish Fold: cute folded rounded ears */
            <g fill={breed.bodyColor} stroke={outlineColor} strokeWidth="2.4" strokeLinejoin="round">
              <path d="M 59 22 Q 62 15 68 17 Q 72 20 69 26 Z" />
              <path d="M 77 22 Q 80 15 86 17 Q 90 20 87 26 Z" />
              <path d="M 62 21 Q 65 18 68 22 Z" fill={breed.earInnerColor} stroke="none" />
              <path d="M 80 21 Q 83 18 86 22 Z" fill={breed.earInnerColor} stroke="none" />
            </g>
          ) : breed.earType === 'large' ? (
            /* Sphynx & Siamese: Large elf ears */
            <g fill={breed.secondaryColor || breed.bodyColor} stroke={outlineColor} strokeWidth="2.4" strokeLinejoin="round">
              <polygon points="56,24 61,4 72,19" />
              <polygon points="58,22 62,8 70,18" fill={breed.earInnerColor} stroke="none" />
              <polygon points="77,19 88,4 93,24" />
              <polygon points="79,18 86,8 90,22" fill={breed.earInnerColor} stroke="none" />
            </g>
          ) : breed.earType === 'tufted' ? (
            /* Maine Coon / Norwegian Forest: Lynx tufted ears */
            <g fill={breed.bodyColor} stroke={outlineColor} strokeWidth="2.4" strokeLinejoin="round">
              <polygon points="57,25 64,8 74,21" />
              <polygon points="60,23 65,12 71,20" fill={breed.earInnerColor} stroke="none" />
              <line x1="64" y1="8" x2="63" y2="2" stroke={outlineColor} strokeWidth="2.5" />

              <polygon points="75,21 85,8 91,25" />
              <polygon points="77,20 84,12 88,23" fill={breed.earInnerColor} stroke="none" />
              <line x1="85" y1="8" x2="86" y2="2" stroke={outlineColor} strokeWidth="2.5" />
            </g>
          ) : (
            /* Standard Pointy Cat Ears */
            <g fill={breed.bodyColor} stroke={outlineColor} strokeWidth="2.4" strokeLinejoin="round">
              <polygon points="58,25 66,10 74,21" />
              <polygon points="61,23 66,13 72,20" fill={breed.earInnerColor} stroke="none" />
              <polygon points="75,21 83,10 91,25" />
              <polygon points="77,20 83,13 88,23" fill={breed.earInnerColor} stroke="none" />
            </g>
          )}

          {/* Head Sphere */}
          <circle
            cx="74"
            cy="32"
            r="16.5"
            fill={breed.bodyColor}
            stroke={outlineColor}
            strokeWidth="2.8"
            filter={`url(#shadow-${cat.id})`}
          />

          {/* Siamese or Ragdoll Face Mask (Seal Point) */}
          {breed.pattern === 'points' && breed.secondaryColor && (
            <ellipse cx="75" cy="33" rx="11" ry="9" fill={breed.secondaryColor} opacity="0.9" />
          )}

          {/* Tabby Head Forehead 'M' mark */}
          {breed.pattern === 'tabby' && breed.stripeColor && (
            <path
              d="M 70 20 L 72 25 L 75 22 L 78 25 L 80 20"
              fill="none"
              stroke={breed.stripeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Eyes (Neko Atsume Classic Styling) */}
          {isSleep || isLoaf ? (
            /* Sleepy / Peaceful curved closed eyes ^^ */
            <g stroke={outlineColor} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M 67 32 Q 71 36 74 32" />
              <path d="M 77 32 Q 81 36 84 32" />
            </g>
          ) : isEat || isDrink ? (
            /* Blissful eating/drinking squint eyes */
            <g stroke={outlineColor} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M 66 33 Q 71 28 74 33" />
              <path d="M 77 33 Q 81 28 84 33" />
            </g>
          ) : (
            /* Big, bright kawaii eyes with shine highlights */
            <g>
              {/* Left Eye */}
              <circle cx="69" cy="31" r="3.8" fill={breed.eyeColor} stroke={outlineColor} strokeWidth="1.2" />
              <circle cx="69" cy="31" r="2.2" fill="#0f172a" />
              <circle cx="68" cy="30" r="1.2" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="81" cy="31" r="3.8" fill={breed.eyeColor} stroke={outlineColor} strokeWidth="1.2" />
              <circle cx="81" cy="31" r="2.2" fill="#0f172a" />
              <circle cx="80" cy="30" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Pink Nose */}
          <polygon
            points="74,36 77,36 75.5,38.5"
            fill={breed.noseColor}
          />

          {/* Mouth */}
          {isEat ? (
            /* Chomping mouth */
            <ellipse cx="75.5" cy="41" rx="4" ry="2.8" fill="#f43f5e" stroke={outlineColor} strokeWidth="1.5" className="animate-pulse" />
          ) : isDrink ? (
            /* Lapping pink tongue */
            <g>
              <path d="M 74 38 Q 75.5 40 77 38" stroke={outlineColor} strokeWidth="1.6" fill="none" />
              <path d="M 74.5 39 Q 75.5 44 76.5 39" fill="#fb7185" stroke={outlineColor} strokeWidth="1.2" />
            </g>
          ) : (
            /* Cute Neko Atsume cat smile :3 */
            <path
              d="M 72.5 39 Q 74 41.5 75.5 39.5 Q 77 41.5 78.5 39"
              fill="none"
              stroke={outlineColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Whiskers */}
          <g stroke={outlineColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
            <line x1="66" y1="37" x2="55" y2="36" />
            <line x1="66" y1="39" x2="54" y2="41" />
            <line x1="84" y1="37" x2="95" y2="36" />
            <line x1="84" y1="39" x2="96" y2="41" />
          </g>

          {/* Rosy Cheeks */}
          <circle cx="65" cy="35" r="2.8" fill="#fb7185" opacity="0.45" />
          <circle cx="85" cy="35" r="2.8" fill="#fb7185" opacity="0.45" />
        </g>

        {/* 4. Food / Drink Item In Front when Eating or Drinking */}
        {isEat && (
          <g className="animate-bounce">
            <ellipse cx="88" cy="56" rx="10" ry="4" fill="#e2e8f0" stroke={outlineColor} strokeWidth="1.8" />
            <path d="M 82 55 C 85 51 92 51 95 55 C 92 59 85 59 82 55 Z" fill="#38bdf8" stroke={outlineColor} strokeWidth="1.2" />
            <polygon points="95,55 99,52 99,58" fill="#0284c7" stroke={outlineColor} strokeWidth="1" />
          </g>
        )}

        {isDrink && (
          <g>
            <ellipse cx="88" cy="56" rx="10" ry="4" fill="#f8fafc" stroke={outlineColor} strokeWidth="2" />
            <ellipse cx="88" cy="56" rx="7.5" ry="2.5" fill="#bae6fd" />
          </g>
        )}

        {/* 5. Silly Costumes Layer (with thick hand-drawn outline aesthetic) */}
        {/* Wizard Costume */}
        {cat.costumeId === 'wizard' && (
          <g>
            <polygon points="68,18 78,-4 86,18" fill="#4338ca" stroke={outlineColor} strokeWidth="2.2" strokeLinejoin="round" />
            <ellipse cx="77" cy="18" rx="12" ry="4" fill="#6366f1" stroke={outlineColor} strokeWidth="2.2" />
            <circle cx="77" cy="6" r="1.8" fill="#fef08a" />
            <line x1="85" y1="28" x2="97" y2="18" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="97,18 98,14 101,18 98,21" fill="#fef08a" stroke={outlineColor} strokeWidth="1" />
          </g>
        )}

        {/* Taco Costume */}
        {cat.costumeId === 'taco' && (
          <g>
            <path
              d="M 28 54 Q 48 28 68 54 Q 70 62 62 65 Q 48 60 34 65 Z"
              fill="#fbbf24"
              stroke={outlineColor}
              strokeWidth="2.5"
            />
            <path d="M 32 50 Q 42 45 48 50 Q 56 45 64 50" stroke="#22c55e" strokeWidth="3.5" fill="none" />
            <circle cx="42" cy="48" r="2.5" fill="#ef4444" stroke={outlineColor} strokeWidth="0.8" />
            <circle cx="54" cy="48" r="2.8" fill="#ef4444" stroke={outlineColor} strokeWidth="0.8" />
          </g>
        )}

        {/* Royal Crown Costume */}
        {cat.costumeId === 'crown' && (
          <g>
            <path
              d="M 66 15 L 68 3 L 73 9 L 78 2 L 83 9 L 88 3 L 90 15 Z"
              fill="url(#goldShine)"
              stroke={outlineColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="68" cy="3" r="1.5" fill="#ef4444" />
            <circle cx="78" cy="2" r="1.8" fill="#3b82f6" />
            <circle cx="88" cy="3" r="1.5" fill="#ef4444" />
            <path
              d="M 30 46 Q 28 65 42 67 Q 50 65 54 48 Z"
              fill="#b91c1c"
              stroke={outlineColor}
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* Dino Onesie Costume */}
        {cat.costumeId === 'dino' && (
          <g>
            <path
              d="M 63 16 Q 74 6 85 16 Q 91 28 85 40 Q 63 40 63 16 Z"
              fill="#22c55e"
              stroke={outlineColor}
              strokeWidth="2.4"
            />
            <polygon points="68,14 70,6 73,13" fill="#facc15" stroke={outlineColor} strokeWidth="1.2" />
            <polygon points="74,10 77,4 79,10" fill="#facc15" stroke={outlineColor} strokeWidth="1.2" />
            <polygon points="80,14 83,6 85,13" fill="#facc15" stroke={outlineColor} strokeWidth="1.2" />
            <polygon points="44,36 47,28 49,36" fill="#facc15" stroke={outlineColor} strokeWidth="1.2" />
            <polygon points="36,40 38,32 41,40" fill="#facc15" stroke={outlineColor} strokeWidth="1.2" />
          </g>
        )}

        {/* In-Bread Loaf Collar Costume */}
        {cat.costumeId === 'bread' && (
          <g>
            <rect
              x="58"
              y="16"
              width="31"
              height="31"
              rx="9"
              fill="#fed7aa"
              stroke="#b45309"
              strokeWidth="4"
            />
            <circle cx="74" cy="32" r="13" fill="none" stroke="#fdba74" strokeWidth="2" />
          </g>
        )}

        {/* Banana Suit Costume */}
        {cat.costumeId === 'banana' && (
          <g>
            <path
              d="M 22 60 C 18 40 38 26 68 36 C 60 56 46 66 22 60 Z"
              fill="#facc15"
              stroke={outlineColor}
              strokeWidth="2.5"
            />
            <path d="M 20 60 L 15 62" stroke="#713f12" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* Chef Hat & Apron */}
        {cat.costumeId === 'chef' && (
          <g>
            <path
              d="M 67 18 Q 62 2 72 2 Q 76 -2 80 2 Q 87 2 85 18 Z"
              fill="#ffffff"
              stroke={outlineColor}
              strokeWidth="2.2"
            />
            <rect x="67" y="15" width="18" height="5" fill="#ffffff" stroke={outlineColor} strokeWidth="1.8" />
            <path d="M 46 42 L 58 42 L 56 58 L 44 58 Z" fill="#e0e7ff" stroke={outlineColor} strokeWidth="2" />
          </g>
        )}

        {/* Cool Sunglasses & Gold Chain */}
        {cat.costumeId === 'sunglasses' && (
          <g>
            <rect x="65" y="27" width="9" height="7" rx="2" fill="#09090b" stroke="#ffffff" strokeWidth="1" />
            <rect x="76" y="27" width="9" height="7" rx="2" fill="#09090b" stroke="#ffffff" strokeWidth="1" />
            <line x1="74" y1="29" x2="76" y2="29" stroke="#09090b" strokeWidth="2.2" />
            <path d="M 63 45 Q 74 54 83 45" fill="none" stroke="url(#goldShine)" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* Enchanted Unicorn */}
        {cat.costumeId === 'unicorn' && (
          <g>
            <polygon points="72,16 75,-4 78,16" fill="url(#goldShine)" stroke={outlineColor} strokeWidth="1.8" />
            <path d="M 68 18 Q 60 26 63 36" stroke="url(#unicornRainbow)" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Astro-Cat Explorer */}
        {cat.costumeId === 'astronaut' && (
          <g>
            <circle cx="74" cy="32" r="19" fill="#38bdf8" fillOpacity="0.25" stroke="#bae6fd" strokeWidth="2.6" />
            <rect x="26" y="38" width="7" height="18" rx="2.5" fill="#e2e8f0" stroke={outlineColor} strokeWidth="2" />
            <rect x="33" y="38" width="7" height="18" rx="2.5" fill="#e2e8f0" stroke={outlineColor} strokeWidth="2" />
          </g>
        )}

        {/* Cowboy Hat & Bandana */}
        {cat.costumeId === 'cowboy' && (
          <g>
            <ellipse cx="76" cy="16" rx="16" ry="5" fill="#92400e" stroke={outlineColor} strokeWidth="2" />
            <path d="M 69 16 Q 68 2 75 3 Q 78 1 81 3 Q 84 2 83 16 Z" fill="#b45309" stroke={outlineColor} strokeWidth="2" />
            <polygon points="67,42 83,42 75,52" fill="#ef4444" stroke={outlineColor} strokeWidth="1.5" />
          </g>
        )}

        {/* Daisy Flower Crown */}
        {cat.costumeId === 'flower_crown' && (
          <g>
            <ellipse cx="75" cy="18" rx="11" ry="3" fill="none" stroke="#22c55e" strokeWidth="2" />
            <circle cx="67" cy="18" r="2.6" fill="#f43f5e" stroke={outlineColor} strokeWidth="0.8" />
            <circle cx="75" cy="16" r="3" fill="#ffffff" stroke={outlineColor} strokeWidth="0.8" />
            <circle cx="83" cy="18" r="2.6" fill="#a855f7" stroke={outlineColor} strokeWidth="0.8" />
          </g>
        )}

        {/* Scuba Snorkel Diver */}
        {cat.costumeId === 'snorkel' && (
          <g>
            <rect x="65" y="27" width="20" height="8" rx="4" fill="#fb923c" stroke={outlineColor} strokeWidth="2" />
            <circle cx="70" cy="31" r="3" fill="#38bdf8" opacity="0.8" />
            <circle cx="80" cy="31" r="3" fill="#38bdf8" opacity="0.8" />
            <path d="M 86 32 L 93 32 L 93 12 L 90 10" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Shadow */}
      <div
        className={`w-14 h-2.5 mx-auto -mt-1 rounded-full bg-stone-900/40 blur-[2px] transition-all duration-150 ${
          isDragging ? 'scale-75 opacity-20' : 'scale-100 opacity-60'
        }`}
      />

      {/* Selected Indicator Ring */}
      {isSelected && (
        <div className="absolute -inset-2.5 rounded-3xl border-3 border-dashed border-amber-500 pointer-events-none animate-pulse ring-4 ring-amber-400/20" />
      )}
    </div>
  );
};
