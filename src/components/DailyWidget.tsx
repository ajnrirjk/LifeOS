import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Copy, Check, Sparkles, X, Heart, Share2, Compass } from 'lucide-react';
import { tts, TTSState } from '../services/ttsService';
import { sounds } from '../services/soundEffects';

interface DailyWidgetProps {
  isModal?: boolean;
}

export const DailyWidget: React.FC<DailyWidgetProps> = ({ isModal = false }) => {
  const { todayHighlight, isWidgetModalOpen, setIsWidgetModalOpen, addXp } = useApp();
  const [copied, setCopied] = useState(false);
  const [prayerPrayed, setPrayerPrayed] = useState(false);
  const [cardTheme, setCardTheme] = useState<'emerald' | 'amber' | 'night' | 'rose'>('emerald');
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    rate: 1.0,
    currentWordIndex: 0,
    text: ''
  });

  useEffect(() => {
    const unsub = tts.subscribe(setTtsState);
    return () => unsub();
  }, []);

  const handleAudioToggle = () => {
    sounds.playTap();
    const narrationText = `${todayHighlight.reference}. ${todayHighlight.text}. Reflection: ${todayHighlight.reflection}. Let us pray: ${todayHighlight.quickPrayer}`;
    tts.toggle(narrationText);
  };

  const handleCopy = () => {
    sounds.playTap();
    const shareText = `“${todayHighlight.text}” — ${todayHighlight.reference}\n\nToday's FaithLingo Reflection:\n${todayHighlight.reflection}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrayAmen = () => {
    if (!prayerPrayed) {
      sounds.playCorrect();
      setPrayerPrayed(true);
      addXp(5);
    }
  };

  const themeGradients = {
    emerald: 'from-emerald-600 via-teal-700 to-cyan-800 text-white',
    amber: 'from-amber-500 via-orange-600 to-yellow-700 text-white',
    night: 'from-slate-900 via-indigo-950 to-slate-900 text-stone-100 border border-slate-700',
    rose: 'from-rose-600 via-pink-700 to-purple-800 text-white',
  };

  const content = (
    <div className="flex flex-col gap-4">
      {/* Widget Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Scripture Highlight
          </span>
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
            {todayHighlight.theme}
          </span>
        </div>

        {/* Audio Narration Quick Button */}
        <button
          onClick={handleAudioToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
            ttsState.isPlaying
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
          }`}
        >
          {ttsState.isPlaying ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>

      {/* Styled Verse Visual Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${themeGradients[cardTheme]} shadow-lg transition-all`}
      >
        {/* Soft Background Watermark */}
        <div className="absolute -bottom-6 -right-6 text-white/10 select-none text-9xl font-serif">
          ✝
        </div>

        <div className="relative z-10">
          <span className="text-xs sm:text-sm font-black tracking-widest uppercase opacity-80 block mb-2">
            Verse of the Day
          </span>
          <p className="text-lg sm:text-xl font-serif leading-relaxed italic mb-3 font-semibold">
            {todayHighlight.text}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <span className="text-sm font-extrabold tracking-wide">
              {todayHighlight.reference}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                title="Copy verse"
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Picker for Card */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <span>Card Visual Theme:</span>
        <div className="flex items-center gap-2">
          {(['emerald', 'amber', 'night', 'rose'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                sounds.playTap();
                setCardTheme(t);
              }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                cardTheme === t ? 'scale-125 border-stone-800 dark:border-white' : 'border-transparent'
              } ${
                t === 'emerald' ? 'bg-emerald-600' : t === 'amber' ? 'bg-amber-500' : t === 'night' ? 'bg-slate-900' : 'bg-rose-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Daily Devotional Reflection */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Today's Reflection
        </h4>
        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
          {todayHighlight.reflection}
        </p>
      </div>

      {/* 1-Minute Guided Prayer */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          1-Minute Guided Prayer
        </h4>
        <p className="text-sm text-stone-700 dark:text-stone-300 italic mb-3">
          “{todayHighlight.quickPrayer}”
        </p>
        <button
          onClick={handlePrayAmen}
          className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all select-none shadow-sm ${
            prayerPrayed
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white active:translate-y-0.5'
          }`}
        >
          {prayerPrayed ? (
            <>
              <Check className="w-4 h-4" />
              <span>Amen! (+5 XP Awarded)</span>
            </>
          ) : (
            <>
              <span>Pray This Prayer (Say "Amen")</span>
              <span className="text-xs font-normal opacity-80">+5 XP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // If used as a standalone card (embedded in Learn tab)
  if (!isModal) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-stone-200 dark:border-slate-800 shadow-sm transition-colors">
        {content}
      </div>
    );
  }

  // If opened via modal dialog
  if (!isWidgetModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            sounds.playTap();
            setIsWidgetModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {content}
      </div>
    </div>
  );
};
