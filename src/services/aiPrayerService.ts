import { GoogleGenAI } from '@google/genai';

export interface PrayerResponse {
  prayer: string;
  reflection: string;
  scriptureEncouragement: string;
  actionStep: string;
  theme: string;
}

export interface PrayerRequestOptions {
  message?: string;
  mood: string;
  verseReference?: string;
  verseText?: string;
  apiKey?: string;
}

// Comprehensive Curated Biblical Fallbacks for Every Mood & Situation
const OFFLINE_PRAYERS_BY_MOOD: Record<string, PrayerResponse[]> = {
  anxious: [
    {
      theme: 'Overcoming Worry with Divine Peace',
      prayer: "Heavenly Father, You know the turbulent thoughts and uneasy burdens that weigh upon my heart right now. Your Word declares that Your peace surpasses all human understanding. I consciously release the things I cannot control into Your sovereign hands. Still my racing heart, quiet the noise of tomorrow's anxieties, and anchor my soul in Your unfailing presence. Through Jesus Christ, my Prince of Peace, Amen.",
      reflection: "Anxiety looks at circumstances; faith looks at the One who controls the circumstances. God does not ask you to carry tomorrow's burdens with today's grace.",
      scriptureEncouragement: "Philippians 4:6-7 — “Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.”",
      actionStep: "Take three slow, deep breaths. Name three specific blessings right in front of you and thank God for each."
    },
    {
      theme: 'Refuge Beneath His Wings',
      prayer: "Lord God, my fortress, when the storms of life roar around me, remind me that You are my shelter. You have never failed Your children, and You will not start failing me today. Guard my mind against dread and despair, and remind me that no weapon formed against me shall prosper in Your kingdom. Amen.",
      reflection: "Worry doesn't empty tomorrow of its sorrow; it only empties today of its strength.",
      scriptureEncouragement: "Psalm 91:4 — “He will cover you with his feathers, and under his wings you will find refuge; his faithfulness will be your shield and rampart.”",
      actionStep: "Write down the single thought causing you the most dread, physically cross it out, and write underneath: 'God is in control.'"
    }
  ],
  grateful: [
    {
      theme: 'A Heart Overflowing with Thanksgiving',
      prayer: "Lord Jesus, my redeemer and friend, my soul overflows with thanksgiving today! Thank You for the breath in my lungs, the mercy that greeted me this morning, and the countless unseen ways You have protected and provided for me. May my praise not be a momentary reaction to good fortune, but a steady heartbeat of worship in all seasons. All glory and honor belong to You! Amen.",
      reflection: "Gratitude turns what we have into enough, and more. It turns a meal into a feast, a house into a home, and a stranger into a brother.",
      scriptureEncouragement: "1 Thessalonians 5:16-18 — “Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.”",
      actionStep: "Send a heartfelt text message to one person today thanking them for how God has used them in your life."
    }
  ],
  guidance: [
    {
      theme: 'Seeking Divine Wisdom & Discernment',
      prayer: "Almighty Father, You who set the stars in their courses and know the steps of my journey, I come asking for divine wisdom. Where my human sight is blind, let Your Holy Spirit guide me. Close doors that would lead to spiritual drift, and open doors that advance Your Kingdom in my life. Grant me discernment to recognize Your gentle whisper above the roar of the world. In Jesus' name, Amen.",
      reflection: "When you don't know what to do next, walk in the obedience of what God has already revealed. His Word is a lamp to your feet, illuminating the very next step.",
      scriptureEncouragement: "Proverbs 3:5-6 — “Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.”",
      actionStep: "Pause for 5 minutes in complete silence before making any decision today, simply listening with an open Bible."
    }
  ],
  healing: [
    {
      theme: 'Restoration, Comfort & Sacred Wholeness',
      prayer: "Lord Jesus, the Great Physician, You who healed the leper and gave sight to the blind, I bring my wounds and weary body before Your throne of grace. Where there is physical pain, release Your restoring touch. Where there is grief or emotional exhaustion, pour in the balm of Gilead. Help me to trust Your loving timing, knowing that You are close to the brokenhearted and save those crushed in spirit. Amen.",
      reflection: "God does not waste our pain. In His hands, our deepest wounds become the wellspring of our deepest empathy and ministry to others.",
      scriptureEncouragement: "Jeremiah 17:14 — “Heal me, LORD, and I will be healed; save me and I will be saved, for you are the one I praise.”",
      actionStep: "Place your hand over your heart, breathe in God's restorative love, and rest without feeling guilty for taking time to heal."
    }
  ],
  strength: [
    {
      theme: 'Renewed Power for the Weary Soul',
      prayer: "Eternal God, my strength and my shield, my energy is spent, but Your reservoir of power never runs dry. When I feel like giving up, breathe fresh vitality into my bones. Let me run and not grow weary, walk and not faint. Teach me to rely not on my own willpower, but on the resurrection power of the Holy Spirit living within me. I am more than a conqueror through Christ who loves me! Amen.",
      reflection: "Christian strength is not pretending you are invincible. It is acknowledging your complete weakness so that Christ's power can rest upon you.",
      scriptureEncouragement: "Isaiah 40:29-31 — “He gives strength to the weary and increases the power of the weak... those who hope in the LORD will renew their strength. They will soar on wings like eagles.”",
      actionStep: "Delegate or step away from one non-essential task today to protect your spiritual and physical energy."
    }
  ],
  family: [
    {
      theme: 'Shield of Protection & Unity for Loved Ones',
      prayer: "Heavenly Father, I lift my family and loved ones into Your protective embrace. Guard our home with Your holy angels against discord, sickness, and spiritual attack. Cultivate patience, forgiveness, and deep sacrificial love among us. Let our household be a beacon of light, grace, and hospitality in our community. In Christ's precious name, Amen.",
      reflection: "A Christ-centered home is not one without conflict, but one where forgiveness flows swifter than offense.",
      scriptureEncouragement: "Joshua 24:15 — “As for me and my household, we will serve the LORD.”",
      actionStep: "Tell a family member today: 'I appreciate you and I am praying for you.'"
    }
  ],
  forgiveness: [
    {
      theme: 'Releasing the Poison of Resentment',
      prayer: "Merciful Savior, who prayed from the cross, 'Father, forgive them, for they know not what they do,' help me to forgive as I have been forgiven. I surrender my desire for retribution and release the debt of those who have wounded me. Cleanse my heart of bitterness, and fill the empty spaces with Your supernatural grace and freedom. Amen.",
      reflection: "Forgiveness doesn't excuse another person's sin; it simply unties you from their toxicity so God can heal you.",
      scriptureEncouragement: "Colossians 3:13 — “Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.”",
      actionStep: "Silently speak a blessing over the person who has hurt you, releasing them to God's justice and mercy."
    }
  ]
};

