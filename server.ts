import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback prayer reflections when offline or API key is unavailable
const fallbackPrayers: Record<string, string> = {
  anxious: "Heavenly Father, You know the heavy burdens and uneasy thoughts weighing on my heart right now. Your Word promises in Philippians 4:6-7 that Your peace, which transcends all understanding, will guard our hearts and minds in Christ Jesus. I cast every anxiety onto You, knowing You care deeply for me. Grant me still waters and rest for my soul today. In Jesus' name, Amen.",
  grateful: "Lord God Almighty, my heart overflows with thanksgiving today! Thank You for the gift of life, for Your endless mercies that are new every morning, and for Jesus Christ who redeemed us. Help me to carry this spirit of gratitude into every conversation and deed today, giving glory to Your name. Amen.",
  guidance: "Sovereign Lord, You are the Shepherd who leads us in paths of righteousness. When paths seem unclear, illuminate my steps with the lamp of Your Word (Psalm 119:105). Give me holy wisdom, discern what aligns with Your Kingdom, and give me courage to walk faithfully in Jesus' footsteps. Amen.",
  healing: "Gracious Healer, You bore our griefs and carried our sorrows. Touch my body, mind, and spirit with Your renewing grace. Bring comfort where there is pain, hope where there is despair, and strengthen my faith to trust in Your loving timing. In Jesus' mighty name, Amen.",
  strength: "Lord, You give power to the faint, and to him who has no might You increase strength (Isaiah 40:29). When my energy fails, let Your Spirit be my reservoir. Remind me that I can do all things through Christ who strengthens me. Amen."
};

