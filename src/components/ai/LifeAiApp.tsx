import React, { useState, useEffect, useRef } from 'react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useSettings } from '../../context/SettingsContext';
import { LifeAiService, LifeAiMessage } from '../../services/lifeAiService';
import { sesameVoice, SESAME_VOICES } from '../../services/sesameVoiceService';
import { sounds } from '../../services/soundEffects';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Trash2,
  Copy,
  Check,
  Compass,
  BookOpen,
  Key,
  RefreshCw,
  Loader2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  Heart,
  Lightbulb,
  Zap
} from 'lucide-react';

type PersonaType = 'pastor' | 'navigator' | 'scholar';

interface PersonaDef {
  id: PersonaType;
  title: string;
  emoji: string;
  badge: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  voiceId: string;
  quickPrompts: string[];
}

const PERSONAS: Record<PersonaType, PersonaDef> = {
  pastor: {
    id: 'pastor',
    title: 'Pastoral Guide',
    emoji: '🕊️',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    description: 'Compassionate counsel, daily prayer creation, and scripture-rooted encouragement.',
    voiceId: 'david-pastoral',
    quickPrompts: [
      'Write an evening prayer of peace and gratitude',
      'Scriptures on trusting God through anxious seasons',
      'Draft a 3-point sermon outline on Grace',
      'How can I cultivate a consistent daily quiet time?'
    ]
  },
  navigator: {
    id: 'navigator',
    title: 'LifeOS Navigator',
    emoji: '⚡',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-400',
    description: 'Direct system assistance, app shortcuts, note-taking advice, and productivity workflows.',
    voiceId: 'elijah-resonant',
    quickPrompts: [
      'How do I record notes during sermons in ChurchNotes?',
      'Guide me through FaithLingo Bible leagues & flashcards',
      'How can I host a prayer circle in LifeMeet?',
      'What faith-based games are in Arcade Vault?'
    ]
  },
  scholar: {
    id: 'scholar',
    title: 'Theological Scholar',
    emoji: '💡',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-400',
    description: 'Historical contexts, Greek/Hebrew word studies, theology, and deep commentary.',
    voiceId: 'grace-gentle',
    quickPrompts: [
      'Explain the meaning of Logos in John 1:1 Greek context',
      'What is the difference between Justification and Sanctification?',
      'Historical context and author of the Book of Hebrews',
      'Explain the covenant structure in Genesis 12 vs Genesis 15'
    ]
  }
};

const INITIAL_MESSAGES: LifeAiMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: 'Grace and peace! I am **LifeAi**, your intelligent companion inside LifeOS.\n\nI can assist you with scripture study, generating prayers, drafting sermon outlines, answering theological questions, and navigating all LifeOS apps (ChurchNotes, FaithLingo, Fellowship Chat, LifeMeet, Arcade Vault, and YouTube).\n\nHow may I serve you today?',
    timestamp: 'Just now',
    actionSuggestion: {
      appId: 'bible_journal',
      label: 'Open ChurchNotes'
    }
  }
];

