import React, { useState } from 'react';
import { sounds } from '../../services/soundEffects';
import { Play, RotateCcw, Volume2, VolumeX, Award, ArrowLeft } from 'lucide-react';

interface ScriptureMatrixGameProps {
  onGameOver?: (score: number, coinsEarned: number) => void;
  onBack?: () => void;
  highScore: number;
}

const PADS = [
  { id: 0, label: 'FAITH', emoji: '🕊️', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/50', border: 'border-emerald-400', noteFreq: 523.25 },
  { id: 1, label: 'HOPE', emoji: '⚓', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/50', border: 'border-blue-400', noteFreq: 659.25 },
  { id: 2, label: 'LOVE', emoji: '❤️', color: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/50', border: 'border-rose-400', noteFreq: 783.99 },
  { id: 3, label: 'PEACE', emoji: '🌿', color: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/50', border: 'border-amber-400', noteFreq: 1046.50 },
];

export const ScriptureMatrixGame: React.FC<ScriptureMatrixGameProps> = ({ onGameOver, onBack, highScore }) => {
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'player' | 'gameover'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);
  const [soundMuted, setSoundMuted] = useState(false);

  const playTone = (freq: number) => {
    if (soundMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const startGame = () => {
    sounds.playTap();
    setScore(0);
    const initialSeq = [Math.floor(Math.random() * 4)];
    setSequence(initialSeq);
    setPlayerIndex(0);
    setGameState('showing');
    playSequence(initialSeq);
  };

  const playSequence = (seq: number[]) => {
    setGameState('showing');
    let idx = 0;
    const interval = Math.max(300, 650 - seq.length * 20);

    const timer = setInterval(() => {
      if (idx < seq.length) {
        const padId = seq[idx];
        flashPad(padId);
        idx++;
      } else {
        clearInterval(timer);
        setActivePad(null);
        setPlayerIndex(0);
        setGameState('player');
      }
    }, interval);
  };

  const flashPad = (padId: number) => {
    setActivePad(padId);
    playTone(PADS[padId].noteFreq);
    setTimeout(() => {
      setActivePad((curr) => (curr === padId ? null : curr));
    }, 280);
  };

  const handlePadPress = (padId: number) => {
    if (gameState !== 'player') return;

    flashPad(padId);

    if (padId === sequence[playerIndex]) {
      const nextIndex = playerIndex + 1;

      if (nextIndex === sequence.length) {
        const nextScore = sequence.length;
        setScore(nextScore);
        if (!soundMuted) sounds.playCorrect();

        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setGameState('showing');

        setTimeout(() => {
          playSequence(nextSeq);
        }, 800);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      if (!soundMuted) sounds.playIncorrect();
      setGameState('gameover');

      if (score > currentHighScore) {
        setCurrentHighScore(score);
        if (!soundMuted) sounds.playCelebration();
      }
      if (onGameOver) onGameOver(score, Math.floor(score / 2) + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-4xl mx-auto select-none">
      <div className="w-full flex items-center justify-between mb-2 text-stone-200">
        <button
          onClick={() => {
            sounds.playTap();
            if (onBack) onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Arcade Hub</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs border border-indigo-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Best: {currentHighScore}</span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-[64vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 bg-stone-950 p-6 flex flex-col items-center justify-center">
        {/* Live HUD */}
        {gameState !== 'idle' && (
          <div className="absolute top-4 left-0 right-0 flex justify-between px-8 pointer-events-none z-10">
            <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-lg shadow-lg">
              Round: {sequence.length}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white font-bold text-xs shadow-lg">
              {gameState === 'showing' ? '👀 WATCH PATTERN' : '🎯 YOUR TURN!'}
            </div>
          </div>
        )}

        {/* 4 Glowing Landscape Crystal Sound Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl h-44 sm:h-52 z-0">
          {PADS.map((pad) => {
            const isLit = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadPress(pad.id)}
                disabled={gameState !== 'player'}
                className={`rounded-3xl bg-gradient-to-tr ${pad.color} flex flex-col items-center justify-center font-black text-white tracking-widest transition-all duration-100 shadow-xl relative overflow-hidden border-2 ${
                  isLit
                    ? `scale-95 brightness-150 ring-4 ring-white ${pad.glow} ${pad.border}`
                    : 'opacity-80 hover:opacity-100 active:scale-95 border-white/10'
                }`}
              >
                <div className="text-3xl mb-1 drop-shadow">
                  {pad.emoji}
                </div>
                <span className="text-xs sm:text-sm font-black drop-shadow">{pad.label}</span>
              </button>
            );
          })}
        </div>

        {/* Idle Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 mb-2 animate-pulse">
              🧠
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-indigo-200 via-white to-purple-300 bg-clip-text text-transparent">
              Scripture Memory Matrix
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-md mb-4">
              Watch the widescreen harmonic sound pads flash in sequence, then repeat the melody pattern!
            </p>

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START MEMORY TEST</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20 animate-in fade-in duration-200">
            <div className="text-3xl mb-1">💎</div>
            <h3 className="text-xl font-black text-white mb-2">Sequence Interrupted</h3>
            <div className="bg-white/10 rounded-2xl p-3 w-full max-w-xs mb-3 border border-white/15">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="text-xs text-stone-300">Rounds Mastered</span>
                <span className="text-lg font-black text-indigo-400">{score}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-xs text-stone-300">Best Memory</span>
                <span className="text-sm font-black text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-500/40 flex items-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY MELODY</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-400 mt-2 text-center">
        🎵 Each crystal pad rings with a distinct harmonic pitch (C, E, G, High C) to test both visual & audio memory!
      </p>
    </div>
  );
};
