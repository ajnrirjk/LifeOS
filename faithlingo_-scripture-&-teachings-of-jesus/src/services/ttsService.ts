/**
 * Text-to-Speech service for Scripture Audio Narrations & Prayers
 * Uses native Web Speech API - 100% offline, immediate, zero latency.
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  currentWordIndex: number;
  text: string;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((state: TTSState) => void)[] = [];
  private rate: number = 1.0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (state: TTSState) => void) {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const state: TTSState = {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      rate: this.rate,
      currentWordIndex: 0,
      text: this.currentText,
    };
    this.listeners.forEach(fn => fn(state));
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.isPlaying && this.currentText) {
      const text = this.currentText;
      this.stop();
      this.speak(text);
    } else {
      this.notify();
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this device');
      return;
    }

    this.stop();
    this.currentText = text;

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => 
      (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.isPlaying = false;
      this.isPaused = false;
      this.notify();
    };

    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public toggle(text: string) {
    if (this.isPlaying && !this.isPaused && this.currentText === text) {
      this.pause();
    } else if (this.isPaused && this.currentText === text) {
      this.resume();
    } else {
      this.speak(text);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    }
  }
}

export const tts = new TTSService();
