import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReadingPlan, ReadingPlanDay } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  BookMarked, 
  Calendar, 
  Volume2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { tts } from '../services/ttsService';

export const ReadingPlansView: React.FC = () => {
  const { readingPlans, togglePlanDay, togglePlanEnrollment, setCurrentTab } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(readingPlans[0]?.id || '');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const currentPlan = readingPlans.find(p => p.id === selectedPlanId) || readingPlans[0];
  const completedDaysCount = currentPlan.days.filter(d => d.completed).length;
  const progressPercent = Math.round((completedDaysCount / currentPlan.days.length) * 100);

  const handleAudioListen = (day: ReadingPlanDay) => {
    sounds.playTap();
    const text = `${day.title}. Scripture: ${day.passageReference}. ${day.keyVerse}. Devotion: ${day.devotionText}. Prayer focus: ${day.prayerFocus}`;
    tts.toggle(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8 pb-24">
      {/* Plans Header */}
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Spiritual Goal Tracks
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Customizable Reading Plans
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
          Choose a tailored reading plan matching your season of life—from overcoming worry to diving deep into Jesus’s words.
        </p>
      </div>

      {/* Plan Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {readingPlans.map((plan) => {
          const isSelected = plan.id === currentPlan.id;
          const planCompletedDays = plan.days.filter(d => d.completed).length;
          const planProgress = Math.round((planCompletedDays / plan.days.length) * 100);

          return (
            <div
              key={plan.id}
              onClick={() => {
                sounds.playTap();
                setSelectedPlanId(plan.id);
              }}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden select-none ${
                isSelected
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {plan.goalCategory}
                </span>
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  {plan.durationLabel}
                </span>
              </div>

              <h3 className="font-black text-base sm:text-lg text-stone-800 dark:text-stone-100 mb-1">
                {plan.title}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed font-medium">
                {plan.description}
              </p>

              {/* Progress bar inside card */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                <span>{planProgress}% Completed</span>
                <span>{planCompletedDays}/{plan.days.length} Days</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${planProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Plan Details & Day Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-colors">
        {/* Banner with enrollment toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Plan Overview
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              {currentPlan.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {currentPlan.subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              togglePlanEnrollment(currentPlan.id);
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all select-none shadow-sm ${
              currentPlan.isEnrolled
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {currentPlan.isEnrolled ? '✓ Enrolled in Plan' : '+ Enroll in This Plan'}
          </button>
        </div>

        {/* Days List Accordion */}
        <div className="flex flex-col gap-3">
          {currentPlan.days.map((day) => {
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <div
                key={day.dayNumber}
                className={`rounded-2xl border-2 transition-all ${
                  day.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-850 border-stone-200 dark:border-slate-800'
                }`}
              >
                {/* Day Header Row */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Completion check button */}
                    <button
                      onClick={() => {
                        sounds.playTap();
                        togglePlanDay(currentPlan.id, day.dayNumber);
                        if (!day.completed) sounds.playCorrect();
                      }}
                      className="text-stone-400 hover:text-emerald-600 transition-colors"
                      title={day.completed ? 'Mark incomplete' : 'Mark completed (+10 XP)'}
                    >
                      {day.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-xs text-stone-400 font-semibold">• {day.passageReference}</span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-stone-800 dark:text-stone-200">
                        {day.title}
                      </h4>
                    </div>
                  </div>

                  {/* Audio Listen & Expand icon */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAudioListen(day)}
                      title="Listen to day devotion"
                      className="p-2 rounded-xl text-stone-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-slate-800"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Day Expanded Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-slate-800 flex flex-col gap-3">
                    {/* Key Verse Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 font-serif italic text-stone-800 dark:text-stone-200 text-sm">
                      {day.keyVerse}
                    </div>

                    {/* Devotional Teaching */}
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                      {day.devotionText}
                    </p>

                    {/* Prayer Focus */}
                    <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      🙏 <strong>Prayer Focus:</strong> {day.prayerFocus}
                    </div>

                    {/* Read Full Chapter button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          sounds.playTap();
                          setCurrentTab('bible');
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        <span>Open Passage in Offline Bible</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
