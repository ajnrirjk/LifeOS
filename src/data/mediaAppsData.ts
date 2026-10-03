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
