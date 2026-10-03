import React, { useState } from 'react';
import { LifeOSApp, TrackerItem, NoteItem, FlashcardItem } from '../../types/lifeos';
import { useLifeOS } from '../../context/LifeOSContext';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  Volume2, 
  RotateCw, 
  Check, 
  Bookmark, 
  Search,
  MessageCircle,
  Flame,
  Award
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { tts } from '../../services/ttsService';

interface CustomAppRunnerProps {
  app: LifeOSApp;
}

export const CustomAppRunner: React.FC<CustomAppRunnerProps> = ({ app }) => {
  const { updateApp } = useLifeOS();

  // Tracker State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');

  // Notes State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(app.notes?.[0]?.id || null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('');

  // AI Assistant State
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Flashcards State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  // --- TRACKER HANDLERS ---
  const handleToggleItem = (itemId: string) => {
    sounds.playTap();
    const currentItems = app.items || [];
    const updated = currentItems.map(item => {
      if (item.id !== itemId) return item;
      const nextComp = !item.completed;
      if (nextComp) sounds.playCorrect();
      return {
        ...item,
        completed: nextComp,
        streak: nextComp ? (item.streak || 0) + 1 : Math.max(0, (item.streak || 1) - 1)
      };
    });
    updateApp(app.id, { items: updated });
  };

  const handleAddTrackerItem = () => {
    if (!newItemTitle.trim()) return;
    sounds.playTap();
    const newItem: TrackerItem = {
      id: `it_${Date.now()}`,
      title: newItemTitle.trim(),
      subtitle: newItemSubtitle.trim() || undefined,
      completed: false,
      streak: 0
    };
    updateApp(app.id, { items: [...(app.items || []), newItem] });
    setNewItemTitle('');
    setNewItemSubtitle('');
  };

  const handleDeleteTrackerItem = (itemId: string) => {
    sounds.playTap();
    updateApp(app.id, { items: (app.items || []).filter(i => i.id !== itemId) });
  };

  // --- NOTES HANDLERS ---
  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    sounds.playTap();
    const newNote: NoteItem = {
      id: `n_${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: noteTag.trim() ? [noteTag.trim()] : []
    };
    const updatedNotes = [newNote, ...(app.notes || [])];
    updateApp(app.id, { notes: updatedNotes });
    setActiveNoteId(newNote.id);
    setIsCreatingNote(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteTag('');
  };

  const handleDeleteNote = (noteId: string) => {
    sounds.playTap();
    const updated = (app.notes || []).filter(n => n.id !== noteId);
    updateApp(app.id, { notes: updated });
    if (activeNoteId === noteId) {
      setActiveNoteId(updated[0]?.id || null);
    }
  };

  // --- AI ASSISTANT HANDLERS ---
  const handleSendAiMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    sounds.playTap();
    const userText = chatInput.trim();
    setChatInput('');
    setIsAiLoading(true);

    const history = app.chatHistory || [];
    const newHistory = [...history, { role: 'user' as const, text: userText }];
    updateApp(app.id, { chatHistory: newHistory });

    try {
      const res = await fetch('/api/lifeos/ai-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appTitle: app.title,
          systemInstruction: app.systemInstruction,
          userMessage: userText,
          history: newHistory
        })
      });

      const data = await res.json();
      const reply = data.reply || "I am reflecting on this with you.";
      updateApp(app.id, {
        chatHistory: [...newHistory, { role: 'assistant' as const, text: reply }]
      });
      sounds.playCorrect();
    } catch (err) {
      console.error('AI app runner error:', err);
      updateApp(app.id, {
        chatHistory: [...newHistory, { role: 'assistant' as const, text: "Grace and peace. I am here with you." }]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- FLASHCARDS HANDLERS ---
  const flashcards = app.flashcards || [];
  const currentCard = flashcards[flashcardIndex];

  const handleToggleMastered = (cardId: string) => {
    sounds.playTap();
    const updated = flashcards.map(c => c.id === cardId ? { ...c, mastered: !c.mastered } : c);
    updateApp(app.id, { flashcards: updated });
  };

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    sounds.playTap();
    const newCard: FlashcardItem = {
      id: `f_${Date.now()}`,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      category: 'General',
      mastered: false
    };
    updateApp(app.id, { flashcards: [...flashcards, newCard] });
    setNewCardFront('');
    setNewCardBack('');
    setIsAddingCard(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
      {/* App Header Banner */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${app.color} text-white shadow-md flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-2xl bg-white/10 backdrop-blur-sm">{app.emoji}</span>
          <div>
            <span className="text-xs font-black uppercase tracking-widest opacity-80 block">
              {app.category} • LifeOS Micro-App
            </span>
            <h2 className="text-2xl font-black">{app.title}</h2>
            <p className="text-xs opacity-90 mt-0.5">{app.description}</p>
          </div>
        </div>
      </div>

      {/* 1. TRACKER VIEW */}
      {app.type === 'tracker' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
            <h3 className="font-black text-base text-stone-800 dark:text-stone-100">
              Active Habit & Task Tracker ({app.items?.filter(i => i.completed).length || 0} / {app.items?.length || 0})
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              {Math.round(((app.items?.filter(i => i.completed).length || 0) / Math.max(1, app.items?.length || 1)) * 100)}% Complete
            </span>
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-3">
            {(app.items || []).map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  item.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-850 border-stone-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className="text-stone-400 hover:text-emerald-600 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <h4 className={`font-bold text-sm sm:text-base ${item.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(item.streak || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{item.streak}d streak</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleDeleteTrackerItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item form */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-stone-500">
              Add New Tracker Item
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTrackerItem();
                }}
                placeholder="Item name (e.g. Read Psalm 91, Pray for neighbors)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
              <input
                type="text"
                value={newItemSubtitle}
                onChange={(e) => setNewItemSubtitle(e.target.value)}
                placeholder="Optional tag or verse..."
                className="sm:w-44 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
              <button
                onClick={handleAddTrackerItem}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. NOTES VIEW */}
      {app.type === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Notes list (4 cols) */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
              <span className="font-black text-xs uppercase tracking-wider text-stone-500">
                Notes ({app.notes?.length || 0})
              </span>
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsCreatingNote(true);
                  setActiveNoteId(null);
                }}
                className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold text-xs"
              >
                + New
              </button>
            </div>

            {(app.notes || []).map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveNoteId(note.id);
                  setIsCreatingNote(false);
                }}
                className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                  activeNoteId === note.id && !isCreatingNote
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800/60 border-transparent hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 line-clamp-1">
                    {note.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="text-stone-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-medium">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2">
                  <span>{note.date}</span>
                  {note.tags && note.tags[0] && (
                    <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-stone-300">
                      {note.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Active note viewer / creator (8 cols) */}
          <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            {isCreatingNote ? (
              <div className="flex flex-col gap-3">
                <h4 className="font-black text-base text-stone-900 dark:text-stone-100">
                  Write New Sacred Note
                </h4>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  placeholder="Tag (e.g. Sermon, Gratitude, Bible Study)..."
                  className="px-3.5 py-1.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs focus:outline-none"
                />
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={8}
                  placeholder="Write your reflection, key scriptures, thoughts..."
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-sm focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingNote(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const currentNote = (app.notes || []).find(n => n.id === activeNoteId) || app.notes?.[0];
                if (!currentNote) {
                  return (
                    <div className="text-center py-16 text-stone-400">
                      <p className="text-sm">No notes yet. Click "+ New" to begin.</p>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-black text-xl text-stone-900 dark:text-stone-100">
                          {currentNote.title}
                        </h3>
                        <span className="text-xs text-stone-400">{currentNote.date}</span>
                      </div>
                      <button
                        onClick={() => tts.speak(`${currentNote.title}. ${currentNote.content}`)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-600 hover:text-emerald-600"
                        title="Listen to note read aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-serif text-stone-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {currentNote.content}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* 3. AI ASSISTANT VIEW */}
      {app.type === 'ai_assistant' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-2">
            {(app.chatHistory || []).map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 text-sm">
                    {app.emoji}
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-md text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex gap-3 items-center text-stone-400 text-xs italic">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Reflecting...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="flex gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendAiMessage();
              }}
              placeholder={`Ask ${app.title}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendAiMessage}
              disabled={isAiLoading || !chatInput.trim()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. FLASHCARDS VIEW */}
      {app.type === 'flashcards' && (
        <div className="flex flex-col items-center gap-6 max-w-lg mx-auto w-full">
          {currentCard ? (
            <>
              {/* Interactive 3D Flip Card */}
              <div
                onClick={() => {
                  sounds.playTap();
                  setIsFlipped(!isFlipped);
                }}
                className="w-full h-72 rounded-3xl p-8 bg-gradient-to-br from-white to-stone-50 dark:from-slate-800 dark:to-slate-900 border-2 border-stone-300 dark:border-slate-700 shadow-xl cursor-pointer flex flex-col justify-between select-none relative transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between text-xs font-black text-stone-400">
                  <span>Card {flashcardIndex + 1} of {flashcards.length}</span>
                  <span className="uppercase tracking-widest">{isFlipped ? 'Answer / Text' : 'Prompt / Reference'}</span>
                </div>

                <div className="my-auto text-center">
                  <p className="font-serif font-black text-xl sm:text-2xl text-stone-800 dark:text-stone-100 italic">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  <span className="block text-[11px] text-stone-400 mt-3 font-semibold">
                    (Tap card to flip)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tts.speak(isFlipped ? currentCard.back : currentCard.front);
                    }}
                    className="p-2 rounded-xl text-stone-400 hover:text-emerald-600"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMastered(currentCard.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                      currentCard.mastered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{currentCard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4">
                <button
                  disabled={flashcardIndex <= 0}
                  onClick={() => {
                    sounds.playTap();
                    setIsFlipped(false);
                    setFlashcardIndex(prev => prev - 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 font-bold text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={flashcardIndex >= flashcards.length - 1}
                  onClick={() => {
                    sounds.playTap();
                    setIsFlipped(false);
                    setFlashcardIndex(prev => prev + 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs disabled:opacity-40"
                >
                  Next Card
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <p>No cards in this deck yet.</p>
            </div>
          )}

          {/* Add New Card Accordion */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-stone-200 dark:border-slate-800">
            <button
              onClick={() => setIsAddingCard(!isAddingCard)}
              className="w-full flex items-center justify-between text-xs font-black text-stone-700 dark:text-stone-300"
            >
              <span>+ Add Card to Deck</span>
              <span>{isAddingCard ? '▲' : '▼'}</span>
            </button>

            {isAddingCard && (
              <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-stone-100 dark:border-slate-800">
                <input
                  type="text"
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Front (Verse reference or concept)..."
                  className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 text-xs border border-stone-200 dark:border-slate-700 focus:outline-none"
                />
                <textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Back (Verse text or definition)..."
                  rows={2}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800 text-xs border border-stone-200 dark:border-slate-700 focus:outline-none resize-none"
                />
                <button
                  onClick={handleAddFlashcard}
                  className="py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Save Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