// API: AI Prayer Companion & Reflection
app.post('/api/prayer-companion', async (req: Request, res: Response) => {
  try {
    const { 
      message, 
      category = 'guidance', 
      mood = 'peace',
      verseReference, 
      verseText, 
      history = [] 
    } = req.body;

    if (!aiClient) {
      const fallbackPrayer = fallbackPrayers[category] || fallbackPrayers.guidance;
      const contextAddition = verseReference ? `\n\nReflection on ${verseReference}: "${verseText || ''}" - Remember that God's promises never return void.` : '';
      return res.json({
        prayer: `${fallbackPrayer}${contextAddition}`,
        reflection: "Take a deep breath and rest in God's unfailing love. He is closer to you than your very breath.",
        scriptureEncouragement: "The Lord bless you and keep you; the Lord make his face shine upon you and be gracious to you. — Numbers 6:24-25",
        suggestedAction: "Spend 2 minutes in silent stillness, offering your worries to Jesus."
      });
    }

    const systemInstruction = `You are "Grace", a warm, loving, biblically grounded Christian Prayer Companion and Bible Reflection Mentor in FaithLingo.
Your role:
1. Provide heartfelt, authentic, Christ-centered prayers tailored to the user's specific feelings, life situations, or prayers requested.
2. Provide a short, uplifting spiritual reflection grounded in the teachings of Jesus and Scripture.
3. Suggest a relevant comforting scripture verse with citation.
4. Keep the tone compassionate, encouraging, peaceful, non-judgmental, and deeply faithful.
5. Avoid overly clinical language. Speak with the warmth of a loving spiritual guide who loves the Gospel and desires to draw souls closer to Christ.
6. Return structured JSON with keys:
   - "prayer": A beautifully written prayer (2-4 paragraphs).
   - "reflection": A 2-3 sentence devotional thought connecting their situation to Jesus's love and grace.
   - "scriptureEncouragement": A relevant verse with reference (e.g. "Come to me, all who labor... — Matthew 11:28").
   - "actionStep": A gentle 1-sentence spiritual practice for today (e.g. "Breathe deeply and whisper Jesus' name whenever you feel overwhelmed today.")`;

    let userPrompt = `User request: ${message || 'Please offer a prayer for my heart today.'}
Category/Intent: ${category}
User's Current State/Mood: ${mood}
`;

    if (verseReference) {
      userPrompt += `Included Scripture to reflect on: ${verseReference} ("${verseText || ''}")\n`;
    }

    if (Array.isArray(history) && history.length > 0) {
      const pastMessages = history.slice(-4).map((h: any) => `${h.role === 'user' ? 'User' : 'Companion'}: ${h.text}`).join('\n');
      userPrompt += `\nRecent Conversation:\n${pastMessages}\n`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      parsedData = {
        prayer: outputText,
        reflection: "Cast all your anxieties upon Him, for He cares for you.",
        scriptureEncouragement: "Philippians 4:6-7",
        actionStep: "Rest in God's unfailing love."
      };
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/prayer-companion:', error);
    const fallbackPrayer = fallbackPrayers.guidance;
    return res.json({
      prayer: fallbackPrayer,
      reflection: "Lord, in times of uncertainty and need, we look to You, our rock and fortress.",
      scriptureEncouragement: "The peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus. — Philippians 4:7",
      actionStep: "Take 60 seconds to meditate on Jesus' peace."
    });
  }
});

// API: Scripture Insight & Teaching deep-dive
app.post('/api/scripture-insight', async (req: Request, res: Response) => {
  try {
    const { reference, text, topic } = req.body;

    if (!aiClient) {
      return res.json({
        summary: `This passage (${reference}) reveals God's eternal character and the heart of the Gospel.`,
        historicalContext: "Spoken to disciples learning the radical nature of the Kingdom of Heaven.",
        greekHebrewMeaning: "Emphasizes covenantal love (Hesed in Hebrew / Agape in Greek).",
        lifeApplication: "Apply this truth by practicing forgiveness and humble service in your daily walk today."
      });
    }

    const prompt = `Provide a rich, accessible, bite-sized Duolingo-style scripture insight on:
Passage: ${reference}
Text: "${text}"
Topic/Theme: ${topic || 'Jesus and Kingdom Teachings'}

Return JSON with:
{
  "summary": "1-2 sentence core message",
  "historicalContext": "1-2 sentences on original context/audience",
  "greekHebrewMeaning": "A brief interesting word study note (e.g. Agape, Shalom, Metanoia)",
  "lifeApplication": "Practical everyday takeaway for believers of all ages",
  "reflectionQuestion": "One thought-provoking question to ponder today"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/scripture-insight:', error);
    return res.json({
      summary: "This passage highlights God's grace and divine wisdom for daily living.",
      historicalContext: "Recorded for the encouragement of believers in all generations.",
      greekHebrewMeaning: "Reflects God's steadfast covenantal faithfulness.",
      lifeApplication: "Live out Christ's love through patient kindness toward others today.",
      reflectionQuestion: "How can you show Christ's compassion in your actions today?"
    });
  }
});

// Cache for Bible complete translations in memory
const bibleTranslationsCache: Record<string, Record<string, Record<string, string[]>>> = {};

async function loadBibleTranslation(trans: string): Promise<Record<string, Record<string, string[]>> | null> {
  const code = trans.toLowerCase();
  if (bibleTranslationsCache[code]) {
    return bibleTranslationsCache[code];
  }

  const filePath = path.resolve(__dirname, 'public', 'bible', `${code}.json`);
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    bibleTranslationsCache[code] = parsed;
    return parsed;
  } catch (err) {
    console.warn(`Could not load local bible file ${filePath}:`, err);
    return null;
  }
}

// API: Offline Bible Chapter Provider (Complete 66 books, 1,189 chapters, 31,102 verses)
app.get('/api/bible/chapter', async (req: Request, res: Response) => {
  try {
    const { translation = 'kjv', book = 'Matthew', chapter = '5' } = req.query;
    const transCode = String(translation).toLowerCase();
    const bookName = String(book).trim();
    const chapterNum = Number(chapter);

    // 1. Try local complete Bible database
    const bibleData = await loadBibleTranslation(transCode);
    if (bibleData) {
      // Find book case-insensitively
      const bookKey = Object.keys(bibleData).find(k => k.toLowerCase() === bookName.toLowerCase());
      if (bookKey && bibleData[bookKey] && bibleData[bookKey][String(chapterNum)]) {
        const verseStrings = bibleData[bookKey][String(chapterNum)];
        const formatted = {
          reference: `${bookKey} ${chapterNum}`,
          book: bookKey,
          chapter: chapterNum,
          translation: transCode.toUpperCase(),
          verses: verseStrings.map((text, idx) => ({
            verse: idx + 1,
            text: text.trim()
          }))
        };
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.json(formatted);
      }
    }

    // 2. Fallback to bible-api.com if needed
    const apiUrl = `https://bible-api.com/${encodeURIComponent(bookName + ' ' + chapterNum)}?translation=${transCode}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch chapter from Bible source' });
    }

    const data: any = await response.json();
    const formatted = {
      reference: data.reference,
      book: bookName,
      chapter: chapterNum,
      translation: transCode.toUpperCase(),
      verses: (data.verses || []).map((v: any) => ({
        verse: v.verse,
        text: String(v.text).replace(/\r\n/g, ' ').replace(/\n/g, ' ').trim()
      }))
    };

    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json(formatted);
  } catch (error: any) {
    console.error('Error in /api/bible/chapter:', error);
    return res.status(500).json({ error: 'Internal server error fetching chapter' });
  }
});