export class AiPrayerService {
  /**
   * Generates a compassionate, contextual Christian prayer & reflection.
   * Tries Gemini API first if configured, then gracefully falls back to rich offline liturgies.
   */
  public static async generatePrayer(opts: PrayerRequestOptions): Promise<PrayerResponse> {
    const { message, mood, verseReference, verseText, apiKey } = opts;

    // 1. Check for Gemini API Key
    const key =
      apiKey ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);

    if (key && key.trim()) {
      try {
        const client = new GoogleGenAI({ apiKey: key.trim() });
        const systemInstruction = `
You are the FaithLingo AI Prayer Companion, a compassionate, reverent, and deeply encouraging pastoral assistant.
Generate an uplifting, biblically grounded prayer, devotional reflection, scripture encouragement, and a small actionable step.
Always respond with valid JSON matching this schema:
{
  "theme": "A short inspiring title",
  "prayer": "A heartfelt, warm, conversational prayer spoken directly to God (Father, Jesus, Holy Spirit) addressing the user's situation (around 3-5 sentences).",
  "reflection": "A 1-2 sentence comforting biblical perspective or insight.",
  "scriptureEncouragement": "Book Chapter:Verse followed by the verse text.",
  "actionStep": "One practical, gentle step the user can take today to foster peace and faith."
}
Only output the JSON object, without backticks or markdown formatting.
`;

        const prompt = `
User Situation / Intention: ${message || 'Seeking peace and God\'s presence'}
Current Emotional Mood: ${mood}
${verseReference ? `Scripture Context: ${verseReference} ("${verseText || ''}")` : ''}
`;

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text?.trim() || '';
        if (rawText) {
          // Parse JSON, stripping any accidental markdown fences
          const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.prayer && parsed.reflection) {
            return {
              theme: parsed.theme || `${mood.toUpperCase()} Prayer`,
              prayer: parsed.prayer,
              reflection: parsed.reflection,
              scriptureEncouragement: parsed.scriptureEncouragement || verseReference || 'Philippians 4:6-7',
              actionStep: parsed.actionStep || 'Spend two quiet minutes resting in God’s presence.'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini AI prayer generation unavailable, using offline scripture generator:', err);
      }
    }

    // 2. Intelligent Offline Biblical Prayer Synthesis
    return this.generateOfflinePrayer(opts);
  }

  /**
   * Generates a contextually personalized prayer completely offline.
   */
  public static generateOfflinePrayer(opts: PrayerRequestOptions): PrayerResponse {
    const { message, mood, verseReference, verseText } = opts;
    const moodKey = mood.toLowerCase();
    const candidateList = OFFLINE_PRAYERS_BY_MOOD[moodKey] || OFFLINE_PRAYERS_BY_MOOD['anxious'];
    const base = candidateList[Math.floor(Math.random() * candidateList.length)];

    let customizedPrayer = base.prayer;
    if (message && message.trim().length > 5) {
      // Weave the user's specific prayer request into the liturgy
      const trimmedMsg = message.trim().replace(/[.!?]+$/, '');
      customizedPrayer = customizedPrayer.replace(
        'I come asking for divine wisdom.',
        `I bring before You this specific burden: ${trimmedMsg}.`
      ).replace(
        'turbulent thoughts and uneasy burdens that weigh upon my heart right now.',
        `heavy thoughts on my heart regarding ${trimmedMsg}.`
      );
    }

    return {
      theme: base.theme,
      prayer: customizedPrayer,
      reflection: base.reflection,
      scriptureEncouragement: verseReference && verseText ? `${verseReference} — “${verseText}”` : base.scriptureEncouragement,
      actionStep: base.actionStep
    };
  }
}
