import { StudyUnit } from '../types';

export const STUDY_UNITS: StudyUnit[] = [
  {
    id: 'unit-1',
    number: 1,
    title: 'The Sermon on the Mount',
    description: 'Explore Jesus’s revolutionary blueprint for the Kingdom of God, the Beatitudes, and Salt & Light.',
    themeColor: 'from-emerald-500 to-teal-600',
    bannerIcon: 'Mountain',
    milestoneBonusGems: 50,
    lessons: [
      {
        id: 'u1-l1',
        title: 'The Beatitudes: Kingdom Blessings',
        subtitle: 'Matthew 5:3-10',
        scriptureAnchor: 'Matthew 5:3',
        xpReward: 20,
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            prompt: 'In the Beatitudes, who did Jesus say will inherit the earth?',
            scriptureReference: 'Matthew 5:5',
            scriptureText: '“Blessed are the gentle (meek), for they shall inherit the earth.”',
            options: [
              { id: 'a', text: 'The powerful and wealthy', isCorrect: false },
              { id: 'b', text: 'The gentle and meek', isCorrect: true, explanation: 'In Jesus’s upside-down Kingdom, true strength is harnessed in meekness.' },
              { id: 'c', text: 'The boastful rulers', isCorrect: false },
              { id: 'd', text: 'The physically strongest', isCorrect: false }
            ],
            insightNote: 'The Greek word for meek is "Praus", which describes a warhorse with immense power under perfect gentle control.',
            mascotTip: 'Grace says: True meekness isn’t weakness—it’s strength submitted to God!'
          },
          {
            id: 'q2',
            type: 'word-scramble',
            prompt: 'Arrange the words to complete Jesus’s first Beatitude:',
            scriptureReference: 'Matthew 5:3',
            scriptureText: 'Blessed are the poor in spirit',
            scrambledWords: ['spirit', 'Blessed', 'poor', 'the', 'are', 'in'],
            correctSentence: ['Blessed', 'are', 'the', 'poor', 'in', 'spirit'],
            insightNote: 'To be "poor in spirit" means recognizing our spiritual bankruptcy without God’s grace.',
            mascotTip: 'Tap the words in order! Tap a placed word to return it.'
          },
          {
            id: 'q3',
            type: 'fill-blank',
            prompt: 'Fill in the blank: “Blessed are the ________, for they shall obtain mercy.”',
            scriptureReference: 'Matthew 5:7',
            scriptureText: '“Blessed are the merciful, for they shall obtain mercy.”',
            options: [
              { id: 'opt1', text: 'merciful', isCorrect: true },
              { id: 'opt2', text: 'righteous', isCorrect: false },
              { id: 'opt3', text: 'judging', isCorrect: false },
              { id: 'opt4', text: 'wealthy', isCorrect: false }
            ],
            insightNote: 'God’s mercy is a reciprocal flow: those who freely give mercy have truly tasted God’s mercy.',
            mascotTip: 'Mercy heals relationships and mirrors the heart of the Father.'
          },
          {
            id: 'q4',
            type: 'match-pairs',
            prompt: 'Match each Beatitude with its promised Kingdom reward:',
            scriptureReference: 'Matthew 5:3-9',
            scriptureText: 'The Beatitudes and their divine promises',
            pairs: [
              { id: 'p1', left: 'The Peacemakers', right: 'Called Children of God' },
              { id: 'p2', left: 'The Pure in Heart', right: 'They Shall See God' },
              { id: 'p3', left: 'Those Who Mourn', right: 'They Shall Be Comforted' },
              { id: 'p4', left: 'Hunger for Righteousness', right: 'They Shall Be Filled' }
            ],
            insightNote: 'Jesus flips the values of the Roman Empire and modern society upside down.',
            mascotTip: 'Tap a left tile, then tap its matching right tile!'
          },
          {
            id: 'q5',
            type: 'true-false',
            prompt: 'True or False: Jesus taught that persecution for righteousness’ sake brings a great reward in heaven.',
            scriptureReference: 'Matthew 5:11-12',
            scriptureText: '“Rejoice and be exceedingly glad, for great is your reward in heaven, for that is how they persecuted the prophets before you.”',
            correctBoolean: true,
            insightNote: 'When standing for truth is costly, heaven counts it as highest honor.',
            mascotTip: 'You are never alone when walking in righteousness.'
          }
        ]
      },
      {
        id: 'u1-l2',
        title: 'Salt of the Earth & Light of the World',
        subtitle: 'Matthew 5:13-16',
        scriptureAnchor: 'Matthew 5:14',
        xpReward: 20,
        questions: [
          {
            id: 'q2-1',
            type: 'word-scramble',
            prompt: 'Unscramble Jesus’s famous declaration to His followers:',
            scriptureReference: 'Matthew 5:14',
            scriptureText: 'You are the light of the world',
            scrambledWords: ['the', 'world', 'You', 'light', 'are', 'of', 'the'],
            correctSentence: ['You', 'are', 'the', 'light', 'of', 'the', 'world'],
            insightNote: 'Light by nature expels darkness. Believers are called not to hide in fear, but shine brightly with good works.',
            mascotTip: 'A city built on a hill cannot be hidden!'
          },
          {
            id: 'q2-2',
            type: 'multiple-choice',
            prompt: 'Why did Jesus say we should let our light shine before others?',
            scriptureReference: 'Matthew 5:16',
            scriptureText: '“Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.”',
            options: [
              { id: 'a', text: 'So people will praise and applaud our talents', isCorrect: false },
              { id: 'b', text: 'So that they may see your good works and glorify your Father in heaven', isCorrect: true },
              { id: 'c', text: 'To prove that we are morally superior to others', isCorrect: false },
              { id: 'd', text: 'To gain worldly political influence', isCorrect: false }
            ],
            insightNote: 'Christian character always points upward—deflecting personal vanity to glorify God.',
            mascotTip: 'Our light is a reflection of Jesus, the true Light!'
          },
          {
            id: 'q2-3',
            type: 'fill-blank',
            prompt: 'In ancient Judea, salt was primarily prized as a preservative and for its ________.',
            scriptureReference: 'Matthew 5:13',
            scriptureText: '“You are the salt of the earth. But if the salt has lost its flavor, with what will it be salted?”',
            options: [
              { id: 'opt1', text: 'flavor and seasoning', isCorrect: true },
              { id: 'opt2', text: 'explosive properties', isCorrect: false },
              { id: 'opt3', text: 'medicinal poison', isCorrect: false },
              { id: 'opt4', text: 'building bricks', isCorrect: false }
            ],
            insightNote: 'Salt prevents decay. Believers preserve society from moral decay and bring the sweet flavor of grace.',
            mascotTip: 'Be the seasoning that brings God’s love to dry conversations!'
          }
        ]
      },
      {
        id: 'u1-l3',
        title: 'The Lord’s Prayer & Freedom From Worry',
        subtitle: 'Matthew 6:9-34',
        scriptureAnchor: 'Matthew 6:33',
        xpReward: 25,
        questions: [
          {
            id: 'q3-1',
            type: 'word-scramble',
            prompt: 'Arrange the core petition of the Lord’s Prayer:',
            scriptureReference: 'Matthew 6:10',
            scriptureText: 'Your will be done on earth as it is in heaven',
            scrambledWords: ['done', 'Your', 'earth', 'will', 'on', 'be', 'in', 'heaven', 'as', 'it', 'is'],
            correctSentence: ['Your', 'will', 'be', 'done', 'on', 'earth', 'as', 'it', 'is', 'in', 'heaven'],
            insightNote: 'Prayer is not bending God’s will to our desires; it is aligning our hearts with His heavenly Kingdom.',
            mascotTip: 'Surrender opens the door to miraculous peace.'
          },
          {
            id: 'q3-2',
            type: 'multiple-choice',
            prompt: 'What illustration did Jesus use to teach us not to worry about food and clothing?',
            scriptureReference: 'Matthew 6:26-28',
            scriptureText: '“Look at the birds of the air... Consider the lilies of the field, how they grow...”',
            options: [
              { id: 'a', text: 'Ants storing grain and bees making honey', isCorrect: false },
              { id: 'b', text: 'The birds of the air and the lilies of the field', isCorrect: true },
              { id: 'c', text: 'The cedar trees of Lebanon', isCorrect: false },
              { id: 'd', text: 'The fish of the Sea of Galilee', isCorrect: false }
            ],
            insightNote: 'Not even King Solomon in all his royal splendor was adorned like the simple wildflowers cared for by God.',
            mascotTip: 'If God clothes the wildflowers, how much more will He care for you?'
          },
          {
            id: 'q3-3',
            type: 'fill-blank',
            prompt: '“Therefore do not be anxious for ________, for ________ will be anxious for itself.”',
            scriptureReference: 'Matthew 6:34',
            scriptureText: '“Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself.”',
            options: [
              { id: 'opt1', text: 'tomorrow', isCorrect: true },
              { id: 'opt2', text: 'yesterday', isCorrect: false },
              { id: 'opt3', text: 'riches', isCorrect: false },
              { id: 'opt4', text: 'opinions', isCorrect: false }
            ],
            insightNote: 'God gives grace in daily rations, just like the manna in the wilderness. Live present in today.',
            mascotTip: 'Grace arrives today for today’s needs!'
          }
        ]
      }
    ]
  },
  {
    id: 'unit-2',
    number: 2,
    title: 'Parables of Grace & The Kingdom',
    description: 'Uncover Jesus’s greatest stories: The Prodigal Son, The Good Samaritan, The Sower, and the Lost Sheep.',
    themeColor: 'from-amber-500 to-orange-600',
    bannerIcon: 'BookOpen',
    milestoneBonusGems: 60,
    lessons: [
      {
        id: 'u2-l1',
        title: 'The Prodigal Son & The Running Father',
        subtitle: 'Luke 15:11-32',
        scriptureAnchor: 'Luke 15:20',
        xpReward: 25,
        questions: [
          {
            id: 'q2-l1-1',
            type: 'multiple-choice',
            prompt: 'When the prodigal son was still far off, what did his father do?',
            scriptureReference: 'Luke 15:20',
            scriptureText: '“While he was still far off, his father saw him and was filled with compassion; he ran, threw his arms around his neck, and kissed him.”',
            options: [
              { id: 'a', text: 'Locked the city gates and demanded he pay back the debts', isCorrect: false },
              { id: 'b', text: 'Ran to him, threw his arms around him, and kissed him', isCorrect: true },
              { id: 'c', text: 'Sent servants to interrogate him first', isCorrect: false },
              { id: 'd', text: 'Ignored him until he proved his repentance for 40 days', isCorrect: false }
            ],
            insightNote: 'In 1st-century Jewish culture, dignified elderly patriarchs never ran. The father cast aside all dignity to welcome his broken child.',
            mascotTip: 'God never waits reluctantly—He runs to embrace the returning soul!'
          },
          {
            id: 'q2-l1-2',
            type: 'match-pairs',
            prompt: 'Match the symbols given to the returned son with their spiritual meaning:',
            scriptureReference: 'Luke 15:22',
            scriptureText: 'The Father’s restoration gifts',
            pairs: [
              { id: 'p1', left: 'The Best Robe', right: 'Righteousness & Honor Restored' },
              { id: 'p2', left: 'The Signet Ring', right: 'Family Authority & Belonging' },
              { id: 'p3', left: 'Sandals on Feet', right: 'Treated as Son, Not Barefoot Slave' },
              { id: 'p4', left: 'The Fatted Calf', right: 'Celebration of Resurrection' }
            ],
            insightNote: 'The father restored the son completely, before the son could even finish reciting his rehearsed speech.',
            mascotTip: 'Grace restores what sin tore away!'
          },
          {
            id: 'q2-l1-3',
            type: 'true-false',
            prompt: 'True or False: The older brother in the parable rejoiced joyfully when his younger brother returned.',
            scriptureReference: 'Luke 15:28',
            scriptureText: '“The older brother became angry and refused to go in. So his father went out and pleaded with him.”',
            correctBoolean: false,
            insightNote: 'Jesus addressed this parable to the Pharisees. Both sons were lost—one through rebellion in a far country, the other through self-righteous religion at home.',
            mascotTip: 'Beware of having an older-brother heart towards those being redeemed.'
          }
        ]
      },
      {
        id: 'u2-l2',
        title: 'The Good Samaritan: Who is My Neighbor?',
        subtitle: 'Luke 10:25-37',
        scriptureAnchor: 'Luke 10:27',
        xpReward: 25,
        questions: [
          {
            id: 'q2-l2-1',
            type: 'multiple-choice',
            prompt: 'Who passed by the wounded traveler on the other side before the Samaritan arrived?',
            scriptureReference: 'Luke 10:31-32',
            scriptureText: '“By chance a priest went down that way... In the same way a Levite also came to the place, saw him, and passed by on the other side.”',
            options: [
              { id: 'a', text: 'A priest and a Levite', isCorrect: true },
              { id: 'b', text: 'Roman soldiers and tax collectors', isCorrect: false },
              { id: 'c', text: 'Fishermen from Galilee', isCorrect: false },
              { id: 'd', text: 'King Herod’s guards', isCorrect: false }
            ],
            insightNote: 'The religious leaders avoided him to protect their ceremonial cleanliness, choosing ritual over active love.',
            mascotTip: 'Love isn’t a theoretical doctrine; it’s hands-on compassion.'
          },
          {
            id: 'q2-l2-2',
            type: 'word-scramble',
            prompt: 'Arrange the Great Commandment quoted by the lawyer:',
            scriptureReference: 'Luke 10:27',
            scriptureText: 'You shall love the Lord your God with all your heart',
            scrambledWords: ['your', 'Lord', 'God', 'all', 'shall', 'love', 'You', 'with', 'the', 'your', 'heart'],
            correctSentence: ['You', 'shall', 'love', 'the', 'Lord', 'your', 'God', 'with', 'all', 'your', 'heart'],
            insightNote: 'Jesus combined Deuteronomy 6:5 (Shema) with Leviticus 19:18 (love your neighbor as yourself).',
            mascotTip: 'Love for God overflows into active love for fellow humans.'
          }
        ]
      }
    ]
  },
  {
    id: 'unit-3',
    number: 3,
    title: 'The Life, Miracles & Compassion of Jesus',
    description: 'Follow Jesus walking on the water, feeding the multitudes, healing the broken, and conquering the grave.',
    themeColor: 'from-blue-600 to-indigo-700',
    bannerIcon: 'Sparkles',
    milestoneBonusGems: 75,
    lessons: [
      {
        id: 'u3-l1',
        title: 'Calming the Storm & Walking on Water',
        subtitle: 'Matthew 14:22-33 & Mark 4:35-41',
        scriptureAnchor: 'Matthew 14:27',
        xpReward: 30,
        questions: [
          {
            id: 'q3-l1-1',
            type: 'multiple-choice',
            prompt: 'What did Jesus say to the disciples when they cried out in terror during the storm?',
            scriptureReference: 'Matthew 14:27',
            scriptureText: '“Immediately Jesus spoke to them, saying, ‘Take courage! It is I! Don’t be afraid.’”',
            options: [
              { id: 'a', text: '“Row faster to the shore!”', isCorrect: false },
              { id: 'b', text: '“Take courage! It is I! Don’t be afraid.”', isCorrect: true },
              { id: 'c', text: '“Why didn’t you check the weather before leaving?”', isCorrect: false },
              { id: 'd', text: '“Cast lots to see who brought the bad luck.”', isCorrect: false }
            ],
            insightNote: '“It is I” translates the Greek "Ego Eimi", the divine covenant name Yahweh revealed to Moses at the burning bush.',
            mascotTip: 'When Jesus steps into the boat, the gale winds surrender to His peace.'
          },
          {
            id: 'q3-l1-2',
            type: 'word-scramble',
            prompt: 'Arrange Peter’s desperate 3-word prayer when he began to sink:',
            scriptureReference: 'Matthew 14:30',
            scriptureText: 'Lord, save me!',
            scrambledWords: ['save', 'Lord,', 'me!'],
            correctSentence: ['Lord,', 'save', 'me!'],
            insightNote: 'You don’t need lengthy or eloquent words to pray. A simple cry from the heart reaches the throne of grace instantly.',
            mascotTip: 'The shortest prayers in Scripture are often the most powerful!'
          },
          {
            id: 'q3-l1-3',
            type: 'multiple-choice',
            prompt: 'Why did Peter begin to sink after stepping onto the stormy waters?',
            scriptureReference: 'Matthew 14:30',
            scriptureText: '“But when he saw the wind, he was afraid, and beginning to sink, he cried out, saying, ‘Lord, save me!’”',
            options: [
              { id: 'a', text: 'His robes were too heavy', isCorrect: false },
              { id: 'b', text: 'He shifted his eyes from Jesus onto the roaring wind and waves', isCorrect: true },
              { id: 'c', text: 'A giant wave tipped him over', isCorrect: false },
              { id: 'd', text: 'Jesus commanded the water to become soft', isCorrect: false }
            ],
            insightNote: 'Faith stays afloat when fixing our gaze on Jesus; fear sinks us when we fixate on circumstances.',
            mascotTip: 'Keep your eyes anchored on Christ, not the waves!'
          }
        ]
      },
      {
        id: 'u3-l2',
        title: 'The Resurrection & Emmaus Road',
        subtitle: 'Luke 24:13-35 & John 20:1-18',
        scriptureAnchor: 'Luke 24:32',
        xpReward: 30,
        questions: [
          {
            id: 'q3-l2-1',
            type: 'fill-blank',
            prompt: 'At the empty tomb, what did the angels ask the weeping women? “Why do you seek the living among the ________?”',
            scriptureReference: 'Luke 24:5',
            scriptureText: '“Why do you seek the living among the dead? He isn’t here, but is risen!”',
            options: [
              { id: 'opt1', text: 'dead', isCorrect: true },
              { id: 'opt2', text: 'shadows', isCorrect: false },
              { id: 'opt3', text: 'rulers', isCorrect: false },
              { id: 'opt4', text: 'mountains', isCorrect: false }
            ],
            insightNote: 'The resurrection is the core cornerstone of Christian hope. Jesus transformed death from a dead-end into a doorway.',
            mascotTip: 'He is not here; He is risen indeed!'
          },
          {
            id: 'q3-l2-2',
            type: 'match-pairs',
            prompt: 'Match the Emmaus Road events in sequence:',
            scriptureReference: 'Luke 24:13-35',
            scriptureText: 'Walking with the Risen Savior',
            pairs: [
              { id: 'p1', left: 'Two disciples walking sad', right: 'Jesus draws near unrecognized' },
              { id: 'p2', left: 'Jesus opens the Scriptures', right: 'Their hearts burn within them' },
              { id: 'p3', left: 'Breaking the bread at table', right: 'Their eyes are opened to recognize Him' },
              { id: 'p4', left: 'Jesus vanishes from sight', right: 'They rush back to Jerusalem with joy' }
            ],
            insightNote: 'Jesus still meets us in ordinary moments: walking down the road, opening His Word, and breaking bread.',
            mascotTip: 'Has your heart ever burned with joy while reading scripture?'
          }
        ]
      }
    ]
  },
  {
    id: 'unit-4',
    number: 4,
    title: 'Wisdom of Proverbs & Psalms',
    description: 'Learn timeless principles for integrity, peaceful living, taming the tongue, and trusting the Good Shepherd.',
    themeColor: 'from-purple-600 to-violet-700',
    bannerIcon: 'Compass',
    milestoneBonusGems: 70,
    lessons: [
      {
        id: 'u4-l1',
        title: 'Trusting the Lord with All Your Heart',
        subtitle: 'Proverbs 3:5-6 & Psalm 119:105',
        scriptureAnchor: 'Proverbs 3:5',
        xpReward: 25,
        questions: [
          {
            id: 'q4-l1-1',
            type: 'word-scramble',
            prompt: 'Arrange this foundational proverb on guidance:',
            scriptureReference: 'Proverbs 3:5',
            scriptureText: 'Trust in the Lord with all your heart',
            scrambledWords: ['your', 'Trust', 'Lord', 'heart', 'with', 'all', 'in', 'the'],
            correctSentence: ['Trust', 'in', 'the', 'Lord', 'with', 'all', 'your', 'heart'],
            insightNote: 'Total trust in Hebrew is "Batach", depicting leaning one’s full body weight against an unyielding fortress.',
            mascotTip: 'Don’t lean on your own fragile understanding!'
          },
          {
            id: 'q4-l1-2',
            type: 'multiple-choice',
            prompt: 'According to Psalm 119:105, what is God’s Word likened to?',
            scriptureReference: 'Psalm 119:105',
            scriptureText: '“Your word is a lamp to my feet, and a light for my path.”',
            options: [
              { id: 'a', text: 'A lamp to my feet and a light for my path', isCorrect: true },
              { id: 'b', text: 'A massive sun that blinds the eyes', isCorrect: false },
              { id: 'c', text: 'A heavy iron burden', isCorrect: false },
              { id: 'd', text: 'A puzzle with no answer', isCorrect: false }
            ],
            insightNote: 'Ancient foot lamps only illuminated one step at a time in the dark. Faith requires stepping forward step by step.',
            mascotTip: 'God rarely gives a 5-year floodlight; He gives daily light for the next step!'
          }
        ]
      }
    ]
  },
  {
    id: 'unit-5',
    number: 5,
    title: 'The "I AM" Teachings of Jesus',
    description: 'Deep dive into the 7 great declarations of Christ in John’s Gospel: The Bread of Life, Light of the World, and True Vine.',
    themeColor: 'from-rose-500 to-pink-600',
    bannerIcon: 'Sun',
    milestoneBonusGems: 80,
    lessons: [
      {
        id: 'u5-l1',
        title: 'The Way, The Truth, and The Life',
        subtitle: 'John 14:1-14',
        scriptureAnchor: 'John 14:6',
        xpReward: 30,
        questions: [
          {
            id: 'q5-l1-1',
            type: 'word-scramble',
            prompt: 'Arrange Jesus’s bold answer to Thomas:',
            scriptureReference: 'John 14:6',
            scriptureText: 'I am the way, the truth, and the life',
            scrambledWords: ['life', 'truth,', 'the', 'I', 'way,', 'and', 'am', 'the', 'the'],
            correctSentence: ['I', 'am', 'the', 'way,', 'the', 'truth,', 'and', 'the', 'life'],
            insightNote: 'Jesus didn’t claim to merely point out a map; He declared Himself to be the very road to God.',
            mascotTip: 'He is the destination and the journey!'
          },
          {
            id: 'q5-l1-2',
            type: 'match-pairs',
            prompt: 'Match the 4 “I AM” metaphors with their spiritual fulfillment:',
            scriptureReference: 'John 6, 8, 10, 15',
            scriptureText: 'The 7 I AM Declarations of Jesus',
            pairs: [
              { id: 'p1', left: 'The Bread of Life', right: 'Satisfies deepest spiritual hunger' },
              { id: 'p2', left: 'The Light of the World', right: 'Dispels spiritual darkness' },
              { id: 'p3', left: 'The Good Shepherd', right: 'Lays down his life for sheep' },
              { id: 'p4', left: 'The True Vine', right: 'Apart from Him we can do nothing' }
            ],
            insightNote: 'In Greek, "Ego Eimi" echoes the sacred Name spoken to Moses at Sinai.',
            mascotTip: 'Abide in the Vine and bear abundant fruit!'
          }
        ]
      }
    ]
  }
];
