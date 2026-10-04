import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { ChevronDown, Settings, Shield, Crown, Megaphone, AlertTriangle, Sparkles, X, Lock, Columns2, ArrowLeftRight } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface LifeOSTopBarProps {
  onOpenPrivacy?: () => void;
}

export const LifeOSTopBar: React.FC<LifeOSTopBarProps> = ({ onOpenPrivacy }) => {
  const {
    activeAppId,
    apps,
    wallpaper,
    setWallpaper,
    isDesktopView,
    showDesktop,
    launchApp,
    splitScreen,
    enterSplitScreen,
    exitSplitScreen,
    toggleSplitScreen,
    setSplitPreset,
    swapSplitApps,
    setPrimaryApp,
    setSecondaryApp
  } = useLifeOS();
  const {
    setIsSettingsOpen,
    settings,
    googleUser,
    isGoogleSigningIn,
    signInWithGoogle,
    isAuthorizedAdmin,
    announcement,
    setAnnouncement,
    toggleMaintenanceMode
  } = useSettings();

  const [timeStr, setTimeStr] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isSplitMenuOpen, setIsSplitMenuOpen] = useState(false);

  useEffect(() => {
    setIsBannerDismissed(false);
  }, [announcement?.id, announcement?.timestamp]);

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

  const wallpapers: Array<{ id: any; label: string; icon: string }> = [
    { id: 'mountain', label: 'Mountain Dawn', icon: '🏔️' },
    { id: 'nebula', label: 'Midnight Nebula', icon: '🌌' },
    { id: 'olive', label: 'Olive Sanctuary', icon: '🌿' },
    { id: 'slate', label: 'Minimal Slate', icon: '⬛' },
    { id: 'aurora', label: 'Sacred Aurora', icon: '✨' },
    { id: 'stained_glass', label: 'Cathedral Glass', icon: '🎨' },
    { id: 'golden_temple', label: 'Golden Temple', icon: '🏛️' },
    { id: 'sunset_peaks', label: 'Galilee Sunset', icon: '🌅' },
    { id: 'cyber_neon', label: 'Cyber Arcade', icon: '⚡' },
    { id: 'custom', label: 'Custom Image URL', icon: '🖼️' },
  ];

  return (
    <div className="w-full flex flex-col shrink-0 z-50">
      <header className="min-h-8 pt-[max(env(safe-area-inset-top,0px),44px)] pb-1.5 sm:pt-0 sm:pb-0 sm:h-8 bg-black/75 backdrop-blur-xl border-b border-white/10 text-white text-xs select-none flex items-center justify-between px-3 relative">
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
                    if (wp.id === 'custom') {
                      const current = localStorage.getItem('lifeos_custom_wallpaper') || '';
                      const url = window.prompt('Enter an image URL for your custom desktop wallpaper:', current);
                      if (url && url.trim()) {
                        localStorage.setItem('lifeos_custom_wallpaper', url.trim());
                        setWallpaper('custom');
                      }
                    } else {
                      setWallpaper(wp.id);
                    }
                    setIsMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                    wallpaper === wp.id ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{wp.icon}</span>
                    <span>{wp.label}</span>
                  </div>
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

        {/* Split Screen Dual-Pane Button & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsSplitMenuOpen(!isSplitMenuOpen);
            }}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg text-xs font-extrabold transition-all ${
              splitScreen.isSplit
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'hover:bg-white/15 text-stone-300'
            }`}
            title="Split-Screen Dual Window View (Alt + Enter)"
          >
            <Columns2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Split Screen</span>
            {splitScreen.isSplit && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          {/* Split Screen Quick Config Dropdown */}
          <AnimatePresence>
            {isSplitMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-9 left-0 w-72 bg-stone-900/98 border border-white/20 rounded-2xl shadow-2xl p-3 z-50 text-stone-200 backdrop-blur-2xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Columns2 className="w-4 h-4 text-amber-400" />
                    <span className="font-black text-xs text-white">Dual-App Split Canvas</span>
                  </div>
                  <button
                    onClick={() => setIsSplitMenuOpen(false)}
                    className="text-stone-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-stone-400">Layout Presets</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        sounds.playTap();
                        if (!splitScreen.isSplit) enterSplitScreen(undefined, undefined, '50-50');
                        else setSplitPreset('50-50');
                      }}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-bold transition-all ${
                        splitScreen.preset === '50-50' && splitScreen.isSplit
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-stone-300'
                      }`}
                    >
                      50 / 50
                    </button>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        if (!splitScreen.isSplit) enterSplitScreen(undefined, undefined, '70-30');
                        else setSplitPreset('70-30');
                      }}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-bold transition-all ${
                        splitScreen.preset === '70-30' && splitScreen.isSplit
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-stone-300'
                      }`}
                    >
                      70 / 30
                    </button>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        if (!splitScreen.isSplit) enterSplitScreen(undefined, undefined, '30-70');
                        else setSplitPreset('30-70');
                      }}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-bold transition-all ${
                        splitScreen.preset === '30-70' && splitScreen.isSplit
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-stone-300'
                      }`}
                    >
                      30 / 70
                    </button>
                  </div>
                </div>

                {/* App Selectors */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      Primary App (Left / Top)
                    </label>
                    <select
                      value={splitScreen.primaryAppId}
                      onChange={(e) => setPrimaryApp(e.target.value)}
                      className="w-full bg-stone-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      {apps.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.emoji} {a.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => swapSplitApps()}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-400 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Swap Apps</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      Secondary App (Right / Bottom)
                    </label>
                    <select
                      value={splitScreen.secondaryAppId}
                      onChange={(e) => setSecondaryApp(e.target.value)}
                      className="w-full bg-stone-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      {apps.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.emoji} {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-1">
                  {splitScreen.isSplit ? (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        exitSplitScreen();
                        setIsSplitMenuOpen(false);
                      }}
                      className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors shadow-md"
                    >
                      Exit Split Screen
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTap();
                        enterSplitScreen();
                        setIsSplitMenuOpen(false);
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Columns2 className="w-3.5 h-3.5" />
                      <span>Launch Split-Screen</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active App Indicator & Mobile Quick Return */}
        {!isDesktopView && activeApp && (
          <div className="sm:hidden flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playTap();
                showDesktop();
              }}
              className="flex items-center gap-1 text-emerald-400 font-black text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40"
              title="Return to Desktop"
            >
              <span>◀</span>
              <span>Home</span>
            </button>
          </div>
        )}

        {/* Quick App Switcher Tabs directly in Top Bar - Never blocks app content */}
        <div className="hidden md:flex items-center gap-1 border-l border-white/10 pl-2">
          {apps
            .filter(a => settings.appVisibility[a.id] !== false && (a.id === 'faithlingo' || a.id === 'bible_journal' || a.isPinned))
            .map((app) => {
              const isActive = !isDesktopView && activeAppId === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    sounds.playTap();
                    launchApp(app.id);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm border border-white/25'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${app.title} — ${app.description}`}
                >
                  <span className="text-xs">{app.emoji}</span>
                  <span className="hidden lg:inline">{app.title}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
        </div>
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

    {/* Master Admin Maintenance Bypass Alert */}
    {settings.maintenanceMode && isAuthorizedAdmin && (
      <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-stone-950 px-3 py-1 text-xs font-black flex items-center justify-between z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-sm">👑</span>
          <span>GOD-MODE ACTIVE: Maintenance Mode is ENABLED for regular users. You have bypass access.</span>
        </div>
        <button
          onClick={() => toggleMaintenanceMode(false)}
          className="px-2 py-0.5 rounded-lg bg-stone-950 text-amber-300 text-[10px] font-black hover:bg-stone-900 transition-colors"
        >
          Disable Maintenance Mode
        </button>
      </div>
    )}

    {/* Sticky Top Broadcast Announcement Banner */}
    <AnimatePresence>
      {announcement && announcement.isActive && !isBannerDismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`w-full px-3 py-1.5 flex items-center justify-between text-xs font-bold border-b select-none z-40 transition-colors shadow-md ${
            announcement.type === 'alert'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
              : announcement.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/40'
              : announcement.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-500/40'
              : 'bg-purple-950/90 text-purple-200 border-purple-500/40'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 max-w-[85%]">
            <span className="shrink-0 text-sm">
              {announcement.type === 'alert' ? '🚨' : announcement.type === 'warning' ? '⚠️' : announcement.type === 'info' ? 'ℹ️' : '🎉'}
            </span>
            <span className="font-black text-white shrink-0">{announcement.title}:</span>
            <span className="truncate opacity-90">{announcement.message}</span>
            <span className="text-[10px] text-stone-400 shrink-0 hidden md:inline">({announcement.timestamp})</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthorizedAdmin && (
              <button
                onClick={() => setAnnouncement(null)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-amber-300 font-black border border-white/20 transition-all"
                title="Master Admin: Dismiss globally for all users"
              >
                Clear Global
              </button>
            )}
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 rounded hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};
