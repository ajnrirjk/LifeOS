import { StudyUnit } from '../types';

export const STUDY_UNITS: StudyUnit[] = [
  {
    "id": "unit-1",
    "number": 1,
    "title": "The Pentateuch: Covenant Beginnings",
    "description": "Explore the foundations of faith: Creation, Abrahamic Covenant, Exodus redemption, and the Law at Sinai.",
    "themeColor": "from-emerald-500 to-teal-600",
    "bannerIcon": "Mountain",
    "milestoneBonusGems": 50,
    "lessons": [
      {
        "id": "u1-l1",
        "title": "Creation, Eden & The First Promise",
        "subtitle": "Genesis 1:1 - Genesis 3:15",
        "scriptureAnchor": "Genesis 1:1",
        "xpReward": 20,
        "questions": [
          {
            "id": "u1-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange the very first verse of the Bible in order:",
            "scriptureReference": "Genesis 1:1",
            "scriptureText": "In the beginning God created the heavens and the earth.",
            "scrambledWords": [
              "earth.",
              "God",
              "the",
              "beginning",
              "the",
              "In",
              "heavens",
              "created",
              "and"
            ],
            "correctSentence": [
              "In",
              "the",
              "beginning",
              "God",
              "created",
              "the",
              "heavens",
              "and",
              "the",
              "earth."
            ],
            "insightNote": "The Hebrew word for God here is \"Elohim\", the majestic plural signifying His supreme power and sovereignty.",
            "mascotTip": "Grace says: God existed before time began—He spoke the entire universe into existence!"
          },
          {
            "id": "u1-l1-q2",
            "type": "multiple-choice",
            "prompt": "According to Genesis 1:27, in whose image were human beings created?",
            "scriptureReference": "Genesis 1:27",
            "scriptureText": "“God created man in his own image. In God’s image he created him; male and female he created them.”",
            "options": [
              {
                "id": "a",
                "text": "In the image of angels and heavenly hosts",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "In the image of God Himself (Imago Dei)",
                "isCorrect": true,
                "explanation": "Every person carries sacred intrinsic dignity because we bear God’s likeness."
              },
              {
                "id": "c",
                "text": "In the likeness of earthly animals",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "In the image of stars and planets",
                "isCorrect": false
              }
            ],
            "insightNote": "The Latin phrase \"Imago Dei\" means every single human being has divine purpose and infinite worth.",
            "mascotTip": "You were custom-designed by the Creator with eternal dignity!"
          },
          {
            "id": "u1-l1-q3",
            "type": "fill-blank",
            "prompt": "Fill in the blank: In Genesis 3:15, known as the Protoevangelium, God promised that the seed of the woman would crush the serpent’s ________.",
            "scriptureReference": "Genesis 3:15",
            "scriptureText": "“I will put enmity between you and the woman, and between your offspring and her offspring. He will crush your head, and you will bruise his heel.”",
            "options": [
              {
                "id": "opt1",
                "text": "head",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "tail",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "claws",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "fangs",
                "isCorrect": false
              }
            ],
            "insightNote": "Genesis 3:15 is the earliest prophecy of Jesus Christ on the cross crushing Satan while having His heel bruised in suffering.",
            "mascotTip": "Even in Eden’s heartbreak, God had already prepared the Cross!"
          },
          {
            "id": "u1-l1-q4",
            "type": "match-pairs",
            "prompt": "Match the days of Creation with what God formed:",
            "scriptureReference": "Genesis 1:1-31",
            "scriptureText": "The Six Days of Creation",
            "pairs": [
              {
                "id": "p1",
                "left": "Day 1",
                "right": "Light Separated from Darkness"
              },
              {
                "id": "p2",
                "left": "Day 3",
                "right": "Dry Land & Lush Vegetation"
              },
              {
                "id": "p3",
                "left": "Day 4",
                "right": "Sun, Moon, and Stars"
              },
              {
                "id": "p4",
                "left": "Day 6",
                "right": "Land Animals & Humanity"
              }
            ],
            "insightNote": "God brought cosmos out of chaos, speaking order, light, and life.",
            "mascotTip": "Connect each left day to its matching creative work!"
          },
          {
            "id": "u1-l1-q5",
            "type": "true-false",
            "prompt": "True or False: On the seventh day, God rested because He was tired and exhausted from work.",
            "scriptureReference": "Genesis 2:2-3",
            "scriptureText": "“On the seventh day God finished his work which he had made; and he rested on the seventh day from all his work.”",
            "correctBoolean": false,
            "insightNote": "God never grows weary (Isaiah 40:28). He rested to celebrate completeness and establish the Sabbath rhythm of delight for us.",
            "mascotTip": "Sabbath rest is not recovery from weakness—it is celebration of God’s provision!"
          }
        ]
      },
      {
        "id": "u1-l2",
        "title": "The Abrahamic Covenant & Faith",
        "subtitle": "Genesis 12:1-3 & Genesis 15:1-6",
        "scriptureAnchor": "Genesis 15:6",
        "xpReward": 20,
        "questions": [
          {
            "id": "u1-l2-q1",
            "type": "word-scramble",
            "prompt": "Arrange the core scripture on Abraham’s justifying faith:",
            "scriptureReference": "Genesis 15:6",
            "scriptureText": "Abram believed the Lord, and he credited it to him as righteousness.",
            "scrambledWords": [
              "Lord,",
              "Abram",
              "credited",
              "believed",
              "righteousness.",
              "as",
              "to",
              "it",
              "him",
              "and",
              "he",
              "the"
            ],
            "correctSentence": [
              "Abram",
              "believed",
              "the",
              "Lord,",
              "and",
              "he",
              "credited",
              "it",
              "to",
              "him",
              "as",
              "righteousness."
            ],
            "insightNote": "The apostle Paul cites Genesis 15:6 in Romans 4 to prove that salvation has always been by faith, not human works.",
            "mascotTip": "Faith is taking God at His Word before the promise is seen!"
          },
          {
            "id": "u1-l2-q2",
            "type": "multiple-choice",
            "prompt": "What did God promise to Abraham when calling him to leave Haran in Genesis 12?",
            "scriptureReference": "Genesis 12:2-3",
            "scriptureText": "“I will make of you a great nation. I will bless you and make your name great... and all the families of the earth will be blessed through you.”",
            "options": [
              {
                "id": "a",
                "text": "All families of the earth will be blessed through him",
                "isCorrect": true,
                "explanation": "This ultimate blessing was fulfilled through Jesus Christ, the Son of Abraham."
              },
              {
                "id": "b",
                "text": "He would never face any family conflicts",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "He would become the Pharaoh of Egypt",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "He would construct an impenetrable fortress city",
                "isCorrect": false
              }
            ],
            "insightNote": "Through Abraham’s line, the Messiah was born to bring salvation to all tribes, languages, and nations.",
            "mascotTip": "God blesses us so that we may be a channel of blessing to others."
          },
          {
            "id": "u1-l2-q3",
            "type": "fill-blank",
            "prompt": "God told Abraham to look up at the night sky and count the ________, saying, “So shall your offspring be.”",
            "scriptureReference": "Genesis 15:5",
            "scriptureText": "“Look now toward the sky, and count the stars, if you are able to count them... So your offspring will be.”",
            "options": [
              {
                "id": "opt1",
                "text": "stars",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "clouds",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "mountains",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "birds",
                "isCorrect": false
              }
            ],
            "insightNote": "Abraham was elderly and childless, yet he dared to trust God’s cosmic promise.",
            "mascotTip": "When your situation looks impossible, look up at the stars and remember God’s promises!"
          }
        ]
      },
      {
        "id": "u1-l3",
        "title": "The Exodus & The Shema",
        "subtitle": "Exodus 14:14, 20:1-17 & Deuteronomy 6:4-5",
        "scriptureAnchor": "Deuteronomy 6:5",
        "xpReward": 25,
        "questions": [
          {
            "id": "u1-l3-q1",
            "type": "word-scramble",
            "prompt": "Arrange the Great Commandment (The Shema) in Deuteronomy 6:5:",
            "scriptureReference": "Deuteronomy 6:5",
            "scriptureText": "Love the Lord your God with all your heart",
            "scrambledWords": [
              "your",
              "heart",
              "Love",
              "Lord",
              "with",
              "the",
              "God",
              "your",
              "all"
            ],
            "correctSentence": [
              "Love",
              "the",
              "Lord",
              "your",
              "God",
              "with",
              "all",
              "your",
              "heart"
            ],
            "insightNote": "Known as the Shema (\"Hear\"), this declaration is the foundational confession of biblical monotheism and devotion.",
            "mascotTip": "Jesus called this the greatest commandment in the whole law!"
          },
          {
            "id": "u1-l3-q2",
            "type": "multiple-choice",
            "prompt": "When trapped between Pharaoh’s army and the Red Sea, what did Moses tell the people of Israel?",
            "scriptureReference": "Exodus 14:14",
            "scriptureText": "“The Lord will fight for you; you need only to be still.”",
            "options": [
              {
                "id": "a",
                "text": "“Surrender immediately and return to slavery”",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "“The Lord will fight for you; you need only to be still”",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "“Swim across the deep waters on your own power”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“Build boats from the desert trees”",
                "isCorrect": false
              }
            ],
            "insightNote": "Deliverance is entirely of the Lord. When there is no human way forward, God splits the sea.",
            "mascotTip": "Be still—the battle belongs to God, not your anxiety!"
          },
          {
            "id": "u1-l3-q3",
            "type": "match-pairs",
            "prompt": "Match the Ten Commandments with their spiritual principles:",
            "scriptureReference": "Exodus 20:1-17",
            "scriptureText": "The Ten Commandments (Decalogue)",
            "pairs": [
              {
                "id": "p1",
                "left": "You shall have no other gods",
                "right": "Single-Hearted Devotion to Yahweh"
              },
              {
                "id": "p2",
                "left": "Remember the Sabbath day",
                "right": "Rhythm of Rest and Holy Worship"
              },
              {
                "id": "p3",
                "left": "Honor your father and mother",
                "right": "First Commandment with a Promise"
              },
              {
                "id": "p4",
                "left": "You shall not bear false witness",
                "right": "Truthfulness and Integrity"
              }
            ],
            "insightNote": "The first 4 commandments guide our relationship with God; the remaining 6 govern love for neighbor.",
            "mascotTip": "The Law shows us God’s holy standard and our need for His grace."
          }
        ]
      }
    ]
  },
  {
    "id": "unit-2",
    "number": 2,
    "title": "The Historical Books: Promised Land & Kings",
    "description": "Walk through Joshua, Judges, Ruth, David’s Kingdom, Solomon’s Temple, and the courage of Esther.",
    "themeColor": "from-blue-600 to-indigo-700",
    "bannerIcon": "Shield",
    "milestoneBonusGems": 60,
    "lessons": [
      {
        "id": "u2-l1",
        "title": "Courage at Jericho & Joshua’s Charge",
        "subtitle": "Joshua 1:7-9 & Joshua 24:15",
        "scriptureAnchor": "Joshua 1:9",
        "xpReward": 25,
        "questions": [
          {
            "id": "u2-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange God’s command of courage to Joshua:",
            "scriptureReference": "Joshua 1:9",
            "scriptureText": "Be strong and courageous do not be afraid",
            "scrambledWords": [
              "afraid",
              "strong",
              "courageous",
              "not",
              "and",
              "do",
              "Be",
              "be"
            ],
            "correctSentence": [
              "Be",
              "strong",
              "and",
              "courageous",
              "do",
              "not",
              "be",
              "afraid"
            ],
            "insightNote": "Joshua’s courage was not based on military strength, but on God’s unfailing presence: \"for the Lord your God will be with you wherever you go.\"",
            "mascotTip": "Courage is not the absence of fear—it is trusting God in the face of fear!"
          },
          {
            "id": "u2-l1-q2",
            "type": "multiple-choice",
            "prompt": "In Joshua 24:15, what unforgettable declaration did Joshua make before all the tribes of Israel?",
            "scriptureReference": "Joshua 24:15",
            "scriptureText": "“As for me and my house, we will serve the Lord.”",
            "options": [
              {
                "id": "a",
                "text": "“Let every tribe worship whatever gods they choose in private”",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "“As for me and my house, we will serve the Lord”",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "“We shall build a kingdom wealthier than Egypt”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“Our armies will conquer all the kingdoms of the earth”",
                "isCorrect": false
              }
            ],
            "insightNote": "Joshua demanded a clear decision: indecisive syncretism is spiritual adultery.",
            "mascotTip": "Anchor your household on serving the Lord!"
          },
          {
            "id": "u2-l1-q3",
            "type": "fill-blank",
            "prompt": "How did the fortified walls of Jericho fall on the seventh day?",
            "scriptureReference": "Joshua 6:20",
            "scriptureText": "“When the people heard the sound of the trumpet, they shouted with a great shout, and the wall fell down flat...”",
            "options": [
              {
                "id": "opt1",
                "text": "shouted with a great shout",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "fired catapults and flaming arrows",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "dug tunnels beneath the stone towers",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "bribed the guards of the city gates",
                "isCorrect": false
              }
            ],
            "insightNote": "God dismantled Jericho through obedient worship and praise, revealing that victory belongs to Him alone.",
            "mascotTip": "Praise brings down spiritual strongholds!"
          }
        ]
      },
      {
        "id": "u2-l2",
        "title": "David, The Giant & The Eternal Throne",
        "subtitle": "1 Samuel 17:45-47 & 2 Samuel 7:12-16",
        "scriptureAnchor": "1 Samuel 17:45",
        "xpReward": 25,
        "questions": [
          {
            "id": "u2-l2-q1",
            "type": "multiple-choice",
            "prompt": "What did young David proclaim to Goliath before slaying him with a sling and stone?",
            "scriptureReference": "1 Samuel 17:45",
            "scriptureText": "“You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty...”",
            "options": [
              {
                "id": "a",
                "text": "“I come against you in the name of the Lord Almighty, the God of the armies of Israel”",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "“I have superior agility and armor from King Saul”",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "“Let us negotiate a treaty between Philistia and Judah”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“My brothers are backing me with chariots”",
                "isCorrect": false
              }
            ],
            "insightNote": "David’s confidence was completely in the honor of God’s name, not physical weaponry.",
            "mascotTip": "Your giants are no match for God’s greatness!"
          },
          {
            "id": "u2-l2-q2",
            "type": "word-scramble",
            "prompt": "Arrange David’s great declaration of the battle in 1 Samuel 17:47:",
            "scriptureReference": "1 Samuel 17:47",
            "scriptureText": "The battle is the Lord’s and he will give you into our hands",
            "scrambledWords": [
              "hands",
              "give",
              "the",
              "Lord’s",
              "will",
              "battle",
              "The",
              "he",
              "and",
              "you",
              "into",
              "our",
              "is"
            ],
            "correctSentence": [
              "The",
              "battle",
              "is",
              "the",
              "Lord’s",
              "and",
              "he",
              "will",
              "give",
              "you",
              "into",
              "our",
              "hands"
            ],
            "insightNote": "The Davidic Covenant in 2 Samuel 7 promises that a descendant of David (Jesus Christ) would reign on an eternal throne.",
            "mascotTip": "Surrender the fight: the battle is the Lord’s!"
          },
          {
            "id": "u2-l2-q3",
            "type": "true-false",
            "prompt": "True or False: God chose David as king because he was the tallest and most physically imposing of Jesse’s sons.",
            "scriptureReference": "1 Samuel 16:7",
            "scriptureText": "“The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.”",
            "correctBoolean": false,
            "insightNote": "Human eyes value stature and appearance; God seeks a heart surrendered to Him.",
            "mascotTip": "God sees your heart when the world only grades your surface!"
          }
        ]
      },
      {
        "id": "u2-l3",
        "title": "Exile, Queen Esther & Nehemiah’s Joy",
        "subtitle": "Esther 4:14 & Nehemiah 8:10",
        "scriptureAnchor": "Esther 4:14",
        "xpReward": 25,
        "questions": [
          {
            "id": "u2-l3-q1",
            "type": "multiple-choice",
            "prompt": "What did Mordecai challenge Queen Esther with when the Jewish people faced extermination?",
            "scriptureReference": "Esther 4:14",
            "scriptureText": "“And who knows but that you have come to your royal position for such a time as this?”",
            "options": [
              {
                "id": "a",
                "text": "“Who knows but that you have come to your royal position for such a time as this?”",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "“Flee secretly across the mountains to Babylon”",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "“Do nothing, for the king cannot be questioned”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“Accumulate gold to buy favor from Haman”",
                "isCorrect": false
              }
            ],
            "insightNote": "God’s providence orchestrates our moments, positions, and opportunities for kingdom purposes.",
            "mascotTip": "God placed you right where you are for such a time as this!"
          },
          {
            "id": "u2-l3-q2",
            "type": "word-scramble",
            "prompt": "Arrange Nehemiah’s famous exhortation to the weeping remnant:",
            "scriptureReference": "Nehemiah 8:10",
            "scriptureText": "The joy of the Lord is your strength",
            "scrambledWords": [
              "strength",
              "is",
              "your",
              "Lord",
              "The",
              "of",
              "joy",
              "the"
            ],
            "correctSentence": [
              "The",
              "joy",
              "of",
              "the",
              "Lord",
              "is",
              "your",
              "strength"
            ],
            "insightNote": "Biblical joy is not superficial happiness based on easy circumstances; it is supernatural strength rooted in God’s redemption.",
            "mascotTip": "His joy is your fortress!"
          }
        ]
      }
    ]
  },
  {
    "id": "unit-3",
    "number": 3,
    "title": "Poetry & Wisdom Literature: Psalms & Proverbs",
    "description": "Dive deep into Job’s redemption, David’s shepherd songs, Proverbs of understanding, and seasons of life.",
    "themeColor": "from-purple-600 to-violet-700",
    "bannerIcon": "Compass",
    "milestoneBonusGems": 70,
    "lessons": [
      {
        "id": "u3-l1",
        "title": "The Shepherd Psalm & Praises of David",
        "subtitle": "Psalm 23:1-6 & Psalm 103:1-5",
        "scriptureAnchor": "Psalm 23:1",
        "xpReward": 25,
        "questions": [
          {
            "id": "u3-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange the world’s most beloved psalm opening:",
            "scriptureReference": "Psalm 23:1",
            "scriptureText": "The Lord is my shepherd I lack nothing",
            "scrambledWords": [
              "nothing",
              "is",
              "my",
              "shepherd",
              "The",
              "I",
              "Lord",
              "lack"
            ],
            "correctSentence": [
              "The",
              "Lord",
              "is",
              "my",
              "shepherd",
              "I",
              "lack",
              "nothing"
            ],
            "insightNote": "Because the sovereign God is our personal Shepherd (\"Yahweh Roi\"), our spiritual and eternal needs are abundantly supplied.",
            "mascotTip": "When the Lord leads, contentment follows!"
          },
          {
            "id": "u3-l1-q2",
            "type": "multiple-choice",
            "prompt": "According to Psalm 23:4, why does the psalmist fear no evil even in the valley of the shadow of death?",
            "scriptureReference": "Psalm 23:4",
            "scriptureText": "“Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.”",
            "options": [
              {
                "id": "a",
                "text": "Because he possesses powerful chariots",
                "isCorrect": false
              },
              {
                "id": "b",
                "text": "Because You are with me; your rod and your staff comfort me",
                "isCorrect": true
              },
              {
                "id": "c",
                "text": "Because the shadow of death is only an illusion",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Because he took a shortcut around the valley",
                "isCorrect": false
              }
            ],
            "insightNote": "Notice the shift in pronoun: David switches from talking ABOUT God (\"He leads me\") to talking TO God (\"You are with me\") in the valley.",
            "mascotTip": "In the dark valley, God draws closer than ever."
          },
          {
            "id": "u3-l1-q3",
            "type": "match-pairs",
            "prompt": "Match the Psalm 103 benefits with their descriptions:",
            "scriptureReference": "Psalm 103:2-5",
            "scriptureText": "Praise the Lord, O my soul, and forget not all his benefits",
            "pairs": [
              {
                "id": "p1",
                "left": "Forgives all iniquities",
                "right": "Pardon from Guilt and Sin"
              },
              {
                "id": "p2",
                "left": "Heals all diseases",
                "right": "Divine Restoration & Wholeness"
              },
              {
                "id": "p3",
                "left": "Crowns with lovingkindness",
                "right": "Covenant Hesed & Tender Mercies"
              },
              {
                "id": "p4",
                "left": "Renews your youth",
                "right": "Soaring Like the Eagles"
              }
            ],
            "insightNote": "\"Hesed\" is God’s faithful covenant love that never lets go.",
            "mascotTip": "Remind your soul of all God’s benefits today!"
          }
        ]
      },
      {
        "id": "u3-l2",
        "title": "Proverbs of Guidance & Seasons of Life",
        "subtitle": "Proverbs 3:5-6 & Ecclesiastes 3:1-8",
        "scriptureAnchor": "Proverbs 3:5",
        "xpReward": 25,
        "questions": [
          {
            "id": "u3-l2-q1",
            "type": "word-scramble",
            "prompt": "Arrange this bedrock proverb on total reliance:",
            "scriptureReference": "Proverbs 3:5",
            "scriptureText": "Trust in the Lord with all your heart",
            "scrambledWords": [
              "your",
              "Trust",
              "Lord",
              "heart",
              "with",
              "all",
              "in",
              "the"
            ],
            "correctSentence": [
              "Trust",
              "in",
              "the",
              "Lord",
              "with",
              "all",
              "your",
              "heart"
            ],
            "insightNote": "The Hebrew word for trust is \"Batach\", conveying leaning your entire weight upon a secure boulder.",
            "mascotTip": "Lean on God, not your fragile human assumptions!"
          },
          {
            "id": "u3-l2-q2",
            "type": "fill-blank",
            "prompt": "“In all your ways acknowledge him, and he will make your ________ straight.”",
            "scriptureReference": "Proverbs 3:6",
            "scriptureText": "“In all your ways acknowledge him, and he will make straight your paths.”",
            "options": [
              {
                "id": "opt1",
                "text": "paths",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "fortunes",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "dreams",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "chariots",
                "isCorrect": false
              }
            ],
            "insightNote": "Acknowledging God in every decision clears away the obstacles and aligns our steps with His wisdom.",
            "mascotTip": "Submit your plans to Him and watch Him direct your steps."
          },
          {
            "id": "u3-l2-q3",
            "type": "multiple-choice",
            "prompt": "According to Ecclesiastes 3:11, what has God set in the human heart?",
            "scriptureReference": "Ecclesiastes 3:11",
            "scriptureText": "“He has made everything beautiful in its time. He has also set eternity in the human heart...”",
            "options": [
              {
                "id": "a",
                "text": "Eternity (an innate longing for the eternal God)",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "A love for temporary silver and gold",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "Fear of earthly mortality only",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Forgetfulness of all former things",
                "isCorrect": false
              }
            ],
            "insightNote": "Earthly possessions cannot satisfy the human soul because God wired our hearts for eternity with Him.",
            "mascotTip": "Only an eternal God can satisfy a heart built for eternity!"
          }
        ]
      },
      {
        "id": "u3-l3",
        "title": "Job: Sovereignty, Redeemer & Steadfastness",
        "subtitle": "Job 19:25-27 & Job 38:1-7",
        "scriptureAnchor": "Job 19:25",
        "xpReward": 30,
        "questions": [
          {
            "id": "u3-l3-q1",
            "type": "word-scramble",
            "prompt": "Arrange Job’s triumphant declaration amidst his deepest agony:",
            "scriptureReference": "Job 19:25",
            "scriptureText": "I know that my Redeemer lives",
            "scrambledWords": [
              "lives",
              "my",
              "that",
              "know",
              "Redeemer",
              "I"
            ],
            "correctSentence": [
              "I",
              "know",
              "that",
              "my",
              "Redeemer",
              "lives"
            ],
            "insightNote": "Job points forward to Christ as the living \"Go’el\" (Kinsman-Redeemer) who will vindicate and raise the redeemed at the last day.",
            "mascotTip": "Even when everything is stripped away, your Redeemer lives!"
          },
          {
            "id": "u3-l3-q2",
            "type": "true-false",
            "prompt": "True or False: In Job 38-41, God answered Job’s questions by giving him an exhaustive theological checklist of why he suffered.",
            "scriptureReference": "Job 38:4",
            "scriptureText": "“Where were you when I laid the foundations of the earth? Tell me, if you understand.”",
            "correctBoolean": false,
            "insightNote": "God did not explain all the cosmic reasons; instead, He revealed His majestic character and boundless wisdom, showing Job that God can be trusted.",
            "mascotTip": "When you can’t trace God’s hand, trust His heart."
          }
        ]
      }
    ]
  },
  {
    "id": "unit-4",
    "number": 4,
    "title": "The Prophets: Messianic Hope & The New Covenant",
    "description": "Listen to the ancient voices of Isaiah, Jeremiah, Daniel, and the Minor Prophets proclaiming Christ and justice.",
    "themeColor": "from-amber-500 to-orange-600",
    "bannerIcon": "Flame",
    "milestoneBonusGems": 80,
    "lessons": [
      {
        "id": "u4-l1",
        "title": "Isaiah: The Prince of Peace & Suffering Servant",
        "subtitle": "Isaiah 9:6 & Isaiah 53:3-6",
        "scriptureAnchor": "Isaiah 53:5",
        "xpReward": 30,
        "questions": [
          {
            "id": "u4-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange the prophecy of Christ’s substitutionary atonement in Isaiah 53:5:",
            "scriptureReference": "Isaiah 53:5",
            "scriptureText": "By his wounds we are healed",
            "scrambledWords": [
              "healed",
              "wounds",
              "we",
              "are",
              "his",
              "By"
            ],
            "correctSentence": [
              "By",
              "his",
              "wounds",
              "we",
              "are",
              "healed"
            ],
            "insightNote": "Written 700 years before Christ, Isaiah 53 accurately describes crucifixion and Jesus bearing the penalty for our transgressions.",
            "mascotTip": "He took the blows that belonged to us and gave us His peace!"
          },
          {
            "id": "u4-l1-q2",
            "type": "match-pairs",
            "prompt": "Match the four divine royal titles in Isaiah 9:6 with their meaning:",
            "scriptureReference": "Isaiah 9:6",
            "scriptureText": "“For unto us a child is born, unto us a son is given...”",
            "pairs": [
              {
                "id": "p1",
                "left": "Wonderful Counselor",
                "right": "Supernatural Wisdom & Direction"
              },
              {
                "id": "p2",
                "left": "Mighty God",
                "right": "Divine Omnipotence & Strength"
              },
              {
                "id": "p3",
                "left": "Everlasting Father",
                "right": "Eternal Tender Protector"
              },
              {
                "id": "p4",
                "left": "Prince of Peace",
                "right": "Bringer of Heavenly Shalom"
              }
            ],
            "insightNote": "Christ is the ultimate fulfillment of all four titles, ruling with justice and righteousness forever.",
            "mascotTip": "He is your Wonderful Counselor when decisions are tough!"
          },
          {
            "id": "u4-l1-q3",
            "type": "fill-blank",
            "prompt": "“Those who wait upon the Lord shall renew their ________; they shall mount up with wings like eagles.”",
            "scriptureReference": "Isaiah 40:31",
            "scriptureText": "“Those who hope in the Lord will renew their strength. They will soar on wings like eagles...”",
            "options": [
              {
                "id": "opt1",
                "text": "strength",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "riches",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "weapons",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "pride",
                "isCorrect": false
              }
            ],
            "insightNote": "Waiting on the Lord is an active posture of expectant trust, trading human exhaustion for divine energy.",
            "mascotTip": "Exchange your fatigue for His supernatural strength today!"
          }
        ]
      },
      {
        "id": "u4-l2",
        "title": "Jeremiah: The New Covenant on the Heart",
        "subtitle": "Jeremiah 31:31-34 & Jeremiah 29:11",
        "scriptureAnchor": "Jeremiah 31:33",
        "xpReward": 30,
        "questions": [
          {
            "id": "u4-l2-q1",
            "type": "multiple-choice",
            "prompt": "How did God say the New Covenant would differ from the Old Covenant in Jeremiah 31:33?",
            "scriptureReference": "Jeremiah 31:33",
            "scriptureText": "“I will put my law in their minds and write it on their hearts. I will be their God, and they will be my people.”",
            "options": [
              {
                "id": "a",
                "text": "He would write His law on their hearts and minds, not merely on stone tablets",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "He would require twice as many animal sacrifices",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "He would abolish all moral standards completely",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "He would only bless those living inside Jerusalem’s walls",
                "isCorrect": false
              }
            ],
            "insightNote": "Through the Holy Spirit, the New Covenant produces internal transformation from the inside out.",
            "mascotTip": "Grace doesn’t just show us God’s law—it puts the love of it into our hearts!"
          },
          {
            "id": "u4-l2-q2",
            "type": "word-scramble",
            "prompt": "Arrange God’s famous promise to the exiles in Jeremiah 29:11:",
            "scriptureReference": "Jeremiah 29:11",
            "scriptureText": "Plans to prosper you and not to harm you plans to give you hope and a future",
            "scrambledWords": [
              "you",
              "future",
              "hope",
              "harm",
              "prosper",
              "not",
              "Plans",
              "and",
              "plans",
              "to",
              "give",
              "a",
              "to",
              "and",
              "you"
            ],
            "correctSentence": [
              "Plans",
              "to",
              "prosper",
              "you",
              "and",
              "not",
              "to",
              "harm",
              "you",
              "plans",
              "to",
              "give",
              "you",
              "hope",
              "and",
              "a",
              "future"
            ],
            "insightNote": "God gave this promise to people facing a 70-year exile, showing that His sovereignty oversees our darkest valleys.",
            "mascotTip": "God’s plans for you are filled with hope and purpose!"
          }
        ]
      },
      {
        "id": "u4-l3",
        "title": "Daniel in Babylon & Prophetic Justice",
        "subtitle": "Daniel 3:17-18 & Micah 6:8",
        "scriptureAnchor": "Micah 6:8",
        "xpReward": 30,
        "questions": [
          {
            "id": "u4-l3-q1",
            "type": "multiple-choice",
            "prompt": "What did Shadrach, Meshach, and Abednego tell Nebuchadnezzar when threatened with the fiery furnace?",
            "scriptureReference": "Daniel 3:17-18",
            "scriptureText": "“Our God is able to deliver us... But even if he does not, we will not serve your gods or worship the golden image.”",
            "options": [
              {
                "id": "a",
                "text": "“Even if He does not deliver us, we will not bow down or serve your gods”",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "“We will bow down only for 5 seconds to stay alive”",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "“We will convert to Babylonian polytheism”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“Our God will guarantee that we never suffer”",
                "isCorrect": false
              }
            ],
            "insightNote": "Their faith was unconditional: \"even if He does not\", their loyalty to God remained unshakable.",
            "mascotTip": "Authentic faith loves God for who He is, not just what He does!"
          },
          {
            "id": "u4-l3-q2",
            "type": "word-scramble",
            "prompt": "Arrange Micah’s famous summary of true worship in Micah 6:8:",
            "scriptureReference": "Micah 6:8",
            "scriptureText": "Act justly love mercy and walk humbly with your God",
            "scrambledWords": [
              "mercy",
              "humbly",
              "and",
              "justly",
              "Act",
              "walk",
              "with",
              "your",
              "love",
              "God"
            ],
            "correctSentence": [
              "Act",
              "justly",
              "love",
              "mercy",
              "and",
              "walk",
              "humbly",
              "with",
              "your",
              "God"
            ],
            "insightNote": "God values a heart of justice, compassion, and humble fellowship far more than external religious rituals.",
            "mascotTip": "Live out justice, cherish mercy, and walk humbly today!"
          }
        ]
      }
    ]
  },
  {
    "id": "unit-5",
    "number": 5,
    "title": "The Gospels & Acts: Christ & The Early Church",
    "description": "Witness the arrival of the Messiah: Sermon on the Mount, Kingdom Parables, The Cross, Resurrection & Pentecost.",
    "themeColor": "from-rose-500 to-pink-600",
    "bannerIcon": "Sun",
    "milestoneBonusGems": 90,
    "lessons": [
      {
        "id": "u5-l1",
        "title": "The Beatitudes & Salt of the Earth",
        "subtitle": "Matthew 5:3-16 & Matthew 6:33",
        "scriptureAnchor": "Matthew 5:14",
        "xpReward": 30,
        "questions": [
          {
            "id": "u5-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange Jesus’s famous declaration to His followers:",
            "scriptureReference": "Matthew 5:14",
            "scriptureText": "You are the light of the world",
            "scrambledWords": [
              "world",
              "light",
              "the",
              "are",
              "You",
              "of",
              "the"
            ],
            "correctSentence": [
              "You",
              "are",
              "the",
              "light",
              "of",
              "the",
              "world"
            ],
            "insightNote": "Light by nature expels darkness. Believers are called not to hide in fear, but shine brightly with good works.",
            "mascotTip": "A city built on a hill cannot be hidden!"
          },
          {
            "id": "u5-l1-q2",
            "type": "multiple-choice",
            "prompt": "In Matthew 6:33, what did Jesus tell us to seek first above all worries of food and clothing?",
            "scriptureReference": "Matthew 6:33",
            "scriptureText": "“But seek first his kingdom and his righteousness, and all these things will be given to you as well.”",
            "options": [
              {
                "id": "a",
                "text": "His kingdom and his righteousness",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "Prestige in the Roman court",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "Storing up immense grain in private barns",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Winning arguments with the religious leaders",
                "isCorrect": false
              }
            ],
            "insightNote": "When Kingdom priorities are first, God supernaturally orders and provides for all our earthly needs.",
            "mascotTip": "Put God first, and everything else falls into place!"
          },
          {
            "id": "u5-l1-q3",
            "type": "match-pairs",
            "prompt": "Match each Beatitude with its Kingdom reward:",
            "scriptureReference": "Matthew 5:3-9",
            "scriptureText": "The Beatitudes and their divine promises",
            "pairs": [
              {
                "id": "p1",
                "left": "The Peacemakers",
                "right": "Called Children of God"
              },
              {
                "id": "p2",
                "left": "The Pure in Heart",
                "right": "They Shall See God"
              },
              {
                "id": "p3",
                "left": "Those Who Mourn",
                "right": "They Shall Be Comforted"
              },
              {
                "id": "p4",
                "left": "Hunger for Righteousness",
                "right": "They Shall Be Filled"
              }
            ],
            "insightNote": "Jesus flips the values of worldly kingdoms upside down.",
            "mascotTip": "Blessed are those whose satisfaction is found in God alone!"
          }
        ]
      },
      {
        "id": "u5-l2",
        "title": "Parables of Grace & The Prodigal Son",
        "subtitle": "Luke 15:11-32 & John 10:11-15",
        "scriptureAnchor": "Luke 15:20",
        "xpReward": 30,
        "questions": [
          {
            "id": "u5-l2-q1",
            "type": "multiple-choice",
            "prompt": "When the prodigal son was still far off, what did his father do?",
            "scriptureReference": "Luke 15:20",
            "scriptureText": "“While he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him.”",
            "options": [
              {
                "id": "a",
                "text": "Ran to him, threw his arms around him, and kissed him",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "Locked the front door and made him sleep in the field",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "Demanded he pay back all squandered money before entering",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Sent guards to escort him into prison",
                "isCorrect": false
              }
            ],
            "insightNote": "In Middle Eastern culture, an elderly patriarch never ran because it was considered undignified. The father cast aside all dignity to embrace his broken son.",
            "mascotTip": "God runs to embrace you with open arms!"
          },
          {
            "id": "u5-l2-q2",
            "type": "word-scramble",
            "prompt": "Arrange Jesus’s declaration in John 10:11:",
            "scriptureReference": "John 10:11",
            "scriptureText": "I am the good shepherd the good shepherd lays down his life for the sheep",
            "scrambledWords": [
              "sheep",
              "down",
              "for",
              "shepherd",
              "life",
              "his",
              "good",
              "lays",
              "the",
              "good",
              "shepherd",
              "am",
              "The",
              "I"
            ],
            "correctSentence": [
              "I",
              "am",
              "the",
              "good",
              "shepherd",
              "the",
              "good",
              "shepherd",
              "lays",
              "down",
              "his",
              "life",
              "for",
              "the",
              "sheep"
            ],
            "insightNote": "Unlike hired hands who flee in danger, Jesus willfully sacrificed His life on the cross to rescue His flock.",
            "mascotTip": "You belong to a Shepherd who laid down His life for you!"
          }
        ]
      },
      {
        "id": "u5-l3",
        "title": "The Cross, Resurrection & Pentecost",
        "subtitle": "John 19:30, Matthew 28:19-20 & Acts 2:1-4",
        "scriptureAnchor": "Matthew 28:19",
        "xpReward": 35,
        "questions": [
          {
            "id": "u5-l3-q1",
            "type": "word-scramble",
            "prompt": "Arrange Jesus’s victory cry on the Cross:",
            "scriptureReference": "John 19:30",
            "scriptureText": "It is finished",
            "scrambledWords": [
              "finished",
              "is",
              "It"
            ],
            "correctSentence": [
              "It",
              "is",
              "finished"
            ],
            "insightNote": "In Greek, \"Tetelestai\" was stamped on debt certificates when paid in full. Jesus wiped out our sin debt forever.",
            "mascotTip": "Your salvation is fully finished—nothing can be added to Christ’s finished work!"
          },
          {
            "id": "u5-l3-q2",
            "type": "multiple-choice",
            "prompt": "In the Great Commission (Matthew 28:19-20), what promise did the risen Jesus leave with His disciples?",
            "scriptureReference": "Matthew 28:20",
            "scriptureText": "“And surely I am with you always, to the very end of the age.”",
            "options": [
              {
                "id": "a",
                "text": "“And surely I am with you always, to the very end of the age”",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "“You will never experience any earthly opposition”",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "“Stay confined within the city of Jerusalem forever”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“Only preach to people who already agree with you”",
                "isCorrect": false
              }
            ],
            "insightNote": "We go into all the world not on our own strength, but in the authority and abiding presence of Christ.",
            "mascotTip": "Wherever you go, Jesus is right there with you!"
          },
          {
            "id": "u5-l3-q3",
            "type": "true-false",
            "prompt": "True or False: At Pentecost (Acts 2), the Holy Spirit was poured out, empowering the early believers to be bold witnesses of Christ across all languages.",
            "scriptureReference": "Acts 2:1-4",
            "scriptureText": "“All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.”",
            "correctBoolean": true,
            "insightNote": "Pentecost reversed the curse of Babel, uniting people of every tongue in the praise of God’s mighty deeds.",
            "mascotTip": "The same Holy Spirit lives in every believer today!"
          }
        ]
      }
    ]
  },
  {
    "id": "unit-6",
    "number": 6,
    "title": "The Epistles & Revelation: The Triumphant King",
    "description": "Explore Pauline theology, Christian warfare, living faith, and the glorious return of King Jesus in Revelation.",
    "themeColor": "from-cyan-500 to-blue-600",
    "bannerIcon": "Crown",
    "milestoneBonusGems": 100,
    "lessons": [
      {
        "id": "u6-l1",
        "title": "Romans: More Than Conquerors",
        "subtitle": "Romans 8:28-39 & Galatians 5:22-23",
        "scriptureAnchor": "Romans 8:37",
        "xpReward": 35,
        "questions": [
          {
            "id": "u6-l1-q1",
            "type": "word-scramble",
            "prompt": "Arrange Paul’s glorious declaration in Romans 8:37:",
            "scriptureReference": "Romans 8:37",
            "scriptureText": "In all these things we are more than conquerors through him who loved us",
            "scrambledWords": [
              "loved",
              "who",
              "conquerors",
              "him",
              "more",
              "these",
              "are",
              "we",
              "In",
              "through",
              "us",
              "all",
              "than",
              "things"
            ],
            "correctSentence": [
              "In",
              "all",
              "these",
              "things",
              "we",
              "are",
              "more",
              "than",
              "conquerors",
              "through",
              "him",
              "who",
              "loved",
              "us"
            ],
            "insightNote": "The Greek word is \"Hypernikomen\" (super-conquerors). We don’t just barely scrape by; Christ’s victory guarantees our ultimate triumph.",
            "mascotTip": "Nothing in all creation can separate you from God’s love in Christ!"
          },
          {
            "id": "u6-l1-q2",
            "type": "multiple-choice",
            "prompt": "What promise does Romans 8:28 give to believers in the midst of trials and suffering?",
            "scriptureReference": "Romans 8:28",
            "scriptureText": "“And we know that in all things God works for the good of those who love him, who have been called according to his purpose.”",
            "options": [
              {
                "id": "a",
                "text": "God works all things together for the good of those who love Him",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "Bad things will never happen to faithful people",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "Everything is determined by random chance and luck",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Pain is meaningless and accomplishes nothing",
                "isCorrect": false
              }
            ],
            "insightNote": "God doesn’t call all things good, but He weaves even hardships into His redemptive master plan.",
            "mascotTip": "God can take what was meant for harm and weave it for your ultimate good."
          },
          {
            "id": "u6-l1-q3",
            "type": "match-pairs",
            "prompt": "Match the Fruit of the Spirit in Galatians 5:22-23 with their manifestations:",
            "scriptureReference": "Galatians 5:22-23",
            "scriptureText": "The Fruit of the Spirit is love, joy, peace, patience...",
            "pairs": [
              {
                "id": "p1",
                "left": "Peace",
                "right": "Inner Calm Rooted in Reconciliation"
              },
              {
                "id": "p2",
                "left": "Patience (Longsuffering)",
                "right": "Endurance Under Provocation"
              },
              {
                "id": "p3",
                "left": "Gentleness",
                "right": "Strength Under Holy Restraint"
              },
              {
                "id": "p4",
                "left": "Faithfulness",
                "right": "Steadfast Reliability and Loyalty"
              }
            ],
            "insightNote": "Notice \"Fruit\" is singular: all 9 virtues grow together on the branch abiding in Christ.",
            "mascotTip": "Abide in Jesus and watch these fruits blossom!"
          }
        ]
      },
      {
        "id": "u6-l2",
        "title": "The Full Armor of God & Living Faith",
        "subtitle": "Ephesians 6:10-18 & James 2:14-26",
        "scriptureAnchor": "Ephesians 6:11",
        "xpReward": 35,
        "questions": [
          {
            "id": "u6-l2-q1",
            "type": "match-pairs",
            "prompt": "Match each piece of the Armor of God with its spiritual defense:",
            "scriptureReference": "Ephesians 6:14-17",
            "scriptureText": "Put on the whole armor of God",
            "pairs": [
              {
                "id": "p1",
                "left": "Belt of Truth",
                "right": "Integrity and Sound Doctrine"
              },
              {
                "id": "p2",
                "left": "Breastplate of Righteousness",
                "right": "Guards the Heart from Accusation"
              },
              {
                "id": "p3",
                "left": "Shield of Faith",
                "right": "Extinguishes Fiery Darts of the Enemy"
              },
              {
                "id": "p4",
                "left": "Sword of the Spirit",
                "right": "The Spoken Word of God (Rhema)"
              }
            ],
            "insightNote": "The Sword of the Spirit is our primary offensive weapon, wielded just as Jesus did in the wilderness.",
            "mascotTip": "Put on your spiritual armor every morning in prayer!"
          },
          {
            "id": "u6-l2-q2",
            "type": "word-scramble",
            "prompt": "Arrange James’s practical exhortation on living faith in James 1:22:",
            "scriptureReference": "James 1:22",
            "scriptureText": "Be doers of the word and not hearers only",
            "scrambledWords": [
              "hearers",
              "Be",
              "doers",
              "not",
              "only",
              "the",
              "word",
              "and",
              "of"
            ],
            "correctSentence": [
              "Be",
              "doers",
              "of",
              "the",
              "word",
              "and",
              "not",
              "hearers",
              "only"
            ],
            "insightNote": "Genuine faith produces active love. Faith alone saves, but the faith that saves is never alone.",
            "mascotTip": "Don’t just listen to the sermon—live it out!"
          },
          {
            "id": "u6-l3-q3",
            "type": "multiple-choice",
            "prompt": "In Hebrews 11:1, how does the author define faith?",
            "scriptureReference": "Hebrews 11:1",
            "scriptureText": "“Now faith is confidence in what we hope for and assurance about what we do not see.”",
            "options": [
              {
                "id": "a",
                "text": "Confidence in what we hope for and assurance about what we do not see",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "Blind belief in things that have no historical grounding",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "Positive thinking that guarantees material wealth",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "Wishing upon a star for good luck",
                "isCorrect": false
              }
            ],
            "insightNote": "Biblical faith is not wishful thinking; it is solid bedrock confidence in the character and promises of God.",
            "mascotTip": "Faith sees what is unseen and banks on God’s integrity!"
          }
        ]
      },
      {
        "id": "u6-l3",
        "title": "Revelation: The New Heaven, New Earth & The King",
        "subtitle": "Revelation 21:1-7 & Revelation 22:12-21",
        "scriptureAnchor": "Revelation 21:4",
        "xpReward": 40,
        "questions": [
          {
            "id": "u6-l3-q1",
            "type": "word-scramble",
            "prompt": "Arrange the glorious promise of eternity in Revelation 21:4:",
            "scriptureReference": "Revelation 21:4",
            "scriptureText": "He will wipe every tear from their eyes",
            "scrambledWords": [
              "tear",
              "eyes",
              "wipe",
              "every",
              "He",
              "from",
              "their",
              "will"
            ],
            "correctSentence": [
              "He",
              "will",
              "wipe",
              "every",
              "tear",
              "from",
              "their",
              "eyes"
            ],
            "insightNote": "In the New Jerusalem, death, mourning, crying, and pain will be no more, for the former things have passed away.",
            "mascotTip": "The story ends with God dwelling with His people in perpetual joy!"
          },
          {
            "id": "u6-l3-q2",
            "type": "multiple-choice",
            "prompt": "In Revelation 22:13, what titles does Jesus proclaim for Himself?",
            "scriptureReference": "Revelation 22:13",
            "scriptureText": "“I am the Alpha and the Omega, the First and the Last, the Beginning and the End.”",
            "options": [
              {
                "id": "a",
                "text": "“The Alpha and the Omega, the First and the Last, the Beginning and the End”",
                "isCorrect": true
              },
              {
                "id": "b",
                "text": "“A prophet who retired from history”",
                "isCorrect": false
              },
              {
                "id": "c",
                "text": "“An angel in the heavens”",
                "isCorrect": false
              },
              {
                "id": "d",
                "text": "“A teacher who founded a temporary philosophy”",
                "isCorrect": false
              }
            ],
            "insightNote": "Alpha and Omega are the first and last letters of the Greek alphabet. Christ spans the entirety of history, redemption, and eternity.",
            "mascotTip": "He who wrote the first chapter of creation writes the final chapter of triumph!"
          },
          {
            "id": "u6-l3-q3",
            "type": "fill-blank",
            "prompt": "What is the very last prayer of the Christian Bible in Revelation 22:20? “He who testifies to these things says, ‘Yes, I am coming soon.’ Amen. ________, Lord Jesus.”",
            "scriptureReference": "Revelation 22:20",
            "scriptureText": "“He who testifies to these things says, ‘Yes, I am coming soon.’ Amen. Come, Lord Jesus.”",
            "options": [
              {
                "id": "opt1",
                "text": "Come",
                "isCorrect": true
              },
              {
                "id": "opt2",
                "text": "Wait",
                "isCorrect": false
              },
              {
                "id": "opt3",
                "text": "Depart",
                "isCorrect": false
              },
              {
                "id": "opt4",
                "text": "Silence",
                "isCorrect": false
              }
            ],
            "insightNote": "The early Church cried \"Maranatha\" (\"Come, Lord Jesus!\"), anticipating Christ’s glorious return in righteousness.",
            "mascotTip": "Live today with your eyes on Jesus—our coming King!"
          }
        ]
      }
    ]
  }
];
