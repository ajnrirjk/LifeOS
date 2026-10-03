import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats, ReadingPlan, PrayerJournalItem, TranslationId, Lesson } from '../types';
import { READING_PLANS } from '../data/readingPlansData';
import { DAILY_HIGHLIGHTS, DailyVerseHighlight } from '../data/bibleData';
import { sounds } from '../services/soundEffects';

interface AppContextType {
  // Navigation
  currentTab: 'learn' | 'bible' | 'plans' | 'prayer' | 'leaderboard';
  setCurrentTab: (tab: 'learn' | 'bible' | 'plans' | 'prayer' | 'leaderboard') => void;
  isShopOpen: boolean;
  setIsShopOpen: (open: boolean) => void;
  isWidgetModalOpen: boolean;
  setIsWidgetModalOpen: (open: boolean) => void;
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson | null) => void;

  // Stats
  userStats: UserStats;
  completeLesson: (lessonId: string, xpEarned: number, bonusGems?: number) => void;
  loseHeart: () => boolean; // returns true if hearts left > 0
  refillHearts: () => boolean;
  buyStreakFreeze: () => boolean;
  addXp: (amount: number) => void;
  addGems: (amount: number) => void;
  setGems: (amount: number) => void;
  setStreak: (days: number) => void;
  setInfiniteHearts: () => void;

  // Reading Plans
  readingPlans: ReadingPlan[];
  togglePlanDay: (planId: string, dayNumber: number) => void;
  togglePlanEnrollment: (planId: string) => void;

  // Bible Reader & Translations
  currentTranslation: TranslationId;
  setCurrentTranslation: (t: TranslationId) => void;
  bookmarkedVerses: string[];
  toggleBookmark: (verseId: string) => void;
  highlightedVerses: Record<string, string>;
  setVerseHighlight: (verseId: string, color: string) => void;

  // Prayer Journal
  prayerJournal: PrayerJournalItem[];
  addPrayerJournalItem: (item: Omit<PrayerJournalItem, 'id' | 'date'>) => void;
  togglePrayerAnswered: (id: string) => void;

  // Preferences & Accessibility
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  soundEnabled: boolean;
  toggleSoundEnabled: () => void;

  // Today's highlight
  todayHighlight: DailyVerseHighlight;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_STATS: UserStats = {
  xp: 410,
  streak: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  hearts: 5,
  maxHearts: 5,
  gems: 240,
  completedLessonIds: ['u1-l1'],
  streakFreezeActive: false,
  activeLeague: 'Gold',
  dailyGoalMinutes: 10,
  todayMinutesSpent: 6,
  streakHistory: [
    new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0],
  ]
};

