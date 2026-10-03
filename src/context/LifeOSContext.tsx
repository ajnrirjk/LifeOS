import React, { createContext, useContext, useState, useEffect } from 'react';
import { LifeOSApp, LifeOSWindowState, LifeOSWallpaper } from '../types/lifeos';
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
}

const LifeOSContext = createContext<LifeOSContextType | null>(null);

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<LifeOSApp[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_apps_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) ? parsed.filter((a: any) => a.id !== 'tiktok') : [];
        const systemIds = new Set(filtered.map((a: LifeOSApp) => a.id));
        const missingSystem = DEFAULT_LIFEOS_APPS.filter(d => !systemIds.has(d.id));
        return [...filtered, ...missingSystem];
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

  const launchApp = (appId: string) => {
    sounds.playTap();
    setIsLaunchpadOpen(false);
    setIsDesktopView(false);
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

  const closeApp = (appId: string) => {
    sounds.playTap();
    setOpenWindows(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });

    // Close window and return to desktop view
    setIsDesktopView(true);
  };

  const minimizeApp = (appId: string) => {
    sounds.playTap();
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
      createdAt: new Date().toLocaleDateString()
    };

    setApps(prev => [...prev, newApp]);
    launchApp(newId);
    return newId;
  };

  const deleteApp = (appId: string) => {
    sounds.playTap();
    setApps(prev => prev.filter(a => a.id !== appId || a.isSystem));
    closeApp(appId);
  };

  const updateApp = (appId: string, updates: Partial<LifeOSApp>) => {
    setApps(prev => prev.map(a => (a.id === appId ? { ...a, ...updates } : a)));
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
        resetDesktopWidgets
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
