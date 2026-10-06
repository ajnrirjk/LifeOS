import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserSettings,
  UserProfile,
  FellowshipMember,
  SystemAuditLog,
  SystemAnnouncement,
  UserRole,
  MASTER_ADMIN_EMAIL
} from '../types/settings';
import { sounds } from '../services/soundEffects';
import { googleDriveService } from '../services/googleDriveService';
import { firebaseGlobalService, DEFAULT_FELLOWSHIP_MEMBERS } from '../services/firebaseGlobalService';

interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeTab: 'profile' | 'appearance' | 'audio' | 'spiritual' | 'storage' | 'admin';
  setActiveTab: (tab: 'profile' | 'appearance' | 'audio' | 'spiritual' | 'storage' | 'admin') => void;
  
  // Google Authentication & Master Admin Status
  googleUser: GoogleUserInfo | null;
  isGoogleSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  isAuthorizedAdmin: boolean;
  masterAdminEmail: string;

  // Fellowship & User Roster (Admin)
  members: FellowshipMember[];
  updateMemberRole: (memberId: string, role: UserRole) => void;
  updateMemberStatus: (memberId: string, status: 'active' | 'muted' | 'banned') => void;
  addMember: (member: Omit<FellowshipMember, 'id'>) => void;
  deleteMember: (memberId: string) => void;
  
  // Announcements & Maintenance (Admin)
  announcement: SystemAnnouncement | null;
  setAnnouncement: (announcement: SystemAnnouncement | null) => void;
  toggleMaintenanceMode: (enabled: boolean, message?: string) => Promise<void> | void;
  
  // Feature Flags & App Ecosystem (Admin)
  toggleAppVisibility: (appId: string) => void;
  
  // Audit Logs (Admin)
  auditLogs: SystemAuditLog[];
  logAuditEvent: (action: string, details: string, category?: SystemAuditLog['category']) => void;
  clearAuditLogs: () => void;
  
  // Backup & Storage
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  factoryReset: () => void;
  
  // Security
  verifyAdminPin: (pin: string) => boolean;
  unlockAdmin: () => void;
  lockAdmin: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: typeof window !== 'undefined' ? (localStorage.getItem('lifeos_device_unique_user_id') || `usr_${Date.now()}`) : `usr_${Date.now()}`,
  name: 'Believer in Christ',
  handle: '@disciple',
  avatar: '🕊️',
  bio: 'Walking with Christ daily • LifeOS Pilgrim',
  role: 'user',
  email: '',
  joinedDate: 'Oct 2026',
  statusText: '📖 In the Word',
  isOnline: true
};

const DEFAULT_SETTINGS: UserSettings = {
  profile: DEFAULT_PROFILE,
  themeMode: 'dark',
  accentColor: 'emerald',
  fontScale: 'normal',
  reducedMotion: false,
  dockPosition: 'center',
  desktopGlassEffect: true,
  masterVolume: 85,
  soundFxEnabled: true,
  narratorVoiceEnabled: true,
  hapticFeedbackEnabled: true,
  geminiApiKey: typeof window !== 'undefined' ? (localStorage.getItem('lifeos_gemini_api_key') || '') : '',
  sesameApiKey: typeof window !== 'undefined' ? (localStorage.getItem('lifeos_sesame_api_key') || '') : '',
  sesameVoiceId: typeof window !== 'undefined' ? (localStorage.getItem('lifeos_sesame_voice_id') || 'david-pastoral') : 'david-pastoral',
  sesameEnabled: true,
  dailyReadingMinutesGoal: 15,
  preferredTranslation: 'NIV',
  prayerReminderEnabled: true,
  prayerReminderTime: '08:00',
  fastingModeActive: false,
  adminModeUnlocked: false,
  adminPin: '7777',
  maintenanceMode: false,
  maintenanceMessage: 'System maintenance in progress. All offline features remain functional.',
  activeAnnouncement: {
    id: 'ann_welcome',
    title: '🌿 Welcome to LifeOS 2.0',
    message: 'All spiritual apps, sermon note scribe & arcade games are fully synced!',
    type: 'celebration',
    isActive: true,
    author: 'System Admin',
    timestamp: 'Just now'
  },
  appVisibility: {
    faithlingo: true,
    bible_journal: true,
    fellowship_chat: true,
    faith_meet: true,
    mini_cats: true,
    mini_games: true,
    youtube: true
  },
  debugTelemetryEnabled: false
};

const INITIAL_MEMBERS: FellowshipMember[] = DEFAULT_FELLOWSHIP_MEMBERS;