const DEFAULT_PRAYERS: PrayerJournalItem[] = [
  {
    id: 'p-init-1',
    date: 'Yesterday at 8:30 PM',
    category: 'Peace & Rest',
    title: 'Peace Before Sleep',
    userPrompt: 'Lord, calm my restless thoughts tonight and grant me deep sleep in Your care.',
    prayerText: 'Heavenly Father, as night falls, I release every task and unfinished desire into Your sovereign hands. Grant my spirit stillness and sweet sleep, knowing You neither slumber nor sleep. In Jesus’ name, Amen.',
    scriptureReference: 'Psalm 4:8',
    reflection: 'Rest is an act of trust in God’s sovereignty.',
    isAnswered: true
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<'learn' | 'bible' | 'plans' | 'prayer' | 'leaderboard'>('learn');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Stats with localStorage persistence
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Reading Plans
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_plans');
      return saved ? JSON.parse(saved) : READING_PLANS;
    } catch {
      return READING_PLANS;
    }
  });

  // Offline Bible Settings
  const [currentTranslation, setCurrentTranslation] = useState<TranslationId>('WEB');
  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_bookmarks');
      return saved ? JSON.parse(saved) : ['Matthew 5:3', 'John 14:6', 'Psalm 23:1'];
    } catch {
      return ['Matthew 5:3', 'John 14:6'];
    }
  });

  const [highlightedVerses, setHighlightedVerses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_highlights');
      return saved ? JSON.parse(saved) : { 'Matthew 5:14': 'amber', 'John 14:27': 'emerald' };
    } catch {
      return {};
    }
  });

  // Prayer Journal
  const [prayerJournal, setPrayerJournal] = useState<PrayerJournalItem[]>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_prayers');
      return saved ? JSON.parse(saved) : DEFAULT_PRAYERS;
    } catch {
      return DEFAULT_PRAYERS;
    }
  });

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('faithlingo_dark');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Font Size for universal accessibility
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      return (localStorage.getItem('faithlingo_fontsize') as any) || 'normal';
    } catch {
      return 'normal';
    }
  });

  // Sound effects
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('faithlingo_dark', String(darkMode));
  }, [darkMode]);

  // Persist userStats
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_stats', JSON.stringify(userStats));
    } catch {}
  }, [userStats]);

  // Persist plans
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_plans', JSON.stringify(readingPlans));
    } catch {}
  }, [readingPlans]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_bookmarks', JSON.stringify(bookmarkedVerses));
    } catch {}
  }, [bookmarkedVerses]);

  // Persist highlights
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_highlights', JSON.stringify(highlightedVerses));
    } catch {}
  }, [highlightedVerses]);

  // Persist prayers
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_prayers', JSON.stringify(prayerJournal));
    } catch {}
  }, [prayerJournal]);

  // Persist font size
  useEffect(() => {
    try {
      localStorage.setItem('faithlingo_fontsize', fontSize);
    } catch {}
  }, [fontSize]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const toggleSoundEnabled = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      return next;
    });
  };

  const completeLesson = (lessonId: string, xpEarned: number, bonusGems: number = 15) => {
    const today = new Date().toISOString().split('T')[0];
    setUserStats(prev => {
      const isNewCompletion = !prev.completedLessonIds.includes(lessonId);
      const isAlreadyActiveToday = prev.lastActiveDate === today;
      const newStreak = isAlreadyActiveToday ? prev.streak : prev.streak + 1;
      const historySet = new Set(prev.streakHistory);
      historySet.add(today);

      return {
        ...prev,
        xp: prev.xp + xpEarned,
        gems: prev.gems + bonusGems,
        lastActiveDate: today,
        streak: newStreak,
        streakHistory: Array.from(historySet),
        completedLessonIds: isNewCompletion ? [...prev.completedLessonIds, lessonId] : prev.completedLessonIds,
        todayMinutesSpent: prev.todayMinutesSpent + 4,
      };
    });
  };

  const loseHeart = (): boolean => {
    let hasRemaining = true;
    setUserStats(prev => {
      const nextHearts = Math.max(0, prev.hearts - 1);
      hasRemaining = nextHearts > 0;
      return {
        ...prev,
        hearts: nextHearts
      };
    });
    return hasRemaining;
  };

  const refillHearts = (): boolean => {
    if (userStats.gems >= 50 || userStats.hearts === 0) {
      setUserStats(prev => ({
        ...prev,
        hearts: prev.maxHearts,
        gems: Math.max(0, prev.gems - 50)
      }));
      return true;
    }
    return false;
  };

  const buyStreakFreeze = (): boolean => {
    if (userStats.gems >= 100 && !userStats.streakFreezeActive) {
      setUserStats(prev => ({
        ...prev,
        streakFreezeActive: true,
        gems: prev.gems - 100
      }));
      return true;
    }
    return false;
  };

  const addXp = (amount: number) => {
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + amount
    }));
  };

  const addGems = (amount: number) => {
    setUserStats(prev => ({
      ...prev,
      gems: Math.max(0, (prev.gems || 0) + amount)
    }));
  };

  const setGems = (amount: number) => {
    setUserStats(prev => ({
      ...prev,
      gems: Math.max(0, amount)
    }));
  };

  const setStreak = (days: number) => {
    setUserStats(prev => ({
      ...prev,
      streak: Math.max(1, days)
    }));
  };

  const setInfiniteHearts = () => {
    setUserStats(prev => ({
      ...prev,
      hearts: 99,
      maxHearts: 99
    }));
  };

  const togglePlanDay = (planId: string, dayNumber: number) => {
    setReadingPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          days: plan.days.map(d => (d.dayNumber === dayNumber ? { ...d, completed: !d.completed } : d))
        };
      })
    );
    addXp(10);
  };

  const togglePlanEnrollment = (planId: string) => {
    setReadingPlans(prev =>
      prev.map(p => (p.id === planId ? { ...p, isEnrolled: !p.isEnrolled } : p))
    );
  };

  const toggleBookmark = (verseId: string) => {
    setBookmarkedVerses(prev =>
      prev.includes(verseId) ? prev.filter(v => v !== verseId) : [...prev, verseId]
    );
  };

  const setVerseHighlight = (verseId: string, color: string) => {
    setHighlightedVerses(prev => ({
      ...prev,
      [verseId]: color
    }));
  };

  const addPrayerJournalItem = (item: Omit<PrayerJournalItem, 'id' | 'date'>) => {
    const newItem: PrayerJournalItem = {
      ...item,
      id: `p-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isAnswered: false
    };
    setPrayerJournal(prev => [newItem, ...prev]);
    addXp(15);
  };

  const togglePrayerAnswered = (id: string) => {
    setPrayerJournal(prev =>
      prev.map(p => (p.id === id ? { ...p, isAnswered: !p.isAnswered } : p))
    );
  };

  // Get daily highlight based on day of month
  const dayIndex = new Date().getDate() % DAILY_HIGHLIGHTS.length;
  const todayHighlight = DAILY_HIGHLIGHTS[dayIndex];

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isShopOpen,
        setIsShopOpen,
        isWidgetModalOpen,
        setIsWidgetModalOpen,
        activeLesson,
        setActiveLesson,
        userStats,
        completeLesson,
        loseHeart,
        refillHearts,
        buyStreakFreeze,
        addXp,
        addGems,
        setGems,
        setStreak,
        setInfiniteHearts,
        readingPlans,
        togglePlanDay,
        togglePlanEnrollment,
        currentTranslation,
        setCurrentTranslation,
        bookmarkedVerses,
        toggleBookmark,
        highlightedVerses,
        setVerseHighlight,
        prayerJournal,
        addPrayerJournalItem,
        togglePrayerAnswered,
        darkMode,
        toggleDarkMode,
        fontSize,
        setFontSize,
        soundEnabled,
        toggleSoundEnabled,
        todayHighlight
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
