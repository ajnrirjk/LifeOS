import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../services/soundEffects';
import { firebaseGlobalService } from '../../services/firebaseGlobalService';
import { Sparkles, ArrowRight, Shield, Check } from 'lucide-react';

const AVATAR_OPTIONS = ['🕊️', '✝️', '👑', '📖', '🧔🏻‍♂️', '👩🏼', '🌟', '🌿', '🕯️', '🛡️', '⛪', '🐑'];

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { settings, updateProfile, googleUser, signInWithGoogle, isGoogleSigningIn, isAuthorizedAdmin } = useSettings();
  const { userStats } = useApp();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🕊️');
  const [bio, setBio] = useState('Walking with Christ daily • LifeOS Believer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!handle || handle.startsWith('@')) {
      const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setHandle(clean ? `@${clean}` : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Believer in Christ';
    const finalHandle = handle.trim() || `@believer_${Math.floor(1000 + Math.random() * 9000)}`;

    setIsSubmitting(true);
    try {
      let deviceUserId = '';
      try {
        deviceUserId = localStorage.getItem('lifeos_device_unique_user_id') || '';
      } catch {}
      if (!deviceUserId || deviceUserId === 'usr_me_001') {
        deviceUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        try {
          localStorage.setItem('lifeos_device_unique_user_id', deviceUserId);
        } catch {}
      }

      const isMasterAdmin = (googleUser?.email?.toLowerCase().trim() === 'aw03102008@gmail.com') ||
                            (settings.profile.email?.toLowerCase().trim() === 'aw03102008@gmail.com');
      const userId = isMasterAdmin ? 'usr_master_admin_aw' : (googleUser?.uid || deviceUserId);

      // Register with global Firestore and backend
      await firebaseGlobalService.registerMember({
        id: userId,
        name: finalName,
        handle: finalHandle,
        avatar: isMasterAdmin ? '👑' : selectedAvatar,
        role: isMasterAdmin ? 'superadmin' : 'user',
        status: 'active',
        email: googleUser?.email || settings.profile.email || '',
        photoURL: googleUser?.photoURL || undefined,
        lastActive: 'Just now',
        xp: userStats?.xp || 0,
        streak: userStats?.streak || 1,
        warningsCount: 0,
        notes: bio.trim()
      });

      updateProfile({
        id: userId,
        name: finalName,
        handle: finalHandle,
        avatar: isMasterAdmin ? '👑' : selectedAvatar,
        bio: bio.trim(),
        role: isMasterAdmin ? 'superadmin' : 'user'
      });

      try {
        localStorage.setItem('lifeos_user_registered_v2', 'true');
      } catch {}

      sounds.playVictory();
      onComplete();
    } catch {
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-lg bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 relative overflow-hidden"
      >
        {/* Background glow header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-600/20 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-3xl shadow-lg mb-1">
              🕊️
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome to LifeOS Sanctuary
            </h2>
            <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
              Connect in live prayer & fellowship with real believers around the world. What should the community call you?
            </p>
          </div>

          {/* Quick Google Sign-In button */}
          {!googleUser && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-center">
              <div className="text-[11px] font-bold text-stone-400">
                Have a Google or Admin Account?
              </div>
              <button
                type="button"
                disabled={isGoogleSigningIn}
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    sounds.playVictory();
                  } catch {}
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>{isGoogleSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">
                Choose Your Fellowship Emblem
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setSelectedAvatar(emoji);
                    }}
                    className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-emerald-600 border-2 border-emerald-400 scale-110 shadow-md'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Your Full or Display Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Brother Thomas, Sarah Grace..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold placeholder-stone-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Spiritual Community Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/20 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                name.trim()
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-900/40 active:scale-98'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Enter LifeOS Sanctuary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
