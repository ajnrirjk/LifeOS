import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { LifeOSAppContentRenderer } from './LifeOSAppContentRenderer';
import { LifeOSApp, SplitRatioPreset } from '../../types/lifeos';
import {
  X,
  Maximize2,
  Minimize2,
  Minus,
  ArrowLeftRight,
  ChevronDown,
  LayoutGrid,
  Columns2,
  Smartphone,
  Check
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface PaneHeaderProps {
  pane: 'primary' | 'secondary';
  app: LifeOSApp;
  allApps: LifeOSApp[];
  isActive: boolean;
  onSelectApp: (appId: string) => void;
  onSwap: () => void;
  onMaximize: () => void;
  onClose: () => void;
  currentPreset: SplitRatioPreset;
  onSelectPreset: (preset: SplitRatioPreset) => void;
}

const PaneHeader: React.FC<PaneHeaderProps> = ({
  pane,
  app,
  allApps,
  isActive,
  onSelectApp,
  onSwap,
  onMaximize,
  onClose,
  currentPreset,
  onSelectPreset
}) => {
  const [isAppPickerOpen, setIsAppPickerOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);

  return (
    <div
      className={`h-9 px-3 border-b flex items-center justify-between select-none shrink-0 text-xs transition-colors relative z-20 ${
        isActive
          ? 'bg-stone-100/95 dark:bg-slate-900/95 border-emerald-500/30 text-stone-900 dark:text-stone-100'
          : 'bg-stone-200/80 dark:bg-slate-950/80 border-white/10 text-stone-600 dark:text-stone-400'
      }`}
    >
      {/* Left: Window Controls & App Selector */}
      <div className="flex items-center gap-2 relative">
        {/* Traffic Light Mini Controls */}
        <div className="flex items-center gap-1.5 mr-1">
          {/* Close pane */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-[8px] text-white transition-transform active:scale-90 group"
            title="Close this pane (expand remaining app)"
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {/* Maximize to full screen */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-[8px] text-white transition-transform active:scale-90 group"
            title="Maximize this app (exit split-screen)"
          >
            <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Current App Button with Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              sounds.playTap();
              setIsAppPickerOpen(!isAppPickerOpen);
              setIsPresetMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-black text-xs transition-colors"
            title="Switch application in this pane"
          >
            <span className="text-sm">{app.emoji}</span>
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{app.title}</span>
            <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
          </button>

          {/* App Switcher Dropdown */}
          <AnimatePresence>
            {isAppPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-8 left-0 w-56 bg-stone-900/98 border border-white/20 rounded-2xl shadow-2xl p-2 z-50 text-stone-200 backdrop-blur-2xl space-y-1 max-h-72 overflow-y-auto"
              >
                <div className="text-[10px] font-black uppercase text-stone-400 px-2 py-1 flex items-center justify-between">
                  <span>Switch App ({pane === 'primary' ? 'Left / Top' : 'Right / Bottom'})</span>
                  <button onClick={() => setIsAppPickerOpen(false)} className="text-stone-400 hover:text-white">✕</button>
                </div>
                {allApps.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      sounds.playTap();
                      onSelectApp(a.id);
                      setIsAppPickerOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      a.id === app.id
                        ? 'bg-emerald-600 text-white font-black'
                        : 'hover:bg-white/10 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{a.emoji}</span>
                      <span className="truncate font-semibold">{a.title}</span>
                    </div>
                    {a.id === app.id && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pane Tag Badge */}
        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10 text-stone-500 dark:text-stone-400">
          {pane === 'primary' ? 'Pane 1' : 'Pane 2'}
        </span>
      </div>

      {/* Right: Split Presets, Swap & Actions */}
      <div className="flex items-center gap-1">
        {/* Quick Presets (Only on Primary pane header on desktop) */}
        {pane === 'primary' && (
          <div className="hidden lg:flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => onSelectPreset('50-50')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                currentPreset === '50-50'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-white/10 text-stone-400 hover:text-stone-200'
              }`}
              title="50/50 Balanced Split"
            >
              50:50
            </button>
            <button
              onClick={() => onSelectPreset('70-30')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                currentPreset === '70-30'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-white/10 text-stone-400 hover:text-stone-200'
              }`}
              title="70/30 Focus Split (Main left)"
            >
              70:30
            </button>
            <button
              onClick={() => onSelectPreset('30-70')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                currentPreset === '30-70'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'hover:bg-white/10 text-stone-400 hover:text-stone-200'
              }`}
              title="30/70 Companion Split (Study right)"
            >
              30:70
            </button>
          </div>
        )}

        {/* Swap Apps Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwap();
          }}
          className="p-1 px-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
          title="Swap Left and Right Panes"
        >
          <ArrowLeftRight className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="hidden xl:inline">Swap</span>
        </button>

        {/* Maximize to Single Window */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          title="Maximize this app to full screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Close Pane */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg hover:bg-rose-500 hover:text-white text-stone-500 transition-colors"
          title="Close this split pane"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const LifeOSSplitPaneView: React.FC = () => {
  const {
    splitScreen,
    apps,
    setSplitRatio,
    setSplitPreset,
    swapSplitApps,
    setPrimaryApp,
    setSecondaryApp,
    setActivePane,
    exitSplitScreen,
    showDesktop
  } = useLifeOS();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  // Detect orientation / mobile viewport
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsMobilePortrait(window.innerWidth < 768);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const primaryApp = apps.find(a => a.id === splitScreen.primaryAppId) || apps[0];
  const secondaryApp = apps.find(a => a.id === splitScreen.secondaryAppId) || apps[1] || apps[0];

  // Draggable Divider Handlers (Mouse & Touch)
  const handleStartDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    sounds.playTap();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (isMobilePortrait) {
        // Vertical Split Calculation (Height percentage)
        const newRatio = ((clientY - rect.top) / rect.height) * 100;
        setSplitRatio(newRatio);
      } else {
        // Horizontal Split Calculation (Width percentage)
        const newRatio = ((clientX - rect.left) / rect.width) * 100;
        setSplitRatio(newRatio);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isMobilePortrait, setSplitRatio]);

  const primaryStyle = isMobilePortrait
    ? { height: `${splitScreen.splitRatio}%`, width: '100%' }
    : { width: `${splitScreen.splitRatio}%`, height: '100%' };

  const secondaryStyle = isMobilePortrait
    ? { height: `${100 - splitScreen.splitRatio}%`, width: '100%' }
    : { width: `${100 - splitScreen.splitRatio}%`, height: '100%' };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex overflow-hidden relative select-none ${
        isMobilePortrait ? 'flex-col' : 'flex-row'
      }`}
    >
      {/* Invisible Overlay during drag to prevent iframe / selection trapping */}
      {isDragging && (
        <div
          className={`fixed inset-0 z-50 select-none ${
            isMobilePortrait ? 'cursor-row-resize' : 'cursor-col-resize'
          }`}
        />
      )}

      {/* ========================================================================= */}
      {/* PRIMARY PANE (Left on Desktop / Top on Mobile)                            */}
      {/* ========================================================================= */}
      <div
        style={primaryStyle}
        onClick={() => setActivePane('primary')}
        className={`flex flex-col overflow-hidden bg-amber-50/95 dark:bg-slate-950/95 backdrop-blur-xl relative transition-[width,height] ${
          isDragging ? 'duration-0' : 'duration-150 ease-out'
        } ${
          splitScreen.activePane === 'primary' ? 'ring-1 ring-emerald-500/30' : ''
        }`}
      >
        <PaneHeader
          pane="primary"
          app={primaryApp}
          allApps={apps}
          isActive={splitScreen.activePane === 'primary'}
          onSelectApp={(id) => setPrimaryApp(id)}
          onSwap={swapSplitApps}
          onMaximize={() => exitSplitScreen(primaryApp.id)}
          onClose={() => exitSplitScreen(secondaryApp.id)}
          currentPreset={splitScreen.preset}
          onSelectPreset={setSplitPreset}
        />
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          <LifeOSAppContentRenderer
            appId={primaryApp.id}
            onReturnToDesktop={() => exitSplitScreen(secondaryApp.id)}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DRAGGABLE CENTER SPLITTER DIVIDER                                         */}
      {/* ========================================================================= */}
      {isMobilePortrait ? (
        /* Mobile Horizontal Drag Handle */
        <div
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
          onDoubleClick={() => setSplitPreset('50-50')}
          className={`h-3 w-full shrink-0 flex items-center justify-center cursor-row-resize touch-none select-none z-30 transition-colors ${
            isDragging
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-800/80 hover:bg-stone-700/80 active:bg-emerald-500 text-stone-400'
          }`}
          title="Drag up/down to resize panes • Double-tap for 50/50"
        >
          <div className="w-12 h-1 rounded-full bg-white/70" />
        </div>
      ) : (
        /* Desktop Vertical Drag Handle */
        <div
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
          onDoubleClick={() => setSplitPreset('50-50')}
          className={`w-2.5 h-full shrink-0 flex items-center justify-center cursor-col-resize select-none z-30 group transition-all relative ${
            isDragging
              ? 'bg-emerald-500'
              : 'bg-stone-300/30 dark:bg-stone-800/60 hover:bg-emerald-500/80 border-x border-white/5'
          }`}
          title="Drag left/right to resize panes • Double-click for 50/50"
        >
          {/* Centered Pill Grip */}
          <div
            className={`w-1 h-9 rounded-full transition-colors ${
              isDragging ? 'bg-white' : 'bg-stone-400/80 group-hover:bg-white'
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY PANE (Right on Desktop / Bottom on Mobile)                      */}
      {/* ========================================================================= */}
      <div
        style={secondaryStyle}
        onClick={() => setActivePane('secondary')}
        className={`flex flex-col overflow-hidden bg-amber-50/95 dark:bg-slate-950/95 backdrop-blur-xl relative transition-[width,height] ${
          isDragging ? 'duration-0' : 'duration-150 ease-out'
        } ${
          splitScreen.activePane === 'secondary' ? 'ring-1 ring-emerald-500/30' : ''
        }`}
      >
        <PaneHeader
          pane="secondary"
          app={secondaryApp}
          allApps={apps}
          isActive={splitScreen.activePane === 'secondary'}
          onSelectApp={(id) => setSecondaryApp(id)}
          onSwap={swapSplitApps}
          onMaximize={() => exitSplitScreen(secondaryApp.id)}
          onClose={() => exitSplitScreen(primaryApp.id)}
          currentPreset={splitScreen.preset}
          onSelectPreset={setSplitPreset}
        />
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
          <LifeOSAppContentRenderer
            appId={secondaryApp.id}
            onReturnToDesktop={() => exitSplitScreen(primaryApp.id)}
          />
        </div>
      </div>
    </div>
  );
};
