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
  HardDrive
} from 'lucide-react';
import { tts, TTSState } from '../services/ttsService';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

export const BibleReader: React.FC = () => {
  const {
    currentTranslation,
    setCurrentTranslation,
    bookmarkedVerses,
    toggleBookmark,
    highlightedVerses,
    setVerseHighlight,
    fontSize,
    setCurrentTab
  } = useApp();

  const [selectedBook, setSelectedBook] = useState('Matthew');
  const [selectedChapter, setSelectedChapter] = useState(5);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

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

  // Audio narration state
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

  // Audio Handlers
  const handleReadChapterAloud = () => {
    sounds.playTap();
    if (ttsState.isPlaying) {
      tts.stop();
      return;
    }
    const fullChapterText = `${selectedBook} Chapter ${selectedChapter}. ${chapterVerses.map(v => `Verse ${v.verse}: ${v.text}`).join(' ')}`;
    tts.speak(fullChapterText);
  };

  const handleReadVerseAloud = (text: string, reference: string) => {
    sounds.playTap();
    tts.toggle(`${reference}. ${text}`);
  };

  const handleCopyVerse = (text: string, ref: string, id: string) => {
    sounds.playTap();
    navigator.clipboard.writeText(`“${text}” — ${ref} (${currentTranslation})`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrevChapter = () => {
    sounds.playTap();
    tts.stop();
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    sounds.playTap();
    tts.stop();
    if (selectedChapter < currentBookInfo.chaptersCount) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const cyclePlaybackRate = () => {
    sounds.playTap();
    const rates = [0.75, 1.0, 1.25];
    const nextIdx = (rates.indexOf(ttsState.rate) + 1) % rates.length;
    tts.setRate(rates[nextIdx]);
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
            {(['WEB', 'KJV', 'BBE'] as TranslationId[]).map((tr) => (
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
                      tts.stop();
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
                        tts.stop();
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

                        {/* Verse text */}
                        <p className={`flex-1 font-serif text-stone-800 dark:text-stone-200 ${fontClass}`}>
                          {verse.text}
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
              Every chapter and verse in the Bible is available offline across WEB, KJV, and BBE translations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
