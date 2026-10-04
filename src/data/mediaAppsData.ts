export interface YouTubeVideo {
  id: string;
  youtubeId: string;
  title: string;
  channelTitle: string;
  channelAvatar?: string;
  views: string;
  timestamp: string;
  duration: string;
  category: 'Worship' | 'Study & Bible' | 'Lofi & Focus' | 'The Chosen' | 'Podcasts';
  description: string;
}

export interface CinemaMovie {
  id: string;
  title: string;
  year: number;
  genre: 'Action' | 'Sci-Fi' | 'Family' | 'Faith & Inspiration' | 'Comedy' | 'Drama' | 'Animation';
  rating: string;
  duration: string;
  posterEmoji: string;
  posterBg: string;
  overview: string;
  cinejoyQuery: string;
  cinejoyUrl: string;
  featured?: boolean;
}

export const CINEMA_FEATURED_MOVIES: CinemaMovie[] = [
  {
    id: 'cine_1',
    title: 'The Chosen: Holy Land Epic',
    year: 2024,
    genre: 'Faith & Inspiration',
    rating: '9.4',
    duration: '2h 15m',
    posterEmoji: '🕊️',
    posterBg: 'from-amber-600 via-yellow-600 to-stone-900',
    overview: 'The revolutionary historical drama following the life and teachings of Jesus Christ and those who encountered Him.',
    cinejoyQuery: 'The Chosen',
    cinejoyUrl: 'https://cinejoy.pk/search?q=The+Chosen',
    featured: true
  },
  {
    id: 'cine_2',
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    rating: '8.7',
    duration: '2h 49m',
    posterEmoji: '🚀',
    posterBg: 'from-indigo-900 via-sky-900 to-black',
    overview: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.',
    cinejoyQuery: 'Interstellar',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Interstellar',
    featured: true
  },
  {
    id: 'cine_3',
    title: 'Dune: Part Two',
    year: 2024,
    genre: 'Sci-Fi',
    rating: '8.6',
    duration: '2h 46m',
    posterEmoji: '🏜️',
    posterBg: 'from-orange-800 via-amber-700 to-stone-950',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    cinejoyQuery: 'Dune Part Two',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Dune+Part+Two'
  },
  {
    id: 'cine_4',
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    genre: 'Animation',
    rating: '8.6',
    duration: '2h 20m',
    posterEmoji: '🕷️',
    posterBg: 'from-rose-600 via-purple-700 to-cyan-700',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    cinejoyQuery: 'Spider-Man Across the Spider-Verse',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Spider-Man+Across+the+Spider-Verse'
  },
  {
    id: 'cine_5',
    title: 'Jesus Revolution',
    year: 2023,
    genre: 'Faith & Inspiration',
    rating: '7.1',
    duration: '2h 00m',
    posterEmoji: '✝️',
    posterBg: 'from-cyan-800 via-teal-700 to-stone-900',
    overview: 'The true story of a national spiritual awakening in the early 1970s and its origins within a community of teenage hippies.',
    cinejoyQuery: 'Jesus Revolution',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Jesus+Revolution'
  },
  {
    id: 'cine_6',
    title: 'Inception',
    year: 2010,
    genre: 'Action',
    rating: '8.8',
    duration: '2h 28m',
    posterEmoji: '🌀',
    posterBg: 'from-slate-800 via-blue-900 to-black',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    cinejoyQuery: 'Inception',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Inception'
  },
  {
    id: 'cine_7',
    title: 'The Lion King',
    year: 2019,
    genre: 'Family',
    rating: '8.5',
    duration: '1h 58m',
    posterEmoji: '🦁',
    posterBg: 'from-yellow-700 via-amber-600 to-stone-900',
    overview: 'After the murder of his father, a young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.',
    cinejoyQuery: 'The Lion King',
    cinejoyUrl: 'https://cinejoy.pk/search?q=The+Lion+King'
  },
  {
    id: 'cine_8',
    title: 'The Pursuit of Happyness',
    year: 2006,
    genre: 'Drama',
    rating: '8.0',
    duration: '1h 57m',
    posterEmoji: '💼',
    posterBg: 'from-stone-800 via-emerald-900 to-stone-950',
    overview: 'A struggling salesman takes custody of his son as he\'s poised to begin a life-changing professional endeavor.',
    cinejoyQuery: 'The Pursuit of Happyness',
    cinejoyUrl: 'https://cinejoy.pk/search?q=The+Pursuit+of+Happyness'
  },
  {
    id: 'cine_9',
    title: 'Inside Out 2',
    year: 2024,
    genre: 'Animation',
    rating: '7.8',
    duration: '1h 36m',
    posterEmoji: '🧠',
    posterBg: 'from-orange-600 via-pink-600 to-indigo-800',
    overview: 'Follow Riley, in her teenage years, encountering new emotions like Anxiety, Envy, Ennui, and Embarrassment.',
    cinejoyQuery: 'Inside Out 2',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Inside+Out+2'
  },
  {
    id: 'cine_10',
    title: 'Paddington 2',
    year: 2017,
    genre: 'Comedy',
    rating: '7.8',
    duration: '1h 43m',
    posterEmoji: '🐻',
    posterBg: 'from-red-700 via-blue-800 to-stone-900',
    overview: 'Paddington, now happily settled with the Brown family, picks up a series of odd jobs to buy the perfect present for his Aunt Lucy.',
    cinejoyQuery: 'Paddington 2',
    cinejoyUrl: 'https://cinejoy.pk/search?q=Paddington+2'
  }
];