// API: Search whole Bible across all 31,102 verses
app.get('/api/bible/search', async (req: Request, res: Response) => {
  try {
    const { translation = 'kjv', q = '', limit = '40' } = req.query;
    const query = String(q).trim().toLowerCase();
    const maxResults = Math.min(Number(limit) || 40, 100);

    if (!query) {
      return res.json({ query: '', count: 0, results: [] });
    }

    const bibleData = await loadBibleTranslation(String(translation).toLowerCase());
    if (!bibleData) {
      return res.json({ query, count: 0, results: [] });
    }

    const results: Array<{ book: string; chapter: number; verse: number; text: string; translation: string }> = [];

    for (const [book, chapters] of Object.entries(bibleData)) {
      for (const [ch, verses] of Object.entries(chapters)) {
        for (let i = 0; i < verses.length; i++) {
          const verseText = verses[i];
          if (verseText.toLowerCase().includes(query)) {
            results.push({
              book,
              chapter: Number(ch),
              verse: i + 1,
              text: verseText,
              translation: String(translation).toUpperCase()
            });
            if (results.length >= maxResults) break;
          }
        }
        if (results.length >= maxResults) break;
      }
      if (results.length >= maxResults) break;
    }

    return res.json({
      query,
      count: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error in /api/bible/search:', error);
    return res.status(500).json({ error: 'Error searching Bible' });
  }
});

// API: LifeOS App Studio AI Assistant (Generate apps from natural language)
app.post('/api/lifeos/generate-app', async (req: Request, res: Response) => {
  try {
    const { userPrompt } = req.body;
    if (!aiClient) {
      return res.json({
        title: "Daily Habit Tracker",
        icon: "Target",
        emoji: "🎯",
        category: "Productivity",
        type: "tracker",
        color: "from-blue-500 to-indigo-600",
        description: "Track habits and build discipline day by day.",
        systemInstruction: "You are a gentle accountability guide helping the user stay consistent.",
        initialFields: [
          { name: "Morning Devotion", completed: true },
          { name: "Scripture Reading (15 mins)", completed: false },
          { name: "Drink Water & Walk", completed: false }
        ]
      });
    }

    const systemInstruction = `You are the LifeOS App Architect AI. When a user asks to create an app, generate a clean JSON configuration for a LifeOS micro-app.
Allowed 'type': 'tracker' (checklist/habits), 'notes' (journal/notes), 'ai_assistant' (interactive conversational tool), 'flashcards' (memorization cards).
Format:
{
  "title": "Short title",
  "icon": "Lucide icon name (e.g. Target, BookOpen, Flame, Heart, Sparkles, Compass)",
  "emoji": "An emoji (e.g. 🎯, 📖, 🕯️, 🌿)",
  "category": "Spiritual | Productivity | Health | Learning | Ministry",
  "type": "tracker | notes | ai_assistant | flashcards",
  "color": "Tailwind gradient e.g. from-indigo-500 to-purple-600",
  "description": "1 sentence description",
  "systemInstruction": "Instructions for the AI helper inside this app",
  "initialItems": [
    { "title": "Item 1", "subtitle": "Details or scripture", "completed": false }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a LifeOS micro-app for: ${userPrompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating LifeOS app:', error);
    return res.json({
      title: "Spiritual Goal Tracker",
      icon: "Sparkles",
      emoji: "✨",
      category: "Spiritual",
      type: "tracker",
      color: "from-emerald-500 to-teal-600",
      description: "Stay intentional with your spiritual walk.",
      systemInstruction: "Encourage spiritual growth.",
      initialItems: [{ title: "Daily Prayer & Silence", completed: false }]
    });
  }
});

// API: LifeOS Custom AI App Runner
app.post('/api/lifeos/ai-run', async (req: Request, res: Response) => {
  try {
    const { appTitle, systemInstruction, userMessage, history = [] } = req.body;

    if (!aiClient) {
      return res.json({
        reply: `Grace and peace! This is your ${appTitle} companion. What would you like to reflect on today?`
      });
    }

    const sys = systemInstruction || `You are an encouraging, wise assistant in the LifeOS application "${appTitle}". Provide thoughtful, uplifting, actionable responses.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage || "Hello!",
      config: {
        systemInstruction: sys
      }
    });

    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Error in /api/lifeos/ai-run:', err);
    return res.json({ reply: "I am with you in spirit. Take a moment to breathe and reflect." });
  }
});

