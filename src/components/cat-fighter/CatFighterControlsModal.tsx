import React, { useState } from 'react';
import { KeyBindings, MobileControlsConfig } from './types';
import { DEFAULT_P1_KEYS, DEFAULT_P2_KEYS } from './CatFighterRoster';
import { sounds } from '../../services/soundEffects';
import { X, Keyboard, Smartphone, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';

interface CatFighterControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  p1Keys: KeyBindings;
  setP1Keys: (keys: KeyBindings) => void;
  p2Keys: KeyBindings;
  setP2Keys: (keys: KeyBindings) => void;
  mobileConfig: MobileControlsConfig;
  setMobileConfig: (config: MobileControlsConfig) => void;
}

export const CatFighterControlsModal: React.FC<CatFighterControlsModalProps> = ({
  isOpen,
  onClose,
  p1Keys,
  setP1Keys,
  p2Keys,
  setP2Keys,
  mobileConfig,
  setMobileConfig
}) => {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'mobile'>('p1');
  const [listeningAction, setListeningAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyListen = (actionKey: keyof KeyBindings, isP2: boolean) => {
    sounds.playTap();
    setListeningAction(actionKey as string);

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newCode = e.code;
      if (isP2) {
        setP2Keys({ ...p2Keys, [actionKey]: newCode });
      } else {
        setP1Keys({ ...p1Keys, [actionKey]: newCode });
      }
      setListeningAction(null);
      window.removeEventListener('keydown', onKey);
    };

    window.addEventListener('keydown', onKey, { once: true });
  };

  const getCleanKeyName = (code: string) => {
    if (code.startsWith('Key')) return code.replace('Key', '');
    if (code.startsWith('Digit')) return code.replace('Digit', '');
    if (code.startsWith('Arrow')) return code.replace('Arrow', '↑ ↓ ← → ');
    if (code.startsWith('Numpad')) return 'Num ' + code.replace('Numpad', '');
    return code;
  };

  const actionsList: Array<{ key: keyof KeyBindings; label: string; desc: string; icon: string }> = [
    { key: 'left', label: 'Move Left / Retreat', desc: 'Walk backwards & auto-guard', icon: '⬅️' },
    { key: 'right', label: 'Move Right / Advance', desc: 'Walk forward towards foe', icon: '➡️' },
    { key: 'up', label: 'Jump / Aerial Pounce', desc: 'Vertical & forward jumping arc', icon: '⬆️' },
    { key: 'down', label: 'Crouch / Low Stance', desc: 'Duck under high attacks', icon: '⬇️' },
    { key: 'lightPunch', label: 'Light Claw (Jab)', desc: 'Fast, short-recovery scratch', icon: '🟡' },
    { key: 'heavyPunch', label: 'Heavy Paw (Smash)', desc: 'Powerful knockback claw kick', icon: '🔴' },
    { key: 'special', label: 'Special (Hadou-Paw / Skill)', desc: 'Fighter unique projectile / skill', icon: '🔵' },
    { key: 'superArt', label: 'SUPER ART (Ultra Claw)', desc: 'Devastating Level 100 cinematic KO', icon: '⚡' },
    { key: 'block', label: 'Manual Guard / Parry', desc: 'Block incoming strikes without chip dmg', icon: '🛡️' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">🕹️</span>
            <div>
              <h3 className="font-black text-lg tracking-tight leading-none">Custom Fighter Controls</h3>
              <p className="text-[11px] text-amber-100 font-medium">Remap keyboard keys or configure mobile touch arcade pads</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center bg-stone-950 p-2 border-b border-white/10 gap-2">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('p1');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'p1'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Player 1 (Main)</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('p2');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'p2'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Player 2 (Versus)</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('mobile');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'mobile'
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/30'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Touch</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {activeTab !== 'mobile' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1 text-xs text-stone-400 px-1">
                <span>Action</span>
                <span>Assigned Key (Click to change)</span>
              </div>

              {actionsList.map((item) => {
                const currentBindings = activeTab === 'p1' ? p1Keys : p2Keys;
                const assignedCode = currentBindings[item.key];
                const isListening = listeningAction === item.key;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-950/80 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-white leading-none">{item.label}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleKeyListen(item.key, activeTab === 'p2')}
                      className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all min-w-[90px] border ${
                        isListening
                          ? 'bg-red-500 text-white border-red-400 animate-pulse ring-2 ring-red-400'
                          : 'bg-white/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-400'
                      }`}
                    >
                      {isListening ? 'Press key...' : getCleanKeyName(assignedCode)}
                    </button>
                  </div>
                );
              })}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    sounds.playTap();
                    if (activeTab === 'p1') setP1Keys(DEFAULT_P1_KEYS);
                    if (activeTab === 'p2') setP2Keys(DEFAULT_P2_KEYS);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Button Size Scale</span>
                  <span className="text-xs font-black text-emerald-400">{Math.round(mobileConfig.buttonScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={mobileConfig.buttonScale}
                  onChange={(e) => setMobileConfig({ ...mobileConfig, buttonScale: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Button Opacity</span>
                  <span className="text-xs font-black text-emerald-400">{Math.round(mobileConfig.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={mobileConfig.opacity}
                  onChange={(e) => setMobileConfig({ ...mobileConfig, opacity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Touch Haptic Feedback</div>
                  <div className="text-[10px] text-stone-400">Vibrate device slightly on hits & specials</div>
                </div>
                <button
                  onClick={() => {
                    sounds.playTap();
                    setMobileConfig({ ...mobileConfig, haptics: !mobileConfig.haptics });
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                    mobileConfig.haptics
                      ? 'bg-emerald-500 text-stone-950 font-black'
                      : 'bg-white/10 text-stone-400'
                  }`}
                >
                  {mobileConfig.haptics ? 'ENABLED' : 'MUTED'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>SAVE & RETURN TO BATTLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
