import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lesson, StudyQuestion } from '../types';
import { useApp } from '../context/AppContext';
import { X, Heart, Sparkles, Volume2, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';
import { tts } from '../services/ttsService';
import { MascotGrace, MascotPose } from './MascotGrace';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose }) => {
  const { userStats, completeLesson, loseHeart, fontSize } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // pair ids
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);

  // Status of the current question check:
  // 'idle' = answering; 'correct' = checked and right; 'incorrect' = checked and wrong
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isFinished, setIsFinished] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [heartShake, setHeartShake] = useState(false);

  const currentQuestion: StudyQuestion = lesson.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + (status !== 'idle' ? 1 : 0)) / lesson.questions.length) * 100);

  // Setup question state when current question changes
  useEffect(() => {
    setStatus('idle');
    setSelectedOptionId(null);
    setSelectedBool(null);
    setSelectedLeftId(null);
    setMatchedPairs([]);

    if (currentQuestion.type === 'word-scramble') {
      const words = currentQuestion.scrambledWords ? [...currentQuestion.scrambledWords] : [];
      if (currentQuestion.correctSentence) {
        // Ensure every required word in correctSentence (including repeated words like "the") has sufficient buttons
        const sentenceCount: Record<string, number> = {};
        for (const w of currentQuestion.correctSentence) {
          sentenceCount[w] = (sentenceCount[w] || 0) + 1;
        }
        const wordCount: Record<string, number> = {};
        for (const w of words) {
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
        for (const [w, count] of Object.entries(sentenceCount)) {
          const diff = count - (wordCount[w] || 0);
          for (let i = 0; i < diff; i++) {
            words.push(w);
          }
        }
      }
      setAvailableWords(words);
      setSelectedWords([]);
    }
  }, [currentIndex, currentQuestion]);

  const handleAudioPlay = () => {
    sounds.playTap();
    tts.speak(currentQuestion.scriptureText);
  };

  // Check Answer Handler
  const handleCheck = () => {
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'fill-blank') {
      const correctOpt = currentQuestion.options?.find(o => o.isCorrect);
      if (selectedOptionId && correctOpt && selectedOptionId === correctOpt.id) {
        isCorrect = true;
      }
    } else if (currentQuestion.type === 'word-scramble') {
      const target = currentQuestion.correctSentence || [];
      if (selectedWords.length === target.length && selectedWords.every((w, i) => w === target[i])) {
        isCorrect = true;
      }
    } else if (currentQuestion.type === 'match-pairs') {
      if (matchedPairs.length === (currentQuestion.pairs?.length || 0)) {
        isCorrect = true;
      }
    } else if (currentQuestion.type === 'true-false') {
      if (selectedBool === currentQuestion.correctBoolean) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      sounds.playCorrect();
      setStatus('correct');
    } else {
      sounds.playIncorrect();
      setStatus('incorrect');
      setMistakesCount(prev => prev + 1);
      setHeartShake(true);
      setTimeout(() => setHeartShake(false), 600);
      loseHeart();
    }
  };

  // Continue to next question or complete lesson
  const handleContinue = () => {
    sounds.playTap();
    if (currentIndex < lesson.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed lesson!
      setIsFinished(true);
      sounds.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      completeLesson(lesson.id, lesson.xpReward, 15);
    }
  };

  // Word Scramble Helpers
  const addWord = (word: string, index: number) => {
    sounds.playTap();
    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== index));
  };

  const removeWord = (word: string, index: number) => {
    sounds.playTap();
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, word]);
  };

  // Match Pair helper
  const handlePairSelection = (id: string, side: 'left' | 'right') => {
    sounds.playTap();
    if (side === 'left') {
      setSelectedLeftId(id);
    } else {
      if (!selectedLeftId) return;
      if (selectedLeftId === id) {
        // Matched!
        sounds.playCorrect();
        setMatchedPairs(prev => [...prev, id]);
        setSelectedLeftId(null);
      } else {
        // Mismatched
        sounds.playIncorrect();
        setSelectedLeftId(null);
      }
    }
  };

  const isCheckDisabled = () => {
    if (status !== 'idle') return false;
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'fill-blank') {
      return !selectedOptionId;
    }
    if (currentQuestion.type === 'word-scramble') {
      return selectedWords.length === 0;
    }
    if (currentQuestion.type === 'match-pairs') {
      return matchedPairs.length !== (currentQuestion.pairs?.length || 0);
    }
    if (currentQuestion.type === 'true-false') {
      return selectedBool === null;
    }
    return false;
  };

  const mascotPose: MascotPose = 
    isFinished ? 'cheering' :
    status === 'correct' ? 'cheering' :
    status === 'incorrect' ? 'comforting' : 'happy';

  // Text scaling for accessibility
  const textSizeClass = fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-amber-50/30 dark:bg-slate-950 text-stone-900 dark:text-stone-100 overflow-hidden select-none">
      {/* Top Header: Close, Progress bar, Hearts */}
      <header className="px-4 py-3 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          title="Exit session"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-3.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          />
        </div>

        {/* Hearts counter */}
        <motion.div 
          animate={{ x: heartShake ? [-10, 10, -8, 8, -4, 4, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 font-black text-rose-500"
        >
          <motion.div
            animate={{ scale: heartShake ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </motion.div>
          <span className="text-sm">{userStats.hearts}</span>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-3 flex flex-col justify-between overflow-y-auto">
        {!isFinished ? (
          <div className="flex flex-col gap-5 my-auto pb-24">
            {/* Scripture Anchor / Mascot dialogue */}
            <div className="flex items-start gap-4">
              <MascotGrace pose={mascotPose} size="md" message={currentQuestion.mascotTip} />
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg inline-block mb-1">
                  {currentQuestion.scriptureReference}
                </span>
                <h3 className={`font-black ${textSizeClass} text-stone-800 dark:text-stone-100 leading-snug`}>
                  {currentQuestion.prompt}
                </h3>
              </div>
            </div>

            {/* Scripture Context Box with Audio Read-Aloud */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
              <p className="text-sm sm:text-base font-serif italic text-stone-700 dark:text-stone-300 font-medium">
                “{currentQuestion.scriptureText}”
              </p>
              <button
                onClick={handleAudioPlay}
                title="Listen to scripture read aloud"
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Questions Body */}
            {/* 1. Multiple Choice / Fill Blank */}
            {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'fill-blank') && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                      onClick={() => {
                        if (status !== 'idle') return;
                        sounds.playTap();
                        setSelectedOptionId(option.id);
                      }}
                      className={`w-full p-4 rounded-2xl font-bold text-left text-sm sm:text-base border-2 transition-colors select-none shadow-sm ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-emerald-200/50'
                          : 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-300 dark:border-slate-700'
                        }`}>
                          {option.id.toUpperCase()}
                        </span>
                        <span>{option.text}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* 2. Word Scramble (Arrange words in biblical order) */}
            {currentQuestion.type === 'word-scramble' && (
              <div className="flex flex-col gap-4">
                {/* Active Sentence Drop Rack */}
                <div className="min-h-[72px] p-3 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-white/60 dark:bg-slate-900/60 flex flex-wrap gap-2 items-center">
                  {selectedWords.length === 0 ? (
                    <span className="text-xs text-stone-400 italic mx-auto">
                      Tap words below to place them in sequence
                    </span>
                  ) : (
                    selectedWords.map((word, idx) => (
                      <motion.button
                        key={`sel-${word}-${idx}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                        onClick={() => removeWord(word, idx)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm transition-colors cursor-pointer"
                        title="Tap to return word to bank"
                      >
                        {word}
                      </motion.button>
                    ))
                  )}
                </div>

                {/* Available Word Bank */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {availableWords.map((word, idx) => (
                    <motion.button
                      key={`avail-${word}-${idx}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                      onClick={() => addWord(word, idx)}
                      className="px-3.5 py-2 rounded-xl border-2 border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-200 font-extrabold text-sm shadow-sm hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Tap to add to sentence"
                    >
                      {word}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Match Pairs */}
            {currentQuestion.type === 'match-pairs' && currentQuestion.pairs && (
              <div className="grid grid-cols-2 gap-3">
                {/* Left column */}
                <div className="flex flex-col gap-2.5">
                  {currentQuestion.pairs.map((pair) => {
                    const isMatched = matchedPairs.includes(pair.id);
                    const isSelected = selectedLeftId === pair.id;
                    return (
                      <button
                        key={pair.id}
                        disabled={isMatched}
                        onClick={() => handlePairSelection(pair.id, 'left')}
                        className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-left transition-all ${
                          isMatched
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-800 dark:text-emerald-300 opacity-60'
                            : isSelected
                            ? 'bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-900 dark:text-cyan-200 scale-102'
                            : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right column (shuffled) */}
                <div className="flex flex-col gap-2.5">
                  {[...currentQuestion.pairs].reverse().map((pair) => {
                    const isMatched = matchedPairs.includes(pair.id);
                    return (
                      <button
                        key={pair.id}
                        disabled={isMatched}
                        onClick={() => handlePairSelection(pair.id, 'right')}
                        className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm text-left transition-all ${
                          isMatched
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-800 dark:text-emerald-300 opacity-60'
                            : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-800 dark:text-stone-200 hover:border-emerald-400'
                        }`}
                      >
                        {pair.right}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. True or False */}
            {currentQuestion.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedBool(true);
                  }}
                  className={`p-5 rounded-2xl border-2 font-black text-lg text-center transition-all ${
                    selectedBool === true
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  ✓ True
                </button>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedBool(false);
                  }}
                  className={`p-5 rounded-2xl border-2 font-black text-lg text-center transition-all ${
                    selectedBool === false
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                      : 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  ✕ False
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Victory Celebration Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className="my-auto flex flex-col items-center text-center p-6 max-w-md mx-auto"
          >
            <MascotGrace pose="cheering" size="lg" />
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mt-4 mb-1">
              Lesson Complete!
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
              You’ve deepened your understanding of Christ’s teachings.
            </p>

            {/* Reward Summary Cards */}
            <div className="grid grid-cols-3 gap-3 w-full mb-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center"
              >
                <span className="block text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                  XP Earned
                </span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                  +{lesson.xpReward}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center"
              >
                <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                  Manna
                </span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  +15
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-center"
              >
                <span className="block text-xs font-black text-rose-600 dark:text-rose-400 uppercase">
                  Streak
                </span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-300">
                  {userStats.streak} Days
                </span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg tracking-wide uppercase shadow-lg shadow-emerald-600/30 transition-all"
            >
              Continue to Path
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Bottom Sticky Action Bar (Duolingo Style Check / Feedback) */}
      {!isFinished && (
        <footer
          className={`p-4 border-t transition-colors ${
            status === 'correct'
              ? 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800'
              : status === 'incorrect'
              ? 'bg-rose-100 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Feedback message when answered */}
            {status !== 'idle' ? (
              <div className="flex items-start gap-3 w-full sm:w-auto">
                {status === 'correct' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className={`font-black text-base ${status === 'correct' ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                    {status === 'correct' ? 'Amen! Beautifully answered!' : 'Keep heart! God’s grace is sufficient.'}
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5 font-medium leading-relaxed">
                    {currentQuestion.insightNote}
                  </p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block text-xs text-stone-400 font-bold uppercase tracking-wider">
                Select your answer & check
              </div>
            )}

            {/* Check / Continue Button */}
            <div className="w-full sm:w-auto shrink-0">
              {status === 'idle' ? (
                <button
                  disabled={isCheckDisabled()}
                  onClick={handleCheck}
                  className={`w-full sm:w-40 py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-sm transition-all active:translate-y-1 ${
                    isCheckDisabled()
                      ? 'bg-stone-200 dark:bg-slate-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
                  }`}
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  className={`w-full sm:w-40 py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider text-white shadow-sm transition-all active:translate-y-1 ${
                    status === 'correct' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
