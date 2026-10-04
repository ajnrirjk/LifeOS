import { LifeOSApp } from '../types/lifeos';

export const DEFAULT_LIFEOS_APPS: LifeOSApp[] = [
  {
    id: 'faithlingo',
    title: 'FaithLingo',
    emoji: '🕊️',
    iconName: 'BookOpen',
    category: 'Spiritual',
    type: 'flagship_faithlingo',
    color: 'from-emerald-500 via-teal-600 to-green-700',
    description: 'Gamified Bible learning, Jesus teachings, streaks, leagues & 66-book offline Bible.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'bible_journal',
    title: 'ChurchNotes',
    emoji: '📖',
    iconName: 'BookMarked',
    category: 'Spiritual',
    type: 'bible_journal',
    color: 'from-amber-600 via-orange-600 to-rose-600',
    description: 'Simple journal to write your thoughts and notes during sermons and church.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'fellowship_chat',
    title: 'Fellowship Chat',
    emoji: '💬',
    iconName: 'MessageSquare',
    category: 'Spiritual',
    type: 'fellowship_chat',
    color: 'from-blue-600 via-indigo-600 to-purple-700',
    description: 'Live real-time group chats with believers, sermon discussions & Google Sign-In.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'faith_meet',
    title: 'LifeMeet',
    emoji: '📹',
    iconName: 'Video',
    category: 'Spiritual',
    type: 'faith_meet',
    color: 'from-blue-600 via-indigo-600 to-sky-500',
    description: 'Google Meet-style group video calling, live screen sharing & prayer fellowship between all devices.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'mini_cats',
    title: 'Cat Fighter Turbo',
    emoji: '🥊',
    iconName: 'Swords',
    category: 'Productivity',
    type: 'mini_cats',
    color: 'from-red-600 via-orange-500 to-amber-500',
    description: 'Retro 16-bit Cat Street Fighter arcade! Hadou-Paw fireballs, lightning kicks, super combos & custom controls.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'mini_games',
    title: 'Arcade Vault',
    emoji: '🕹️',
    iconName: 'Gamepad2',
    category: 'Productivity',
    type: 'mini_games',
    color: 'from-violet-600 via-purple-600 to-fuchsia-600',
    description: 'Retro arcade & mini games! Faith Flappy Dove, Babel Stacker, Demon Buster, Eden Snake & Slingshot.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'youtube',
    title: 'YouTube',
    emoji: '▶️',
    iconName: 'PlaySquare',
    category: 'Learning',
    type: 'youtube',
    color: 'from-red-600 via-rose-600 to-red-800',
    description: 'Watch worship streams, BibleProject videos, lofi study beats, and any YouTube video.',
    isPinned: true,
    isSystem: true
  },
  {
    id: 'tiktok',
    title: 'TikFeed',
    emoji: '🎵',
    iconName: 'Music2',
    category: 'Learning',
    type: 'tiktok',
    color: 'from-stone-700 via-emerald-700 to-teal-700',
    description: 'Trending TikTok videos — dance, comedy, food, sports, tech, music & faith content.',
    isPinned: true,
    isSystem: true
  }
];

export const APP_TEMPLATES = [
  {
    type: 'tracker',
    title: 'Fasting & Wellness Log',
    emoji: '🌿',
    icon: 'Heart',
    category: 'Health',
    color: 'from-emerald-500 to-teal-600',
    description: 'Track spiritual fasts, hydration, and body prayer walks.'
  }
];