export const YOUTUBE_CURATED_VIDEOS: YouTubeVideo[] = [
  {
    id: 'yt_1',
    youtubeId: 'mC-zw0zCCtg',
    title: 'Jireh | Elevation Worship & Maverick City',
    channelTitle: 'Elevation Worship',
    channelAvatar: '🕊️',
    views: '142M views',
    timestamp: '3 years ago',
    duration: '9:59',
    category: 'Worship',
    description: 'Official Music Video for "Jireh" featuring Chandler Moore and Naomi Raine, recorded live at Ballantyne.'
  },
  {
    id: 'yt_2',
    youtubeId: 'YBl84oZSRMg',
    title: 'Graves Into Gardens (Live) | Elevation Worship ft. Brandon Lake',
    channelTitle: 'Elevation Worship',
    channelAvatar: '🌿',
    views: '185M views',
    timestamp: '4 years ago',
    duration: '7:32',
    category: 'Worship',
    description: 'The official live video for "Graves Into Gardens" recorded live at Elevation Ballantyne.'
  },
  {
    id: 'yt_3',
    youtubeId: 'ak06AUUxF3g',
    title: 'The Bible as Jewish Meditation Literature | BibleProject',
    channelTitle: 'BibleProject',
    channelAvatar: '📖',
    views: '3.4M views',
    timestamp: '5 years ago',
    duration: '5:36',
    category: 'Study & Bible',
    description: 'How the Bible was designed to be read slowly, repeatedly, and meditated on day and night.'
  },
  {
    id: 'yt_4',
    youtubeId: 'K1-63J5e4rE',
    title: 'The Chosen: "I Have Called You By Name" (Mary Magdalene Scene)',
    channelTitle: 'The Chosen',
    channelAvatar: '👑',
    views: '12M views',
    timestamp: '4 years ago',
    duration: '8:45',
    category: 'The Chosen',
    description: 'Jesus meets Mary Magdalene in the powerful climax of Episode 1 of The Chosen.'
  },
  {
    id: 'yt_5',
    youtubeId: '5qap5aO4i9A',
    title: 'Peaceful Christian Lofi Beats - Study, Relax, Pray & Sleep',
    channelTitle: 'Lofi Worship & Study',
    channelAvatar: '🎧',
    views: '4.8M views',
    timestamp: '1 year ago',
    duration: '3:00:00',
    category: 'Lofi & Focus',
    description: 'Chill and cozy Christian lofi hip hop instrumentals to study, read Scripture, and work to.'
  },
  {
    id: 'yt_6',
    youtubeId: 'o3q0q_i9E1U',
    title: 'The Law of Human Nature | C.S. Lewis Doodle (Mere Christianity Ch. 1)',
    channelTitle: 'C.S. Lewis Doodles',
    channelAvatar: '✏️',
    views: '2.9M views',
    timestamp: '7 years ago',
    duration: '9:12',
    category: 'Study & Bible',
    description: 'An illustrated reading of Chapter 1 of Mere Christianity by C.S. Lewis exploring moral law.'
  },
  {
    id: 'yt_7',
    youtubeId: 'mC-zw0zCCtg',
    title: 'Maverick City Music - Million Little Miracles',
    channelTitle: 'Elevation Worship',
    channelAvatar: '🙌',
    views: '88M views',
    timestamp: '3 years ago',
    duration: '6:14',
    category: 'Worship',
    description: 'All my life I have been carried. Live acoustic worship performance.'
  },
  {
    id: 'yt_8',
    youtubeId: 'DWcJFNfaw9c',
    title: 'Ambient Rain & Bible Study - Cozy Library Fireplace',
    channelTitle: 'Peace & Quiet Sanctuary',
    channelAvatar: '🌧️',
    views: '1.2M views',
    timestamp: '6 months ago',
    duration: '2:15:00',
    category: 'Lofi & Focus',
    description: 'Gentle raindrops tapping on windowpane with warm crackling fireplace for focused devotions.'
  }
];

// Helper to extract YouTube video ID from links or raw ID
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already 11 characters alphanumeric
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtu.be / youtube.com links
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  // Handle shorts link (e.g. youtube.com/shorts/VIDEO_ID)
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  return null;
}

// Helper to format Cinejoy search URL from movie title or query
export function formatCinejoySearchUrl(query: string): string {
  if (!query) return 'https://cinejoy.pk/';
  const trimmed = query.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://cinejoy.pk/search?q=${encodeURIComponent(trimmed)}`;
}

