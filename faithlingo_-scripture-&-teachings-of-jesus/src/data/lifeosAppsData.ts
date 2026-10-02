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
    id: 'mini_cats',
    title: 'Pocket Paws',
    emoji: '🐱',
    iconName: 'Cat',
    category: 'Productivity',
    type: 'mini_cats',
    color: 'from-amber-500 via-orange-500 to-rose-600',
    description: 'Miniature cat breeds playground. Drag & drop, silly costumes, feed, drink, dance & sleep!',
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
    title: 'TikTok',
    emoji: '🎵',
    iconName: 'Film',
    category: 'Learning',
    type: 'tiktok',
    color: 'from-cyan-500 via-stone-900 to-rose-500',
    description: 'Vertical clips & shorts feed. Faith inspiration, aesthetic study vlogs & wholesome clips.',
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