export const LifeAiApp: React.FC = () => {
  const { launchApp } = useLifeOS();
  const { settings, updateSettings } = useSettings();

  const [messages, setMessages] = useState<LifeAiMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_life_ai_messages_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(() => {
    try {
      const saved = localStorage.getItem('lifeos_life_ai_persona');
      if (saved && (saved === 'pastor' || saved === 'navigator' || saved === 'scholar')) {
        return saved as PersonaType;
      }
    } catch {}
    return 'pastor';
  });

  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    return settings.sesameVoiceId || 'david-pastoral';
  });

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(settings.geminiApiKey || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_life_ai_messages_v1', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist persona
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_life_ai_persona', selectedPersona);
    } catch {}
  }, [selectedPersona]);

  // Listen to sesame voice state
  useEffect(() => {
    const unsub = sesameVoice.subscribe((ttsState) => {
      if (!ttsState.isPlaying) {
        setSpeakingMessageId(null);
      }
    });
    return () => unsub();
  }, []);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    sounds.playTap();

    const userMessage: LifeAiMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await LifeAiService.generateResponse({
        prompt: textToSend,
        conversationHistory: [...messages, userMessage],
        persona: selectedPersona,
        apiKey: settings.geminiApiKey
      });

      setMessages(prev => [...prev, response]);
      sounds.playMessageNotification();
    } catch (err) {
      console.error('LifeAi generation error:', err);
      // Fallback message
      const fallbackMsg: LifeAiMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an unexpected connection glitch. Rest assured, the Lord remains your strength (Psalm 28:7). Please try again in a moment!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history with LifeAi?')) {
      sounds.playPurgeSound();
      sesameVoice.stop();
      setSpeakingMessageId(null);
      setMessages(INITIAL_MESSAGES);
    }
  };

  const handleToggleSpeech = (msg: LifeAiMessage) => {
    sounds.playTap();
    if (speakingMessageId === msg.id) {
      sesameVoice.stop();
      setSpeakingMessageId(null);
    } else {
      sesameVoice.stop();
      setSpeakingMessageId(msg.id);
      // Strip markdown asterisks and hashtags for clean speech recitation
      const cleanText = msg.text.replace(/[*_#`>]/g, '').trim();
      sesameVoice.speak(cleanText, {
        voiceId: selectedVoiceId,
        apiKey: settings.sesameApiKey,
        onEnd: () => setSpeakingMessageId(null)
      });
    }
  };

  const handleCopyText = (msg: LifeAiMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    sounds.playTap();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = () => {
    const trimmed = geminiKeyInput.trim();
    updateSettings({ geminiApiKey: trimmed });
    setShowApiKeyModal(false);
    sounds.playCorrect();
  };

  const activePersona = PERSONAS[selectedPersona];
  const hasGeminiKey = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim());

  // Render markdown-like simple formatting for paragraphs, bold text, bullet points
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2.5" />;
      }

      // Blockquote
      if (line.startsWith('>')) {
        return (
          <blockquote
            key={lineIdx}
            className="my-1.5 pl-3 border-l-2 border-emerald-500/60 italic text-stone-300 text-xs sm:text-sm bg-emerald-950/20 py-1 rounded-r"
          >
            {renderBoldSpan(line.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // Bullet item
      if (line.match(/^[\*\-•]\s+/)) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1 text-xs sm:text-sm">
            <span className="text-cyan-400 font-bold mt-1 text-xs">•</span>
            <span className="leading-relaxed flex-1">
              {renderBoldSpan(line.replace(/^[\*\-•]\s+/, ''))}
            </span>
          </div>
        );
      }

      // Numbered item
      if (line.match(/^\d+\.\s+/)) {
        const num = line.match(/^(\d+)\.\s+/)?.[1];
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1 text-xs sm:text-sm">
            <span className="text-emerald-400 font-bold text-xs mt-0.5">{num}.</span>
            <span className="leading-relaxed flex-1">
              {renderBoldSpan(line.replace(/^\d+\.\s+/, ''))}
            </span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={lineIdx} className="leading-relaxed my-1 text-xs sm:text-sm">
          {renderBoldSpan(line)}
        </p>
      );
    });
  };

  const renderBoldSpan = (str: string) => {
    // Regex splits by **bold**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-stone-950 text-stone-100 font-sans select-text overflow-hidden">
      {/* Top Header */}
      <header className="flex-shrink-0 px-4 py-3 bg-stone-900/90 backdrop-blur-md border-b border-stone-800/80 flex items-center justify-between gap-3 z-10">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                LifeAi
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
                  Companion
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-stone-400 truncate hidden sm:block">
              Intelligent spiritual companion & LifeOS guide
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-2">
          {/* Persona selector tabs */}
          <div className="bg-stone-950/80 border border-stone-800 p-0.5 rounded-xl flex items-center">
            {(Object.keys(PERSONAS) as PersonaType[]).map((pKey) => {
              const p = PERSONAS[pKey];
              const isActive = selectedPersona === pKey;
              return (
                <button
                  key={pKey}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedPersona(pKey);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `${p.badge} font-bold shadow-sm`
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                  title={p.description}
                >
                  <span>{p.emoji}</span>
                  <span className="hidden md:inline">{p.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Voice Engine Picker */}
          <div className="relative hidden lg:flex items-center space-x-1.5 bg-stone-950/60 border border-stone-800 px-2 py-1 rounded-xl text-xs text-stone-300">
            <Volume2 className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedVoiceId}
              onChange={(e) => {
                 const vid = e.target.value;
                 setSelectedVoiceId(vid);
                 updateSettings({ sesameVoiceId: vid });
                 sounds.playTap();
              }}
              className="bg-transparent border-none text-xs text-stone-200 focus:outline-none cursor-pointer"
            >
              {SESAME_VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-stone-900 text-stone-200">
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stop active speech button if speaking */}
          {speakingMessageId && (
            <button
              onClick={() => {
                sesameVoice.stop();
                setSpeakingMessageId(null);
                sounds.playTap();
              }}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1 animate-pulse"
              title="Stop speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mute Voice</span>
            </button>
          )}

          {/* Gemini Key Config Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setShowApiKeyModal(true);
            }}
            className={`p-2 rounded-xl border text-xs font-medium transition-all ${
              hasGeminiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-stone-800/60 border-stone-700/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title={hasGeminiKey ? 'Gemini 2.5 Flash active' : 'Configure Gemini API Key'}
          >
            <Key className="w-4 h-4" />
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-stone-800/60 hover:bg-rose-500/20 border border-stone-700/60 hover:border-rose-500/30 text-stone-400 hover:text-rose-300 transition-all"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Conversation Flow */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth">
        {/* Active Persona Banner */}
        <div className="max-w-3xl mx-auto mb-2">
          <div className="p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center space-x-2">
              <span className="text-base">{activePersona.emoji}</span>
              <span className="font-semibold text-stone-300">{activePersona.title}</span>
              <span className="text-stone-500 hidden sm:inline">— {activePersona.description}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                }`}
              />
              <span className="text-[11px] font-medium text-stone-400">
                {hasGeminiKey ? 'Gemini 2.5 Flash' : 'Wisdom Engine'}
              </span>
            </div>
          </div>
        </div>

        {/* Message Bubbles */}
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThisSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-md relative transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm'
                      : 'bg-stone-900/90 border border-stone-800/80 text-stone-200 rounded-tl-sm'
                  }`}
                >
                  {/* Sender label for assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-stone-800/50 text-[11px]">
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        LifeAi
                      </span>
                      <span className="text-stone-500 text-[10px]">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message body with Markdown formatting */}
                  <div className="text-stone-100 font-normal leading-relaxed text-xs sm:text-sm">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* App Action Suggestion Button */}
                  {msg.actionSuggestion && (
                    <div className="mt-3 pt-2.5 border-t border-stone-800/70 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          sounds.playTap();
                          launchApp(msg.actionSuggestion!.appId);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-900/30 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{msg.actionSuggestion.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>
                  )}

                  {/* Assistant Message Actions Toolbar */}
                  {!isUser && (
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-stone-500 text-[11px]">
                      <div className="flex items-center space-x-1">
                        {/* Sesame Voice Speak Button */}
                        <button
                          onClick={() => handleToggleSpeech(msg)}
                          className={`p-1 rounded-lg transition-all flex items-center space-x-1 px-1.5 ${
                            isThisSpeaking
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'hover:bg-stone-800 hover:text-stone-300'
                          }`}
                          title="Listen with Sesame AI Voice"
                        >
                          {isThisSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                              <span className="text-[10px] font-bold text-rose-300">Mute</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Read</span>
                            </>
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyText(msg)}
                          className="p-1 rounded-lg hover:bg-stone-800 hover:text-stone-300 transition-all flex items-center space-x-1 px-1.5"
                          title="Copy text to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Timestamp for user */}
                      {isUser && <span className="text-stone-400 text-[10px]">{msg.timestamp}</span>}
                    </div>
                  )}
                </div>

                {/* User timestamp */}
                {isUser && (
                  <span className="text-[10px] text-stone-500 mt-1 mr-1">{msg.timestamp}</span>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="bg-stone-900/90 border border-stone-800/80 rounded-2xl px-4 py-3 text-stone-300 text-xs flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="italic text-stone-400 font-medium">
                  LifeAi is discerning an answer...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Prompts Ribbon */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-stone-900 bg-stone-950/70 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {activePersona.quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-stone-900/90 backdrop-blur-md border-t border-stone-800">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-stone-950 border border-stone-800 rounded-2xl shadow-inner focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activePersona.title} about scripture, life, prayer, or LifeOS...`}
              disabled={isLoading}
              className="w-full bg-transparent text-stone-100 placeholder-stone-500 text-xs sm:text-sm p-3.5 pr-24 resize-none focus:outline-none max-h-32 leading-relaxed"
            />

            <div className="absolute right-2 bottom-2 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Send className="w-4 h-4 text-stone-950" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-500">
            <div className="flex items-center space-x-2">
              <span>Press <strong className="text-stone-400">Enter</strong> to send, <strong className="text-stone-400">Shift+Enter</strong> for newline</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  sounds.playTap();
                  launchApp('bible_journal');
                }}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                <span>ChurchNotes</span>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  launchApp('faithlingo');
                }}
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>FaithLingo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Key Config Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Gemini API Key</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Connect Google Gemini 2.5 Flash for advanced real-time generation and reasoning. If no key is set, LifeAi will seamlessly use its built-in offline wisdom engine.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 pt-1"
              >
                <span>Get a free Gemini API key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-xs font-black text-stone-950 transition-all shadow-md active:scale-95"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LifeAiApp;
