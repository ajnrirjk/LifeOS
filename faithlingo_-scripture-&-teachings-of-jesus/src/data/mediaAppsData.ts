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

export interface TikTokClip {
  id: string;
  videoUrl?: string; // Direct HTML5 video stream (100% reliable, zero iframe restrictions)
  videoId?: string;  // YouTube / Shorts ID fallback
  posterUrl?: string;
  author: string;
  handle: string;
  avatar: string;
  description: string;
  soundTitle: string;
  likes: number;
  commentsCount: number;
  shares: number;
  category: 'Inspiration' | 'Worship' | 'Aesthetic' | 'Pets';
  tags: string[];
}

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

export const TIKTOK_CURATED_CLIPS: TikTokClip[] = [
  {
    id: 'tt_1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-the-trees-of-a-forest-41132-large.mp4',
    videoId: 'ak06AUUxF3g',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60',
    author: 'Faith & Grace',
    handle: '@faithandgracedaily',
    avatar: '🕊️',
    description: 'When you realize God is already in your tomorrow, you stop stressing today 🙏✨ "Do not be anxious about tomorrow, for tomorrow will be anxious for itself." - Matthew 6:34 #faith #peace #bibleverse #trustgod',
    soundTitle: 'Original Sound - Morning Mercies Acoustic',
    likes: 48200,
    commentsCount: 1240,
    shares: 8930,
    category: 'Inspiration',
    tags: ['faith', 'peace', 'devotional', 'jesus']
  },
  {
    id: 'tt_2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-table-in-the-morning-42469-large.mp4',
    videoId: '5qap5aO4i9A',
    posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60',
    author: 'Bible Study Girl',
    handle: '@cozybiblestudy',
    avatar: '📖',
    description: 'My 5-minute morning routine that changed my mental health forever ☕🌿 Highlighting Psalm 23: "He leads me beside still waters. He restores my soul." #biblestudy #morningroutine #cozy #psalm23',
    soundTitle: 'Lofi Scripture Vibes - Worship Instrumental',
    likes: 92400,
    commentsCount: 2310,
    shares: 15400,
    category: 'Aesthetic',
    tags: ['biblestudy', 'morningroutine', 'aesthetic', 'psalm23']
  },
  {
    id: 'tt_3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-held-up-at-a-concert-with-lights-42974-large.mp4',
    videoId: 'YBl84oZSRMg',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    author: 'Worship Moments',
    handle: '@worshipnightlive',
    avatar: '🙌',
    description: 'The moment the entire arena sang the chorus in unison... tears and goosebumps every single time 😭❤️ "There is nothing better than you, Lord!" #worship #gratitude #church #christianmusic',
    soundTitle: 'Graves Into Gardens (Live Stadium Chorus)',
    likes: 184500,
    commentsCount: 4290,
    shares: 34200,
    category: 'Worship',
    tags: ['worship', 'church', 'christian', 'singing']
  },
  {
    id: 'tt_4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cat-lying-down-and-looking-curious-41584-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60',
    author: 'Pocket Paws Official',
    handle: '@pocketpawsclub',
    avatar: '🐱',
    description: 'Orange cat brain cell was working overtime today loafing in the sunlight 😭🍊🐾 He demanded head scratches immediately! #catsoftiktok #orangecat #loaf #cute #pocketpaws',
    soundTitle: 'Cute Cat Purr & Meow Sound - Neko Sanctuary',
    likes: 312000,
    commentsCount: 5120,
    shares: 48900,
    category: 'Pets',
    tags: ['catsoftiktok', 'cute', 'pets', 'funny']
  },
  {
    id: 'tt_5',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-under-a-cloudy-sky-42488-large.mp4',
    videoId: 'mC-zw0zCCtg',
    posterUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60',
    author: 'Scripture In 60 Seconds',
    handle: '@quickscripture',
    avatar: '✝️',
    description: 'If you needed a sign today, read this: Romans 8:31 "If God is for us, who can be against us?" Stand firm in faith today! 🔥 #scripture #verseoftheday #romans8 #encouragement',
    soundTitle: 'Peaceful Mountain Meditation - Soaking In Grace',
    likes: 145000,
    commentsCount: 3890,
    shares: 21900,
    category: 'Inspiration',
    tags: ['verseoftheday', 'romans8', 'bible', 'motivation']
  },
  {
    id: 'tt_6',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
    author: 'Ocean Devotionals',
    handle: '@oceandevotions',
    avatar: '🌊',
    description: 'Take a deep breath. His grace is deeper than any ocean you are facing right now 🌊💙 Psalm 93:4 "Mightier than the waves of the sea is His love for you." #peace #anxietyrelief #jesuslovesyou',
    soundTitle: 'Calm Ocean Waves & Piano - Still Waters',
    likes: 98400,
    commentsCount: 1840,
    shares: 11200,
    category: 'Aesthetic',
    tags: ['ocean', 'peace', 'psalm93', 'grace']
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
