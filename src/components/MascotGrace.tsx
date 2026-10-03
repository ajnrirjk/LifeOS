import React from 'react';

export type MascotPose = 'happy' | 'cheering' | 'praying' | 'thinking' | 'comforting' | 'flying';

interface MascotGraceProps {
  pose?: MascotPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

export const MascotGrace: React.FC<MascotGraceProps> = ({
  pose = 'happy',
  size = 'md',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Dove Mascot "Grace" */}
      <div className={`relative ${sizeClasses} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Halo */}
          <ellipse
            cx="60"
            cy="18"
            rx="22"
            ry="6"
            className="stroke-amber-400 dark:stroke-amber-300"
            strokeWidth="3.5"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Dove Body & Tail */}
          <path
            d="M 30 75 C 20 85, 10 92, 12 98 C 15 102, 28 92, 38 82 C 45 88, 65 92, 82 82 C 96 74, 102 58, 98 42 C 95 32, 85 24, 74 25 C 62 26, 54 36, 46 45 C 38 54, 34 68, 30 75 Z"
            className="fill-white dark:fill-stone-100 stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Left Wing */}
          <path
            d={
              pose === 'cheering' || pose === 'flying'
                ? "M 48 48 C 30 20, 15 32, 28 65 C 34 60, 42 54, 48 48 Z"
                : pose === 'praying'
                ? "M 52 52 C 42 42, 36 60, 46 72 C 49 65, 50 58, 52 52 Z"
                : "M 45 52 C 25 45, 18 68, 35 76 C 39 68, 42 59, 45 52 Z"
            }
            className="fill-emerald-100 dark:fill-emerald-950 stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Right Wing */}
          <path
            d={
              pose === 'cheering' || pose === 'flying'
                ? "M 68 46 C 88 18, 102 30, 86 65 C 80 58, 74 52, 68 46 Z"
                : pose === 'praying'
                ? "M 64 52 C 72 42, 78 60, 68 72 C 66 65, 65 58, 64 52 Z"
                : "M 70 52 C 90 48, 95 72, 78 78 C 74 70, 72 60, 70 52 Z"
            }
            className="fill-white dark:fill-stone-100 stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Soft Cheek Blush */}
          <circle cx="68" cy="42" r="5" className="fill-rose-300/80" />

          {/* Beak */}
          <polygon
            points="88,38 102,42 88,46"
            className="fill-amber-500 stroke-amber-600"
            strokeWidth="1.5"
          />

          {/* Friendly Eyes */}
          {pose === 'praying' || pose === 'comforting' ? (
            // Peaceful closed curved eyes
            <path
              d="M 72 37 Q 77 34 82 37"
              className="stroke-stone-800 dark:stroke-stone-900"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Sparkly happy eyes
            <>
              <circle cx="76" cy="36" r="3.5" className="fill-stone-900" />
              <circle cx="77.5" cy="34.5" r="1.2" className="fill-white" />
            </>
          )}

          {/* Green Olive Branch in Beak */}
          <g transform="translate(85, 38) rotate(15)">
            <path
              d="M 5 5 Q 16 12 24 8"
              className="stroke-emerald-700"
              strokeWidth="2.5"
              fill="none"
            />
            <ellipse cx="14" cy="7" rx="4" ry="2.2" transform="rotate(-30 14 7)" className="fill-emerald-500 stroke-emerald-700" strokeWidth="1" />
            <ellipse cx="20" cy="9" rx="4" ry="2.2" transform="rotate(25 20 9)" className="fill-emerald-500 stroke-emerald-700" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Speech bubble */}
      {message && (
        <div className="relative bg-white dark:bg-slate-800 text-stone-800 dark:text-stone-100 text-sm md:text-base font-bold px-4 py-2.5 rounded-2xl border-2 border-stone-200 dark:border-slate-700 shadow-sm max-w-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-stone-200 dark:border-r-slate-700" />
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[7px] border-r-white dark:border-r-slate-800" />
          {message}
        </div>
      )}
    </div>
  );
};
