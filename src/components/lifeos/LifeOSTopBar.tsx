import React, { useState, useEffect } from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { ChevronDown, Settings, Shield, Crown } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface LifeOSTopBarProps {
  onOpenPrivacy?: () => void;
}

export const LifeOSTopBar: React.FC<LifeOSTopBarProps> = ({ onOpenPrivacy }) => {
  const { activeAppId, apps, wallpaper, setWallpaper, isDesktopView, showDesktop, launchApp } = useLifeOS();
  const { setIsSettingsOpen, settings, googleUser, isGoogleSigningIn, signInWithGoogle, isAuthorizedAdmin } = useSettings();

  const [timeStr, setTimeStr] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
  const isAdmin = settings.profile.role === 'admin' || settings.profile.role === 'superadmin';

  const wallpapers: Array<{ id: any; label: string }> = [
    { id: 'mountain', label: 'Mountain Dawn' },
    { id: 'nebula', label: 'Midnight Nebula' },
    { id: 'olive', label: 'Olive Sanctuary' },
    { id: 'slate', label: 'Minimal Slate' },
    { id: 'aurora', label: 'Sacred Aurora' },
  ];

  return (
    <header className="min-h-8 pt-[max(env(safe-area-inset-top,0px),44px)] pb-1.5 sm:pt-0 sm:pb-0 sm:h-8 bg-black/75 backdrop-blur-xl border-b border-white/10 text-white text-xs select-none flex items-center justify-between px-3 z-50 relative">
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
            <div className="absolute top-7 left-0 w-52 bg-stone-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 text-stone-200 text-xs">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg text-left text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Control Center & Admin</span>
                </div>
                <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-200 font-mono">GOD</span>
              </button>

              <div className="h-px bg-white/10 my-1" />

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
                    wallpaper === wp.id ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-white/10'
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

      {/* Center/Right: Google Auth, Admin & Settings shortcut, Privacy link & Live System Date/Time */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Google User Avatar / Sign-In Button */}
        {googleUser ? (
          <button
            onClick={() => {
              sounds.playTap();
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 transition-all text-[11px]"
            title={`Signed in as ${googleUser.email}`}
          >
            {googleUser.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt="Profile"
                className="w-4 h-4 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <span className="text-xs">🕊️</span>
            )}
            <span className="font-bold hidden sm:inline max-w-[100px] truncate">{googleUser.displayName || 'Believer'}</span>
            {isAuthorizedAdmin && (
              <span className="px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[9px] font-black font-mono">
                ADMIN
              </span>
            )}
          </button>
        ) : (
          <button
            disabled={isGoogleSigningIn}
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white text-stone-900 hover:bg-stone-100 font-black text-[11px] transition-all shadow-sm active:scale-95"
            title="Sign In with Google"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSigningIn ? '...' : 'Sign In'}</span>
          </button>
        )}

        {/* Settings & Admin Quick Trigger */}
        <button
          onClick={() => {
            sounds.playTap();
            setIsSettingsOpen(true);
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white font-bold text-[11px] transition-all"
          title="Open User Settings & Admin Control Center"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {onOpenPrivacy && (
          <button
            onClick={() => {
              sounds.playTap();
              onOpenPrivacy();
            }}
            className="text-[11px] font-semibold text-stone-300 hover:text-white px-1.5 sm:px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors hidden md:flex items-center gap-1"
            title="View Life OS Privacy Policy"
          >
            <span>🛡️</span>
            <span>Privacy</span>
          </button>
        )}

        <div className="font-bold text-stone-300 tracking-tight text-[11px] whitespace-nowrap hidden sm:block">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
