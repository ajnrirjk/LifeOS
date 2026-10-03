export type WidgetId = 
  | 'youtube'
  | 'mini_cats'
  | 'church_notes'
  | 'faithlingo_stats'
  | 'verse_of_day'
  | 'fellowship_chat'
  | 'quick_listen'
  | 'prayer_focus'
  | 'spiritual_habits'
  | 'app_studio';

export interface DesktopWidgetConfig {
  id: WidgetId;
  title: string;
  subtitle: string;
  emoji: string;
  category: 'Spiritual' | 'Study' | 'Devotion' | 'System';
  span: 'small' | 'medium' | 'large';
  color: string;
}

export const ALL_DESKTOP_WIDGETS: DesktopWidgetConfig[] = [
  {
    id: 'youtube',
    title: 'YouTube Player',
    subtitle: 'Stream worship music, BibleProject, and study lofi',
    emoji: '▶️',
    category: 'Study',
    span: 'medium',
    color: 'from-red-600/20 to-rose-700/20 border-red-500/30'
  },
  {
    id: 'mini_cats',
    title: 'Pocket Paws Sanctuary',
    subtitle: 'Miniature cats live playground, feeding & silly costumes',
    emoji: '🐱',
    category: 'System',
    span: 'medium',
    color: 'from-amber-500/20 to-rose-600/20 border-amber-500/30'
  },
  {
    id: 'church_notes',
    title: 'ChurchNotes Scribe',
    subtitle: 'Recent sermon notes & voice dictation',
    emoji: '📖',
    category: 'Spiritual',
    span: 'medium',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30'
  },
  {
    id: 'fellowship_chat',
    title: 'Fellowship Group Chat',
    subtitle: 'Live real-time community chat & prayer chain',
    emoji: '💬',
    category: 'Spiritual',
    span: 'medium',
    color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30'
  },
  {
    id: 'faithlingo_stats',
    title: 'FaithLingo Progress',
    subtitle: 'Daily streak, hearts & XP level',
    emoji: '🕊️',
    category: 'Study',
    span: 'small',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30'
  },
  {
    id: 'verse_of_day',
    title: 'Verse of the Day',
    subtitle: 'Daily scripture promise & audio narration',
    emoji: '✨',
    category: 'Devotion',
    span: 'medium',
    color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30'
  },
  {
    id: 'prayer_focus',
    title: 'Daily Prayer Wall',
    subtitle: 'Active prayer requests & answered praises',
    emoji: '🙏',
    category: 'Devotion',
    span: 'medium',
    color: 'from-purple-500/20 to-pink-600/20 border-purple-500/30'
  },
  {
    id: 'spiritual_habits',
    title: 'Spiritual Disciplines',
    subtitle: 'Daily scripture, prayer & journaling habit checklist',
    emoji: '🔥',
    category: 'Spiritual',
    span: 'small',
    color: 'from-rose-500/20 to-red-600/20 border-rose-500/30'
  },
  {
    id: 'quick_listen',
    title: 'Fast Sermon Listener',
    subtitle: '1-tap instant microphone scribe with AI distillation',
    emoji: '🎙️',
    category: 'Spiritual',
    span: 'small',
    color: 'from-amber-600/20 to-yellow-600/20 border-amber-400/30'
  },
  {
    id: 'app_studio',
    title: 'App Studio & Launchpad',
    subtitle: 'Custom spiritual apps & AI generator',
    emoji: '🛠️',
    category: 'System',
    span: 'small',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30'
  }
];

export const DEFAULT_ACTIVE_WIDGETS: WidgetId[] = [
  'fellowship_chat',
  'church_notes',
  'faithlingo_stats',
  'verse_of_day',
  'prayer_focus',
  'spiritual_habits'
];
