export type TranslationId = 'WEB' | 'KJV' | 'BBE';

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: TranslationId;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export type QuestionType = 
  | 'multiple-choice'
  | 'word-scramble'
  | 'fill-blank'
  | 'match-pairs'
  | 'true-false';

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface StudyQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  scriptureReference: string;
  scriptureText: string;
  // For multiple-choice & fill-blank:
  options?: QuestionOption[];
  // For word-scramble:
  scrambledWords?: string[];
  correctSentence?: string[];
  // For match-pairs:
  pairs?: MatchPair[];
  // For true-false:
  correctBoolean?: boolean;
  // Explanatory note upon answering:
  insightNote: string;
  mascotTip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  scriptureAnchor: string;
  xpReward: number;
  questions: StudyQuestion[];
  completed?: boolean;
  score?: number;
}

export interface StudyUnit {
  id: string;
  number: number;
  title: string;
  description: string;
  themeColor: string; // Tailwind color token
  bannerIcon: string;
  lessons: Lesson[];
  milestoneBonusGems: number;
}

export interface UserStats {
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  hearts: number;
  maxHearts: number;
  gems: number; // Manna
  completedLessonIds: string[];
  streakFreezeActive: boolean;
  activeLeague: 'Bronze' | 'Silver' | 'Gold' | 'Sapphire' | 'Ruby' | 'Diamond';
  dailyGoalMinutes: number;
  todayMinutesSpent: number;
  streakHistory: string[]; // array of YYYY-MM-DD
}

export interface ReadingPlanDay {
  dayNumber: number;
  title: string;
  passageReference: string;
  keyVerse: string;
  devotionText: string;
  prayerFocus: string;
  completed: boolean;
}

export interface ReadingPlan {
  id: string;
  title: string;
  subtitle: string;
  goalCategory: 'Peace & Anxiety' | 'Jesus Ministry' | 'Daily Wisdom' | 'Kingdom Teachings' | 'Faith Foundations';
  totalDays: number;
  durationLabel: string;
  coverGradient: string;
  description: string;
  days: ReadingPlanDay[];
  isEnrolled: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isCurrentUser?: boolean;
  country: string;
  streak: number;
  cheersReceived: number;
  statusQuote: string;
}

export interface PrayerJournalItem {
  id: string;
  date: string;
  category: string;
  title: string;
  userPrompt: string;
  prayerText: string;
  scriptureReference?: string;
  reflection?: string;
  isAnswered?: boolean;
}
