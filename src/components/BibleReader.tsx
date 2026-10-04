import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BIBLE_BOOKS, 
  TRANSLATION_DETAILS, 
  BibleBookInfo 
} from '../data/bibleData';
import { BibleVerse, TranslationId } from '../types';
import { offlineBibleStorage } from '../services/offlineBibleStorage';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Check,
  Download,
  Database,
  CloudCheck,
  X,
  RefreshCw,
  HardDrive,
  FileText,
  RotateCw,
  Layers,
  Heart
} from 'lucide-react';
import { sesameVoice, SESAME_VOICES } from '../services/sesameVoiceService';
import { TTSState } from '../services/ttsService';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface MemoryCardItem {
  ref: string;
  book: string;
  text: string;
  theme: string;
}

const CANONICAL_MEMORY_VERSES: MemoryCardItem[] = [
  { ref: 'John 3:16', book: 'John', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', theme: 'God’s Infinite Love' },
  { ref: 'Philippians 4:13', book: 'Philippians', text: 'I can do all things through Christ who gives me strength.', theme: 'Supernatural Strength' },
  { ref: 'Romans 8:28', book: 'Romans', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', theme: 'Divine Sovereignty' },
  { ref: 'Proverbs 3:5-6', book: 'Proverbs', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', theme: 'Guidance & Trust' },
  { ref: 'Psalm 23:1', book: 'Psalms', text: 'The Lord is my shepherd, I lack nothing.', theme: 'The Good Shepherd' },
  { ref: 'Isaiah 40:31', book: 'Isaiah', text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', theme: 'Endurance & Hope' },
  { ref: 'Matthew 6:33', book: 'Matthew', text: 'Seek first his kingdom and his righteousness, and all these things will be given to you as well.', theme: 'Kingdom Priorities' },
  { ref: 'Joshua 1:9', book: 'Joshua', text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', theme: 'Courage in Adversity' },
  { ref: 'Ephesians 2:8-9', book: 'Ephesians', text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.', theme: 'Salvation by Grace' },
  { ref: '2 Timothy 1:7', book: '2 Timothy', text: 'For God has not given us a spirit of fear, but of power, and of love, and of a sound mind.', theme: 'Peace Over Fear' }
];

export const BibleReader: React.FC = () => {
  const {
    currentTranslation,
    setCurrentTranslation,
    bookmarkedVerses,
    toggleBookmark,
    highlightedVerses,
    setVerseHighlight,
    fontSize,
    setCurrentTab,
    addXp
  } = useApp();

  const [selectedBook, setSelectedBook] = useState('Matthew');
  const [selectedChapter, setSelectedChapter] = useState(5);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  // Red-Letter toggle for Jesus's words
  const [redLetterMode, setRedLetterMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lifeos_red_letter_mode') !== 'false';
    }
    return true;
  });

  // Flashcards Scripture Memory state
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [flashcardMasked, setFlashcardMasked] = useState(false);
  const [learnedCards, setLearnedCards] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('lifeos_learned_flashcards') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  // Personal Study Notes state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeNoteRef, setActiveNoteRef] = useState<string | null>(null);
  const [activeNoteVerseText, setActiveNoteVerseText] = useState<string>('');
  const [currentNoteText, setCurrentNoteText] = useState<string>('');
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('lifeos_bible_verse_notes') || '{}');
      } catch {
        return {};
      }
    }
    return {};
  });

  // Filters & Search
  const [testamentFilter, setTestamentFilter] = useState<'All' | 'New' | 'Old'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [isSearchingVerses, setIsSearchingVerses] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ book: string; chapter: number; verse: number; text: string }>>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Offline Download Manager state
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ percent: number; status: string } | null>(null);
  const [offlineStats, setOfflineStats] = useState<{ chaptersCount: number; booksCount: number; isFullBibleReady: boolean }>({
    chaptersCount: 1189,
    booksCount: 66,
    isFullBibleReady: true
  });

  // Audio narration state (powered by Sesame AI Voice + fallback)
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

  // Update offline storage stats on mount and after translation change
  const refreshOfflineStats = async () => {
    const stats = await offlineBibleStorage.getOfflineStats(currentTranslation);
    setOfflineStats(stats);
  };

  useEffect(() => {
    refreshOfflineStats();
    // Warm up translation in background
    offlineBibleStorage.loadFullTranslation(currentTranslation).then(() => {
      refreshOfflineStats();
    });
  }, [currentTranslation]);

  // Load Chapter dynamically from IndexedDB or local dataset
  useEffect(() => {
    let isMounted = true;
    setIsLoadingChapter(true);

    offlineBibleStorage.loadChapterOnlineOrOffline(currentTranslation, selectedBook, selectedChapter)
      .then(({ verses }) => {
        if (isMounted) {
          setChapterVerses(verses);
          setIsLoadingChapter(false);
          refreshOfflineStats();
        }
      })
      .catch((err) => {
        console.error('Failed to load chapter:', err);
        if (isMounted) setIsLoadingChapter(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBook, selectedChapter, currentTranslation]);

  const currentBookInfo: BibleBookInfo = useMemo(() => {
    return BIBLE_BOOKS.find(b => b.name === selectedBook) || BIBLE_BOOKS.find(b => b.name === 'Matthew')!;
  }, [selectedBook]);

  // Filtered books list
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(b => {
      const matchesTestament = testamentFilter === 'All' || b.testament === testamentFilter;
      const matchesCategory = categoryFilter === 'All' || b.category.includes(categoryFilter);
      const matchesSearch = !bookSearchQuery.trim() || 
        b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()) || 
        b.theme.toLowerCase().includes(bookSearchQuery.toLowerCase());
      return matchesTestament && matchesCategory && matchesSearch;
    });
  }, [testamentFilter, categoryFilter, bookSearchQuery]);

  // Handle Whole-Bible Search across all 31,102 verses
  const handlePerformSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchingVerses(false);
      return;
    }
    setIsSearchingVerses(true);
    setIsSearchingLoading(true);
    try {
      const results = await offlineBibleStorage.searchEntireBible(query, currentTranslation);
      setSearchResults(results);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setIsSearchingLoading(false);
    }
  };

  // Audio Handlers powered by Sesame Voice + Web Speech fallback
  const handleReadChapterAloud = () => {
    sounds.playTap();
    if (ttsState.isPlaying) {
      sesameVoice.stop();
      return;
    }
    const fullChapterText = `${selectedBook} Chapter ${selectedChapter}. ${chapterVerses.map(v => `Verse ${v.verse}: ${v.text}`).join(' ')}`;
    sesameVoice.speak(fullChapterText);
  };

  const handleReadVerseAloud = (text: string, reference: string) => {
    sounds.playTap();
    if (ttsState.isPlaying && ttsState.text.includes(reference)) {
      sesameVoice.stop();
      return;
    }
    sesameVoice.speak(`${reference}. ${text}`);
  };

  const handleCopyVerse = (text: string, ref: string, id: string) => {
    sounds.playTap();
    navigator.clipboard.writeText(`“${text}” — ${ref} (${currentTranslation})`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrevChapter = () => {
    sounds.playTap();
    sesameVoice.stop();
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    sounds.playTap();
    sesameVoice.stop();
    if (selectedChapter < currentBookInfo.chaptersCount) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const cyclePlaybackRate = () => {
    sounds.playTap();
    const rates = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(ttsState.rate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    sesameVoice.setRate(newRate);
  };

  // Study Notes helpers
  const openNoteForVerse = (ref: string, text: string) => {
    sounds.playTap();
    setActiveNoteRef(ref);
    setActiveNoteVerseText(text);
    setCurrentNoteText(verseNotes[ref] || '');
    setIsNoteModalOpen(true);
  };

  const saveCurrentNote = () => {
    if (!activeNoteRef) return;
    sounds.playVictory();
    const updated = { ...verseNotes, [activeNoteRef]: currentNoteText.trim() };
    if (!currentNoteText.trim()) {
      delete updated[activeNoteRef];
    }
    setVerseNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_bible_verse_notes', JSON.stringify(updated));
    }
    setIsNoteModalOpen(false);
  };

  // Red-Letter formatting for Jesus's words in the Gospels & Revelation
  const renderVerseBody = (text: string, book: string, chapter: number) => {
    if (!redLetterMode || !['Matthew', 'Mark', 'Luke', 'John', 'Revelation'].includes(book)) {
      return text;
    }

    const isFullDiscourseChapter =
      (book === 'Matthew' && [5, 6, 7, 24, 25].includes(chapter)) ||
      (book === 'John' && [14, 15, 16, 17].includes(chapter));

    if (isFullDiscourseChapter && !text.includes('“') && !text.includes('"')) {
      return <span className="text-rose-600 dark:text-rose-400 font-medium">{text}</span>;
    }

    const quoteRegex = /(“[^”]+”|"[^"]+")/g;
    const parts = text.split(quoteRegex);
    if (parts.length > 1) {
      return parts.map((part, idx) => {
        const isQuote = (part.startsWith('“') && part.endsWith('”')) || (part.startsWith('"') && part.endsWith('"'));
        if (isQuote) {
          return (
            <span key={idx} className="text-rose-600 dark:text-rose-400 font-semibold">
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    }

    return text;
  };

  // Download entire 66-book Bible (1,189 chapters, 31,102 verses) into IndexedDB
  const handleSyncEntireBible = async () => {
    sounds.playTap();
    setSyncProgress({ percent: 15, status: `Caching all 66 books in ${currentTranslation}...` });

    const ok = await offlineBibleStorage.syncEntireBibleOffline(currentTranslation, (percent, status) => {
      setSyncProgress({ percent, status });
    });

    if (ok) {
      sounds.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      await refreshOfflineStats();
      setTimeout(() => setSyncProgress(null), 2500);
    } else {
      sounds.playIncorrect();
      setSyncProgress(null);
    }
  };

  const fontClass = fontSize === 'xlarge' ? 'text-xl leading-loose' : fontSize === 'large' ? 'text-lg leading-relaxed' : 'text-base leading-relaxed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
      {/* Top Banner: Translations, Offline Status, Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Translation Picker */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-slate-800 w-full sm:w-auto">
            {(['NIV', 'WEB', 'KJV', 'BBE'] as TranslationId[]).map((tr) => (
              <button
                key={tr}
                onClick={() => {
                  sounds.playTap();
                  setCurrentTranslation(tr);
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all select-none ${
                  currentTranslation === tr
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Offline Storage Status & Download Manager Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                sounds.playTap();
                setIsOfflineManagerOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-100 transition-all select-none"
              title="Manage offline downloaded books and storage"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Full Bible Offline (66/66 Books)</span>
            </button>

            {/* Offline Whole-Bible Verse Search */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformSearch(verseSearchQuery);
              }}
              className="relative w-44 sm:w-60"
            >
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={verseSearchQuery}
                onChange={(e) => {
                  setVerseSearchQuery(e.target.value);
                  if (!e.target.value) setIsSearchingVerses(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePerformSearch(verseSearchQuery);
                  }
                }}
                placeholder="Search all 31,102 verses..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
              />
            </form>
          </div>
        </div>

        {/* Translation summary and 66-book total indicator */}
        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-slate-800">
          <span>
            <strong className="text-stone-800 dark:text-stone-200">{TRANSLATION_DETAILS[currentTranslation].name}:</strong>{' '}
            {TRANSLATION_DETAILS[currentTranslation].description}
          </span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CloudCheck className="w-4 h-4" />
            100% Complete Offline Bible (31,102 Verses Ready)
          </span>
        </div>
      </div>

      {/* Quick Action Ribbon: Red-Letter Toggle, Scripture Flashcards, Sesame Voice Narration Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-100 dark:bg-slate-800/80 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Red-Letter Toggle */}
          <button
            onClick={() => {
              sounds.playTap();
              const next = !redLetterMode;
              setRedLetterMode(next);
              if (typeof window !== 'undefined') {
                localStorage.setItem('lifeos_red_letter_mode', String(next));
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm ${
              redLetterMode
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                : 'bg-white dark:bg-slate-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-600'
            }`}
            title="Highlight words spoken by Jesus in red"
          >
            <span className={`w-2 h-2 rounded-full ${redLetterMode ? 'bg-rose-500 animate-pulse' : 'bg-stone-400'}`} />
            <span>Red Letters (Words of Christ): {redLetterMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Scripture Memory Flashcards */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsFlashcardsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all shadow-sm"
            title="Open Scripture Memory Flashcards Trainer"
          >
            <span>📇</span>
            <span>Scripture Memory ({CANONICAL_MEMORY_VERSES.length + bookmarkedVerses.length} Cards)</span>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded-full font-black">
              +XP
            </span>
          </button>
        </div>

        {/* Sesame Voice Narration Badge */}
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sesame AI Audio Narrator</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-stone-700 dark:text-stone-300 font-bold">100% Offline Compatible</span>
        </div>
      </div>

      {/* Progress banner during full offline sync */}
      {syncProgress && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 flex flex-col gap-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-black">
            <span>{syncProgress.status}</span>
            <span>{syncProgress.percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Reader View or Verse Search Results */}
      {isSearchingVerses ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg text-stone-800 dark:text-stone-100">
                Bible Search Results for "{verseSearchQuery}"
              </h3>
              <span className="text-xs text-stone-500">
                Found {searchResults.length} verses across all 66 books ({currentTranslation})
              </span>
            </div>
            <button
              onClick={() => {
                setVerseSearchQuery('');
                setIsSearchingVerses(false);
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Back to Reader
            </button>
          </div>

          {isSearchingLoading ? (
            <div className="text-center py-12 text-stone-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-sm font-semibold">Searching through all 31,102 verses...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-stone-500 italic py-8 text-center">
              No verses found matching "{verseSearchQuery}". Try search terms like "love", "light", "shepherd", "faith", or "grace".
            </p>
          ) : (
            <div className="flex flex-col gap-4 divide-y divide-stone-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto pr-2">
              {searchResults.map((v, i) => (
                <div key={i} className="pt-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setSelectedBook(v.book);
                        setSelectedChapter(v.chapter);
                        setIsSearchingVerses(false);
                      }}
                      className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {v.book} {v.chapter}:{v.verse} ({currentTranslation}) → Open Chapter
                    </button>
                    <button
                      onClick={() => handleCopyVerse(v.text, `${v.book} ${v.chapter}:${v.verse}`, `search-${i}`)}
                      className="p-1 rounded text-stone-400 hover:text-stone-600"
                    >
                      {copiedId === `search-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-serif italic text-stone-800 dark:text-stone-200 text-sm">
                    “{v.text}”
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* The Full 66-Book Explorer & Chapter Reader */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 66-Book Browser (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 max-h-[640px] overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-stone-800 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>The 66 Books</span>
              </h3>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                All 66 Available
              </span>
            </div>

            {/* Testament Filter: All | New (27) | Old (39) */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-black">
              {(['All', 'New', 'Old'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    sounds.playTap();
                    setTestamentFilter(t);
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    testamentFilter === t
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                  }`}
                >
                  {t === 'All' ? 'All (66)' : t === 'New' ? 'NT (27)' : 'OT (39)'}
                </button>
              ))}
            </div>

            {/* Quick Filter Book Input */}
            <input
              type="text"
              value={bookSearchQuery}
              onChange={(e) => setBookSearchQuery(e.target.value)}
              placeholder="Find book (e.g. Genesis, Psalms, John)..."
              className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500"
            />

            {/* Scrollable Books List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 divide-y divide-stone-100 dark:divide-slate-800">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook === book.name;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedBook(book.name);
                      setSelectedChapter(1);
                      sesameVoice.stop();
                    }}
                    className={`pt-2 pb-1.5 px-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'hover:bg-stone-50 dark:hover:bg-slate-800/60 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{book.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300">
                        {book.chaptersCount} Ch.
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 italic line-clamp-1 mt-0.5 font-medium">
                      {book.theme}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Book & Chapter Reader (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-stone-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-colors">
            {/* Header: Book Title, Theme, and Navigation */}
            <div className="flex flex-col gap-3 pb-4 border-b border-stone-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {currentBookInfo.testament} Testament • {currentBookInfo.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <CloudCheck className="w-3 h-3 text-emerald-600" />
                      All {chapterVerses.length} Verses Loaded
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
                    {selectedBook} {selectedChapter}
                  </h2>
                </div>

                {/* Chapter Audio Read & Speed */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={cyclePlaybackRate}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200"
                    title="Change voice narration speed"
                  >
                    {ttsState.rate}x Speed
                  </button>

                  <button
                    onClick={handleReadChapterAloud}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                      ttsState.isPlaying
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {ttsState.isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{ttsState.isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
              </div>

              {/* Book Theme Note */}
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                Theme: {currentBookInfo.theme}
              </p>

              {/* Chapter Grid / Selector Bar */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase text-stone-400 block mb-1">
                  Select Chapter (1 to {currentBookInfo.chaptersCount}):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {Array.from({ length: currentBookInfo.chaptersCount }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        sounds.playTap();
                        setSelectedChapter(ch);
                        sesameVoice.stop();
                      }}
                      className={`w-8 h-8 rounded-xl shrink-0 font-extrabold text-xs transition-all select-none ${
                        selectedChapter === ch
                          ? 'bg-emerald-600 text-white shadow-sm scale-105'
                          : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verses Reading Body */}
            {isLoadingChapter ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-sm font-bold">Opening {selectedBook} Chapter {selectedChapter}...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-2">
                {chapterVerses.map((verse) => {
                  const verseRef = `${verse.book} ${verse.chapter}:${verse.verse}`;
                  const isBookmarked = bookmarkedVerses.includes(verseRef);
                  const highlightColor = highlightedVerses[verseRef];

                  const highlightStyle = 
                    highlightColor === 'amber' ? 'bg-amber-100 dark:bg-amber-950/60' :
                    highlightColor === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950/60' :
                    highlightColor === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-950/60' :
                    highlightColor === 'rose' ? 'bg-rose-100 dark:bg-rose-950/60' : '';

                  return (
                    <div
                      key={verse.verse}
                      className={`group relative p-3 rounded-2xl transition-all ${highlightStyle} hover:bg-stone-50 dark:hover:bg-slate-800/40`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Verse number */}
                        <span className="font-black text-xs text-emerald-700 dark:text-emerald-400 select-none mt-1 shrink-0">
                          {verse.verse}
                        </span>

                        {/* Verse text with Red-Letter formatting */}
                        <p className={`flex-1 font-serif text-stone-800 dark:text-stone-200 ${fontClass}`}>
                          {renderVerseBody(verse.text, selectedBook, selectedChapter)}
                        </p>

                        {/* Action controls */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          {/* Audio */}
                          <button
                            onClick={() => handleReadVerseAloud(verse.text, verseRef)}
                            title="Read verse aloud"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-slate-700"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Bookmark */}
                          <button
                            onClick={() => {
                              sounds.playTap();
                              toggleBookmark(verseRef);
                            }}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                            className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-slate-700 ${
                              isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-400'
                            }`}
                          >
                            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                          </button>

                          {/* Study Note */}
                          <button
                            onClick={() => openNoteForVerse(verseRef, verse.text)}
                            title={verseNotes[verseRef] ? 'Edit personal study note' : 'Add personal study note'}
                            className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-slate-700 ${
                              verseNotes[verseRef] ? 'text-amber-500' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                            }`}
                          >
                            <FileText className={`w-4 h-4 ${verseNotes[verseRef] ? 'fill-amber-500/20' : ''}`} />
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyVerse(verse.text, verseRef, `${verse.chapter}-${verse.verse}`)}
                            title="Copy verse"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-slate-700"
                          >
                            {copiedId === `${verse.chapter}-${verse.verse}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                          </button>

                          {/* AI Reflect Link */}
                          <button
                            onClick={() => {
                              sounds.playTap();
                              setCurrentTab('prayer');
                            }}
                            title="Reflect on this verse in AI Prayer Companion"
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Personal Study Note preview if exists */}
                      {verseNotes[verseRef] && (
                        <div
                          onClick={() => openNoteForVerse(verseRef, verse.text)}
                          className="mt-2 ml-6 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 cursor-pointer hover:border-amber-400 transition-colors flex items-start gap-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block mb-0.5">
                              Personal Study Note
                            </span>
                            <p className="text-xs text-stone-700 dark:text-stone-300 italic font-sans line-clamp-2">
                              {verseNotes[verseRef]}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Color Highlighter Dots (visible on hover) */}
                      <div className="flex items-center gap-1.5 mt-1 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-stone-400 font-semibold mr-1">Highlight:</span>
                        {(['amber', 'emerald', 'cyan', 'rose'] as const).map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              sounds.playTap();
                              setVerseHighlight(verseRef, highlightColor === color ? '' : color);
                            }}
                            className={`w-3.5 h-3.5 rounded-full ${
                              color === 'amber' ? 'bg-amber-400' :
                              color === 'emerald' ? 'bg-emerald-400' :
                              color === 'cyan' ? 'bg-cyan-400' : 'bg-rose-400'
                            } ${highlightColor === color ? 'ring-2 ring-stone-700 dark:ring-white scale-110' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Chapter Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-slate-800">
              <button
                onClick={handlePrevChapter}
                disabled={selectedChapter <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-black text-stone-400">
                Chapter {selectedChapter} of {currentBookInfo.chaptersCount} ({chapterVerses.length} Verses)
              </span>

              <button
                onClick={handleNextChapter}
                disabled={selectedChapter >= currentBookInfo.chaptersCount}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Storage Manager Dialog */}
      {isOfflineManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setIsOfflineManagerOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                  Full Bible Offline Storage Manager
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {currentTranslation} ({TRANSLATION_DETAILS[currentTranslation].name})
                </span>
              </div>
            </div>

            {/* Offline Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                Complete Bible Status
              </span>
              <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">
                All 66 Books • 1,189 Chapters • 31,102 Verses Ready
              </p>
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium block mt-1">
                Every single chapter from Genesis 1 to Revelation 22 has all verses locally bundled. Zero internet connection required.
              </span>
            </div>

            {/* Fast 1-Click Sync Entire Bible */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="p-4 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    Save Full {currentTranslation} to Device Storage
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pre-caches all 31,102 verses into your browser's IndexedDB database for instant offline access.
                  </p>
                </div>
                <button
                  onClick={handleSyncEntireBible}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shrink-0 active:translate-y-0.5 transition-all"
                >
                  Sync Entire Bible
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 text-center font-medium mt-2">
              Every chapter and verse in the Bible is available offline across NIV, WEB, KJV, and BBE translations.
            </p>
          </div>
        </div>
      )}

      {/* Scripture Memory Flashcards Modal */}
      {isFlashcardsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 border-2 border-stone-200 dark:border-slate-800 shadow-2xl relative flex flex-col gap-5">
            <button
              onClick={() => {
                sounds.playTap();
                setIsFlashcardsOpen(false);
                sesameVoice.stop();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📇</span>
                <div>
                  <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                    Scripture Memory Flashcards
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Card {flashcardIdx + 1} of {CANONICAL_MEMORY_VERSES.length} • {learnedCards.includes(CANONICAL_MEMORY_VERSES[flashcardIdx]?.ref) ? '⭐️ Mastered' : '🌱 In Training'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playTap();
                  setFlashcardMasked(!flashcardMasked);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                  flashcardMasked
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-400'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-slate-700'
                }`}
                title="Mask key words to test your memory recall"
              >
                {flashcardMasked ? 'Mask: ON 🧩' : 'Mask: OFF'}
              </button>
            </div>

            {/* The Interactive Flashcard */}
            {(() => {
              const currentCard = CANONICAL_MEMORY_VERSES[flashcardIdx] || CANONICAL_MEMORY_VERSES[0];

              // Masked text logic
              const words = currentCard.text.split(' ');
              const maskedText = words.map((w, idx) => (idx % 3 === 2 ? '_____' : w)).join(' ');

              return (
                <div
                  onClick={() => {
                    sounds.playTap();
                    setIsFlashcardFlipped(!isFlashcardFlipped);
                  }}
                  className={`min-h-[220px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer select-none transition-all duration-300 border-2 shadow-lg ${
                    isFlashcardFlipped
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400'
                      : 'bg-stone-50 dark:bg-slate-800 text-stone-800 dark:text-stone-100 border-amber-300 dark:border-amber-900/60 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isFlashcardFlipped
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {currentCard.theme}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playTap();
                        sesameVoice.speak(`${currentCard.ref}. ${currentCard.text}`);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isFlashcardFlipped ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-stone-200 hover:bg-stone-300'
                      }`}
                      title="Audio Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-6 text-center">
                    {!isFlashcardFlipped ? (
                      <div className="space-y-2">
                        <h4 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-amber-900 dark:text-amber-100">
                          {currentCard.ref}
                        </h4>
                        <span className="text-xs text-stone-500 font-semibold block">
                          Tap card to reveal scripture text ↺
                        </span>
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-serif italic leading-relaxed text-emerald-50">
                        “{flashcardMasked ? maskedText : currentCard.text}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold opacity-80">
                    <span>{isFlashcardFlipped ? currentCard.ref : 'Tap to Flip'}</span>
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{isFlashcardFlipped ? 'Show Reference' : 'Reveal Verse'}</span>
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsFlashcardFlipped(false);
                  setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : CANONICAL_MEMORY_VERSES.length - 1));
                  sesameVoice.stop();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  sounds.playVictory();
                  confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
                  addXp(5);
                  const currentCard = CANONICAL_MEMORY_VERSES[flashcardIdx];
                  if (currentCard && !learnedCards.includes(currentCard.ref)) {
                    const next = [...learnedCards, currentCard.ref];
                    setLearnedCards(next);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('lifeos_learned_flashcards', JSON.stringify(next));
                    }
                  }
                  // Advance to next card
                  setIsFlashcardFlipped(false);
                  setFlashcardIdx((prev) => (prev < CANONICAL_MEMORY_VERSES.length - 1 ? prev + 1 : 0));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>I Know This! (+5 XP)</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsFlashcardFlipped(false);
                  setFlashcardIdx((prev) => (prev < CANONICAL_MEMORY_VERSES.length - 1 ? prev + 1 : 0));
                  sesameVoice.stop();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Study Note Modal */}
      {isNoteModalOpen && activeNoteRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border-2 border-stone-200 dark:border-slate-800 shadow-2xl relative flex flex-col gap-4">
            <button
              onClick={() => {
                sounds.playTap();
                setIsNoteModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100">
                  Study Note: {activeNoteRef}
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {TRANSLATION_DETAILS[currentTranslation].name}
                </span>
              </div>
            </div>

            {/* Quoted verse text */}
            <p className="text-xs font-serif italic text-stone-600 dark:text-stone-300 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
              “{activeNoteVerseText}”
            </p>

            {/* Note text editor */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Your Personal Reflection & Cross-References:
              </label>
              <textarea
                rows={4}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="What is God speaking to you through this passage? Add reflections, greek/hebrew notes, or sermon reminders..."
                className="w-full p-3 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  const updated = { ...verseNotes };
                  delete updated[activeNoteRef];
                  setVerseNotes(updated);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('lifeos_bible_verse_notes', JSON.stringify(updated));
                  }
                  setIsNoteModalOpen(false);
                }}
                className="text-xs font-bold text-rose-500 hover:text-rose-600"
              >
                Clear Note
              </button>

              <button
                onClick={saveCurrentNote}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Save Study Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