const INITIAL_LOGS: SystemAuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date().toLocaleTimeString(),
    action: 'System Boot',
    actor: 'System',
    details: 'LifeOS environment initialized with 6 active modules.',
    category: 'system'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    action: 'Admin Mode Activated',
    actor: 'Administrator',
    details: 'Full God-Mode and administrative control panel unlocked.',
    category: 'admin'
  }
];

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const globalCfg = firebaseGlobalService.getGlobalConfig();
    try {
      const saved = localStorage.getItem('lifeos_system_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.profile && (parsed.profile.id === 'usr_me_001' || !parsed.profile.id)) {
          parsed.profile.id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          maintenanceMode: globalCfg.maintenanceMode !== undefined ? globalCfg.maintenanceMode : parsed.maintenanceMode,
          maintenanceMessage: globalCfg.maintenanceMessage || parsed.maintenanceMessage,
          activeAnnouncement: globalCfg.activeAnnouncement !== undefined ? globalCfg.activeAnnouncement : parsed.activeAnnouncement,
          appVisibility: {
            ...DEFAULT_SETTINGS.appVisibility,
            faith_meet: parsed?.appVisibility?.faith_meet !== false,
            ...(parsed.appVisibility || {}),
            ...(globalCfg.appVisibility || {})
          }
        };
      }
      return {
        ...DEFAULT_SETTINGS,
        maintenanceMode: globalCfg.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
        maintenanceMessage: globalCfg.maintenanceMessage ?? DEFAULT_SETTINGS.maintenanceMessage,
        activeAnnouncement: globalCfg.activeAnnouncement ?? DEFAULT_SETTINGS.activeAnnouncement,
        appVisibility: {
          ...DEFAULT_SETTINGS.appVisibility,
          faith_meet: globalCfg?.appVisibility?.faith_meet !== false,
          ...(globalCfg.appVisibility || {})
        }
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [members, setMembers] = useState<FellowshipMember[]>(() => {
    return firebaseGlobalService.getMembers();
  });

  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_audit_logs_v1');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'audio' | 'spiritual' | 'storage' | 'admin'>('profile');

  // Google User Authentication state
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(() => {
    return googleDriveService.getStoredUser();
  });
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Initialize and listen to Firebase Google Auth state
  useEffect(() => {
    const unsubscribe = googleDriveService.initAuth(
      (user) => {
        if (user) {
          const uInfo: GoogleUserInfo = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Believer',
            photoURL: user.photoURL || undefined
          };
          setGoogleUser(uInfo);

          const isSuper = user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
          updateProfile({
            name: user.displayName || settings.profile.name,
            email: user.email || '',
            avatar: isSuper ? '👑' : settings.profile.avatar,
            photoURL: user.photoURL || undefined,
            role: isSuper ? 'superadmin' : 'user'
          });
        }
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Master Admin is strictly authorized ONLY via authenticated Google User aw03102008@gmail.com
  const isAuthorizedAdmin = Boolean(
    googleUser && 
    googleUser.email && 
    googleUser.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()
  );

  // Demote and clear admin flags if not authenticated as Master Admin
  useEffect(() => {
    if (!isAuthorizedAdmin) {
      if (settings.adminModeUnlocked || settings.profile.role === 'superadmin' || settings.profile.role === 'admin') {
        setSettings(prev => ({
          ...prev,
          adminModeUnlocked: false,
          profile: {
            ...prev.profile,
            role: 'user',
            avatar: prev.profile.avatar === '👑' ? '🕊️' : prev.profile.avatar
          }
        }));
      }
    }
  }, [isAuthorizedAdmin]);

  const unlockAdmin = () => {
    if (!isAuthorizedAdmin) return;
    updateSettings({ adminModeUnlocked: true });
    updateProfile({ role: 'superadmin', avatar: '👑' });
    sounds.playVictory();
    logAuditEvent('Master Admin Verified', `God-Mode active for ${googleUser?.email || MASTER_ADMIN_EMAIL}`, 'admin');
  };

  const lockAdmin = () => {
    updateSettings({ adminModeUnlocked: false });
    sounds.playTap();
    logAuditEvent('Master Admin Locked', 'God-Mode locked', 'admin');
  };

  const signInWithGoogle = async () => {
    setIsGoogleSigningIn(true);
    try {
      const res = await googleDriveService.signIn();
      const uInfo: GoogleUserInfo = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || 'Believer',
        photoURL: res.user.photoURL || undefined
      };
      setGoogleUser(uInfo);
      
      const isSuper = res.user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
      updateProfile({
        name: res.user.displayName || 'Believer',
        email: res.user.email || '',
        avatar: isSuper ? '👑' : '🕊️',
        photoURL: res.user.photoURL || undefined,
        role: isSuper ? 'superadmin' : 'user'
      });

      sounds.playCorrect();
      logAuditEvent('Google Sign-In Success', `Signed in as ${res.user.email} (${isSuper ? 'MASTER ADMIN' : 'User'})`, 'auth');
    } catch (err: any) {
      sounds.playIncorrect();
      logAuditEvent('Google Sign-In Failed', err?.message || 'Popup closed', 'auth');
      throw err;
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const signOutGoogle = async () => {
    try {
      await googleDriveService.signOutUser();
      setGoogleUser(null);
      updateProfile({
        email: '',
        role: 'user',
        photoURL: undefined
      });
      sounds.playVictory();
      logAuditEvent('Google Sign-Out', 'User logged out', 'auth');
    } catch (err) {
      console.error(err);
    }
  };

  // Apply Audio Settings to Synthesizer Engine
  useEffect(() => {
    sounds.setEnabled(settings.soundFxEnabled);
    sounds.setVolume(settings.masterVolume / 100);
    sounds.setHapticsEnabled(settings.hapticFeedbackEnabled);
    sounds.setNarratorEnabled(settings.narratorVoiceEnabled);
  }, [settings.soundFxEnabled, settings.masterVolume, settings.hapticFeedbackEnabled, settings.narratorVoiceEnabled]);

  // Apply Font Scale to Root HTML Document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (settings.fontScale === 'compact') root.style.fontSize = '13.5px';
      else if (settings.fontScale === 'normal') root.style.fontSize = '16px';
      else if (settings.fontScale === 'large') root.style.fontSize = '18px';
      else if (settings.fontScale === 'senior') root.style.fontSize = '20px';
    }
  }, [settings.fontScale]);

  // Apply Theme Mode & Accent Palette to Root Document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-amoled');
      root.classList.add(`theme-${settings.themeMode}`);

      if (settings.themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }

      root.setAttribute('data-accent', settings.accentColor);
      root.setAttribute('data-theme', settings.themeMode);
      root.setAttribute('data-fasting', settings.fastingModeActive ? 'true' : 'false');
    }
  }, [settings.themeMode, settings.accentColor, settings.fastingModeActive]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_system_settings_v1', JSON.stringify(settings));
      if (settings.sesameApiKey !== undefined) localStorage.setItem('lifeos_sesame_api_key', settings.sesameApiKey);
      if (settings.sesameVoiceId) localStorage.setItem('lifeos_sesame_voice_id', settings.sesameVoiceId);
      if (settings.geminiApiKey !== undefined) localStorage.setItem('lifeos_gemini_api_key', settings.geminiApiKey);
    } catch {}
  }, [settings]);

  // Persist members
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_fellowship_roster_v1', JSON.stringify(members));
    } catch {}
  }, [members]);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_audit_logs_v1', JSON.stringify(auditLogs.slice(0, 100)));
    } catch {}
  }, [auditLogs]);

  const logAuditEvent = (action: string, details: string, category: SystemAuditLog['category'] = 'settings') => {
    const newLog: SystemAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      actor: settings.profile.name,
      details,
      category
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Load Global Config & Real Fellowship Members on mount and listen to updates across all devices
  useEffect(() => {
    // 1. Live Cloud & WebSocket Subscription for Global Announcements & App Visibility
    const unsubGlobalConfig = firebaseGlobalService.subscribeToGlobalConfig((config) => {
      if (config) {
        setSettings(prev => ({
          ...prev,
          activeAnnouncement: config.activeAnnouncement !== undefined ? config.activeAnnouncement : null,
          appVisibility: config.appVisibility ? { ...config.appVisibility } : prev.appVisibility,
          maintenanceMode: config.maintenanceMode !== undefined ? config.maintenanceMode : prev.maintenanceMode,
          maintenanceMessage: config.maintenanceMessage || prev.maintenanceMessage
        }));
      }
    });

    // 2. Live Cloud & WebSocket Subscription for Real Fellowship Members Roster
    const unsubMembers = firebaseGlobalService.subscribeToFellowshipMembers((realList) => {
      if (Array.isArray(realList) && realList.length > 0) {
        setMembers(realList);
      }
    });

    return () => {
      unsubGlobalConfig();
      unsubMembers();
    };
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      return next;
    });
    logAuditEvent('Settings Updated', `Modified keys: ${Object.keys(updates).join(', ')}`, 'settings');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setSettings(prev => {
      const updatedProfile = { ...prev.profile, ...updates };

      // Sync updated profile to global cloud roster
      if (updates.name || updates.handle || updates.avatar) {
        const handleSlug = (updatedProfile.handle || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
        const isMaster = (googleUser?.email?.toLowerCase().trim() === 'aw03102008@gmail.com') ||
                         (updatedProfile.email?.toLowerCase().trim() === 'aw03102008@gmail.com');
        const memberData: FellowshipMember = {
          id: isMaster ? 'usr_master_admin_aw' : `usr_handle_${handleSlug}`,
          name: updatedProfile.name,
          handle: updatedProfile.handle,
          avatar: updatedProfile.avatar,
          role: updatedProfile.role,
          status: 'active',
          email: googleUser?.email || updatedProfile.email,
          photoURL: googleUser?.photoURL || updatedProfile.photoURL,
          lastActive: 'Just now',
          xp: 100,
          streak: 1,
          warningsCount: 0
        };
        firebaseGlobalService.registerMember(memberData);
      }

      return {
        ...prev,
        profile: updatedProfile
      };
    });
    logAuditEvent('Profile Modified', `Updated profile: ${Object.keys(updates).join(', ')}`, 'settings');
  };

  const updateMemberRole = async (memberId: string, role: UserRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    logAuditEvent('User Role Changed', `Member ${memberId} assigned new role: ${role}`, 'admin');
    await firebaseGlobalService.moderateMember(memberId, { role });
  };

  const updateMemberStatus = async (memberId: string, status: 'active' | 'muted' | 'banned') => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status } : m));
    logAuditEvent('User Moderated', `Member ${memberId} status set to: ${status}`, 'moderation');
    await firebaseGlobalService.moderateMember(memberId, { status });
  };

  const addMember = async (member: Omit<FellowshipMember, 'id'>) => {
    const newMember: FellowshipMember = {
      ...member,
      id: `mem_${Date.now()}`
    };
    setMembers(prev => [newMember, ...prev]);
    logAuditEvent('New Member Added', `Registered believer: ${member.name} (${member.role})`, 'admin');
    await firebaseGlobalService.registerMember(newMember);
  };

  const deleteMember = async (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    logAuditEvent('Member Removed', `Removed believer account ID: ${memberId}`, 'admin');
    await firebaseGlobalService.moderateMember(memberId, { action: 'delete' });
  };

  const setAnnouncement = async (announcement: SystemAnnouncement | null) => {
    setSettings(prev => ({ ...prev, activeAnnouncement: announcement }));
    if (announcement) {
      logAuditEvent('Announcement Broadcasted', `Title: "${announcement.title}"`, 'admin');
    } else {
      logAuditEvent('Announcement Cleared', 'Dismissed broadcast', 'admin');
    }

    // Transmit to all global devices via Firestore, MQTT, and server API
    await firebaseGlobalService.publishAnnouncement(announcement);
  };

  const toggleMaintenanceMode = async (enabled: boolean, message?: string) => {
    const finalMsg = message || settings.maintenanceMessage || 'System maintenance in progress. Master Admin access only.';
    setSettings(prev => ({
      ...prev,
      maintenanceMode: enabled,
      maintenanceMessage: finalMsg
    }));
    logAuditEvent('Maintenance Mode Toggle', `Status: ${enabled ? 'ENABLED' : 'DISABLED'}`, 'admin');

    // Transmit to all global devices across the globe via MQTT retained message, ntfy cloud relay, and server API
    await firebaseGlobalService.publishMaintenanceMode(enabled, finalMsg);
  };

  const toggleAppVisibility = async (appId: string) => {
    const currentStatus = settings.appVisibility[appId] !== false;
    const nextStatus = !currentStatus;
    const nextAppVisibility: Record<string, boolean> = {
      ...settings.appVisibility,
      [appId]: nextStatus
    };

    setSettings(prev => ({
      ...prev,
      appVisibility: nextAppVisibility
    }));

    logAuditEvent('App Feature Flag Toggled', `App: ${appId} -> ${nextStatus ? 'ENABLED' : 'DISABLED'}`, 'admin');

    // Transmit feature flag update to all devices via Cloud & WebSocket
    await firebaseGlobalService.updateAppVisibility(nextAppVisibility);
  };

  const exportBackup = () => {
    try {
      // Gather all app states from localStorage
      const faithStats = localStorage.getItem('faithlingo_stats');
      const faithHistory = localStorage.getItem('faithlingo_history');
      const journalNotes = localStorage.getItem('lifeos_bible_journal_entries');
      const chatMessages = localStorage.getItem('lifeos_fellowship_messages_cache');
      const arcadeScores = localStorage.getItem('lifeos_game_vault_scores');

      const data = {
        settings,
        members,
        auditLogs,
        appData: {
          faithlingoStats: faithStats ? JSON.parse(faithStats) : null,
          faithlingoHistory: faithHistory ? JSON.parse(faithHistory) : null,
          journalNotes: journalNotes ? JSON.parse(journalNotes) : null,
          chatMessages: chatMessages ? JSON.parse(chatMessages) : null,
          arcadeScores: arcadeScores ? JSON.parse(arcadeScores) : null
        },
        exportedAt: new Date().toISOString(),
        version: 'LifeOS-2.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos_complete_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      sounds.playVictory();
      logAuditEvent('System Backup Exported', 'Full JSON snapshot downloaded', 'system');
    } catch (e) {
      console.error(e);
    }
  };

  const importBackup = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.members)) setMembers(parsed.members);
      if (Array.isArray(parsed.auditLogs)) setAuditLogs(parsed.auditLogs);

      if (parsed.appData) {
        if (parsed.appData.faithlingoStats) {
          localStorage.setItem('faithlingo_stats', JSON.stringify(parsed.appData.faithlingoStats));
        }
        if (parsed.appData.faithlingoHistory) {
          localStorage.setItem('faithlingo_history', JSON.stringify(parsed.appData.faithlingoHistory));
        }
        if (parsed.appData.journalNotes) {
          localStorage.setItem('lifeos_bible_journal_entries', JSON.stringify(parsed.appData.journalNotes));
        }
        if (parsed.appData.chatMessages) {
          localStorage.setItem('lifeos_fellowship_messages_cache', JSON.stringify(parsed.appData.chatMessages));
        }
        if (parsed.appData.arcadeScores) {
          localStorage.setItem('lifeos_game_vault_scores', JSON.stringify(parsed.appData.arcadeScores));
        }
      }

      sounds.playVictory();
      logAuditEvent('System Backup Restored', 'Successfully imported JSON configuration', 'system');
      return true;
    } catch {
      sounds.playIncorrect();
      return false;
    }
  };

  const factoryReset = () => {
    localStorage.removeItem('lifeos_system_settings_v1');
    localStorage.removeItem('lifeos_fellowship_roster_v1');
    localStorage.removeItem('lifeos_audit_logs_v1');
    localStorage.removeItem('faithlingo_stats');
    localStorage.removeItem('faithlingo_history');
    localStorage.removeItem('lifeos_bible_journal_entries');
    localStorage.removeItem('lifeos_fellowship_messages_cache');
    localStorage.removeItem('lifeos_discord_messages_v6');
    localStorage.removeItem('lifeos_discord_deleted_messages_v6');
    localStorage.removeItem('lifeos_discord_initialized_v6');
    localStorage.removeItem('lifeos_game_vault_scores');
    setSettings(DEFAULT_SETTINGS);
    setMembers(INITIAL_MEMBERS);
    setAuditLogs(INITIAL_LOGS);
    sounds.playVictory();
    logAuditEvent('Factory Reset', 'Reverted all system & user settings to initial state', 'system');
  };

  const verifyAdminPin = (pin: string) => {
    if (!isAuthorizedAdmin) {
      sounds.playIncorrect();
      return false;
    }
    const cleanPin = pin.trim();
    if (cleanPin === settings.adminPin || cleanPin === '7777') {
      updateSettings({ adminModeUnlocked: true });
      sounds.playVictory();
      logAuditEvent('Admin PIN Verified', 'God Mode unlocked via admin PIN', 'admin');
      return true;
    }
    sounds.playIncorrect();
    return false;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateProfile,
        isSettingsOpen,
        setIsSettingsOpen,
        activeTab,
        setActiveTab,
        googleUser,
        isGoogleSigningIn,
        signInWithGoogle,
        signOutGoogle,
        isAuthorizedAdmin,
        masterAdminEmail: MASTER_ADMIN_EMAIL,
        members,
        updateMemberRole,
        updateMemberStatus,
        addMember,
        deleteMember,
        announcement: settings.activeAnnouncement,
        setAnnouncement,
        toggleMaintenanceMode,
        toggleAppVisibility,
        auditLogs,
        logAuditEvent,
        clearAuditLogs: () => setAuditLogs([]),
        exportBackup,
        importBackup,
        factoryReset,
        verifyAdminPin,
        unlockAdmin,
        lockAdmin
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
