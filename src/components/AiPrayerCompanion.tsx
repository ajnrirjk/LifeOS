import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  HeartHandshake, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Send, 
  BookMarked, 
  Check, 
  Copy, 
  Heart, 
  Bookmark, 
  Compass, 
  Calendar,
  MessageCircle
} from 'lucide-react';
import { tts, TTSState } from '../services/ttsService';
import { sesameVoice } from '../services/sesameVoiceService';
import { AiPrayerService, PrayerResponse } from '../services/aiPrayerService';
import { sounds } from '../services/soundEffects';
import { MascotGrace } from './MascotGrace';

export const AiPrayerCompanion: React.FC = () => {
  const { prayerJournal, addPrayerJournalItem, togglePrayerAnswered, todayHighlight } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'journal'>('create');
  const [selectedMood, setSelectedMood] = useState<string>('anxious');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedVerseRef, setSelectedVerseRef] = useState(todayHighlight.reference);
  const [selectedVerseText, setSelectedVerseText] = useState(todayHighlight.text);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<PrayerResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Audio narration state
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    rate: 1.0,
    currentWordIndex: 0,
    text: ''
  });

  useEffect(() => {
    const unsub = sesameVoice.subscribe(setTtsState);
    return () => unsub();
  }, []);

  const moodChips = [
    { id: 'anxious', label: 'Anxious & Seeking Peace', emoji: '🕊️', prompt: 'I am feeling overwhelmed with worry and need God’s peace to steady my soul.' },
    { id: 'grateful', label: 'Grateful & Praising God', emoji: '🙌', prompt: 'My heart is full of gratitude for God’s faithful provision and love today.' },
    { id: 'guidance', label: 'Seeking Wisdom & Direction', emoji: '🧭', prompt: 'I have difficult decisions ahead and need the guidance of the Holy Spirit.' },
    { id: 'healing', label: 'Healing & Comfort in Grief', emoji: '🌿', prompt: 'Please comfort my hurting heart and bring physical and spiritual restoration.' },
    { id: 'strength', label: 'Strength for the Weary', emoji: '⚡', prompt: 'My energy is drained; please renew my strength through Christ Jesus.' },
    { id: 'family', label: 'Family & Loved Ones', emoji: '🏡', prompt: 'Please bless, protect, and guide my family in love and holy unity.' },
    { id: 'forgiveness', label: 'Forgiveness & Grace', emoji: '🤍', prompt: 'Help me release resentment and forgive as Christ has forgiven me.' },
  ] as const;

  const handleSelectMood = (mood: string, defaultText: string) => {
    sounds.playTap();
    setSelectedMood(mood);
    if (!userPrompt) {
      setUserPrompt(defaultText);
    }
  };

  const handleGeneratePrayer = async () => {
    sounds.playTap();
    setIsLoading(true);
    setIsSaved(false);
    sesameVoice.stop();

    try {
      const activePrompt = userPrompt || moodChips.find(m => m.id === selectedMood)?.prompt;
      const data = await AiPrayerService.generatePrayer({
        message: activePrompt,
        mood: selectedMood,
        verseReference: selectedVerseRef,
        verseText: selectedVerseText
      });
      setCurrentResponse(data);
      sounds.playCorrect();
    } catch (err) {
      console.error('Prayer companion error:', err);
      const fallback = AiPrayerService.generateOfflinePrayer({
        message: userPrompt,
        mood: selectedMood,
        verseReference: selectedVerseRef,
        verseText: selectedVerseText
      });
      setCurrentResponse(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioToggle = () => {
    sounds.playTap();
    if (!currentResponse) return;
    if (ttsState.isPlaying) {
      sesameVoice.stop();
    } else {
      const narrationText = `Prayer: ${currentResponse.prayer}. Reflection: ${currentResponse.reflection}. Scripture Anchor: ${currentResponse.scriptureEncouragement}`;
      sesameVoice.speak(narrationText);
    }
  };

  const handleSaveToJournal = () => {
    if (!currentResponse || isSaved) return;
    sounds.playTap();
    addPrayerJournalItem({
      category: selectedMood.toUpperCase(),
      title: `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Devotion`,
      userPrompt: userPrompt || 'Prayer request',
      prayerText: currentResponse.prayer,
      scriptureReference: currentResponse.scriptureEncouragement,
      reflection: currentResponse.reflection
    });
    setIsSaved(true);
  };

  const handleCopyPrayer = () => {
    if (!currentResponse) return;
    sounds.playTap();
    navigator.clipboard.writeText(`${currentResponse.prayer}\n\nReflection: ${currentResponse.reflection}\n${currentResponse.scriptureEncouragement}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
      {/* Sanctuary Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 rounded-3xl shadow-md">
        <div className="flex items-center gap-4">
          <MascotGrace pose="praying" size="md" />
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">
              Grace Sanctuary
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              AI Prayer & Verse Reflection
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 opacity-90">
              Personalized encouragement, pastoral reflection, and prayer companion
            </p>
          </div>
        </div>

        {/* Subtabs: New Prayer vs Prayer Journal */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 backdrop-blur-sm self-stretch sm:self-auto justify-center">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveSubTab('create');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeSubTab === 'create' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            New Prayer
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveSubTab('journal');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeSubTab === 'journal' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
            }`}
          >
            Journal ({prayerJournal.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="flex flex-col gap-6">
          {/* Mood / Spiritual Need Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-colors">
            <label className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              1. What is resting on your heart right now?
            </label>
            <div className="flex flex-wrap gap-2">
              {moodChips.map((chip) => {
                const isSelected = selectedMood === chip.id;
                return (
                  <motion.button
                    key={chip.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectMood(chip.id, chip.prompt)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold border-2 transition-colors flex items-center gap-1.5 select-none ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm'
                        : 'border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom Prayer Input Box */}
            <div className="mt-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Custom details or specific prayer request (optional):
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Lord, please grant me patience with my children and peace during my work presentation tomorrow..."
                className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-100 text-sm focus:border-emerald-500 focus:outline-none resize-none placeholder:text-stone-400"
              />
            </div>

            {/* Scripture Anchor reference */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-slate-800">
              <span>Anchoring with Scripture:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                {selectedVerseRef}
              </span>
            </div>

            {/* Generate Prayer Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={handleGeneratePrayer}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                isLoading
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Seeking God’s Presence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Receive Prayer & Verse Reflection</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Generated Prayer & Reflection Display */}
          <AnimatePresence>
            {currentResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 dark:border-emerald-800/80 shadow-lg flex flex-col gap-6"
              >
              {/* Card Action Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  Personalized Prayer
                </span>

                <div className="flex items-center gap-2">
                  {/* Listen with Audio Narration */}
                  <button
                    onClick={handleAudioToggle}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      ttsState.isPlaying
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {ttsState.isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    <span>{ttsState.isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>

                  {/* Copy */}
                  <button
                    onClick={handleCopyPrayer}
                    className="p-1.5 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800"
                    title="Copy prayer"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Save to Journal */}
                  <button
                    onClick={handleSaveToJournal}
                    disabled={isSaved}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved to Journal' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* The Prayer Text */}
              <div className="font-serif italic text-stone-800 dark:text-stone-100 text-lg sm:text-xl leading-relaxed whitespace-pre-line pl-4 border-l-4 border-emerald-500">
                {currentResponse.prayer}
              </div>

              {/* Scripture Encouragement */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col gap-1">
                <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-400">
                  Scripture Anchor
                </span>
                <p className="text-sm font-serif font-bold text-stone-800 dark:text-stone-200">
                  {currentResponse.scriptureEncouragement}
                </p>
              </div>

              {/* Devotional Reflection */}
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Grace Reflection
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {currentResponse.reflection}
                </p>
              </div>

              {/* Gentle Action Step */}
              {currentResponse.actionStep && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  💡 <strong>Practice Today:</strong> {currentResponse.actionStep}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      ) : (
        /* Prayer Journal View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-lg text-stone-800 dark:text-stone-100">
                My Prayer Journal
              </h3>
              <p className="text-xs text-stone-500">
                Record of prayers, reflections, and answered praises
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveSubTab('create');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              + New Prayer
            </button>
          </div>

          {prayerJournal.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <BookMarked className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Your prayer journal is empty.</p>
              <p className="text-xs mt-1">Generate a prayer above and tap "Save to Journal".</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {prayerJournal.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    item.isAnswered
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                      : 'bg-stone-50 dark:bg-slate-800/70 border-stone-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-stone-200 dark:bg-slate-700 text-[10px] font-black text-stone-700 dark:text-stone-300 uppercase">
                        {item.category}
                      </span>
                      <span className="text-xs text-stone-400 font-semibold">
                        {item.date}
                      </span>
                    </div>

                    {/* Answered Checkbox */}
                    <button
                      onClick={() => {
                        sounds.playTap();
                        togglePrayerAnswered(item.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${
                        item.isAnswered
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : 'bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.isAnswered ? 'Praise! Answered' : 'Mark Answered'}</span>
                    </button>
                  </div>

                  <p className="font-serif italic text-stone-800 dark:text-stone-200 text-sm leading-relaxed mb-3">
                    “{item.prayerText}”
                  </p>

                  {item.scriptureReference && (
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      Anchor: {item.scriptureReference}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
