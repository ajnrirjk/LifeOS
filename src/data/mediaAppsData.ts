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
    tiktokId: '6839475182118194437',
    title: 'Meatballs Madness 🔥 Cooking in Nature',
    creator: 'Men With The Pot',
    creatorHandle: '@menwiththepot',
    views: '48M',
    likes: '4.9M',
    timestamp: 'Viral ASMR',
    category: 'Food',
    description: 'Campfire cooking meatballs in the deep wilderness. Relaxing forest sounds and outdoor culinary art.'
  },
  {
    id: 'tt_2',
    tiktokId: '6718335390845095173',
    title: 'Scramble up ur name & I’ll try to guess it 😍❤️',
    creator: 'Scout, Suki & Stella',
    creatorHandle: '@scout2015',
    views: '92M',
    likes: '8.4M',
    timestamp: 'Viral Classic',
    category: 'Trending',
    description: 'The mega-viral aesthetic pet video that took over TikTok FYP feeds worldwide.'
  },
  {
    id: 'tt_3',
    tiktokId: '6827479715578678533',
    title: 'How to Look Expensive on a Budget 💰',
    creator: 'Tim Dessaint',
    creatorHandle: '@timdessaint',
    views: '35M',
    likes: '3.1M',
    timestamp: 'Style Guide',
    category: 'Life Hacks',
    description: 'Pro styling tips to elevate your wardrobe without breaking the bank.'
  },
  {
    id: 'tt_4',
    tiktokId: '6807502301582871814',
    title: 'Stay-At-Home Rave & Dance Party ✨',
    creator: 'Rachel Leary',
    creatorHandle: '@rachleary',
    views: '22M',
    likes: '2.5M',
    timestamp: 'Dance Trend',
    category: 'Dance',
    description: 'Energetic lighting and dance party vibes from home.'
  },
  {
    id: 'tt_5',
    tiktokId: '7359552125262662945',
    title: 'Stay Unique! The Little Warrior 🐾',
    creator: 'Wild Life',
    creatorHandle: '@mpwild',
    views: '64M',
    likes: '7.2M',
    timestamp: 'Animation',
    category: 'Comedy',
    description: 'Heartwarming viral animated story about finding your strength and staying unique.'
  },
  {
    id: 'tt_6',
    tiktokId: '7372652121092623648',
    title: 'Finding Home: Kitten Adventure 🐱',
    creator: 'Chubby’s Life',
    creatorHandle: '@chubby_s_life',
    views: '78M',
    likes: '8.1M',
    timestamp: 'Viral Story',
    category: 'Trending',
    description: 'Viral animated narrative that captured millions of hearts on TikTok.'
  },
  {
    id: 'tt_7',
    tiktokId: '6858267898385812741',
    title: 'Styling Guide: Elevating Everyday Outfits 🧥',
    creator: 'Tim Dessaint',
    creatorHandle: '@timdessaint',
    views: '18M',
    likes: '1.9M',
    timestamp: 'Fashion Tok',
    category: 'Tech',
    description: 'Essential outfit proportions and layering secrets for modern fashion.'
  },
  {
    id: 'tt_8',
    tiktokId: '7341839949806996769',
    title: 'The Great Journey: Escape Adventure 🌟',
    creator: 'Chubby’s Life',
    creatorHandle: '@chubby_s_life',
    views: '51M',
    likes: '5.6M',
    timestamp: 'Adventure',
    category: 'Sports',
    description: 'Action-packed viral animated escapade that went mega-viral across feeds.'
  },
  {
    id: 'tt_9',
    tiktokId: '7357355293254225184',
    title: 'Heart & Family: Journey Together ❤️',
    creator: 'MPminds',
    creatorHandle: '@mpminds',
    views: '42M',
    likes: '4.8M',
    timestamp: 'Inspirational',
    category: 'Faith',
    description: 'A touching story of persevering through hardship together with love and hope.'
  },
  {
    id: 'tt_10',
    tiktokId: '7367070877709520161',
    title: 'Hope Against All Odds 🌈',
    creator: 'Chubby’s Life',
    creatorHandle: '@chubby_s_life',
    views: '39M',
    likes: '4.3M',
    timestamp: 'Inspiration',
    category: 'Faith',
    description: 'An uplifting reminder that joy and light always follow after the storm.'
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