// Zero-knowledge Encrypted Cloud Backup storage for Bible Journal
const encryptedVaultStorage: Record<string, { encryptedPayload: string; lastModified: string }> = {};

app.post('/api/journal/backup', (req: Request, res: Response) => {
  try {
    const { vaultId = 'default_vault', encryptedPayload } = req.body;
    if (!encryptedPayload) {
      return res.status(400).json({ error: 'Missing encryptedPayload' });
    }
    const lastModified = new Date().toISOString();
    encryptedVaultStorage[vaultId] = {
      encryptedPayload,
      lastModified
    };
    return res.json({ success: true, vaultId, lastModified });
  } catch (err: any) {
    console.error('Error in /api/journal/backup POST:', err);
    return res.status(500).json({ error: 'Failed to save encrypted cloud backup' });
  }
});

app.get('/api/journal/backup', (req: Request, res: Response) => {
  try {
    const vaultId = String(req.query.vaultId || 'default_vault');
    const vault = encryptedVaultStorage[vaultId];
    if (!vault) {
      return res.status(404).json({ error: 'No encrypted backup found for this vault ID' });
    }
    return res.json({ success: true, vaultId, encryptedPayload: vault.encryptedPayload, lastModified: vault.lastModified });
  } catch (err: any) {
    console.error('Error in /api/journal/backup GET:', err);
    return res.status(500).json({ error: 'Failed to retrieve cloud backup' });
  }
});

// API: Clean & Summarize Dictated Sermon Notes into high-value, spiritually rich notes
app.post('/api/sermon/summarize-dictation', async (req: Request, res: Response) => {
  try {
    const { transcript, currentNotes = '', noteTitle = '', notePassage = '' } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing transcript' });
    }

    const trimmed = transcript.trim();
    if (!trimmed) {
      return res.json({ summary: '', detectedTitle: '', detectedPassage: '', detectedSpeaker: '' });
    }

    if (!aiClient) {
      // Fallback clean formatting without API key
      const cleaned = trimmed
        .replace(/\b(good morning|welcome|amen|turn to your neighbor|can i get a witness|hallelujah|um|uh|like|you know|sort of|so yeah|basically|give it up for the band)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      const capitalized = cleaned ? `• ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}` : '';
      return res.json({
        summary: capitalized,
        detectedTitle: '',
        detectedPassage: '',
        detectedSpeaker: ''
      });
    }

    const systemInstruction = `You are a Master Theological Editor, Christian Scholar, and Senior Literary Scribe.

CRITICAL DIRECTIVE FROM THE USER:
"When summarized, don't just put bullet points. Use AI to help refine it with proper grammar, articulate prose, and deep clarity."
Do NOT produce a lazy, fragmented list of short bullet points. Instead, write in complete, eloquent, grammatically flawless English with rich sentence structure, reverent tone, and high spiritual depth.

TRANSCRIPTION CLEANUP & GRAMMAR CORRECTIONS:
- Correct all speech-to-text transcription artifacts, phonetic errors (e.g. "he bruise" -> "Hebrews", "acts to" -> "Acts 2", "profit" -> "prophet", "alter" -> "altar"), run-on fragments, and speech disfluencies.
- Omit casual banter, greetings, announcements, mic checks, and choir transitions.
- Weave the preacher's ideas into articulate, cohesive sentences and paragraphs with proper capitalization, punctuation, and theological vocabulary.

STRUCTURE OF THE REFINED SERMON DOCUMENT:

### 🎯 Sermon Overview & Central Thesis
[Write 1-2 rich, cohesive narrative paragraphs with proper grammar, articulating the core message, the preacher's burden, and the overarching spiritual theme of the sermon.]

### 📖 Biblical Exposition & Scriptural Context
[For each passage cited, write a thoughtful paragraph providing the scriptural context, explaining what God's Word reveals, and unpacking how the preacher applied it.]

### 💡 Core Theological Teachings & Deep Insights
[Provide 2-4 named, well-developed sections. Each section must feature a bold thematic header followed by thorough, fluent explanatory prose that explains the biblical arguments, spiritual principles, and illustrations presented in the message.]

### 💬 Memorable Preacher Quotes & Epiphanies
[Highlight profound quotes or declarations from the message, formatted with quotation marks and proper punctuation, providing brief context for why the statement was impactful.]

### 🙏 Practical Life Application & Heart Reflection
[Write an articulate, encouraging guide for living out this truth this week, including specific daily walk practices and a focused heart-prayer to guide the believer's devotional life.]

If the recording is brief (under 80 words), write a beautifully polished, grammatically elegant reflection of 1-2 paragraphs rather than a bare bullet point.

Return JSON:
{
  "summary": "The refined, eloquent, grammatically polished sermon document in clean markdown",
  "detectedTitle": "A compelling, dignified sermon title inferred from the message",
  "detectedPassage": "Primary scripture passage cited (e.g. 'Romans 8:28-39')",
  "detectedSpeaker": "Preacher name if identified, else empty string"
}`;

    const userPrompt = `Live Sermon Voice Recording transcript:
"""
${trimmed}
"""

Active Note Context:
- Current Title: "${noteTitle}"
- Current Passage: "${notePassage}"
- Existing Notes Content:
${String(currentNotes).slice(-400)}

Filter out casual greetings and filler, and summarize the valuable spiritual points, scripture references, preacher quotes, and practical application takeaways:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    let summary = (parsed.summary || '').trim();
    if (!summary && trimmed) {
      summary = `### 📖 Sermon Reflection\n\n${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}.`;
    }

    return res.json({
      summary,
      detectedTitle: (parsed.detectedTitle || '').trim(),
      detectedPassage: (parsed.detectedPassage || '').trim(),
      detectedSpeaker: (parsed.detectedSpeaker || '').trim(),
    });
  } catch (error: any) {
    console.error('Error in /api/sermon/summarize-dictation:', error);
    const cleaned = String(req.body.transcript || '')
      .replace(/\b(um|uh|like|you know|sort of|amen|turn to your neighbor)\b/gi, '')
      .trim();
    return res.json({
      summary: cleaned ? `### 📖 Sermon Reflection\n\n${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}.` : '',
      detectedTitle: '',
      detectedPassage: '',
      detectedSpeaker: '',
    });
  }
});

