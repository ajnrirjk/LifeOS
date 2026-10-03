import { ReadingPlan } from '../types';

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'plan-anxiety',
    title: 'Overcoming Anxiety & Finding God’s Peace',
    subtitle: '14-Day journey from chronic worry into supernatural rest',
    goalCategory: 'Peace & Anxiety',
    totalDays: 14,
    durationLabel: '14 Days • 5 mins/day',
    coverGradient: 'from-teal-500 via-emerald-600 to-green-700',
    description: 'Anchor your troubled thoughts in the unshakable promises of Christ. Each day pairs a peace scripture with a practical breath meditation and devotional reflection.',
    isEnrolled: true,
    days: [
      {
        dayNumber: 1,
        title: 'Trading Worries for Peace',
        passageReference: 'Philippians 4:4-7',
        keyVerse: '“Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.”',
        devotionText: 'Anxiety often whispers that we are on our own. But Paul wrote these words while chained in a Roman dungeon. The secret was not ideal circumstances, but a present Savior. When anxious thoughts intrude, turn them into arrow prayers.',
        prayerFocus: 'Lord Jesus, I release my grip on what I cannot control and rest in Your guarding peace.',
        completed: true
      },
      {
        dayNumber: 2,
        title: 'Consider the Wildflowers',
        passageReference: 'Matthew 6:25-34',
        keyVerse: '“Can any one of you by worrying add a single hour to your life?”',
        devotionText: 'Jesus directs our gaze downward to the lilies and upward to the birds. If the Creator paints flowers that only bloom for a season, how tenderly will He clothe and provide for His redeemed children?',
        prayerFocus: 'Father, help me trust Your daily supply. I surrender tomorrow into Your hands.',
        completed: true
      },
      {
        dayNumber: 3,
        title: 'He Calms the Roaring Sea',
        passageReference: 'Mark 4:35-41',
        keyVerse: '“He got up, rebuked the wind and said to the waves, ‘Quiet! Be still!’”',
        devotionText: 'Notice that Jesus was asleep on a cushion in the stern of the boat. The storm did not surprise Him. Even when life feels like it is taking on water, Jesus is in the boat with you.',
        prayerFocus: 'Speak Peace into my internal storm today, Lord. You rule the wind and waves.',
        completed: false
      },
      {
        dayNumber: 4,
        title: 'Cast All Your Cares',
        passageReference: '1 Peter 5:6-7',
        keyVerse: '“Cast all your anxiety on him because he cares for you.”',
        devotionText: 'The Greek word for "casting" implies flinging a heavy burden onto the shoulders of someone stronger. You were never designed to carry the boulder of the future alone.',
        prayerFocus: 'Jesus, I heave this specific anxiety onto Your shoulders right now. You care for me.',
        completed: false
      },
      {
        dayNumber: 5,
        title: 'Beside Still Waters',
        passageReference: 'Psalm 23:1-6',
        keyVerse: '“He makes me lie down in green pastures, he leads me beside quiet waters.”',
        devotionText: 'Sheep will only lie down when they are completely free from fear, friction with other sheep, pests, and hunger. The Good Shepherd takes responsibility for providing that deep safety.',
        prayerFocus: 'Good Shepherd, lead my soul to quiet waters today. I lack nothing in You.',
        completed: false
      }
    ]
  },
  {
    id: 'plan-jesus-ministry',
    title: 'The Life & Teachings of Jesus',
    subtitle: '30-Day walk through the footsteps, miracles, and words of the Messiah',
    goalCategory: 'Jesus Ministry',
    totalDays: 30,
    durationLabel: '30 Days • 8 mins/day',
    coverGradient: 'from-amber-500 via-orange-600 to-red-600',
    description: 'Immerse your daily rhythm in the life of Jesus across the four Gospels. Witness His tender touch on outcasts, His radical authority, and His triumph over the grave.',
    isEnrolled: false,
    days: [
      {
        dayNumber: 1,
        title: 'The Word Became Flesh',
        passageReference: 'John 1:1-18',
        keyVerse: '“The Word became flesh and made his dwelling among us. We have seen his glory.”',
        devotionText: 'God did not send a memo or an abstract philosophy; He stepped into our dust and breathed our air. In Jesus, God has a human face full of grace and truth.',
        prayerFocus: 'Jesus, thank You for coming near to us. Dwell in my heart today.',
        completed: false
      },
      {
        dayNumber: 2,
        title: 'The Baptism & Wilderness Victory',
        passageReference: 'Matthew 3:13-4:11',
        keyVerse: '“And a voice from heaven said, ‘This is my Son, whom I love; with him I am well pleased.’”',
        devotionText: 'Before Jesus preached a single sermon or performed a single miracle, the Father announced His delight. Your identity in Christ is based on sonship, not performance.',
        prayerFocus: 'Father, remind me that my worth is anchored in being Your beloved child.',
        completed: false
      },
      {
        dayNumber: 3,
        title: 'The Calling of the Disciples',
        passageReference: 'Mark 1:16-20',
        keyVerse: '“‘Come, follow me,’ Jesus said, ‘and I will send you out to fish for people.’”',
        devotionText: 'Jesus did not recruit rabbis or elites. He chose rough-hewn fishermen at their boats. He calls ordinary people to an extraordinary Kingdom calling.',
        prayerFocus: 'Lord, make me willing to drop my nets and follow where You lead today.',
        completed: false
      }
    ]
  },
  {
    id: 'plan-proverbs',
    title: 'Proverbs: 31 Days of Wisdom',
    subtitle: 'A chapter a day for crystal-clear clarity in decisions and relationships',
    goalCategory: 'Daily Wisdom',
    totalDays: 31,
    durationLabel: '31 Days • 6 mins/day',
    coverGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    description: 'Practical, sharp, God-breathed street wisdom for your mouth, wallet, emotions, family, and work ethics. One proverb a day keeps foolishness away.',
    isEnrolled: false,
    days: [
      {
        dayNumber: 1,
        title: 'The Beginning of Knowledge',
        passageReference: 'Proverbs 1:1-7',
        keyVerse: '“The fear of the Lord is the beginning of knowledge, but fools despise wisdom and instruction.”',
        devotionText: 'The "fear of the Lord" is not cowering dread; it is reverent awe of who God is. When God is in His proper place, every other priority falls into balance.',
        prayerFocus: 'Lord, give me a teachable spirit that welcomes Your correction and wisdom.',
        completed: false
      },
      {
        dayNumber: 2,
        title: 'The Value of Seeking Wisdom',
        passageReference: 'Proverbs 2:1-11',
        keyVerse: '“For the Lord gives wisdom; from his mouth come knowledge and understanding.”',
        devotionText: 'Wisdom is not stumbling upon good luck; it is mining for hidden treasure. Those who hunger for divine perspective will find God shielding their integrity.',
        prayerFocus: 'Holy Spirit, grant me discernment to see beneath the surface in my decisions today.',
        completed: false
      },
      {
        dayNumber: 3,
        title: 'Trust with All Your Heart',
        passageReference: 'Proverbs 3:1-12',
        keyVerse: '“Trust in the Lord with all your heart and lean not on your own understanding.”',
        devotionText: 'Human logic is limited to what our eyes see today. God sees the end from the beginning. Surrendering our calculations to Him unlocks straight paths.',
        prayerFocus: 'I surrender my plans to You, Father. Direct my steps.',
        completed: false
      }
    ]
  },
  {
    id: 'plan-sermon-mount',
    title: 'Sermon on the Mount: Kingdom Living',
    subtitle: '7-Day intensive on Christ’s core manifesto for daily life',
    goalCategory: 'Kingdom Teachings',
    totalDays: 7,
    durationLabel: '7 Days • 7 mins/day',
    coverGradient: 'from-blue-600 via-cyan-600 to-teal-600',
    description: 'Walk through Matthew 5-7. Learn radical forgiveness, loving enemies, praying without hypocrisy, and building your life on the unshakeable rock.',
    isEnrolled: false,
    days: [
      {
        dayNumber: 1,
        title: 'The Upside-Down Kingdom',
        passageReference: 'Matthew 5:1-12',
        keyVerse: '“Blessed are the pure in heart, for they will see God.”',
        devotionText: 'The world crowns the proud, the ruthless, and the self-sufficient. Jesus crowns the merciful, the pure in heart, and the peacemakers.',
        prayerFocus: 'Jesus, re-align my ambitions with the eternal values of Your Kingdom.',
        completed: false
      },
      {
        dayNumber: 2,
        title: 'Salt, Light, and Heart Righteousness',
        passageReference: 'Matthew 5:13-26',
        keyVerse: '“Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.”',
        devotionText: 'Righteousness isn’t merely avoiding outward bad behavior; it is purifying inward motives and seeking swift reconciliation with our brothers and sisters.',
        prayerFocus: 'Lord, help me forgive anyone I harbor grievance against today.',
        completed: false
      }
    ]
  }
];
