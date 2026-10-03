import { LeaderboardUser } from '../types';

export const LEAGUES = [
  { name: 'Bronze', color: 'from-amber-700 to-amber-900', border: 'border-amber-700', icon: 'Shield', minXp: 0 },
  { name: 'Silver', color: 'from-slate-300 to-slate-500', border: 'border-slate-400', icon: 'ShieldCheck', minXp: 150 },
  { name: 'Gold', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', icon: 'Award', minXp: 350 },
  { name: 'Sapphire', color: 'from-blue-400 to-cyan-600', border: 'border-blue-400', icon: 'Gem', minXp: 600 },
  { name: 'Ruby', color: 'from-red-500 to-rose-700', border: 'border-red-500', icon: 'Flame', minXp: 900 },
  { name: 'Diamond', color: 'from-cyan-300 via-sky-400 to-indigo-500', border: 'border-cyan-300', icon: 'Crown', minXp: 1300 },
];

export const MOCK_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: 'u-1',
    name: 'Sarah K. (Nairobi)',
    avatar: '👩🏾‍🌾',
    xp: 640,
    country: '🇰🇪',
    streak: 24,
    cheersReceived: 18,
    statusQuote: '“I can do all things through Christ!”'
  },
  {
    id: 'u-2',
    name: 'David Miller',
    avatar: '👨🏼‍💼',
    xp: 580,
    country: '🇺🇸',
    streak: 19,
    cheersReceived: 14,
    statusQuote: 'Memorizing the Beatitudes this week!'
  },
  {
    id: 'u-3',
    name: 'Mateo Alvarez',
    avatar: '👨🏽‍🎓',
    xp: 520,
    country: '🇲🇽',
    streak: 15,
    cheersReceived: 12,
    statusQuote: 'Seeking first the Kingdom 🕊️'
  },
  {
    id: 'u-current',
    name: 'You (Grace Follower)',
    avatar: '🕊️',
    xp: 410,
    isCurrentUser: true,
    country: '🌐',
    streak: 7,
    cheersReceived: 9,
    statusQuote: 'Walking in faith, not by sight.'
  },
  {
    id: 'u-4',
    name: 'Grace Kim',
    avatar: '👩🏻‍🏫',
    xp: 390,
    country: '🇰🇷',
    streak: 11,
    cheersReceived: 8,
    statusQuote: 'Psalm 23 is my anchor today.'
  },
  {
    id: 'u-5',
    name: 'Samuel Adebayo',
    avatar: '👨🏿‍⚕️',
    xp: 350,
    country: '🇳🇬',
    streak: 8,
    cheersReceived: 7,
    statusQuote: 'Grace upon grace!'
  },
  {
    id: 'u-6',
    name: 'Hannah & Caleb (Family)',
    avatar: '👨‍👩‍👧',
    xp: 290,
    country: '🇨🇦',
    streak: 6,
    cheersReceived: 5,
    statusQuote: 'Evening family devotions together.'
  },
  {
    id: 'u-7',
    name: 'Lucas Silva',
    avatar: '🧑🏽‍💻',
    xp: 240,
    country: '🇧🇷',
    streak: 4,
    cheersReceived: 4,
    statusQuote: 'Peace of Christ be with you all.'
  },
  {
    id: 'u-8',
    name: 'Elena Rostova',
    avatar: '👩🏼‍🎨',
    xp: 180,
    country: '🇺🇦',
    streak: 3,
    cheersReceived: 6,
    statusQuote: 'Praying for peace and renewal.'
  },
  {
    id: 'u-9',
    name: 'Joshua Tanaka',
    avatar: '🧑🏻‍🍳',
    xp: 110,
    country: '🇯🇵',
    streak: 2,
    cheersReceived: 2,
    statusQuote: 'Day 2 of the Jesus Ministry plan!'
  }
];