// ==========================================
// REAL-TIME GROUP CHAT SYSTEM
// ==========================================

interface ServerChatMessage {
  id: string;
  channelId: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderEmail?: string;
  isGoogleUser: boolean;
  createdAt: number;
  reactions: Record<string, string[]>;
  attachment?: {
    type: 'verse' | 'sermon_note';
    title: string;
    content: string;
    reference?: string;
  };
}

interface ServerChatChannel {
  id: string;
  name: string;
  topic: string;
  emoji: string;
  isPrivate?: boolean;
  creatorId?: string;
  createdAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
}

// In-memory chat storage with persistence
const chatChannels: Map<string, ServerChatChannel> = new Map([
  [
    'general',
    {
      id: 'general',
      name: 'general-fellowship',
      topic: 'Welcome, daily encouragement, and community fellowship in Christ',
      emoji: '🕊️',
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageTime: Date.now(),
    }
  ],
  [
    'sermon-discussion',
    {
      id: 'sermon-discussion',
      name: 'sermon-discussion',
      topic: 'Discussing Sunday sermons, preacher insights, and notes',
      emoji: '📖',
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageTime: Date.now(),
    }
  ],
  [
    'prayer-chain',
    {
      id: 'prayer-chain',
      name: 'prayer-chain',
      topic: 'Post live prayer requests and celebrate answered prayers together',
      emoji: '🙏',
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageTime: Date.now(),
    }
  ],
  [
    'bible-study',
    {
      id: 'bible-study',
      name: 'scripture-deep-dive',
      topic: 'Daily Bible questions, Greek/Hebrew word study, and verses',
      emoji: '📜',
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageTime: Date.now(),
    }
  ]
]);

// Start with empty real user messages
const chatMessages: ServerChatMessage[] = [];

// Active SSE Connections
const chatClients: Map<string, Response> = new Map();

function broadcastToChat(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  chatClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Handled in client cleanup
    }
  });
}

