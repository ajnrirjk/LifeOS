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
      if (typeof window !== 'undefined') {
        // 1. Direct key stored in localStorage
        const directKey = localStorage.getItem('lifeos_gemini_api_key');
        if (directKey && directKey.trim()) return directKey.trim();

        // 2. Settings JSON in localStorage
        const savedSettings = localStorage.getItem('lifeos_system_settings_v1');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.geminiApiKey && typeof parsed.geminiApiKey === 'string' && parsed.geminiApiKey.trim()) {
            return parsed.geminiApiKey.trim();
          }
        }

        const legacySettings = localStorage.getItem('lifeos_settings_v3');
        if (legacySettings) {
          const parsed = JSON.parse(legacySettings);
          if (parsed.geminiApiKey && typeof parsed.geminiApiKey === 'string' && parsed.geminiApiKey.trim()) {
            return parsed.geminiApiKey.trim();
          }
        }
      }

      // 3. Environment variables
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return (import.meta.env.VITE_GEMINI_API_KEY as string).trim();
      }
      if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        return (process.env.GEMINI_API_KEY as string).trim();
      }
    } catch {}

    return undefined;
  }

  /**
   * Cleans and sanitizes conversation turns for Google Gemini API.
   * Mandates:
   * 1. The first turn MUST have role 'user' (cannot start with 'model').
   * 2. Turns must strictly alternate between 'user' and 'model'.
   * 3. Prompt is cleanly appended as the final 'user' turn.
   */
  private static sanitizeHistoryForGemini(
    history: LifeAiMessage[],
    newPrompt: string
  ): { role: 'user' | 'model'; parts: { text: string }[] }[] {
    const turns: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    // Filter recent messages (exclude the latest prompt if caller already pushed it to history)
    const recent = history.slice(-6);

    for (const msg of recent) {
      // Skip empty or the prompt itself if already appended
      if (!msg.text || !msg.text.trim()) continue;
      if (msg.text.trim() === newPrompt.trim() && msg.sender === 'user') continue;

      const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';

      // Rule 1: The very first turn cannot be 'model'
      if (turns.length === 0 && role === 'model') {
        continue;
      }

      // Rule 2: Cannot have consecutive turns with the same role
      if (turns.length > 0 && turns[turns.length - 1].role === role) {
        turns[turns.length - 1].parts[0].text += `\n\n${msg.text.trim()}`;
      } else {
        turns.push({
          role,
          parts: [{ text: msg.text.trim() }]
        });
      }
    }

    // Append the current prompt as the trailing user turn
    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].parts[0].text += `\n\n${newPrompt.trim()}`;
    } else {
      turns.push({
        role: 'user',
        parts: [{ text: newPrompt.trim() }]
      });
    }

    return turns;
  }

  /**
   * Generates response via Gemini 2.5 Flash, falling back to local contextual knowledge engine
   */
  public static async generateResponse(opts: LifeAiRequestOptions): Promise<LifeAiMessage> {
    const { prompt, conversationHistory = [], persona = 'pastor' } = opts;
    const apiKey = this.getApiKey(opts.apiKey);

    const personaInstruction =
      persona === 'pastor'
        ? 'You are a warm, wise, compassionate pastoral counselor and Bible scholar. Speak with gentleness, scripture grounding, and uplifting encouragement.'
        : persona === 'navigator'
        ? 'You are the LifeOS Master Navigator and Productivity Guide. You know every app in LifeOS intimately (FaithLingo, ChurchNotes, Fellowship Chat, LifeMeet, Arcade Vault, YouTube). Provide direct, efficient, actionable system instructions and tips.'
        : 'You are an articulate scholar, writer, and theological researcher. Provide clear, comprehensive, and intellectually thorough answers with historical, Greek/Hebrew, and literary depth.';

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

    // 1. If Gemini API key is configured, query Google Gemini
    if (apiKey) {
      try {
        const contents = this.sanitizeHistoryForGemini(conversationHistory, prompt);

        // Try direct Google Gemini REST API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (replyText) {
            return {
              id: `lifeai_${Date.now()}`,
              sender: 'assistant',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionSuggestion: this.detectActionSuggestion(replyText)
            };
          }
        } else {
          console.warn('Gemini REST API returned error status:', response.status);
          // Try SDK fallback
          const client = new GoogleGenAI({ apiKey });
          const sdkRes = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          const sdkText = sdkRes.text?.trim();
          if (sdkText) {
            return {
              id: `lifeai_${Date.now()}`,
              sender: 'assistant',
              text: sdkText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionSuggestion: this.detectActionSuggestion(sdkText)
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call encountered error, falling back to local wisdom engine:', err);
      }
    }

    // 2. Intelligent Offline Fallback Engine
    return this.generateOfflineResponse(prompt, persona);
  }

  /**
   * Detects relevant LifeOS app action suggestion from response text
   */
  public static detectActionSuggestion(text: string): LifeAiMessage['actionSuggestion'] {
    const lower = text.toLowerCase();
    if (lower.includes('churchnotes') || lower.includes('sermon note') || lower.includes('journal')) {
      return { appId: 'bible_journal', label: 'Open ChurchNotes' };
    }
    if (lower.includes('faithlingo') || lower.includes('bible reader') || lower.includes('scripture flashcard')) {
      return { appId: 'faithlingo', label: 'Open FaithLingo' };
    }
    if (lower.includes('fellowship') || lower.includes('chat channel')) {
      return { appId: 'fellowship_chat', label: 'Open Fellowship Chat' };
    }
    if (lower.includes('lifemeet') || lower.includes('video call') || lower.includes('prayer room')) {
      return { appId: 'faith_meet', label: 'Open LifeMeet' };
    }
    if (lower.includes('arcade vault') || lower.includes('cat fighter') || lower.includes('mini-game')) {
      return { appId: 'mini_games', label: 'Play Arcade Vault' };
    }
    if (lower.includes('youtube') || lower.includes('worship music') || lower.includes('lofi')) {
      return { appId: 'youtube', label: 'Open YouTube' };
    }
    return undefined;
  }

  /**
   * Generates a rich, contextually aware response completely offline
   */
  public static generateOfflineResponse(prompt: string, persona: LifeAiRequestOptions['persona']): LifeAiMessage {
    const q = prompt.toLowerCase().trim();
    let text = '';
    let actionSuggestion: LifeAiMessage['actionSuggestion'];

    // ── GREETINGS ──
    if (/^(hi|hello|hey|greetings|good morning|good evening|good afternoon|howdy)/i.test(q)) {
      if (persona === 'pastor') {
        text = `Grace and peace to you! It is a blessing to connect. How can I walk alongside you today — whether in prayer, studying God's Word, preparing notes, or exploring LifeOS?`;
      } else if (persona === 'navigator') {
        text = `Welcome! I'm your LifeOS Navigator. Everything is running smoothly. Need quick shortcuts for ChurchNotes, FaithLingo leagues, LifeMeet video sessions, or the Arcade? Just let me know what you want to achieve!`;
      } else {
        text = `Greetings. Ready to delve into theological research, Greek/Hebrew word exegesis, church history, or hermeneutics. What subject or scripture text shall we examine?`;
      }
    }

    // ── SPECIFIC FAMOUS VERSES & SCRIPTURES ──
    else if (q.includes('romans 8:28') || q.includes('all things work together')) {
      text = `### Romans 8:28 Exegesis & Comfort
> *"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."*

**Key Biblical Insights:**
1. **"In all things" (Greek: *panta*)**: God does not say all things *are* good, but that He *works through* all things — even grief, setbacks, and trials — to weave His redemptive good.
2. **"For the good" (Greek: *agathon*)**: In Romans 8, this ultimate good is defined in verse 29: to be conformed to the image of Jesus Christ.
3. **The Anchor of Sovereignty**: Our peace does not rest on favorable circumstances, but on the unwavering faithfulness of the One guiding our steps.

*Application:* Bring whatever season or dilemma you are facing before God in prayer today. He is actively at work in ways you cannot yet see.`;
      actionSuggestion = { appId: 'bible_journal', label: 'Record in ChurchNotes' };
    }

    else if (q.includes('john 3:16') || q.includes('for god so loved the world')) {
      text = `### John 3:16 — The Heart of the Gospel
> *"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."*

**Theological Breakdown:**
1. **The Origin**: The unmatched love of God (*Agapē*) directed toward a broken world.
2. **The Sacrifice**: The Father gave His unique, beloved Son (*Monogenēs*), paying our ransom upon the cross.
3. **The Invitation**: "Whoever believes" (*Pisteuōn*) — universal accessibility by grace through faith.
4. **The Promise**: Deliverance from eternal spiritual death into everlasting communion with the Living God.

This single verse contains the entire arc of redemption: divine love, sacrificial giving, personal faith, and eternal hope.`;
      actionSuggestion = { appId: 'faithlingo', label: 'Read John in FaithLingo' };
    }

    else if (q.includes('psalm 23') || q.includes('the lord is my shepherd')) {
      text = `### Psalm 23 — The Shepherd's Care
> *"The LORD is my shepherd; I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul."* (Psalm 23:1-3)

**Devotional Reflection:**
- **In the Pastures**: David knew shepherd life intimately. Sheep only lie down when they are free from fear, friction with others, and hunger. God provides true rest.
- **In the Valley (v. 4)**: Notice David shifts from speaking *about* God ("He leads me") to speaking *directly to* God ("for *You* are with me"). In the darkest valleys, the Shepherd draws closest.
- **The Table & Anointing (v. 5)**: God prepares an abundant feast even in the presence of foes. His grace pursues us all the days of our lives.`;
      actionSuggestion = { appId: 'bible_journal', label: 'Journal on Psalm 23' };
    }

    else if (q.includes('philippians 4') || q.includes('anxious') || q.includes('anxiety') || q.includes('worry') || q.includes('peace of god')) {
      text = `### Philippians 4:6-7 — The Antidote to Anxiety
> *"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."*

**3 Steps to Trade Worry for Peace:**
1. **Acknowledge the Request**: Don't suppress worry; convert it directly into prayer and petition.
2. **Infuse Thanksgiving**: Gratitude reorients our perspective from the size of the problem to the greatness of our God.
3. **Receive the Sentry (Guard)**: The Greek word for "guard" (*phrouresei*) is a Roman military term. God’s supernatural peace stands sentinel over your thoughts and emotions.

*A Short Prayer:* "Father, I surrender tomorrow's burdens into Your hands. Fill my mind with Your quiet presence right now. In Jesus' name, Amen."`;
      actionSuggestion = { appId: 'bible_journal', label: 'Save Prayer in Notes' };
    }

    else if (q.includes('john 1:1') || q.includes('logos') || q.includes('word was god')) {
      text = `### The Concept of Logos in John 1:1
> *"In the beginning was the Word (Logos), and the Word was with God, and the Word was God."*

**Linguistic & Theological Context:**
1. **Greek Philosophy**: In Hellenistic thought, *Logos* was the impersonal rational principle animating the cosmos.
2. **Hebrew Thought (*Dabar*)**: In Jewish Scripture, the "Word of the LORD" is the personal, creative, and covenantal power of God that spoke the universe into existence (Genesis 1, Psalm 33:6).
3. **John’s Revelation**: John unites and transcends both by declaring that the *Logos* is a **Person** who became flesh (*sarx egeneto*, v. 14) — Jesus Christ, fully God and fully man.`;
      actionSuggestion = { appId: 'faithlingo', label: 'Study in Bible Reader' };
    }

    else if (q.includes('fruit of the spirit') || q.includes('galatians 5')) {
      text = `### The Fruit of the Spirit (Galatians 5:22-23)
> *"But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control."*

**Key Observations:**
- **Singular "Fruit" (Greek: *karpos*)**: It is one unified harvest produced by the Holy Spirit in a yielding heart, rather than separate virtues we manufacture by sheer willpower.
- **Rooted in Christ**: As Jesus taught in John 15, "Apart from me you can do nothing." Abiding in Christ naturally bears this fruit.
- **Contrast with Works of Flesh**: Living by the Spirit liberates us from both legalism and license into true spiritual maturity.`;
      actionSuggestion = { appId: 'bible_journal', label: 'Reflect in ChurchNotes' };
    }

    else if (q.includes('armor of god') || q.includes('ephesians 6')) {
      text = `### The Full Armor of God (Ephesians 6:10-18)
Standing firm against spiritual opposition:
1. **Belt of Truth**: Anchoring our mind in God's objective reality.
2. **Breastplate of Righteousness**: Guarding the heart with Christ’s imputed righteousness.
3. **Feet fitted with the Gospel of Peace**: Readiness and stability in Christ.
4. **Shield of Faith**: Extinguishing all the flaming darts of doubt and accusation.
5. **Helmet of Salvation**: Protecting our thoughts with the certainty of our redemption.
6. **Sword of the Spirit**: The spoken Word of God (*Rhema Theou*).
7. **Praying in the Spirit**: The spiritual lifeline sustaining every piece of armor.`;
    }

    // ── THEOLOGICAL QUESTIONS ──
    else if (q.includes('justification') || q.includes('sanctification')) {
      text = `### Justification vs. Sanctification

| Aspect | Justification | Sanctification |
| :--- | :--- | :--- |
| **Definition** | Declared righteous by God | Made progressively holy |
| **Timing** | Instantaneous at conversion | Lifelong ongoing process |
| **Agency** | Monergistic (God alone) | Synergistic (Spirit working in believer) |
| **Key Passage** | Romans 5:1 | 1 Thessalonians 5:23, Philippians 2:12-13 |
| **Status** | Absolute legal standing | Growing experiential maturity |

*Summary:* Justification is the root of salvation; Sanctification is the fruit. You are completely secure in Christ while growing each day into His likeness.`;
    }

    else if (q.includes('trinity') || q.includes('three in one')) {
      text = `### The Doctrine of the Trinity
The historic Christian confession affirms:
**God is one in essence (ousia), existing eternally as three distinct co-equal persons (hypostases): Father, Son, and Holy Spirit.**

- **The Father** is the source and architect of creation and redemption.
- **The Son** is eternally begotten, incarnate, and our Redeemer.
- **The Holy Spirit** eternally proceeds, indwells, regenerates, and empowers the Church.

*Key Scriptures:* Matthew 28:19 (one "name", three persons), 2 Corinthians 13:14, Matthew 3:16-17 (Jesus' baptism).`;
    }

    // ── SERMON OUTLINES ──
    else if (q.includes('sermon') && (q.includes('outline') || q.includes('grace') || q.includes('preach') || q.includes('idea'))) {
      text = `### 3-Point Sermon Outline: "The Scandal of Sovereign Grace"
**Scripture Text:** Ephesians 2:1-10

#### 1. The Desperate Condition: Dead in Sin (v. 1-3)
- Spiritual bankruptcy without Christ: unable to revive ourselves.
- The human dilemma is not that we are merely uninformed, but spiritually dead.

#### 2. The Divine Interruption: "But God..." (v. 4-7)
- Two of the most glorious words in Scripture: *But God, being rich in mercy...*
- Grace is unearned, initiated solely by God's great love.
- We are raised up and seated with Christ in heavenly places.

#### 3. The Divine Purpose: Created for Good Works (v. 8-10)
- Saved *by* grace through faith — not by works, so that no one can boast.
- Saved *for* good works — we are His workmanship (*poiēma*, masterpiece).

*Application Question:* Are you trying to earn God's love through religious exertion, or resting in the completed work of Christ and serving out of joyful gratitude?`;
      actionSuggestion = { appId: 'bible_journal', label: 'Copy to ChurchNotes' };
    }

    // ── PRAYER REQUESTS & DEVOTIONS ──
    else if (q.includes('prayer') || q.includes('pray') || q.includes('evening prayer') || q.includes('morning prayer')) {
      const isEvening = q.includes('evening') || q.includes('night') || q.includes('sleep');
      if (isEvening) {
        text = `### Evening Prayer of Peace & Rest
*"Heavenly Father, as the day comes to a close, I bring my thoughts and weary body to You. Thank You for Your sustaining grace throughout this day — for every breath, every victory, and every lesson.*

*I release into Your hands every unfinished task, every anxious thought, and every burden I was never meant to carry alone. You neither slumber nor sleep (Psalm 121:4). Watch over my home, quiet my racing mind with Your peace, and grant me restoring rest tonight so I may rise tomorrow to serve You with joy. In Jesus' mighty name, Amen."*`;
      } else {
        text = `### Morning Prayer of Consecration & Strength
*"Lord God Almighty, thank You for the gift of a new day. Lamentations 3:23 reminds me that Your mercies are new every single morning; great is Your faithfulness!*

*I dedicate my words, my decisions, my work, and my relationships to Your glory today. Where I face uncertainty, grant me discernment. Where I face frustration, grant me patience. Fill me afresh with Your Holy Spirit, and let Your light shine through me into the lives of everyone I encounter today. Through Christ Jesus our Lord, Amen."*`;
      }
      actionSuggestion = { appId: 'bible_journal', label: 'Save Prayer in Notes' };
    }

    // ── QUIET TIME & HABITS ──
    else if (q.includes('quiet time') || q.includes('devotional') || q.includes('habit') || q.includes('read the bible')) {
      text = `### Cultivating a Meaningful Daily Quiet Time

1. **Start with Stillness (2 minutes)**: Take deep breaths and pray: *"Lord, speak, for your servant is listening."*
2. **Read Systematically (10 minutes)**: Choose a book (like the Gospel of Mark or Philippians) rather than random flipping. Use FaithLingo's Bible Reader with KJV, NIV, or ESV.
3. **Ask 3 Questions**:
   - *What does this reveal about God's character?*
   - *What truth does this speak into my life?*
   - *What is one concrete action step I should take today?*
4. **Scribe Your Notes (5 minutes)**: Open **ChurchNotes** to record your insights and prayer points.
5. **Conclude with Prayer**: Talk to God as your loving Father about the day ahead.`;
      actionSuggestion = { appId: 'faithlingo', label: 'Open Bible Reader' };
    }

    // ── SYSTEM & APP NAVIGATION ──
    else if (q.includes('churchnotes') || q.includes('notes') || q.includes('note taking')) {
      text = `### ChurchNotes Scribe Guide
**ChurchNotes** is LifeOS's distraction-free sermon scribe and personal journal.
- **Fast Note Creation**: Capture sermon title, speaker, scripture references, and structured points in real-time.
- **Reflection Tags**: Categorize notes by #sermon, #prayer, #theology, or #study.
- **Local & Offline Persistence**: Notes are automatically saved in local browser storage and can be exported as clean markdown or text.`;
      actionSuggestion = { appId: 'bible_journal', label: 'Open ChurchNotes' };
    }

    else if (q.includes('faithlingo') || q.includes('league') || q.includes('streak') || q.includes('flashcard')) {
      text = `### FaithLingo App Guide
**FaithLingo** is the interactive biblical learning ecosystem inside LifeOS:
- **6 Covenant Units**: Progress through lessons covering Genesis (Creation & Patriarchs), Exodus (Law & Wilderness), Kingdom & Prophets, Gospels (Life of Christ), Acts & Epistles, and Revelation.
- **Scripture Flashcards**: Memorize verses with audio playback, masked recall, and difficulty ratings.
- **Leagues & Streaks**: Climb weekly disciple leagues with XP rewards and maintain daily study streaks.
- **66-Book Bible Reader**: Complete offline Bible with NIV, KJV, ESV, and BBE translations.`;
      actionSuggestion = { appId: 'faithlingo', label: 'Launch FaithLingo' };
    }

    else if (q.includes('lifemeet') || q.includes('video') || q.includes('meeting')) {
      text = `### LifeMeet HD Video Guide
**LifeMeet** provides secure peer-to-peer fellowship video calling:
- **Instant Rooms**: Create or join custom room codes with your church fellowship or small group.
- **Screen Share**: Share Bible studies, slides, or sermons with crystal-clear presentation mode.
- **Prayer Circles**: Dedicated breakout audio mode for group intercession.`;
      actionSuggestion = { appId: 'faith_meet', label: 'Launch LifeMeet' };
    }

    else if (q.includes('game') || q.includes('arcade') || q.includes('cat fighter')) {
      text = `### LifeOS Arcade Apps
Take a relaxing break with our faith-inspired mini-games:
- **Arcade Vault**:
  - 🕊️ *Flappy Dove*: Navigate through obstacles while collecting olive branches.
  - 🧱 *Babel Stacker*: Precision block-stacking challenge.
  - 🍎 *Eden Snake*: Retro arcade snake with biblical milestones.
  - ⚔️ *Demon Buster*: Action defense mini-game.
- **Cat Fighter Turbo**:
  - 🥊 16-bit retro fighting game featuring paw fireballs, super combos, and custom synth tunes!`;
      actionSuggestion = { appId: 'mini_games', label: 'Open Arcade Vault' };
    }

    else if (q.includes('youtube') || q.includes('music') || q.includes('lofi') || q.includes('video')) {
      text = `### YouTube Sanctuary in LifeOS
The YouTube app features curated, distraction-free Christian media:
- **Worship**: Elevation Worship, Maverick City, Bethel, and Hillsong favorites.
- **Bible Study**: Illustrated BibleProject deep-dives into biblical books and themes.
- **Lofi & Focus**: Peaceful Christian lofi beats with ambient library fireplaces for quiet studying.
- **The Chosen**: Iconic cinematic scenes from the groundbreaking series.`;
      actionSuggestion = { appId: 'youtube', label: 'Open YouTube' };
    }

    else if (q.includes('sesame') || q.includes('voice') || q.includes('speak') || q.includes('audio')) {
      text = `### Sesame AI Voice Engine
LifeOS includes 4 expressive pastoral voice profiles:
- **Pastor David** (Warm, reverent, and comforting)
- **Sister Grace** (Gentle, devotional, and peaceful)
- **Elijah** (Deep, resonant, and inspiring)
- **Ruth** (Compassionate and steady)

*Tip:* Click the **Read** button on any LifeAi message to hear it recited aloud immediately!`;
    }

    // ── GENERAL CONVERSATION & ASSISTANCE ──
    else {
      // Dynamic intelligent response based on active persona
      if (persona === 'scholar') {
        text = `Examining your inquiry: **"${prompt}"**

From a theological and scriptural vantage point, Scripture calls us to examine all things and hold fast to what is good (1 Thessalonians 5:21). Whether considering historical context, original language nuances (Hebrew/Greek), or church history, Scripture remains God-breathed and profitable for teaching, rebuking, correcting, and training in righteousness (2 Timothy 3:16).

Would you like to explore:
1. Specific biblical references and linguistic word studies
2. Historical and hermeneutical background
3. Systematic theology perspectives
4. How this connects to practical Christian discipleship?`;
      } else if (persona === 'navigator') {
        text = `Understood: **"${prompt}"**

Here is how LifeOS can support you with this:
- **Study & Scripture**: Explore our 66-book offline reader inside **FaithLingo**.
- **Reflections & Logging**: Open **ChurchNotes** to write detailed sermon points or personal entries.
- **Community**: Discuss with other disciples in **Fellowship Chat**.
- **Worship & Focus**: Play Christian focus lofi or worship sets in **YouTube**.

Tap one of the buttons below to jump right in!`;
        actionSuggestion = { appId: 'faithlingo', label: 'Open FaithLingo' };
      } else {
        text = `Thank you for sharing your heart: **"${prompt}"**

In every circumstance, Scripture reminds us that the Lord is near to all who call upon Him in truth (Psalm 145:18). He invites us to cast all our anxieties and questions upon Him, because He cares deeply for us (1 Peter 5:7).

Whatever you are seeking right now — clarity, peace, biblical wisdom, or guidance — know that God's Word is a lamp to your feet and a light to your path (Psalm 119:105).

How can I help you take the next step today? We can pray together, study a passage, or outline notes for your journal.`;
        actionSuggestion = { appId: 'bible_journal', label: 'Open ChurchNotes' };
      }
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
export default LifeAiService;
