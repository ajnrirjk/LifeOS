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

export interface TikTokVideo {
  id: string;
  tiktokId: string;
  title: string;
  creator: string;
  creatorHandle: string;
  views: string;
  likes: string;
  timestamp: string;
  category: 'Trending' | 'Comedy' | 'Dance' | 'Food' | 'Sports' | 'Music' | 'Life Hacks' | 'Tech' | 'Faith';
  description: string;
}

export const TIKTOK_CURATED_VIDEOS: TikTokVideo[] = [
  {
    id: 'tt_1',
    tiktokId: '7106594312292453678',
    title: 'Viral Dance Challenge 2024',
    creator: 'Charli D\'Amelio',
    creatorHandle: '@charlidamelio',
    views: '92M',
    likes: '8.1M',
    timestamp: '2 months ago',
    category: 'Dance',
    description: 'The most viral dance challenge taking over TikTok right now!'
  },
  {
    id: 'tt_2',
    tiktokId: '7212651994439124270',
    title: 'POV: You Found The Best Life Hack',
    creator: 'Khaby Lame',
    creatorHandle: '@khaby.lame',
    views: '148M',
    likes: '18M',
    timestamp: '3 months ago',
    category: 'Life Hacks',
    description: 'Khaby reacts to overly complicated life hacks with his signature silence and simplicity.'
  },
  {
    id: 'tt_3',
    tiktokId: '7238612345678901234',
    title: 'Gordon Ramsay Roasts TikTok Recipes',
    creator: 'Gordon Ramsay',
    creatorHandle: '@gordongram',
    views: '55M',
    likes: '4.2M',
    timestamp: '1 month ago',
    category: 'Food',
    description: 'The legendary chef reacts to the most chaotic TikTok cooking trends.'
  },
  {
    id: 'tt_4',
    tiktokId: '7195023456789012345',
    title: 'Insane Basketball Trick Shots 🏀',
    creator: 'Dude Perfect',
    creatorHandle: '@dudeperfect',
    views: '83M',
    likes: '6.9M',
    timestamp: '4 months ago',
    category: 'Sports',
    description: 'Dude Perfect breaks world records with impossible basketball trick shots on TikTok.'
  },
  {
    id: 'tt_5',
    tiktokId: '7301234567890123456',
    title: 'This Prank Had Me Dead 💀',
    creator: 'Zach King',
    creatorHandle: '@zachking',
    views: '211M',
    likes: '22M',
    timestamp: '5 months ago',
    category: 'Comedy',
    description: 'Zach King\'s mind-bending magic illusions and pranks that break the internet.'
  },
  {
    id: 'tt_6',
    tiktokId: '7187651234567890123',
    title: 'Aesthetic Morning Routine ☀️',
    creator: 'Bella Poarch',
    creatorHandle: '@bellapoarch',
    views: '41M',
    likes: '3.8M',
    timestamp: '6 months ago',
    category: 'Life Hacks',
    description: 'A satisfying, aesthetic morning routine that went completely viral across TikTok.'
  },
  {
    id: 'tt_7',
    tiktokId: '7265432187654321098',
    title: 'iPhone 16 Pro vs Android - Which is BETTER? 📱',
    creator: 'Marques Brownlee',
    creatorHandle: '@mkbhd',
    views: '29M',
    likes: '2.4M',
    timestamp: '2 months ago',
    category: 'Tech',
    description: 'MKBHD breaks down the iPhone 16 Pro vs the latest Android flagships in 60 seconds.'
  },
  {
    id: 'tt_8',
    tiktokId: '7112345678901234567',
    title: 'This Song Goes So Hard 🔥',
    creator: 'Olivia Rodrigo',
    creatorHandle: '@oliviarodrigo',
    views: '76M',
    likes: '7.3M',
    timestamp: '8 months ago',
    category: 'Music',
    description: 'Behind-the-scenes snippet of Olivia\'s latest track going mega-viral on TikTok.'
  },
  {
    id: 'tt_9',
    tiktokId: '7334521678901234567',
    title: 'This Will Change How You See The World',
    creator: 'MrBeast',
    creatorHandle: '@mrbeast',
    views: '134M',
    likes: '15M',
    timestamp: '3 weeks ago',
    category: 'Trending',
    description: 'MrBeast drops a mind-blowing TikTok that everyone is talking about.'
  },
  {
    id: 'tt_10',
    tiktokId: '7289012345678901234',
    title: 'God\'s Grace - Morning Devotional 🙏',
    creator: 'Sadie Robertson',
    creatorHandle: '@sadierobertson',
    views: '18M',
    likes: '2.1M',
    timestamp: '1 month ago',
    category: 'Faith',
    description: 'A powerful 60-second morning devotional about trusting God\'s plan for your life.'
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

// Helper to extract TikTok video ID from links or raw numeric ID
export function extractTikTokId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already pure digits (TikTok video IDs are usually 15-20 digits)
  if (/^\d{10,24}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard https://www.tiktok.com/@user/video/VIDEO_ID
  const videoMatch = trimmed.match(/\/video\/(\d+)/);
  if (videoMatch && videoMatch[1]) {
    return videoMatch[1];
  }

  // Handle mobile links https://m.tiktok.com/v/VIDEO_ID
  const vMatch = trimmed.match(/\/v\/(\d+)/);
  if (vMatch && vMatch[1]) {
    return vMatch[1];
  }

  // Handle /embed/v2/VIDEO_ID or /player/v1/VIDEO_ID
  const embedMatch = trimmed.match(/\/(?:embed|player)\/(?:v\d+\/)?(\d+)/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  return null;
}
