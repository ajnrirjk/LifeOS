import React, { createContext, useContext, useState, useEffect } from 'react';
import { LifeOSApp, LifeOSWindowState, LifeOSWallpaper, SplitScreenState, SplitRatioPreset } from '../types/lifeos';
import { DEFAULT_LIFEOS_APPS } from '../data/lifeosAppsData';
import { WidgetId, DEFAULT_ACTIVE_WIDGETS } from '../types/widgets';
import { sounds } from '../services/soundEffects';

interface LifeOSContextType {
  apps: LifeOSApp[];
  activeAppId: string;
  setActiveAppId: (id: string) => void;
  openWindows: Record<string, LifeOSWindowState>;
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  minimizeApp: (appId: string) => void;
  maximizeApp: (appId: string) => void;
  createApp: (app: Omit<LifeOSApp, 'id'>) => string;
  deleteApp: (appId: string) => void;
  updateApp: (appId: string, updates: Partial<LifeOSApp>) => void;
  wallpaper: LifeOSWallpaper;
  setWallpaper: (wp: LifeOSWallpaper) => void;
  isLaunchpadOpen: boolean;
  setIsLaunchpadOpen: (open: boolean) => void;
  isDesktopView: boolean;
  setIsDesktopView: (view: boolean) => void;
  showDesktop: () => void;
  desktopWidgets: WidgetId[];
  addDesktopWidget: (id: WidgetId) => void;
  removeDesktopWidget: (id: WidgetId) => void;
  resetDesktopWidgets: () => void;
  moveDesktopWidget: (id: WidgetId, direction: 'prev' | 'next') => void;

  // Split-Screen Dual Window Canvas
  splitScreen: SplitScreenState;
  enterSplitScreen: (primaryId?: string, secondaryId?: string, preset?: SplitRatioPreset) => void;
  exitSplitScreen: (keepAppId?: string) => void;
  setSplitRatio: (ratio: number) => void;
  setSplitPreset: (preset: SplitRatioPreset) => void;
  swapSplitApps: () => void;
  setPrimaryApp: (appId: string) => void;
  setSecondaryApp: (appId: string) => void;
  setActivePane: (pane: 'primary' | 'secondary') => void;
  toggleSplitScreen: () => void;
}

const DEFAULT_SPLIT_SCREEN: SplitScreenState = {
  isSplit: false,
  primaryAppId: 'bible_journal',
  secondaryAppId: 'fellowship_chat',
  splitRatio: 50,
  preset: '50-50',
  activePane: 'primary'
};

