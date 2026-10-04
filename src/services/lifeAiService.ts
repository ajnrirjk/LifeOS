import { GoogleGenAI } from '@google/genai';

export interface LifeAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    appId: string;
    label: string;
  };
}

export interface LifeAiRequestOptions {
  prompt: string;
  conversationHistory?: LifeAiMessage[];
  persona?: 'pastor' | 'navigator' | 'scholar';
  apiKey?: string;
}

export class LifeAiService {
  /**
   * Retrieves active Gemini API key from parameters, settings in localStorage, or env
   */
  public static getApiKey(explicitKey?: string): string | undefined {
    if (explicitKey && explicitKey.trim()) return explicitKey.trim();

    try {
      const saved = localStorage.getItem('lifeos_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.geminiApiKey && typeof parsed.geminiApiKey === 'string' && parsed.geminiApiKey.trim()) {
          return parsed.geminiApiKey.trim();
        }
      }
    } catch {}

    return undefined;
  }

  /**
   * Generates response via Gemini 2.5 Flash, falling back to local contextual knowledge engine
   */
  public static async generateResponse(opts: LifeAiRequestOptions): Promise<LifeAiMessage> {
    const { prompt, conversationHistory = [], persona = 'pastor' } = opts;
    const apiKey = this.getApiKey(opts.apiKey);

    // 1. If Gemini API key is configured, query Gemini 2.5 Flash
    if (apiKey) {
      try {
        const client = new GoogleGenAI({ apiKey });

        const personaInstruction =
          persona === 'pastor'
            ? 'You are a warm, wise, compassionate pastoral counselor and Bible scholar. Speak with gentleness, scripture grounding, and uplifting encouragement.'
            : persona === 'navigator'
            ? 'You are the LifeOS Master Navigator and Productivity Guide. You know every app in LifeOS intimately (FaithLingo, ChurchNotes, Fellowship Chat, LifeMeet, Arcade Vault, YouTube). Provide direct, efficient, actionable system instructions and tips.'
            : 'You are an articulate scholar, writer, and theological researcher. Provide clear, comprehensive, and intellectually thorough answers with historical and literary depth.';

        const systemInstruction = `${personaInstruction}
You are LifeAi, the central intelligent companion embedded inside LifeOS — a faith-centered, productivity, and spiritual desktop operating system.
LifeOS Apps available to the user:
- FaithLingo: Gamified Bible curriculum across 6 covenant units (Genesis to Revelation), streaks, leagues, scripture memory flashcards, and 66-book offline Bible reader (NIV, KJV, ESV, BBE).
- ChurchNotes: Sermon note-taking scribe with rich formatting, personal reflection logs, and study tags.
- Fellowship Chat: Real-time community discussion channels, sermon chat, and prayer sharing.
- LifeMeet: HD video conferencing with screen share and prayer rooms.
- Arcade Vault & Cat Fighter Turbo: Faith-themed arcade mini-games (Flappy Dove, Babel Stacker, Eden Snake, Demon Buster, Slingshot, Cat Fighter).
- YouTube: Embedded player for worship music, BibleProject videos, and lofi focus streams.
- Sesame AI Voice Engine: 4 pastoral voice personas (David, Grace, Elijah, Ruth) that can speak text aloud.

When relevant, suggest which LifeOS app can help the user (e.g. "You can record this reflection in ChurchNotes"). Keep answers structured, friendly, concise, and inspiring.`;

        // Format history for Gemini API
        const contents = conversationHistory.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        const replyText = response.text?.trim() || '';
        if (replyText) {
          // Detect relevant LifeOS app action suggestion
          let actionSuggestion: LifeAiMessage['actionSuggestion'];
          const lower = replyText.toLowerCase();
          if (lower.includes('churchnotes') || lower.includes('journal') || lower.includes('note')) {
            actionSuggestion = { appId: 'bible_journal', label: 'Open ChurchNotes' };
          } else if (lower.includes('faithlingo') || lower.includes('bible reader') || lower.includes('scripture flashcard')) {
            actionSuggestion = { appId: 'faithlingo', label: 'Open FaithLingo' };
          } else if (lower.includes('fellowship') || lower.includes('chat')) {
            actionSuggestion = { appId: 'fellowship_chat', label: 'Open Fellowship Chat' };
          } else if (lower.includes('lifemeet') || lower.includes('video call')) {
            actionSuggestion = { appId: 'faith_meet', label: 'Open LifeMeet' };
          } else if (lower.includes('arcade') || lower.includes('game')) {
            actionSuggestion = { appId: 'mini_games', label: 'Open Arcade Vault' };
          }

          return {
            id: `lifeai_${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionSuggestion
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, switching to intelligent offline LifeAi engine:', err);
      }
    }

    // 2. Intelligent Offline Fallback Engine
    return this.generateOfflineResponse(prompt, persona);
  }

  /**
   * Generates a rich, contextually aware response completely offline
   */
  public static generateOfflineResponse(prompt: string, persona: LifeAiRequestOptions['persona']): LifeAiMessage {
    const q = prompt.toLowerCase();
    let text = '';
    let actionSuggestion: LifeAiMessage['actionSuggestion'];

    // ── System / App Navigation ──
    if (q.includes('what is lifeos') || q.includes('how does lifeos work') || q.includes('help')) {
      text = `Welcome to **LifeOS**! Here are the core applications you have right at your fingertips:

1. **🕊️ FaithLingo**: Learn the Bible interactively through 6 covenant units from Genesis to Revelation, with streaks, memory flashcards, and a 66-book offline Bible reader (NIV, KJV, ESV).
2. **📖 ChurchNotes**: Take sermon notes, jot prayer journals, and save personal reflections.
3. **💬 Fellowship Chat**: Connect with other believers in real-time group discussions.
4. **📹 LifeMeet**: Start or join live video calls and prayer circles with screen sharing.
5. **🕹️ Arcade Vault & Cat Fighter**: Enjoy retro mini-games (Babel Stacker, Flappy Dove, Eden Snake).
6. **▶️ YouTube**: Watch worship streams, BibleProject videos, and lofi focus beats.

What would you like to explore today?`;
      actionSuggestion = { appId: 'faithlingo', label: 'Explore FaithLingo' };
    } else if (q.includes('churchnotes') || q.includes('notes') || q.includes('sermon note')) {
      text = `**ChurchNotes Scribe** is designed for distraction-free sermon logging and personal prayer journaling.
- You can create new notes for Sunday sermons, Bible study groups, or quiet time.
- Notes are automatically saved locally and can be organized by sermon title, preacher, and date.
- Tap below to jump straight into ChurchNotes!`;
      actionSuggestion = { appId: 'bible_journal', label: 'Open ChurchNotes' };
    } else if (q.includes('bible') || q.includes('scripture') || q.includes('read') || q.includes('niv') || q.includes('kjv')) {
      text = `LifeOS includes a complete **66-Book Offline Bible Reader** inside FaithLingo!
- **Translations**: NIV (New International Version), KJV, ESV, and BBE.
- **Red-Letter Mode**: Highlights the words of Christ in red across the Gospels.
- **Memory Flashcards**: Practice memorizing key scriptures with audio playback and masked recall.
- **Personal Verse Notes**: Click any verse to attach your own study notes.`;
      actionSuggestion = { appId: 'faithlingo', label: 'Open Bible Reader' };
    } else if (q.includes('prayer') || q.includes('pray for me') || q.includes('anxious') || q.includes('worry')) {
      text = `Here is a prayer for your heart today:

*"Heavenly Father, You know every thought, burden, and unspoken worry resting on my heart right now. Your Word promises in Philippians 4:7 that Your peace surpasses all human understanding. I place this day, my family, and my tomorrow into Your faithful hands. Still my racing mind, fill me with Your Holy Spirit, and remind me that You are working all things together for good. Through Jesus Christ, Amen."*

Take a deep breath — God has you covered today.`;
      actionSuggestion = { appId: 'bible_journal', label: 'Save Prayer in Notes' };
    } else if (q.includes('sermon') && (q.includes('outline') || q.includes('preach') || q.includes('idea'))) {
      text = `Here is a powerful **3-Point Sermon Outline** ready for ChurchNotes:

**Title:** Anchored in the Storm: Walking by Faith
**Passage:** Mark 4:35-41 (Jesus Calms the Sea)

1. **The Reality of the Sudden Storm (v. 37-38)**
   * Storms are not proof of God's absence; Jesus was in the boat with them.
   * Our natural instinct is panic, but our calling is trust.

2. **The Authority of the Savior (v. 39)**
   * "Peace, be still!" — Creation recognizes the voice of its Creator.
   * Christ has sovereign authority over internal anxieties and external trials.

3. **The Question of Our Faith (v. 40-41)**
   * "Why are you so afraid? Do you still have no faith?"
   * Moving from fearing the storm to having holy reverence for the Lord.

*Application:* What storm are you currently facing where you need to hear Christ say, "Peace, be still"?`;
      actionSuggestion = { appId: 'bible_journal', label: 'Draft in ChurchNotes' };
    } else if (q.includes('game') || q.includes('play') || q.includes('arcade')) {
      text = `Looking for a fun break? LifeOS has two retro arcade apps:
- **🕹️ Arcade Vault**: Play Faith Flappy Dove, Babel Stacker, Demon Buster, Eden Snake, and Slingshot!
- **🥊 Cat Fighter Turbo**: 16-bit Street Fighter-style arcade with paw fireballs, special combos, and retro synth music!`;
      actionSuggestion = { appId: 'mini_games', label: 'Play Arcade Vault' };
    } else if (q.includes('voice') || q.includes('sesame') || q.includes('speak') || q.includes('audio')) {
      text = `LifeOS features the **Sesame AI Voice Engine**!
- You can hear scriptures and prayers spoken aloud in 4 pastoral voice personas: **David** (Deep & Regal), **Grace** (Warm & Gentle), **Elijah** (Resonant & Bold), and **Ruth** (Calm & Reflective).
- It also uses Web Speech API when offline so you always have voice playback!`;
    } else {
      // General thoughtful response
      text = `I hear you. As your LifeOS AI Companion, I am here to help you study scripture, draft sermon notes, pray through challenges, and navigate everything in LifeOS.

Tip: You can ask me to:
- 📖 *"Explain Romans 8:28"*
- 🕊️ *"Write a morning devotional prayer"*
- 📝 *"Help me organize my ChurchNotes"*
- ⚡ *"How do I start a LifeMeet video call?"*
- 💡 *"Give me productivity tips for today"*

How can I assist you right now?`;
    }

    return {
      id: `lifeai_${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionSuggestion
    };
  }
}