// 1. Get all group chat channels
app.get('/api/chat/channels', (_req: Request, res: Response) => {
  const list = Array.from(chatChannels.values()).map(c => {
    const channelMsgs = chatMessages.filter(m => m.channelId === c.id);
    const lastMsg = channelMsgs[channelMsgs.length - 1];
    return {
      ...c,
      lastMessage: lastMsg ? lastMsg.text : c.lastMessage || '',
      lastMessageTime: lastMsg ? lastMsg.createdAt : c.lastMessageTime || c.createdAt,
      messageCount: channelMsgs.length,
    };
  });
  return res.json(list);
});

// 2. Create a new group chat channel
app.post('/api/chat/channels', (req: Request, res: Response) => {
  const { name, topic, emoji, creatorId } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
  const id = `chan_${Date.now()}_${cleanName.slice(0, 15)}`;

  const newChannel: ServerChatChannel = {
    id,
    name: cleanName || 'new-group',
    topic: topic || 'Believers gathering in fellowship',
    emoji: emoji || '🕊️',
    creatorId,
    createdAt: Date.now(),
    lastMessage: 'Group chat created! Start the conversation.',
    lastMessageTime: Date.now()
  };

  chatChannels.set(id, newChannel);
  broadcastToChat('new_channel', newChannel);

  return res.json(newChannel);
});

// 3. Get messages for a channel
app.get('/api/chat/messages', (req: Request, res: Response) => {
  const channelId = String(req.query.channelId || 'general');
  const since = Number(req.query.since || 0);

  let filtered = chatMessages.filter(m => m.channelId === channelId);
  if (since > 0) {
    filtered = filtered.filter(m => m.createdAt > since);
  }

  return res.json(filtered);
});

// 4. Post a message to group chat
app.post('/api/chat/messages', (req: Request, res: Response) => {
  const { channelId, text, senderId, senderName, senderPhoto, senderEmail, isGoogleUser, attachment } = req.body;

  if (!channelId || !text || !text.trim()) {
    return res.status(400).json({ error: 'channelId and text are required' });
  }

  const message: ServerChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channelId,
    text: text.trim(),
    senderId: senderId || 'guest_user',
    senderName: senderName || 'Anonymous Believer',
    senderPhoto,
    senderEmail,
    isGoogleUser: !!isGoogleUser,
    createdAt: Date.now(),
    reactions: {},
    attachment: attachment || undefined,
  };

  chatMessages.push(message);

  // Keep last 1,000 messages in memory to prevent excessive memory usage
  if (chatMessages.length > 1000) {
    chatMessages.splice(0, chatMessages.length - 1000);
  }

  // Update channel last message
  const ch = chatChannels.get(channelId);
  if (ch) {
    ch.lastMessage = message.text;
    ch.lastMessageTime = message.createdAt;
  }

  // Broadcast in real-time to all connected users
  broadcastToChat('message', message);

  return res.json(message);
});

// 5. Toggle reaction on a message
app.post('/api/chat/react', (req: Request, res: Response) => {
  const { messageId, emoji, userName } = req.body;
  if (!messageId || !emoji || !userName) {
    return res.status(400).json({ error: 'messageId, emoji, and userName required' });
  }

  const msg = chatMessages.find(m => m.id === messageId);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (!msg.reactions) {
    msg.reactions = {};
  }

  const currentList = msg.reactions[emoji] || [];
  if (currentList.includes(userName)) {
    msg.reactions[emoji] = currentList.filter(u => u !== userName);
    if (msg.reactions[emoji].length === 0) {
      delete msg.reactions[emoji];
    }
  } else {
    msg.reactions[emoji] = [...currentList, userName];
  }

  const update = { messageId, reactions: msg.reactions, channelId: msg.channelId };
  broadcastToChat('reaction', update);

  return res.json(update);
});

// 6. Broadcast typing indicator
app.post('/api/chat/typing', (req: Request, res: Response) => {
  const { channelId, userName, isTyping } = req.body;
  broadcastToChat('typing', { channelId, userName, isTyping, timestamp: Date.now() });
  return res.json({ ok: true });
});

// 7. Real-Time Server-Sent Events (SSE) Stream
app.get('/api/chat/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  chatClients.set(clientId, res);

  // Send initial connection event with active client count
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, activeUsers: chatClients.size })}\n\n`);

  // Broadcast user count update
  broadcastToChat('presence', { activeUsers: chatClients.size });

  // Keep-alive heartbeat every 20 seconds to prevent proxy disconnects
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    chatClients.delete(clientId);
    broadcastToChat('presence', { activeUsers: chatClients.size });
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
