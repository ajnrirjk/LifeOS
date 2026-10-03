export type AppType = 
  | 'flagship_faithlingo' 
  | 'bible_journal'
  | 'fellowship_chat'
  | 'faith_meet'
  | 'mini_cats'
  | 'mini_games'
  | 'youtube'
  | 'app_studio' 
  | 'tracker' 
  | 'notes' 
  | 'ai_assistant' 
  | 'flashcards';

export interface TrackerItem {
  id: string;
  title: string;
  subtitle?: string;
  completed: boolean;
  streak?: number;
  date?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
  mastered?: boolean;
}

export interface LifeOSApp {
  id: string;
  title: string;
  emoji: string;
  iconName: string;
  category: 'Spiritual' | 'Productivity' | 'Health' | 'Learning' | 'System';
  type: AppType;
  color: string; // Tailwind gradient
  description: string;
  isPinned: boolean;
  isSystem: boolean;
  systemInstruction?: string;
  items?: TrackerItem[];
  notes?: NoteItem[];
  flashcards?: FlashcardItem[];
  chatHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
  createdAt?: string;
}

export interface LifeOSWindowState {
  appId: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export type LifeOSWallpaper = 'mountain' | 'nebula' | 'olive' | 'slate' | 'aurora';
