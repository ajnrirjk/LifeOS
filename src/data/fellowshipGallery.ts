export interface FellowshipGalleryImage {
  id: string;
  title: string;
  category: 'scripture' | 'creation' | 'fellowship' | 'worship' | 'symbol';
  url: string;
  thumbnailUrl: string;
  description: string;
  verse?: string;
}

export const FELLOWSHIP_GALLERY: FellowshipGalleryImage[] = [
  {
    id: 'img_cross_sunrise',
    title: 'Cross at Sunrise',
    category: 'symbol',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=400&q=80',
    description: 'The wooden cross illuminated by golden dawn sunlight on a hill.',
    verse: '“I have been crucified with Christ. It is no longer I who live, but Christ who lives in me.” — Galatians 2:20',
  },
  {
    id: 'img_open_bible_candle',
    title: 'Holy Scripture & Warm Light',
    category: 'scripture',
    url: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=400&q=80',
    description: 'Open Bible resting in warm golden candlelight.',
    verse: '“Your word is a lamp to my feet and a light to my path.” — Psalm 119:105',
  },
  {
    id: 'img_prayer_hands',
    title: 'Heart in Prayer',
    category: 'fellowship',
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=400&q=80',
    description: 'Gentle hands folded in sincere, quiet prayer.',
    verse: '“Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.” — Philippians 4:6',
  },
  {
    id: 'img_mountain_majesty',
    title: 'Majestic Creation',
    category: 'creation',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    description: 'Snow-capped mountain summits in glorious morning light.',
    verse: '“The heavens declare the glory of God, and the sky above proclaims his handiwork.” — Psalm 19:1',
  },
  {
    id: 'img_stained_glass',
    title: 'Sanctuary Stained Glass',
    category: 'worship',
    url: 'https://images.unsplash.com/photo-1548625361-195fe578ee19?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548625361-195fe578ee19?auto=format&fit=crop&w=400&q=80',
    description: 'Vibrant rays of sunlight streaming through cathedral stained glass.',
    verse: '“One thing have I asked of the Lord, that will I seek after: that I may dwell in the house of the Lord all the days of my life.” — Psalm 27:4',
  },
  {
    id: 'img_starry_heavens',
    title: 'Vast Universe & Stars',
    category: 'creation',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    description: 'Milky Way night sky over serene wilderness.',
    verse: '“When I look at your heavens, the work of your fingers, the moon and the stars, which you have set in place, what is man that you are mindful of him?” — Psalm 8:3-4',
  },
  {
    id: 'img_communion_bread',
    title: 'Lord’s Table & Cup',
    category: 'worship',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=400&q=80',
    description: 'Communion cup and rustic bread in sacred remembrance.',
    verse: '“Do this in remembrance of me.” — Luke 22:19',
  },
  {
    id: 'img_dove_peace',
    title: 'Dove of Peace',
    category: 'symbol',
    url: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=400&q=80',
    description: 'White dove soaring in clear blue sky, symbolizing the Holy Spirit.',
    verse: '“And the Holy Spirit descended on him in bodily form, like a dove.” — Luke 3:22',
  },
  {
    id: 'img_golden_pasture',
    title: 'Green Pastures & Still Waters',
    category: 'creation',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    description: 'Gentle green rolling hills and calm, peaceful morning mist.',
    verse: '“The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.” — Psalm 23:1-2',
  },
  {
    id: 'img_worship_hands',
    title: 'Hands Lifted in Praise',
    category: 'worship',
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=400&q=80',
    description: 'Gathering of believers lifting hands in genuine praise.',
    verse: '“Let everything that has breath praise the Lord! Praise the Lord!” — Psalm 150:6',
  }
];
