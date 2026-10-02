import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, ExternalLink, Mail } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose, onAgree }) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAgree = () => {
    sounds.playTap();
    try {
      localStorage.setItem('lifeos_privacy_agreed', 'true');
      localStorage.setItem('lifeos_privacy_agreed_date', new Date().toISOString());
    } catch {}
    if (onAgree) onAgree();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Privacy Policy for Life OS</h2>
              <p className="text-xs text-stone-400">Last Updated: October 2, 2026</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Exact Text */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-300 leading-relaxed font-sans">
          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">1</span>
              Information We Collect
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              When you use Life OS and choose to authenticate via Google OAuth, we collect your primary Google email address, your name, and your profile picture.
            </p>
          </section>

          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">2</span>
              How We Use Your Information
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              The information we collect from Google is used strictly for authentication and account management. Your email acts as your unique identifier to save your Life OS data, and your name/avatar are used to personalize your user interface. We do not use your Google data for any other purpose.
            </p>
          </section>

          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">3</span>
              Information Sharing and Disclosure
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              Life OS does not sell, rent, or share your personal Google information or any data associated with your account to any third parties, advertisers, or affiliates.
            </p>
          </section>

          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">4</span>
              Data Security
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              We implement industry-standard security measures to protect your data. All communication between your browser and our servers is encrypted.
            </p>
          </section>

          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">5</span>
              Data Retention and Deletion
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              We retain your data only for as long as your account is active. If you wish to delete your account and remove all associated data, you may do so by contacting us at <a href="mailto:aw03102008@gmail.com" className="text-emerald-400 underline font-semibold hover:text-emerald-300">aw03102008@gmail.com</a> or by using the account deletion option in your profile settings. We will process your deletion request within 30 days.
            </p>
          </section>

          <section className="bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-black">6</span>
              Contact Us
            </h3>
            <p className="text-stone-300 pl-7 text-xs sm:text-sm">
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:aw03102008@gmail.com" className="text-emerald-400 underline font-semibold hover:text-emerald-300">aw03102008@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Footer with Agreement Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950/80 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer text-stone-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => {
                sounds.playTap();
                setHasAgreed(e.target.checked);
              }}
              className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-stone-900 cursor-pointer"
            />
            <span className="text-xs font-medium">
              I have read and agree to the <span className="text-white font-bold">Privacy Policy</span> &amp; <a href="/terms" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Terms</a>
            </span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors font-medium text-xs"
            >
              Close
            </button>
            <button
              onClick={handleAgree}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/40 text-xs flex items-center gap-1.5"
            >
              <span>✓</span>
              <span>I Agree &amp; Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
