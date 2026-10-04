import { tts, TTSState } from './ttsService';

export interface SesameVoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: string;
  sampleText: string;
}

export const SESAME_VOICES: SesameVoiceProfile[] = [
  {
    id: 'david-pastoral',
    name: 'Pastor David',
    gender: 'male',
    tone: 'Warm, reverent, and comforting',
    sampleText: 'The Lord is my shepherd; I shall not want.'
  },
  {
    id: 'grace-gentle',
    name: 'Sister Grace',
    gender: 'female',
    tone: 'Gentle, devotional, and peaceful',
    sampleText: 'Be still, and know that I am God.'
  },
  {
    id: 'elijah-resonant',
    name: 'Elijah',
    gender: 'male',
    tone: 'Deep, clear, and inspiring',
    sampleText: 'The heavens declare the glory of God.'
  },
  {
    id: 'ruth-devotional',
    name: 'Ruth',
    gender: 'female',
    tone: 'Compassionate and steady',
    sampleText: 'Your Word is a lamp to my feet and a light to my path.'
  }
];

class SesameVoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSesamePlaying: boolean = false;
  private listeners: ((state: TTSState) => void)[] = [];

  constructor() {
    // Also listen to fallback tts state changes
    tts.subscribe((state) => {
      if (!this.isSesamePlaying) {
        this.notify(state);
      }
    });
  }

  public subscribe(listener: (state: TTSState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(state: TTSState) {
    this.listeners.forEach(fn => fn(state));
  }

  /**
   * Speaks text using Sesame AI Voice if apiKey is available;
   * otherwise falls back seamlessly to browser native natural TTS.
   */
  public async speak(
    text: string,
    options?: {
      voiceId?: string;
      rate?: number;
      apiKey?: string;
      onEnd?: () => void;
    }
  ) {
    this.stop();

    const apiKey = options?.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('lifeos_sesame_api_key') : null);
    const voiceId = options?.voiceId || (typeof window !== 'undefined' ? localStorage.getItem('lifeos_sesame_voice_id') : null) || 'david-pastoral';

    // 1. Try Sesame Cloud TTS if configured
    if (apiKey && apiKey.trim()) {
      try {
        const response = await fetch('https://app.sesame.com/api/v1/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            text,
            voice: voiceId,
            speed: options?.rate || 1.0
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;
          this.isSesamePlaying = true;

          audio.playbackRate = options?.rate || 1.0;

          audio.onplay = () => {
            this.notify({
              isPlaying: true,
              isPaused: false,
              rate: options?.rate || 1.0,
              currentWordIndex: 0,
              text
            });
          };

          audio.onended = () => {
            this.isSesamePlaying = false;
            URL.revokeObjectURL(audioUrl);
            this.notify({
              isPlaying: false,
              isPaused: false,
              rate: options?.rate || 1.0,
              currentWordIndex: 0,
              text: ''
            });
            if (options?.onEnd) options.onEnd();
          };

          audio.onerror = () => {
            this.isSesamePlaying = false;
            // Fallback to native TTS if network or playback fails
            tts.speak(text, options?.onEnd);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Sesame AI Voice request error, falling back to Web Speech:', err);
      }
    }

    // 2. Seamless Fallback to high-quality native Web Speech API
    this.isSesamePlaying = false;
    if (options?.rate) {
      tts.setRate(options.rate);
    }
    tts.speak(text, options?.onEnd);
  }

  public setRate(rate: number) {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
    tts.setRate(rate);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isSesamePlaying = false;
    tts.stop();
  }

  public pause() {
    if (this.currentAudio && this.isSesamePlaying) {
      this.currentAudio.pause();
      this.notify({
        isPlaying: false,
        isPaused: true,
        rate: 1.0,
        currentWordIndex: 0,
        text: ''
      });
    } else {
      tts.pause();
    }
  }

  public resume() {
    if (this.currentAudio && !this.isSesamePlaying) {
      this.currentAudio.play();
      this.isSesamePlaying = true;
    } else {
      tts.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.isSesamePlaying || tts.isSpeaking();
  }
}

export const sesameVoice = new SesameVoiceService();
