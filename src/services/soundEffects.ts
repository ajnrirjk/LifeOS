/**
 * Web Audio API synthesizer for cheerful, game-like sound effects.
 * 100% offline, zero asset downloads, works in all browsers.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Cheerful chime on correct answer
  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1 (E5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2 (G#5)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(830.61, now + 0.08);
      gain2.gain.setValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);

      // Note 3 (B5 - higher harmony)
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(987.77, now + 0.16);
      gain3.gain.setValueAtTime(0.22, now + 0.16);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);
      osc3.start(now + 0.16);
      osc3.stop(now + 0.48);
    } catch {
      // ignore
    }
  }

  // Gentle low tone on incorrect answer (supportive, not harsh)
  playIncorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  // Discord & iMessage style message incoming notification sound
  playMessageNotification() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // First Pop tone (G5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second Pop tone (C6)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.18);
      gain2.gain.setValueAtTime(0.28, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch {
      // ignore
    }
  }

  // Purge / wipe sound effect
  playPurgeSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Tap button click
  playTap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  // Fanfare / victory sound on completing lesson
  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.12;
        const duration = idx === notes.length - 1 ? 0.6 : 0.22;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // ignore
    }
  }

  // Realistic cute cat meow (default)
  playMeow() {
    this.playBreedMeow('orange_tabby');
  }

  // Breed-Specific Meow Sound Effects with unique acoustic frequencies and envelopes
  playBreedMeow(breedId: string) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      switch (breedId) {
        case 'siamese': {
          // Siamese: Loud, raspy, highly vocal, nasal opera meow with frequency modulation
          const osc = this.ctx.createOscillator();
          const mod = this.ctx.createOscillator();
          const modGain = this.ctx.createGain();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          mod.type = 'sine';
          mod.frequency.setValueAtTime(28, now); // vibrato flutter
          modGain.gain.setValueAtTime(35, now);

          mod.connect(osc.frequency);
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.45);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          mod.start(now);
          osc.start(now);
          mod.stop(now + 0.46);
          osc.stop(now + 0.46);
          break;
        }

        case 'persian': {
          // Persian: Very gentle, breathy, polite high-pitched quiet squeak ("mew...")
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(820, now);
          osc.frequency.exponentialRampToValueAtTime(1020, now + 0.09);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.26);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.09, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.28);
          break;
        }

        case 'maine_coon': {
          // Maine Coon: Iconic trill-chirrup ("Brrr-meow! / Prrr-rt!"), chirpy rolling purr-meow
          for (let i = 0; i < 4; i++) {
            const trill = this.ctx.createOscillator();
            const trillGain = this.ctx.createGain();
            const t = now + i * 0.04;
            trill.type = 'triangle';
            trill.frequency.setValueAtTime(380 + i * 65, t);
            trillGain.gain.setValueAtTime(0.12, t);
            trillGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            trill.connect(trillGain);
            trillGain.connect(this.ctx.destination);
            trill.start(t);
            trill.stop(t + 0.04);
          }
          // Follow-up rising chirp
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(560, now + 0.16);
          osc.frequency.exponentialRampToValueAtTime(740, now + 0.26);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.44);
          gain.gain.setValueAtTime(0.01, now + 0.16);
          gain.gain.linearRampToValueAtTime(0.19, now + 0.22);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + 0.16);
          osc.stop(now + 0.44);
          break;
        }

        case 'scottish_fold': {
          // Scottish Fold: Cute innocent baby-kitten squeak ("Mee-eep!")
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(940, now);
          osc.frequency.exponentialRampToValueAtTime(1180, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(910, now + 0.22);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.23);
          break;
        }

        case 'bengal': {
          // Bengal: Throaty, wild, raspy leopard growl-meow
          const osc = this.ctx.createOscillator();
          const sub = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          sub.type = 'triangle';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.14);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.38);

          sub.frequency.setValueAtTime(180, now);
          sub.frequency.exponentialRampToValueAtTime(320, now + 0.14);
          sub.frequency.exponentialRampToValueAtTime(160, now + 0.38);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gain);
          sub.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          sub.start(now);
          osc.stop(now + 0.4);
          sub.stop(now + 0.4);
          break;
        }

        case 'tuxedo': {
          // Tuxedo: Distinguished crisp double-chirp ("Meow-mew!")
          // Note 1
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(540, now);
          osc1.frequency.exponentialRampToValueAtTime(710, now + 0.08);
          osc1.frequency.exponentialRampToValueAtTime(560, now + 0.16);
          gain1.gain.setValueAtTime(0.16, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
          osc1.connect(gain1);
          gain1.connect(this.ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.17);

          // Note 2
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(620, now + 0.18);
          osc2.frequency.exponentialRampToValueAtTime(780, now + 0.25);
          osc2.frequency.exponentialRampToValueAtTime(590, now + 0.35);
          gain2.gain.setValueAtTime(0.18, now + 0.18);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(now + 0.18);
          osc2.stop(now + 0.36);
          break;
        }

        case 'british_shorthair': {
          // British Shorthair: Round, calm, deep dignified "Moww"
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(460, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(340, now + 0.36);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.38);
          break;
        }

        case 'sphynx': {
          // Sphynx: Fast, quirky, chirpy elf squeak
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(680, now);
          osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.19);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'black_cat': {
          // Midnight Bombay: Mystical, melodic smooth midnight purr-meow
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(630, now + 0.14);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.42);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.44);
          break;
        }

        case 'ragdoll': {
          // Ragdoll: Ultra relaxed, sleepy floof yawn-meow
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(510, now + 0.16);
          osc.frequency.exponentialRampToValueAtTime(290, now + 0.45);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.48);
          break;
        }

        case 'calico': {
          // Calico: Sassy, chirpy rising-pitch "Mrr-oww!"
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(510, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(620, now + 0.32);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.19, now + 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'russian_blue': {
          // Russian Blue: Crystal bell soft silver meow
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(860, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }

        case 'munchkin': {
          // Munchkin: Tiny kitten double squeak
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1150, now + 0.06);
          osc.frequency.exponentialRampToValueAtTime(850, now + 0.16);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }

        case 'norwegian_forest': {
          // Norwegian Forest: Deep echoing mountain chirp
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(560, now + 0.14);
          osc.frequency.exponentialRampToValueAtTime(350, now + 0.36);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.38);
          break;
        }

        case 'japanese_bobtail': {
          // Japanese Bobtail: Maneki-Neko auspicious high chirp
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(940, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.28);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        default: {
          // Orange Tabby & default: Classic cheerful, goofy loud "Meee-OW!"
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(460, now);
          osc.frequency.exponentialRampToValueAtTime(760, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(540, now + 0.32);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
      }
    } catch {}
  }

  // Rhythmic soft purr
  playPurr() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.14;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(58 + Math.random() * 6, t);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      }
    } catch {}
  }

  // Crunchy nibble munch
  playMunch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.08;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + i * 150, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    } catch {}
  }

  // Cute water or milk slurp
  playSlurp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Soft squish bounce when dragging and dropping a cat
  playDropSquish() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Magical sparkly dress-up chime
  playCostumeChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [659.25, 880.0, 1174.66, 1318.51]; // E5, A5, D6, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {}
  }

  // Coin / reward collect clink
  playCoin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Cozy Lo-Fi Cat Sanctuary BGM loop (Web Audio synthesized kalimba & soft bells)
  private catBgmTimer: any = null;
  public isCatBgmActive: boolean = false;

  startCatBgm() {
    if (this.isCatBgmActive || !this.enabled) return;
    this.initCtx();
    this.isCatBgmActive = true;
    const notes = [
      523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5
      587.33, 698.46, 880.0, 698.46,  // D5, F5, A5, F5
      659.25, 783.99, 987.77, 783.99, // E5, G5, B5, G5
      523.25, 783.99, 1046.5, 783.99  // C5, G5, C6, G5
    ];
    let noteIdx = 0;
    this.catBgmTimer = setInterval(() => {
      if (!this.isCatBgmActive || !this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
        noteIdx++;
      } catch {}
    }, 420);
  }

  stopCatBgm() {
    this.isCatBgmActive = false;
    if (this.catBgmTimer) {
      clearInterval(this.catBgmTimer);
      this.catBgmTimer = null;
    }
  }
}

export const sounds = new SoundEffectsService();
