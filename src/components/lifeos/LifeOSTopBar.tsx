import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { ChevronDown } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface LifeOSTopBarProps {
  onOpenPrivacy?: () => void;
}

export const LifeOSTopBar: React.FC<LifeOSTopBarProps> = ({ onOpenPrivacy }) => {
  const { activeAppId, apps, wallpaper, setWallpaper, isDesktopView, showDesktop, launchApp } = useLifeOS();

  const [timeStr, setTimeStr] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) +
        ' • ' +
        now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeApp = apps.find(a => a.id === activeAppId);

  const wallpapers: Array<{ id: any; label: string }> = [
    { id: 'mountain', label: 'Mountain Dawn' },
    { id: 'nebula', label: 'Midnight Nebula' },
    { id: 'olive', label: 'Olive Sanctuary' },
    { id: 'slate', label: 'Minimal Slate' },
    { id: 'aurora', label: 'Sacred Aurora' },
  ];

  return (
    <header className="h-8 bg-black/60 backdrop-blur-xl border-b border-white/10 text-white text-xs select-none flex items-center justify-between px-3 z-50 relative">
      {/* Left: LifeOS Logo, Desktop Button & Active App Name */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Apple/LifeOS Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 font-black px-2 py-0.5 rounded-md hover:bg-white/15 transition-colors"
          >
            <span className="text-sm">🌿</span>
            <span className="font-extrabold tracking-tight">LifeOS</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-7 left-0 w-48 bg-stone-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 text-stone-200 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase text-stone-400">
                Desktop Wallpaper
              </div>
              {wallpapers.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playTap();
                    setWallpaper(wp.id);
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                    wallpaper === wp.id ? 'bg-emerald-600 text-white' : 'hover:bg-white/10'
                  }`}
                >
                  <span>{wp.label}</span>
                  {wallpaper === wp.id && <span>✓</span>}
                </button>
              ))}

              <div className="h-px bg-white/10 my-1" />

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsMenuOpen(false);
                  if (onOpenPrivacy) onOpenPrivacy();
                }}
                className="px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>🛡️</span>
                <span>Privacy Policy</span>
              </button>

              <a
                href="/terms"
                onClick={() => {
                  sounds.playTap();
                  setIsMenuOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-white/10 text-stone-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>📜</span>
                <span>Terms of Service</span>
              </a>
            </div>
          )}
        </div>

        {/* Desktop / Widgets View Button */}
        <button
          onClick={() => {
            sounds.playTap();
            showDesktop();
          }}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg text-xs font-extrabold transition-all ${
            isDesktopView
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-sm'
              : 'hover:bg-white/15 text-stone-300'
          }`}
          title="Show LifeOS Desktop Widgets"
        >
          <span>🖥️</span>
          <span className="hidden sm:inline">Desktop Widgets</span>
          <span className="sm:hidden">Widgets</span>
        </button>

        {/* Active App Indicator & Mobile Quick Return */}
        {!isDesktopView && activeApp && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playTap();
                showDesktop();
              }}
              className="sm:hidden flex items-center gap-1 text-emerald-400 font-black text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40"
              title="Return to Desktop"
            >
              <span>◀</span>
              <span>Home</span>
            </button>
            <button
              onClick={() => launchApp(activeApp.id)}
              className="hidden sm:flex items-center gap-1.5 font-bold text-stone-300 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>{activeApp.emoji}</span>
              <span>{activeApp.title}</span>
            </button>
          </div>
        )}
      </div>

      {/* Center/Right: Privacy link & Live System Date/Time */}
      <div className="flex items-center gap-2">
        {onOpenPrivacy && (
          <button
            onClick={() => {
              sounds.playTap();
              onOpenPrivacy();
            }}
            className="text-[11px] font-semibold text-stone-300 hover:text-white px-1.5 sm:px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-1"
            title="View Life OS Privacy Policy"
          >
            <span>🛡️</span>
            <span className="hidden md:inline">Privacy Policy</span>
          </button>
        )}
        <div className="font-bold text-stone-200 tracking-tight text-[11px] whitespace-nowrap">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
