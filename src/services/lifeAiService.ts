export interface LifeAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    appId: string;
    label: string;
  };
  suggestedFollowUps?: string[];
}

export type LifeAiPersona = 'guide' | 'scholar' | 'navigator' | 'prayer';

const HISTORY_STORAGE_KEY = 'lifeai_chat_history_v2';

export class LifeAiService {
  /**
   * Sends user message to the server-side Gemini endpoint
   */
  public static async sendMessage(
    prompt: string,
    history: LifeAiMessage[] = [],
    persona: LifeAiPersona = 'guide'
  ): Promise<LifeAiMessage> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty');
    }

    try {
      const response = await fetch('/api/lifeai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(-8).map(m => ({
            sender: m.sender,
            text: m.text
          })),
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: data.reply || "I'm here to help you navigate LifeOS and grow in faith.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestion: data.actionSuggestion,
        suggestedFollowUps: data.suggestedFollowUps || []
      };
    } catch (err) {
      console.warn('Network error calling /api/lifeai/chat, using client fallback:', err);
      return {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: `### ✨ LifeAi Assistant\n\nI am with you! I can help you navigate **FaithLingo**, write in **ChurchNotes**, join **LifeMeet**, or study Scripture.\n\n* *"Trust in the LORD with all your heart and lean not on your own understanding."* — Proverbs 3:5\n\nWhat would you like to explore in LifeOS right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestion: { appId: 'faithlingo', label: 'Open FaithLingo' },
        suggestedFollowUps: ['How do I take sermon notes?', 'Show me daily reading plans', 'How do I start a video call?']
      };
    }
  }

  /**
   * Loads saved chat history from localStorage
   */
  public static getSavedHistory(): LifeAiMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [];
  }

  /**
   * Persists chat history to localStorage
   */
  public static saveHistory(messages: LifeAiMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      // Keep up to 50 recent messages to avoid quota limits
      const trimmed = messages.slice(-50);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  /**
   * Clears saved chat history
   */
  public static clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
  }
}
