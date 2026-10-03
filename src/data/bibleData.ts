import { BibleVerse, TranslationId } from '../types';

export interface BibleBookInfo {
  id: string;
  name: string;
  testament: 'Old' | 'New';
  chaptersCount: number;
  category: 
    | 'Pentateuch' 
    | 'Historical' 
    | 'Wisdom & Poetry' 
    | 'Major Prophets' 
    | 'Minor Prophets' 
    | 'Gospels' 
    | 'Church History' 
    | 'Pauline Epistles' 
    | 'General Epistles' 
    | 'Prophecy';
  theme: string;
}

// Complete 66 Canonical Books of the Bible with exact chapter counts
export const BIBLE_BOOKS: BibleBookInfo[] = [
  // --- OLD TESTAMENT (39 Books) ---
  // Pentateuch / Law (5)
  { id: 'genesis', name: 'Genesis', testament: 'Old', chaptersCount: 50, category: 'Pentateuch', theme: 'Beginnings, Creation, Covenant, and Patriarchs' },
  { id: 'exodus', name: 'Exodus', testament: 'Old', chaptersCount: 40, category: 'Pentateuch', theme: 'Deliverance from Egypt, Passover, and Law at Sinai' },
  { id: 'leviticus', name: 'Leviticus', testament: 'Old', chaptersCount: 27, category: 'Pentateuch', theme: 'Holiness, Sacrifices, and Priesthood' },
  { id: 'numbers', name: 'Numbers', testament: 'Old', chaptersCount: 36, category: 'Pentateuch', theme: 'Wilderness Wanderings and God’s Faithfulness' },
  { id: 'deuteronomy', name: 'Deuteronomy', testament: 'Old', chaptersCount: 34, category: 'Pentateuch', theme: 'Covenant Renewal and the Shema' },

  // Historical Books (12)
  { id: 'joshua', name: 'Joshua', testament: 'Old', chaptersCount: 24, category: 'Historical', theme: 'Entering and Conquering the Promised Land' },
  { id: 'judges', name: 'Judges', testament: 'Old', chaptersCount: 21, category: 'Historical', theme: 'Cycles of Rebellion, Deliverance, and Grace' },
  { id: 'ruth', name: 'Ruth', testament: 'Old', chaptersCount: 4, category: 'Historical', theme: 'Kinsman-Redeemer, Loyalty, and Lineage of David' },
  { id: '1-samuel', name: '1 Samuel', testament: 'Old', chaptersCount: 31, category: 'Historical', theme: 'Samuel, King Saul, and the Anointing of David' },
  { id: '2-samuel', name: '2 Samuel', testament: 'Old', chaptersCount: 24, category: 'Historical', theme: 'David’s Reign, Covenant, and Repentance' },
  { id: '1-kings', name: '1 Kings', testament: 'Old', chaptersCount: 22, category: 'Historical', theme: 'Solomon’s Temple and the Divided Kingdom' },
  { id: '2-kings', name: '2 Kings', testament: 'Old', chaptersCount: 25, category: 'Historical', theme: 'Prophets Elijah and Elisha, Exile of Israel' },
  { id: '1-chronicles', name: '1 Chronicles', testament: 'Old', chaptersCount: 29, category: 'Historical', theme: 'Genealogies, David’s Worship, and Temple Preparation' },
  { id: '2-chronicles', name: '2 Chronicles', testament: 'Old', chaptersCount: 36, category: 'Historical', theme: 'Kings of Judah and Solomon’s Glory' },
  { id: 'ezra', name: 'Ezra', testament: 'Old', chaptersCount: 10, category: 'Historical', theme: 'Return from Babylon and Rebuilding the Temple' },
  { id: 'nehemiah', name: 'Nehemiah', testament: 'Old', chaptersCount: 13, category: 'Historical', theme: 'Rebuilding Jerusalem’s Walls and Spiritual Reform' },
  { id: 'esther', name: 'Esther', testament: 'Old', chaptersCount: 10, category: 'Historical', theme: 'Providential Preservation of God’s People' },

  // Wisdom & Poetry (5)
  { id: 'job', name: 'Job', testament: 'Old', chaptersCount: 42, category: 'Wisdom & Poetry', theme: 'Faith Amidst Suffering and Sovereign Wisdom' },
  { id: 'psalms', name: 'Psalms', testament: 'Old', chaptersCount: 150, category: 'Wisdom & Poetry', theme: 'Praise, Lament, Messianic Prophecy, and Prayers' },
  { id: 'proverbs', name: 'Proverbs', testament: 'Old', chaptersCount: 31, category: 'Wisdom & Poetry', theme: 'Practical Daily Wisdom and the Fear of the Lord' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', testament: 'Old', chaptersCount: 12, category: 'Wisdom & Poetry', theme: 'Meaning in Life and Fearing God Under the Sun' },
  { id: 'song-of-solomon', name: 'Song of Solomon', testament: 'Old', chaptersCount: 8, category: 'Wisdom & Poetry', theme: 'Covenant Love, Beauty, and Devotion' },

  // Major Prophets (5)
  { id: 'isaiah', name: 'Isaiah', testament: 'Old', chaptersCount: 66, category: 'Major Prophets', theme: 'The Holy One of Israel and the Suffering Servant' },
  { id: 'jeremiah', name: 'Jeremiah', testament: 'Old', chaptersCount: 52, category: 'Major Prophets', theme: 'Weeping Prophet and the Promise of the New Covenant' },
  { id: 'lamentations', name: 'Lamentations', testament: 'Old', chaptersCount: 5, category: 'Major Prophets', theme: 'Grief Over Jerusalem and God’s Unfailing Mercies' },
  { id: 'ezekiel', name: 'Ezekiel', testament: 'Old', chaptersCount: 48, category: 'Major Prophets', theme: 'Visions of God’s Glory and Valley of Dry Bones' },
  { id: 'daniel', name: 'Daniel', testament: 'Old', chaptersCount: 12, category: 'Major Prophets', theme: 'God’s Sovereignty in Babylon and Future Kingdoms' },

  // Minor Prophets (12)
  { id: 'hosea', name: 'Hosea', testament: 'Old', chaptersCount: 14, category: 'Minor Prophets', theme: 'God’s Relentless, Unfaithful-Spouse-Redeeming Love' },
  { id: 'joel', name: 'Joel', testament: 'Old', chaptersCount: 3, category: 'Minor Prophets', theme: 'Outpouring of the Holy Spirit on All Flesh' },
  { id: 'amos', name: 'Amos', testament: 'Old', chaptersCount: 9, category: 'Minor Prophets', theme: 'Justice Rolling Down Like Waters' },
  { id: 'obadiah', name: 'Obadiah', testament: 'Old', chaptersCount: 1, category: 'Minor Prophets', theme: 'Pride of Edom and Deliverance on Mount Zion' },
  { id: 'jonah', name: 'Jonah', testament: 'Old', chaptersCount: 4, category: 'Minor Prophets', theme: 'Mercy on Nineveh and God’s Global Compassion' },
  { id: 'micah', name: 'Micah', testament: 'Old', chaptersCount: 7, category: 'Minor Prophets', theme: 'Act Justly, Love Mercy, Walk Humbly with God' },
  { id: 'nahum', name: 'Nahum', testament: 'Old', chaptersCount: 3, category: 'Minor Prophets', theme: 'Judgment on Oppression and Good News on the Mountains' },
  { id: 'habakkuk', name: 'Habakkuk', testament: 'Old', chaptersCount: 3, category: 'Minor Prophets', theme: 'The Just Shall Live by Faith' },
  { id: 'zephaniah', name: 'Zephaniah', testament: 'Old', chaptersCount: 3, category: 'Minor Prophets', theme: 'The Day of the Lord and God Rejoicing Over Us' },
  { id: 'haggai', name: 'Haggai', testament: 'Old', chaptersCount: 2, category: 'Minor Prophets', theme: 'Rebuilding the Lord’s Temple' },
  { id: 'zechariah', name: 'Zechariah', testament: 'Old', chaptersCount: 14, category: 'Minor Prophets', theme: 'Visions of the Messiah, King on a Donkey' },
  { id: 'malachi', name: 'Malachi', testament: 'Old', chaptersCount: 4, category: 'Minor Prophets', theme: 'Covenant Faithfulness and the Sun of Righteousness' },

  // --- NEW TESTAMENT (27 Books) ---
  // Gospels (4)
  { id: 'matthew', name: 'Matthew', testament: 'New', chaptersCount: 28, category: 'Gospels', theme: 'Jesus as the Promised Jewish King and Messiah' },
  { id: 'mark', name: 'Mark', testament: 'New', chaptersCount: 16, category: 'Gospels', theme: 'Jesus as the Suffering Servant and Son of God' },
  { id: 'luke', name: 'Luke', testament: 'New', chaptersCount: 24, category: 'Gospels', theme: 'Jesus as the Savior of the Lost, Poor, and Outcasts' },
  { id: 'john', name: 'John', testament: 'New', chaptersCount: 21, category: 'Gospels', theme: 'Jesus as the Divine Word and Source of Eternal Life' },

  // Church History (1)
  { id: 'acts', name: 'Acts', testament: 'New', chaptersCount: 28, category: 'Church History', theme: 'Holy Spirit Empowering the Apostles from Jerusalem to Rome' },

  // Pauline Epistles (14)
  { id: 'romans', name: 'Romans', testament: 'New', chaptersCount: 16, category: 'Pauline Epistles', theme: 'Justification by Faith, Grace, and the Power of the Gospel' },
  { id: '1-corinthians', name: '1 Corinthians', testament: 'New', chaptersCount: 16, category: 'Pauline Epistles', theme: 'Unity, Spiritual Gifts, Love, and the Resurrection' },
  { id: '2-corinthians', name: '2 Corinthians', testament: 'New', chaptersCount: 13, category: 'Pauline Epistles', theme: 'Strength in Weakness, Ministry of Reconciliation' },
  { id: 'galatians', name: 'Galatians', testament: 'New', chaptersCount: 6, category: 'Pauline Epistles', theme: 'Freedom in Christ and the Fruit of the Spirit' },
  { id: 'ephesians', name: 'Ephesians', testament: 'New', chaptersCount: 6, category: 'Pauline Epistles', theme: 'Unity in Christ, Grace Through Faith, and Armor of God' },
  { id: 'philippians', name: 'Philippians', testament: 'New', chaptersCount: 4, category: 'Pauline Epistles', theme: 'Joy in the Lord, Humility, and Christ our Strength' },
  { id: 'colossians', name: 'Colossians', testament: 'New', chaptersCount: 4, category: 'Pauline Epistles', theme: 'Preeminence and Sufficiency of Jesus Christ' },
  { id: '1-thessalonians', name: '1 Thessalonians', testament: 'New', chaptersCount: 5, category: 'Pauline Epistles', theme: 'Hope of Christ’s Return and Holy Living' },
  { id: '2-thessalonians', name: '2 Thessalonians', testament: 'New', chaptersCount: 3, category: 'Pauline Epistles', theme: 'Standing Firm Until the Lord Comes' },
  { id: '1-timothy', name: '1 Timothy', testament: 'New', chaptersCount: 6, category: 'Pauline Epistles', theme: 'Church Leadership, Sound Doctrine, and Faithfulness' },
  { id: '2-timothy', name: '2 Timothy', testament: 'New', chaptersCount: 4, category: 'Pauline Epistles', theme: 'Finishing the Race and Guarding the Gospel' },
  { id: 'titus', name: 'Titus', testament: 'New', chaptersCount: 3, category: 'Pauline Epistles', theme: 'Good Works, Grace, and Godly Order' },
  { id: 'philemon', name: 'Philemon', testament: 'New', chaptersCount: 1, category: 'Pauline Epistles', theme: 'Forgiveness and Brotherly Reconciliation in Christ' },
  { id: 'hebrews', name: 'Hebrews', testament: 'New', chaptersCount: 13, category: 'Pauline Epistles', theme: 'Jesus as Greater High Priest and Superior Covenant' },

  // General Epistles (7)
  { id: 'james', name: 'James', testament: 'New', chaptersCount: 5, category: 'General Epistles', theme: 'Living Faith Proved by Works and Taming the Tongue' },
  { id: '1-peter', name: '1 Peter', testament: 'New', chaptersCount: 5, category: 'General Epistles', theme: 'Living Hope in Suffering and Royal Priesthood' },
  { id: '2-peter', name: '2 Peter', testament: 'New', chaptersCount: 3, category: 'General Epistles', theme: 'Growing in Grace and Guarding Against False Teachers' },
  { id: '1-john', name: '1 John', testament: 'New', chaptersCount: 5, category: 'General Epistles', theme: 'Fellowship with God, God is Love, and Assurance' },
  { id: '2-john', name: '2 John', testament: 'New', chaptersCount: 1, category: 'General Epistles', theme: 'Walking in Truth and Love' },
  { id: '3-john', name: '3 John', testament: 'New', chaptersCount: 1, category: 'General Epistles', theme: 'Hospitality to Fellow Laborers in the Truth' },
  { id: 'jude', name: 'Jude', testament: 'New', chaptersCount: 1, category: 'General Epistles', theme: 'Contending Earnestly for the Faith Once Delivered' },

  // Prophecy (1)
  { id: 'revelation', name: 'Revelation', testament: 'New', chaptersCount: 22, category: 'Prophecy', theme: 'The Lamb on the Throne, Victory, New Heavens and New Earth' },
];

export const TRANSLATION_DETAILS: Record<TranslationId, { name: string; short: string; description: string }> = {
  WEB: {
    name: 'World English Bible',
    short: 'WEB',
    description: 'Modern, clear, and accurate public domain translation in today’s English.'
  },
  KJV: {
    name: 'King James Version',
    short: 'KJV',
    description: 'The iconic 1611 masterwork celebrated for lyrical beauty and reverent cadence.'
  },
  BBE: {
    name: 'Bible in Basic English',
    short: 'BBE',
    description: 'Simpler vocabulary (1,000 words). Highly accessible for youth and learners.'
  }
};

// Rich pre-bundled scripture verses guaranteeing immediate offline reading on first launch
export const OFFLINE_BIBLE_VERSES: BibleVerse[] = [
  // --- MATTHEW 5 (Beatitudes & Salt and Light) ---
  { book: 'Matthew', chapter: 5, verse: 1, text: 'Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 2, text: 'He opened his mouth and taught them, saying,', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 3, text: '“Blessed are the poor in spirit, for theirs is the Kingdom of Heaven.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are those who mourn, for they shall be comforted.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 5, text: 'Blessed are the gentle, for they shall inherit the earth.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 6, text: 'Blessed are those who hunger and thirst after righteousness, for they shall be filled.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 7, text: 'Blessed are the merciful, for they shall obtain mercy.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 8, text: 'Blessed are the pure in heart, for they shall see God.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 9, text: 'Blessed are the peacemakers, for they shall be called children of God.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 10, text: 'Blessed are those who have been persecuted for righteousness’ sake, for theirs is the Kingdom of Heaven.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 14, text: '“You are the light of the world. A city located on a hill can’t be hidden.', translation: 'WEB' },
  { book: 'Matthew', chapter: 5, verse: 16, text: 'Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.', translation: 'WEB' },

  { book: 'Matthew', chapter: 5, verse: 1, text: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 2, text: 'And he opened his mouth, and taught them, saying,', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 3, text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 4, text: 'Blessed are they that mourn: for they shall be comforted.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 5, text: 'Blessed are the meek: for they shall inherit the earth.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 6, text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 7, text: 'Blessed are the merciful: for they shall obtain mercy.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 8, text: 'Blessed are the pure in heart: for they shall see God.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 9, text: 'Blessed are the peacemakers: for they shall be called the children of God.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 10, text: 'Blessed are they which are persecuted for righteousness’ sake: for theirs is the kingdom of heaven.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 14, text: 'Ye are the light of the world. A city that is set on an hill cannot be hid.', translation: 'KJV' },
  { book: 'Matthew', chapter: 5, verse: 16, text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.', translation: 'KJV' },

  { book: 'Matthew', chapter: 5, verse: 1, text: 'And seeing great numbers of people, he went up into the mountain: and when he was seated, his disciples came to him:', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 2, text: 'And with these words he gave them teaching, saying,', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 3, text: 'Happy are the poor in spirit: for the kingdom of heaven is theirs.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 4, text: 'Happy are those who are sad: for they will be comforted.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 5, text: 'Happy are the gentle: for the earth will be their heritage.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 6, text: 'Happy are those who have a desire for righteousness: for they will have their desire.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 7, text: 'Happy are the merciful: for they will obtain mercy.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 8, text: 'Happy are the clean in heart: for they will see God.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 9, text: 'Happy are the peacemakers: for they will be named sons of God.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 10, text: 'Happy are those who are attacked because of righteousness: for the kingdom of heaven is theirs.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 14, text: 'You are the light of the world. A town put on a hill may be seen by all.', translation: 'BBE' },
  { book: 'Matthew', chapter: 5, verse: 16, text: 'Even so let your light be shining before men, so that they may see your good works and give glory to your Father in heaven.', translation: 'BBE' },

  // --- MATTHEW 6 (The Lord's Prayer & Do Not Worry) ---
  { book: 'Matthew', chapter: 6, verse: 9, text: '“Pray like this: ‘Our Father in heaven, may your name be kept holy.', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 10, text: 'Let your Kingdom come. Let your will be done on earth as it is in heaven.', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 11, text: 'Give us today our daily bread.', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 12, text: 'Forgive us our debts, as we also forgive our debtors.', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 13, text: 'Bring us not into temptation, but deliver us from the evil one. For yours is the Kingdom, the power, and the glory forever. Amen.’', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 25, text: '“Therefore I tell you, don’t be anxious for your life: what you will eat, or what you will drink; nor yet for your body, what you will wear. Isn’t life more than food, and the body more than clothing?', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 26, text: 'See the birds of the sky, that they don’t sow, neither do they reap, nor gather into barns. Your heavenly Father feeds them. Aren’t you of much more value than they?', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 33, text: 'But seek first God’s Kingdom and his righteousness; and all these things will be given to you as well.', translation: 'WEB' },
  { book: 'Matthew', chapter: 6, verse: 34, text: 'Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient.', translation: 'WEB' },

  { book: 'Matthew', chapter: 6, verse: 9, text: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 10, text: 'Thy kingdom come, Thy will be done in earth, as it is in heaven.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 11, text: 'Give us this day our daily bread.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 12, text: 'And forgive us our debts, as we forgive our debtors.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 13, text: 'And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 25, text: 'Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment?', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 26, text: 'Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 33, text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.', translation: 'KJV' },
  { book: 'Matthew', chapter: 6, verse: 34, text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.', translation: 'KJV' },

  // --- JOHN 1 (In the beginning was the Word) ---
  { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', translation: 'WEB' },
  { book: 'John', chapter: 1, verse: 2, text: 'The same was in the beginning with God.', translation: 'WEB' },
  { book: 'John', chapter: 1, verse: 3, text: 'All things were made through him. Without him was not anything made that has been made.', translation: 'WEB' },
  { book: 'John', chapter: 1, verse: 4, text: 'In him was life, and the life was the light of men.', translation: 'WEB' },
  { book: 'John', chapter: 1, verse: 5, text: 'The light shines in the darkness, and the darkness hasn’t overcome it.', translation: 'WEB' },
  { book: 'John', chapter: 1, verse: 14, text: 'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.', translation: 'WEB' },

  { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', translation: 'KJV' },
  { book: 'John', chapter: 1, verse: 2, text: 'The same was in the beginning with God.', translation: 'KJV' },
  { book: 'John', chapter: 1, verse: 3, text: 'All things were made by him; and without him was not any thing made that was made.', translation: 'KJV' },
  { book: 'John', chapter: 1, verse: 4, text: 'In him was life; and the life was the light of men.', translation: 'KJV' },
  { book: 'John', chapter: 1, verse: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.', translation: 'KJV' },
  { book: 'John', chapter: 1, verse: 14, text: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.', translation: 'KJV' },

  // --- JOHN 14 (The Way, The Truth, and The Life) ---
  { book: 'John', chapter: 14, verse: 1, text: '“Don’t let your heart be troubled. Believe in God. Believe also in me.', translation: 'WEB' },
  { book: 'John', chapter: 14, verse: 2, text: 'In my Father’s house are many homes. If it weren’t so, I would have told you. I am going to prepare a place for you.', translation: 'WEB' },
  { book: 'John', chapter: 14, verse: 6, text: 'Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father, except through me.', translation: 'WEB' },
  { book: 'John', chapter: 14, verse: 27, text: '“Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful.', translation: 'WEB' },

  { book: 'John', chapter: 14, verse: 1, text: 'Let not your heart be troubled: ye believe in God, believe also in me.', translation: 'KJV' },
  { book: 'John', chapter: 14, verse: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.', translation: 'KJV' },
  { book: 'John', chapter: 14, verse: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', translation: 'KJV' },

  // --- PSALM 23 (The Lord is My Shepherd) ---
  { book: 'Psalms', chapter: 23, verse: 1, text: 'Yahweh is my shepherd: I shall lack nothing.', translation: 'WEB' },
  { book: 'Psalms', chapter: 23, verse: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.', translation: 'WEB' },
  { book: 'Psalms', chapter: 23, verse: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.', translation: 'WEB' },
  { book: 'Psalms', chapter: 23, verse: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.', translation: 'WEB' },
  { book: 'Psalms', chapter: 23, verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.', translation: 'WEB' },
  { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.', translation: 'WEB' },

  { book: 'Psalms', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', translation: 'KJV' },
  { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.', translation: 'KJV' },
  { book: 'Psalms', chapter: 23, verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.', translation: 'KJV' },
  { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', translation: 'KJV' },
  { book: 'Psalms', chapter: 23, verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.', translation: 'KJV' },
  { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.', translation: 'KJV' },

  { book: 'Psalms', chapter: 23, verse: 1, text: 'The Lord is my keeper; I need nothing.', translation: 'BBE' },
  { book: 'Psalms', chapter: 23, verse: 2, text: 'He makes a resting-place for me in the green grass: he guides me by the quiet waters.', translation: 'BBE' },
  { book: 'Psalms', chapter: 23, verse: 3, text: 'He gives new life to my soul: he is my guide in the ways of righteousness, because of his name.', translation: 'BBE' },
  { book: 'Psalms', chapter: 23, verse: 4, text: 'Yes, though I go through the valley of the shadow of death, I will have no fear: for you are with me; your rod and your support are my comfort.', translation: 'BBE' },
  { book: 'Psalms', chapter: 23, verse: 5, text: 'You make a feast for me before my haters: you put oil on my head; my cup is full.', translation: 'BBE' },
  { book: 'Psalms', chapter: 23, verse: 6, text: 'Only good and mercy will be with me all the days of my life: and I will have a place in the house of the Lord for ever.', translation: 'BBE' },

  // --- PHILIPPIANS 4 (Rejoice in the Lord always) ---
  { book: 'Philippians', chapter: 4, verse: 4, text: 'Rejoice in the Lord always! Again I will say, Rejoice!', translation: 'WEB' },
  { book: 'Philippians', chapter: 4, verse: 6, text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.', translation: 'WEB' },
  { book: 'Philippians', chapter: 4, verse: 7, text: 'And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.', translation: 'WEB' },
  { book: 'Philippians', chapter: 4, verse: 8, text: 'Finally, brothers, whatever things are true, whatever things are honorable, whatever things are just, whatever things are pure, whatever things are lovely, whatever things are of good report; if there is any virtue, and if there is any praise, think about these things.', translation: 'WEB' },
  { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ, who strengthens me.', translation: 'WEB' },

  { book: 'Philippians', chapter: 4, verse: 4, text: 'Rejoice in the Lord alway: and again I say, Rejoice.', translation: 'KJV' },
  { book: 'Philippians', chapter: 4, verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.', translation: 'KJV' },
  { book: 'Philippians', chapter: 4, verse: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', translation: 'KJV' },
  { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ which strengtheneth me.', translation: 'KJV' },

  // --- PROVERBS 3 (Trust in the Lord with all your heart) ---
  { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding.', translation: 'WEB' },
  { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all your ways acknowledge him, and he will make your paths straight.', translation: 'WEB' },
  { book: 'Proverbs', chapter: 3, verse: 7, text: 'Don’t be wise in your own eyes. Fear Yahweh, and depart from evil.', translation: 'WEB' },

  { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', translation: 'KJV' },
  { book: 'Proverbs', chapter: 3, verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.', translation: 'KJV' },
  { book: 'Proverbs', chapter: 3, verse: 7, text: 'Be not wise in thine own eyes: fear the LORD, and depart from evil.', translation: 'KJV' },

  // --- ROMANS 8 (More than Conquerors) ---
  { book: 'Romans', chapter: 8, verse: 28, text: 'We know that all things work together for good for those who love God, to those who are called according to his purpose.', translation: 'WEB' },
  { book: 'Romans', chapter: 8, verse: 31, text: 'What then shall we say about these things? If God is for us, who can be against us?', translation: 'WEB' },
  { book: 'Romans', chapter: 8, verse: 38, text: 'For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,', translation: 'WEB' },
  { book: 'Romans', chapter: 8, verse: 39, text: 'nor height, nor depth, nor any other created thing, will be able to separate us from the love of God, which is in Christ Jesus our Lord.', translation: 'WEB' },

  { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', translation: 'KJV' },
  { book: 'Romans', chapter: 8, verse: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?', translation: 'KJV' },
  { book: 'Romans', chapter: 8, verse: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,', translation: 'KJV' },
  { book: 'Romans', chapter: 8, verse: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.', translation: 'KJV' },

  // --- GENESIS 1 (Creation of the Heavens and the Earth) ---
  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning, God created the heavens and the earth.', translation: 'WEB' },
  { book: 'Genesis', chapter: 1, verse: 2, text: 'The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the waters.', translation: 'WEB' },
  { book: 'Genesis', chapter: 1, verse: 3, text: 'God said, “Let there be light,” and there was light.', translation: 'WEB' },

  { book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.', translation: 'KJV' },
  { book: 'Genesis', chapter: 1, verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.', translation: 'KJV' },
  { book: 'Genesis', chapter: 1, verse: 3, text: 'And God said, Let there be light: and there was light.', translation: 'KJV' },

  // --- REVELATION 21 (New Heaven and New Earth) ---
  { book: 'Revelation', chapter: 21, verse: 1, text: 'I saw a new heaven and a new earth: for the first heaven and the first earth have passed away, and the sea is no more.', translation: 'WEB' },
  { book: 'Revelation', chapter: 21, verse: 3, text: 'I heard a loud voice out of heaven saying, “Behold, God’s dwelling is with people, and he will dwell with them, and they will be his people, and God himself will be with them as their God.', translation: 'WEB' },
  { book: 'Revelation', chapter: 21, verse: 4, text: 'He will wipe away from them every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain, any more. The first things have passed away.”', translation: 'WEB' },
  { book: 'Revelation', chapter: 21, verse: 5, text: 'He who sits on the throne said, “Behold, I make all things new.”', translation: 'WEB' },

  { book: 'Revelation', chapter: 21, verse: 1, text: 'And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.', translation: 'KJV' },
  { book: 'Revelation', chapter: 21, verse: 3, text: 'And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.', translation: 'KJV' },
  { book: 'Revelation', chapter: 21, verse: 4, text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.', translation: 'KJV' },
  { book: 'Revelation', chapter: 21, verse: 5, text: 'And he that sat upon the throne said, Behold, I make all things new.', translation: 'KJV' }
];

export function getBundledVerses(book: string, chapter: number, translation: TranslationId = 'WEB'): BibleVerse[] {
  return OFFLINE_BIBLE_VERSES.filter(
    v => v.book.toLowerCase() === book.toLowerCase() && v.chapter === chapter && v.translation === translation
  );
}

export function searchOfflineBible(query: string, translation: TranslationId = 'WEB'): BibleVerse[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return OFFLINE_BIBLE_VERSES.filter(
    v => v.translation === translation && (v.text.toLowerCase().includes(q) || `${v.book} ${v.chapter}:${v.verse}`.toLowerCase().includes(q))
  );
}

export interface DailyVerseHighlight {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  theme: string;
  reflection: string;
  quickPrayer: string;
}

export const DAILY_HIGHLIGHTS: DailyVerseHighlight[] = [
  {
    reference: 'Matthew 6:33',
    book: 'Matthew',
    chapter: 6,
    verse: 33,
    theme: 'Kingdom Priorities',
    text: '“Seek first God’s Kingdom and his righteousness; and all these things will be given to you as well.”',
    reflection: 'When life feels scattered and overwhelming, Jesus invites us to recalibrate our compass. Put His Kingdom and love first, and trust that He holds all tomorrow’s needs.',
    quickPrayer: 'Jesus, take center stage in my thoughts and ambitions today. Lead me into Your peace. Amen.'
  },
  {
    reference: 'Philippians 4:6-7',
    book: 'Philippians',
    chapter: 4,
    verse: 6,
    theme: 'Peace in Anxiety',
    text: '“In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.”',
    reflection: 'Prayer transforms our anxious loops into sacred conversations. Hand each worry to God with gratitude, and receive the supernatural peace that guards your heart.',
    quickPrayer: 'Lord, I trade my worries for Your peace that surpasses all understanding. Guard my heart today. Amen.'
  },
  {
    reference: 'John 14:27',
    book: 'John',
    chapter: 14,
    verse: 27,
    theme: 'Christ’s Unshakable Peace',
    text: '“Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful.”',
    reflection: 'Worldly peace depends on ideal circumstances; Christ’s peace thrives even in the storm. Rest in the gift He left for your soul.',
    quickPrayer: 'Prince of Peace, calm every troubled thought inside me. I receive Your unshakable gift. Amen.'
  },
  {
    reference: 'Psalm 23:1-3',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    theme: 'The Shepherd’s Care',
    text: '“The Lord is my shepherd; I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.”',
    reflection: 'A good shepherd knows every sheep by name, shields them from wolves, and leads them to places of restoration. You are safe in His pasture.',
    quickPrayer: 'Good Shepherd, restore my weary soul today. Guide my steps in righteousness. Amen.'
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    theme: 'Divine Guidance',
    text: '“Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.”',
    reflection: 'We don’t need to see the entire staircase to take the next faithful step with God. Lean on His infinite wisdom rather than your fragile calculations.',
    quickPrayer: 'Father, I surrender my desire to control every outcome. Straighten my path as I follow You. Amen.'
  }
];
