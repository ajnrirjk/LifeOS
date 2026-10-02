import React, { useState } from 'react';
import { BookOpen, Sparkles, Volume2, CheckCircle2, Circle, PenTool, ChevronRight } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { tts } from '../../services/ttsService';

interface DailyReadingWidgetProps {
  onQuickScribe: (verseRef: string, verseText: string, reflectionPrompt: string) => void;
}

export const DailyReadingWidget: React.FC<DailyReadingWidgetProps> = ({ onQuickScribe }) => {
  const [isRead, setIsRead] = useState(false);

  // Daily curated reading passage & contemplation prompt
  const todayReading = {
    reference: "Romans 12:2",
    translation: "KJV",
    text: "“And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.”",
    prompt: "In what subtle way is the world pressing you into its mold, and what truth of Scripture renews your mind today?"
  };

  const handleToggleRead = () => {
    sounds.playTap();
    if (!isRead) sounds.playCorrect();
    setIsRead(!isRead);
  };

  const handleAudioListen = () => {
    sounds.playTap();
    tts.speak(`${todayReading.reference}. ${todayReading.text} Contemplation: ${todayReading.prompt}`);
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/20 border-2 border-amber-200/80 dark:border-slate-800 shadow-md flex flex-col gap-4 relative overflow-hidden select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              Daily Reading Widget
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>{todayReading.reference}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
                {todayReading.translation}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAudioListen}
            className="p-2 rounded-xl text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            title="Listen to reading"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleRead}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              isRead
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300'
            }`}
          >
            {isRead ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                <span>Meditated</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scripture Text */}
      <blockquote className="font-serif italic text-stone-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-emerald-500 dark:border-emerald-400">
        {todayReading.text}
      </blockquote>

      {/* Contemplation Prompt */}
      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-stone-200/80 dark:border-slate-700/80 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-900 dark:text-stone-100 font-bold block mb-0.5">
            Today's Reflection Question:
          </strong>
          {todayReading.prompt}
        </div>
      </div>

      {/* One-Tap Quick Scribe Action */}
      <button
        onClick={() => {
          sounds.playTap();
          onQuickScribe(todayReading.reference, todayReading.text, todayReading.prompt);
        }}
        className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
      >
        <PenTool className="w-3.5 h-3.5" />
        <span>Record in Bible Journal</span>
        <ChevronRight className="w-3.5 h-3.5 opacity-80" />
      </button>
    </div>
  );
};
