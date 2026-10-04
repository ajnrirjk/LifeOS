import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Compass,
  BookOpen,
  Heart,
  Zap,
  ArrowRight,
  BookmarkPlus,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { sounds } from '../../services/soundEffects';
import {
  LifeAiService,
  LifeAiMessage,
  LifeAiPersona
} from '../../services/lifeAiService';

const PERSONAS: Array<{
  id: LifeAiPersona;
  label: string;
  emoji: string;
  description: string;
  icon: any;
}> = [
  {
    id: 'guide',
    label: 'Everyday Guide',
    emoji: '🕊️',
    description: 'Practical daily companion for faith, tasks & organization',
    icon: Compass
  },
  {
    id: 'scholar',
    label: 'Bible Scholar',
    emoji: '📖',
    description: 'Deep scripture insights, Greek/Hebrew, theology & history',
    icon: BookOpen
  },
  {
    id: 'navigator',
    label: 'OS Navigator',
    emoji: '⚡',
    description: 'LifeOS shortcuts, app advice, sermon notes & feature discovery',
    icon: Zap
  },
  {
    id: 'prayer',
    label: 'Prayer & Heart',
    emoji: '🙏',
    description: 'Gentle spiritual comfort, customized prayers & encouragement',
    icon: Heart
  }
];

const QUICK_STARTERS = [
  {
    text: 'Help me plan a peaceful and productive morning routine',
    emoji: '☀️',
    persona: 'guide' as LifeAiPersona
  },
  {
    text: 'Give me 3 comforting Bible verses for when I feel overwhelmed',
    emoji: '🌿',
    persona: 'prayer' as LifeAiPersona
  },
  {
    text: 'How can I take effective sermon notes during church?',
    emoji: '📝',
    persona: 'navigator' as LifeAiPersona
  },
  {
    text: 'Explain Romans 8:28 and how it applies to difficult times',
    emoji: '📖',
    persona: 'scholar' as LifeAiPersona
  },
  {
    text: 'How do I start or join a video fellowship in LifeMeet?',
    emoji: '📹',
    persona: 'navigator' as LifeAiPersona
  },
  {
    text: 'Write a short prayer of gratitude for my family and blessings',
    emoji: '🙏',
    persona: 'prayer' as LifeAiPersona
  }
];