const LifeOSContext = createContext<LifeOSContextType | null>(null);

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<LifeOSApp[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_apps_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((a: any) => a.id !== 'tiktok') : [];
        const defaultMap = new Map(DEFAULT_LIFEOS_APPS.map(d => [d.id, d]));
        const updated = filtered.map((a: LifeOSApp) => {
          const sys = defaultMap.get(a.id);
          if (sys) {
            return {
              ...a,
              title: sys.title,
              emoji: sys.emoji,
              iconName: sys.iconName,
              category: sys.category,
              type: sys.type,
              color: sys.color,
              description: sys.description
            };
          }
          return a;
        });
        const systemIds = new Set(updated.map((a: LifeOSApp) => a.id));
        const missingSystem = DEFAULT_LIFEOS_APPS.filter(d => !systemIds.has(d.id));
        return [...updated, ...missingSystem];
      }
      return DEFAULT_LIFEOS_APPS;
    } catch {
      return DEFAULT_LIFEOS_APPS;
    }
  });

  const [activeAppId, setActiveAppId] = useState<string>('bible_journal');
  const [openWindows, setOpenWindows] = useState<Record<string, LifeOSWindowState>>({
    faithlingo: {
      appId: 'faithlingo',
      isOpen: true,
      isMinimized: false,
      isMaximized: true,
      zIndex: 10
    },
    bible_journal: {
      appId: 'bible_journal',
      isOpen: true,
      isMinimized: false,
      isMaximized: true,
      zIndex: 11
    }
  });

  const [wallpaper, setWallpaper] = useState<LifeOSWallpaper>(() => {
    try {
      return (localStorage.getItem('lifeos_wallpaper') as LifeOSWallpaper) || 'mountain';
    } catch {
      return 'mountain';
    }
  });

  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(true);

  // Split-Screen State with LocalStorage Persistence
  const [splitScreen, setSplitScreen] = useState<SplitScreenState>(() => {
    try {
      const saved = localStorage.getItem('lifeos_split_screen_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_SPLIT_SCREEN,
            ...parsed,
            isSplit: !!parsed.isSplit
          };
        }
      }
    } catch {}
    return DEFAULT_SPLIT_SCREEN;
  });

  useEffect(() => {
    try {
      localStorage.setItem('lifeos_split_screen_v1', JSON.stringify(splitScreen));
    } catch {}
  }, [splitScreen]);

  // Desktop Widgets state with localStorage persistence
  const [desktopWidgets, setDesktopWidgets] = useState<WidgetId[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_desktop_widgets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => id !== 'tiktok') as WidgetId[];
        }
      }
      return DEFAULT_ACTIVE_WIDGETS;
    } catch {
      return DEFAULT_ACTIVE_WIDGETS;
    }
  });

  // Persist widgets
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_desktop_widgets_v2', JSON.stringify(desktopWidgets));
    } catch {}
  }, [desktopWidgets]);

  // Persist apps in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_apps_v5', JSON.stringify(apps));
    } catch {}
  }, [apps]);

  // Persist wallpaper
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_wallpaper', wallpaper);
    } catch {}
  }, [wallpaper]);

  const showDesktop = () => {
    sounds.playTap();
    setIsDesktopView(true);
  };

  const enterSplitScreen = (primaryId?: string, secondaryId?: string, preset: SplitRatioPreset = '50-50') => {
    sounds.playTap();
    setIsDesktopView(false);
    setIsLaunchpadOpen(false);

    const prim = primaryId || activeAppId || 'bible_journal';
    let sec = secondaryId;
    if (!sec || sec === prim) {
      if (prim === 'bible_journal') sec = 'fellowship_chat';
      else if (prim === 'faithlingo') sec = 'bible_journal';
      else if (prim === 'fellowship_chat') sec = 'bible_journal';
      else if (prim === 'youtube') sec = 'bible_journal';
      else sec = 'fellowship_chat';
    }

    const ratio = preset === '70-30' ? 70 : preset === '30-70' ? 30 : 50;

    setSplitScreen({
      isSplit: true,
      primaryAppId: prim,
      secondaryAppId: sec,
      splitRatio: ratio,
      preset,
      activePane: 'primary'
    });

    setActiveAppId(prim);
  };

  const exitSplitScreen = (keepAppId?: string) => {
    sounds.playTap();
    const target = keepAppId || splitScreen.primaryAppId;
    setSplitScreen(prev => ({
      ...prev,
      isSplit: false,
      activePane: 'primary'
    }));
    setActiveAppId(target);
    setIsDesktopView(false);
  };

  const setSplitRatio = (ratio: number) => {
    const clamped = Math.max(20, Math.min(80, Math.round(ratio)));
    setSplitScreen(prev => {
      let preset: SplitRatioPreset = '50-50';
      if (clamped >= 65) preset = '70-30';
      else if (clamped <= 35) preset = '30-70';
      return {
        ...prev,
        splitRatio: clamped,
        preset
      };
    });
  };

  const setSplitPreset = (preset: SplitRatioPreset) => {
    sounds.playTap();
    const ratio = preset === '70-30' ? 70 : preset === '30-70' ? 30 : 50;
    setSplitScreen(prev => ({
      ...prev,
      preset,
      splitRatio: ratio
    }));
  };

  const swapSplitApps = () => {
    sounds.playTap();
    setSplitScreen(prev => ({
      ...prev,
      primaryAppId: prev.secondaryAppId,
      secondaryAppId: prev.primaryAppId
    }));
  };

  const setPrimaryApp = (appId: string) => {
    sounds.playTap();
    setSplitScreen(prev => {
      if (prev.secondaryAppId === appId) {
        return {
          ...prev,
          primaryAppId: appId,
          secondaryAppId: prev.primaryAppId
        };
      }
      return { ...prev, primaryAppId: appId };
    });
    setActiveAppId(appId);
  };

  const setSecondaryApp = (appId: string) => {
    sounds.playTap();
    setSplitScreen(prev => {
      if (prev.primaryAppId === appId) {
        return {
          ...prev,
          primaryAppId: prev.secondaryAppId,
          secondaryAppId: appId
        };
      }
      return { ...prev, secondaryAppId: appId };
    });
  };

  const setActivePane = (pane: 'primary' | 'secondary') => {
    setSplitScreen(prev => ({ ...prev, activePane: pane }));
    if (pane === 'primary') setActiveAppId(splitScreen.primaryAppId);
    else setActiveAppId(splitScreen.secondaryAppId);
  };

  const toggleSplitScreen = () => {
    if (splitScreen.isSplit) {
      exitSplitScreen();
    } else {
      enterSplitScreen();
    }
  };

  const launchApp = (appId: string) => {
    sounds.playTap();
    setIsLaunchpadOpen(false);
    setIsDesktopView(false);

    if (splitScreen.isSplit) {
      if (splitScreen.activePane === 'primary') {
        setSplitScreen(prev => ({ ...prev, primaryAppId: appId }));
      } else {
        setSplitScreen(prev => ({ ...prev, secondaryAppId: appId }));
      }
      setActiveAppId(appId);
      return;
    }

    setActiveAppId(appId);
    setOpenWindows(prev => {
      const maxZ = Math.max(...Object.values(prev).map(w => w.zIndex), 10);
      return {
        ...prev,
        [appId]: {
          appId,
          isOpen: true,
          isMinimized: false,
          isMaximized: true,
          zIndex: maxZ + 1
        }
      };
    });
  };

  const addDesktopWidget = (id: WidgetId) => {
    sounds.playVictory();
    setDesktopWidgets(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeDesktopWidget = (id: WidgetId) => {
    sounds.playTap();
    setDesktopWidgets(prev => prev.filter(wId => wId !== id));
  };

  const resetDesktopWidgets = () => {
    sounds.playTap();
    setDesktopWidgets(DEFAULT_ACTIVE_WIDGETS);
  };

  const moveDesktopWidget = (id: WidgetId, direction: 'prev' | 'next') => {
    sounds.playTap();
    setDesktopWidgets(prev => {
      const index = prev.indexOf(id);
      if (index === -1) return prev;
      const targetIndex = direction === 'prev' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const closeApp = (appId: string) => {
    sounds.playTap();
    if (splitScreen.isSplit) {
      // If closing one of the split apps, expand the other app to full screen
      if (splitScreen.primaryAppId === appId) {
        exitSplitScreen(splitScreen.secondaryAppId);
      } else if (splitScreen.secondaryAppId === appId) {
        exitSplitScreen(splitScreen.primaryAppId);
      }
      return;
    }

    setOpenWindows(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });

    setIsDesktopView(true);
  };

  const minimizeApp = (appId: string) => {
    sounds.playTap();
    if (splitScreen.isSplit) {
      setIsDesktopView(true);
      return;
    }

    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: true
      }
    }));
    setIsDesktopView(true);
  };

  const maximizeApp = (appId: string) => {
    sounds.playTap();
    if (splitScreen.isSplit) {
      exitSplitScreen(appId);
      return;
    }

    setIsDesktopView(false);
    setOpenWindows(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: false,
        isMaximized: !prev[appId]?.isMaximized
      }
    }));
  };

  const createApp = (appData: Omit<LifeOSApp, 'id'>): string => {
    sounds.playVictory();
    const newId = `custom_${Date.now()}`;
    const newApp: LifeOSApp = {
      ...appData,
      id: newId,
      isSystem: false,
      isPinned: true,
      color: appData.color || 'from-indigo-600 to-blue-700',
      createdAt: new Date().toISOString()
    };
    setApps(prev => [newApp, ...prev]);
    return newId;
  };

  const deleteApp = (appId: string) => {
    sounds.playTap();
    setApps(prev => prev.filter(a => a.id !== appId));
    closeApp(appId);
  };

  const updateApp = (appId: string, updates: Partial<LifeOSApp>) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, ...updates } : a));
  };

  return (
    <LifeOSContext.Provider
      value={{
        apps,
        activeAppId,
        setActiveAppId,
        openWindows,
        launchApp,
        closeApp,
        minimizeApp,
        maximizeApp,
        createApp,
        deleteApp,
        updateApp,
        wallpaper,
        setWallpaper,
        isLaunchpadOpen,
        setIsLaunchpadOpen,
        isDesktopView,
        setIsDesktopView,
        showDesktop,
        desktopWidgets,
        addDesktopWidget,
        removeDesktopWidget,
        resetDesktopWidgets,
        moveDesktopWidget,

        // Split-Screen Dual Window Canvas
        splitScreen,
        enterSplitScreen,
        exitSplitScreen,
        setSplitRatio,
        setSplitPreset,
        swapSplitApps,
        setPrimaryApp,
        setSecondaryApp,
        setActivePane,
        toggleSplitScreen
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
};

export const useLifeOS = () => {
  const context = useContext(LifeOSContext);
  if (!context) throw new Error('useLifeOS must be used within a LifeOSProvider');
  return context;
};
