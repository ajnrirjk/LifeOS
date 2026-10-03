# 🕊️ FaithLingo & LifeOS

> **A Christian Spiritual Operating System & Gamified Bible Study Suite**

FaithLingo combines gamified scripture learning (Duolingo-style Bible study, streak goals, social leaderboards, AI prayer companion, multi-translation offline reader) with **LifeOS** — a desktop and mobile dashboard featuring live desktop widgets, AI-powered real-time church sermon note scribe with voice dictation & auto-sync to Google Drive, fellowship community chat, and curated worship media streaming.

---

## ✨ Key Features

### 🌿 LifeOS Desktop & Mobile Experience
- **Dual Mode:** macOS-inspired desktop with floating glass dock, traffic-light window management (close, minimize, maximize), and live widgets; alongside an edge-to-edge native mobile view with safe-area navigation.
- **Interactive Widgets:** Live widgets for daily streaks, sermon note excerpts, Verse of the Day with audio narration, prayer lists, spiritual habits tracker, and community chat.
- **Customization:** 5 dynamic wallpapers (Mountain Dawn, Midnight Nebula, Olive Sanctuary, Minimal Slate, Sacred Aurora), collapsible dock, and modular widget board.

### 📖 Church & Sermon Scribe (Bible Journal)
- **Live Voice Dictation:** Automatic speech-to-text recording during church services with sanctuary auto-gain mic sensitivity boost (+8dB to +14dB) and live VU level meter.
- **AI Sermon Cleaner:** Cleans transcriptions into structured bullet points, key takeaways, scripture references, and life applications.
- **Google Drive Cloud Sync:** Direct OAuth Google Drive integration to auto-save sermon notes securely.
- **Theming & Export:** Parchment Light, Midnight Dark, and Sepia themes with instant Markdown and text export.

### 🕊️ FaithLingo Gamified Bible Study
- **Interactive Lessons:** Bite-sized interactive quizzes, scripture fill-in-the-blanks, matching teachings, and Jesus' parables.
- **Duolingo Mechanics:** Daily streaks, Manna gems, refillable hearts, and weekly league leaderboards.
- **Scripture Reader:** Multi-translation Bible reader with verse audio narrations, bookmarking, and highlighting.
- **AI Prayer Companion:** Server-side Gemini AI prayer partner to pray with you on life situations, gratitude, and scripture reflections.

### 💬 Fellowship Community Chat
- **Real-time Channels:** Group chats for prayer requests, sermon discussion, and Bible study groups.
- **Rich Attachments:** 1-click sharing of today's verse or recent sermon notes directly into group conversations.

### ▶️ Worship & Bible Stream
- Curated worship music, BibleProject animations, and prayer focus streams with YouTube embedding and custom video queue.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional for AI features):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, TSX
- **AI:** Google GenAI SDK (`@google/genai`)
- **Storage & Auth:** Google Workspace OAuth (Drive API), Firebase Firestore & Auth, LocalStorage offline fallback

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