export const LifeAiApp: React.FC = () => {
  const { launchApp } = useLifeOS();
  const { googleUser } = useSettings();

  const [messages, setMessages] = useState<LifeAiMessage[]>(() => {
    return LifeAiService.getSavedHistory();
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<LifeAiPersona>('guide');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages whenever updated
  useEffect(() => {
    LifeAiService.saveHistory(messages);
  }, [messages]);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Handle Speech-to-Text via Web Speech API
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      try {
        speechRecognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    try {
      sounds.playTap();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to Speech
  const toggleSpeech = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    sounds.playTap();

    // Strip markdown formatting symbols for clean audio reading
    const cleanText = text
      .replace(/#{1,6}\s?/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s?/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    sounds.playTap();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save to ChurchNotes
  const handleSaveToNotes = (msgId: string, text: string) => {
    try {
      sounds.playCorrect();
      const existing = localStorage.getItem('lifeos_church_sermon_notes_v2');
      let notes = [];
      if (existing) {
        notes = JSON.parse(existing);
      }

      const newNote = {
        id: `note_lifeai_${Date.now()}`,
        title: `LifeAi Insight (${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`,
        date: new Date().toISOString().split('T')[0],
        speaker: 'LifeAi Companion',
        passage: 'Everyday Wisdom',
        content: text,
        tags: ['LifeAi', 'Wisdom', 'Devotional'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notes.unshift(newNote);
      localStorage.setItem('lifeos_church_sermon_notes_v2', JSON.stringify(notes));

      setSavedNoteId(msgId);
      setTimeout(() => setSavedNoteId(null), 3000);
    } catch (err) {
      console.error('Error saving to ChurchNotes:', err);
    }
  };

  // Send Message
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    sounds.playTap();

    const userMessage: LifeAiMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const responseMessage = await LifeAiService.sendMessage(
        textToSend,
        messages,
        activePersona
      );
      sounds.playCorrect();
      setMessages([...newHistory, responseMessage]);
    } catch {
      sounds.playIncorrect();
      const errorMsg: LifeAiMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I experienced a momentary connection issue. I'm still here to help you navigate LifeOS anytime!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Chat History
  const handleClearHistory = () => {
    if (confirm('Clear LifeAi chat history?')) {
      sounds.playTap();
      LifeAiService.clearHistory();
      setMessages([]);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
    }
  };

  // Render Markdown-like formatting helper
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-2 mb-1 flex items-center gap-1.5">
                <span>{trimmed.replace('### ', '')}</span>
              </h3>
            );
          }

          // Heading 2 or 1
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-base font-black text-violet-600 dark:text-violet-400 mt-3 mb-1">
                {trimmed.replace(/^#+\s/, '')}
              </h2>
            );
          }

          // Bullet point
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-violet-500 font-bold mt-1 text-xs">•</span>
                <span className="flex-1">{formatInlineText(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)/);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-extrabold text-xs text-indigo-500 mt-0.5">{match?.[1]}.</span>
                <span className="flex-1">{formatInlineText(match?.[2] || '')}</span>
              </div>
            );
          }

          // Blockquote / Scripture verse
          if (trimmed.startsWith('> ')) {
            return (
              <div
                key={idx}
                className="my-2 p-2.5 rounded-xl bg-violet-500/10 border-l-4 border-violet-500 text-stone-800 dark:text-stone-200 italic font-serif text-sm"
              >
                {formatInlineText(trimmed.replace('> ', ''))}
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          return <p key={idx}>{formatInlineText(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Format bold and backtick codes inline
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-stone-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-xs font-mono text-violet-600 dark:text-violet-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-slate-950 text-stone-900 dark:text-stone-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="h-14 border-b border-stone-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm tracking-tight text-stone-900 dark:text-white">
                LifeAi
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30">
                Companion
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Your Everyday LifeOS Assistant
            </p>
          </div>
        </div>

        {/* Persona Switcher & Controls */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center p-0.5 bg-stone-100 dark:bg-slate-800/80 rounded-xl border border-stone-200 dark:border-slate-700/60">
            {PERSONAS.map(p => {
              const Icon = p.icon;
              const isActive = activePersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playTap();
                    setActivePersona(p.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title={p.description}
                >
                  <span>{p.emoji}</span>
                  <span className="hidden md:inline">{p.label}</span>
                </button>
              );
            })}
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome Hero & Quick Starter Cards */
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-violet-500/25 mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                How can LifeAi assist you today?
              </h2>
              <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                I'm your intelligent companion inside LifeOS. Ask for Bible insights, daily planning, sermon note templates, or instant navigation across your apps.
              </p>
            </motion.div>

            {/* Quick Starters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {QUICK_STARTERS.map((starter, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setActivePersona(starter.persona);
                    handleSend(starter.text);
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 text-left hover:border-violet-500/50 hover:shadow-md transition-all group"
                >
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40">
                    {starter.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                      {starter.text}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-4 py-3.5 shadow-sm ${
                      isUser
                        ? 'bg-violet-600 text-white rounded-br-xs font-medium'
                        : 'bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800/80 rounded-bl-xs text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-3">
                        {renderFormattedText(msg.text)}

                        {/* Action Suggestion Card (Deep linking into LifeOS apps) */}
                        {msg.actionSuggestion && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                sounds.playCorrect();
                                launchApp(msg.actionSuggestion!.appId);
                              }}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                            >
                              <span>{msg.actionSuggestion.label}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Message Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800/60 text-[11px] text-stone-400">
                          <span className="text-[10px]">{msg.timestamp}</span>

                          <div className="flex items-center gap-1">
                            {/* Text to Speech */}
                            <button
                              onClick={() => toggleSpeech(msg.id, msg.text)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                speakingId === msg.id
                                  ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300'
                                  : 'hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-stone-600'
                              }`}
                              title={speakingId === msg.id ? 'Stop Speaking' : 'Read Aloud'}
                            >
                              {speakingId === msg.id ? (
                                <VolumeX className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Copy Text */}
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-stone-600 transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Save to ChurchNotes */}
                            <button
                              onClick={() => handleSaveToNotes(msg.id, msg.text)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 transition-colors"
                              title="Save as note in ChurchNotes"
                            >
                              {savedNoteId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-500 font-bold">Saved!</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-semibold">Save Note</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up question chips */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pl-2 max-w-[85%]">
                      {msg.suggestedFollowUps.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(f)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors flex items-center gap-1"
                        >
                          <span>{f}</span>
                          <ArrowRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Thinking Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3.5 max-w-[200px] rounded-2xl rounded-bl-xs bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-500 text-xs shadow-sm"
              >
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                <span className="font-bold">LifeAi is thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar & Controls */}
      <div className="p-3 md:p-4 bg-white/95 dark:bg-slate-900/95 border-t border-stone-200 dark:border-slate-800 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Active Persona Banner for mobile */}
          <div className="flex sm:hidden items-center justify-between text-xs text-stone-500 pb-1">
            <span className="font-bold">Persona: {PERSONAS.find(p => p.id === activePersona)?.label}</span>
            <div className="flex gap-1">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p.id)}
                  className={`p-1 rounded-md text-sm ${activePersona === p.id ? 'bg-violet-600 text-white' : 'bg-stone-100 dark:bg-slate-800'}`}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2 bg-stone-100 dark:bg-slate-800/90 rounded-2xl p-1.5 border border-stone-200 dark:border-slate-700/60 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            {/* Speech to text mic button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
              }`}
              title={isListening ? 'Stop listening' : 'Speak message'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input field */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask LifeAi anything (${PERSONAS.find(p => p.id === activePersona)?.label} mode)...`}
              className="flex-1 bg-transparent border-0 resize-none outline-none text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 max-h-32 py-2"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl font-bold transition-all ${
                input.trim() && !isLoading
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/25 active:scale-95'
                  : 'bg-stone-200 dark:bg-slate-700 text-stone-400 cursor-not-allowed'
              }`}
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
