import React, { useState } from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { AppType, LifeOSApp } from '../../types/lifeos';
import { APP_TEMPLATES } from '../../data/lifeosAppsData';
import { 
  Sparkles, 
  Layers, 
  Target, 
  BookMarked, 
  Compass, 
  Plus, 
  Check, 
  ArrowRight, 
  Flame, 
  Heart, 
  Volume2, 
  Trash2,
  Rocket
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const AppStudio: React.FC = () => {
  const { createApp, apps } = useLifeOS();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // App Creation Form State
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [type, setType] = useState<AppType>('tracker');
  const [category, setCategory] = useState<'Spiritual' | 'Productivity' | 'Health' | 'Learning' | 'Ministry'>('Spiritual');
  const [description, setDescription] = useState('');
  const [colorGradient, setColorGradient] = useState('from-indigo-600 via-purple-600 to-pink-600');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [initialItems, setInitialItems] = useState<Array<{ title: string; subtitle?: string }>>([
    { title: 'Morning Gratitude & Scripture', subtitle: 'Psalm 118:24' }
  ]);
  const [newItemTitle, setNewItemTitle] = useState('');

  const colorOptions = [
    { label: 'Emerald Spirit', val: 'from-emerald-500 via-teal-600 to-green-700' },
    { label: 'Royal Sapphire', val: 'from-blue-600 via-indigo-600 to-purple-600' },
    { label: 'Sunset Amber', val: 'from-amber-500 via-orange-600 to-rose-600' },
    { label: 'Rose Grace', val: 'from-rose-500 via-pink-600 to-purple-600' },
    { label: 'Midnight Nebula', val: 'from-slate-800 via-indigo-950 to-slate-900' },
  ];

  const emojiOptions = ['🎯', '📔', '🌿', '✨', '🕊️', '🕯️', '📇', '🛡️', '⚡', '🙌', '📜', '❤️'];

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    sounds.playTap();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/lifeos/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: aiPrompt })
      });

      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || 'My New App');
        setEmoji(data.emoji || '✨');
        setType(data.type || 'tracker');
        setDescription(data.description || 'Custom LifeOS app');
        if (data.systemInstruction) setSystemInstruction(data.systemInstruction);
        if (Array.isArray(data.initialItems) && data.initialItems.length > 0) {
          setInitialItems(data.initialItems);
        }
        sounds.playCorrect();
      }
    } catch (err) {
      console.error('AI app generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    sounds.playTap();
    setInitialItems(prev => [...prev, { title: newItemTitle.trim() }]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (index: number) => {
    sounds.playTap();
    setInitialItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAndLaunch = () => {
    sounds.playTap();
    const finalTitle = title.trim() || 'Custom App';

    let itemsPayload: any = undefined;
    let notesPayload: any = undefined;
    let flashcardsPayload: any = undefined;

    if (type === 'tracker') {
      itemsPayload = initialItems.map((item, idx) => ({
        id: `i_${idx}_${Date.now()}`,
        title: item.title,
        subtitle: item.subtitle || '',
        completed: false,
        streak: 1
      }));
    } else if (type === 'notes') {
      notesPayload = [
        {
          id: `n_${Date.now()}`,
          title: `Welcome to ${finalTitle}`,
          content: 'Tap the edit button to begin writing notes and reflections.',
          date: new Date().toLocaleDateString(),
          tags: ['First Note']
        }
      ];
    } else if (type === 'flashcards') {
      flashcardsPayload = [
        {
          id: `f_${Date.now()}`,
          front: 'Key Verse or Term',
          back: 'Meaning, citation, and life application',
          category: 'General',
          mastered: false
        }
      ];
    }

    createApp({
      title: finalTitle,
      emoji: emoji,
      iconName: type === 'tracker' ? 'Target' : type === 'notes' ? 'BookMarked' : type === 'ai_assistant' ? 'Sparkles' : 'Layers',
      category: category as any,
      type: type,
      color: colorGradient,
      description: description.trim() || 'Built with LifeOS App Studio',
      isPinned: true,
      isSystem: false,
      systemInstruction: systemInstruction || undefined,
      items: itemsPayload,
      notes: notesPayload,
      flashcards: flashcardsPayload,
      chatHistory: type === 'ai_assistant' ? [{ role: 'assistant', text: `Welcome to ${finalTitle}! How can I help you today?` }] : undefined
    });
  };

  const handleCloneTemplate = (template: typeof APP_TEMPLATES[0]) => {
    sounds.playTap();
    setTitle(template.title);
    setEmoji(template.emoji);
    setType(template.type as AppType);
    setColorGradient(template.color);
    setDescription(template.description);
    setCategory(template.category as any);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8 pb-24">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-purple-200 block mb-1">
            LifeOS App Studio
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Create Your Own Apps
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 opacity-90 mt-1 max-w-xl">
            Design, configure, and instantly launch custom spiritual trackers, AI tools, sacred notebooks, and study engines inside LifeOS.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-xs font-bold block text-purple-200">Installed Apps</span>
          <span className="text-2xl font-black">{apps.length}</span>
        </div>
      </div>

      {/* AI App Architect Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-base text-stone-900 dark:text-stone-100">
            Generate App with LifeOS AI
          </h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Describe what you want to track or build, and AI will configure the title, layout, categories, and initial items for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateWithAI();
            }}
            placeholder="e.g. A daily 3-item fasting & gratitude log with prayer prompts..."
            className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleGenerateWithAI}
            disabled={isGenerating || !aiPrompt.trim()}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Building...' : 'Generate App'}</span>
          </button>
        </div>
      </div>

      {/* Pre-made Templates Quick Start */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
          Quick Start from Templates
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {APP_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => handleCloneTemplate(tmpl)}
              className="p-4 rounded-2xl border-2 border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 text-left transition-all select-none shadow-sm"
            >
              <span className="text-2xl block mb-2">{tmpl.emoji}</span>
              <h4 className="font-black text-sm text-stone-800 dark:text-stone-200 line-clamp-1">
                {tmpl.title}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                {tmpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Configuration Wizard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        <h3 className="font-black text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <span>App Specifications</span>
        </h3>

        {/* Name & Emoji */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-stone-500">
              App Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Prayer Routine"
              className="px-4 py-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-stone-500">
              Icon Emoji
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
              {emojiOptions.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    sounds.playTap();
                    setEmoji(em);
                  }}
                  className={`p-1.5 rounded-xl text-lg transition-transform ${emoji === em ? 'scale-125 bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* App Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-stone-500">
            App Architecture / Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'tracker', label: 'Habit / Checklist', icon: Target },
              { id: 'notes', label: 'Sacred Notes', icon: BookMarked },
              { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles },
              { id: 'flashcards', label: 'Flashcards', icon: Layers },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playTap();
                    setType(t.id as AppType);
                  }}
                  className={`p-3.5 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all select-none ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-stone-200 dark:border-slate-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Theme */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-stone-500">
            Window Header Theme
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c.val}
                onClick={() => {
                  sounds.playTap();
                  setColorGradient(c.val);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${c.val} border-2 transition-all ${
                  colorGradient === c.val ? 'border-stone-900 dark:border-white scale-105 shadow-md' : 'border-transparent opacity-80'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-stone-500">
            App Tagline / Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Daily spiritual check-in for peace and clarity"
            className="px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Specific Type Details */}
        {type === 'tracker' && (
          <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Initial Checklist Items
            </span>
            <div className="flex flex-col gap-2">
              {initialItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs font-bold">
                  <span>{item.title}</span>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                }}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
              />
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-slate-700 text-xs font-bold hover:bg-stone-300"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {type === 'ai_assistant' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-stone-500">
              AI Assistant Persona & Instructions
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={3}
              placeholder="e.g. You are a gentle mentor helping the user study the Greek meaning of the Gospel of John..."
              className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-xs resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Launch Button */}
        <button
          onClick={handleCreateAndLaunch}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:translate-y-1 transition-all"
        >
          <Rocket className="w-5 h-5" />
          <span>Publish & Launch App in LifeOS</span>
        </button>
      </div>
    </div>
  );
};
