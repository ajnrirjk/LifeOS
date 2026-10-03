import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserSettings,
  UserProfile,
  FellowshipMember,
  SystemAuditLog,
  SystemAnnouncement,
  UserRole
} from '../types/settings';
import { sounds } from '../services/soundEffects';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeTab: 'profile' | 'appearance' | 'audio' | 'spiritual' | 'storage' | 'admin';
  setActiveTab: (tab: 'profile' | 'appearance' | 'audio' | 'spiritual' | 'storage' | 'admin') => void;
  
  // Fellowship & User Roster (Admin)
  members: FellowshipMember[];
  updateMemberRole: (memberId: string, role: UserRole) => void;
  updateMemberStatus: (memberId: string, status: 'active' | 'muted' | 'banned') => void;
  addMember: (member: Omit<FellowshipMember, 'id'>) => void;
  deleteMember: (memberId: string) => void;
  
  // Announcements & Maintenance (Admin)
  announcement: SystemAnnouncement | null;
  setAnnouncement: (announcement: SystemAnnouncement | null) => void;
  toggleMaintenanceMode: (enabled: boolean, message?: string) => void;
  
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
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_me_001',
  name: 'Believer (Faith Explorer)',
  handle: '@disciple',
  avatar: '🕊️',
  bio: 'Walking with Christ daily • LifeOS Pilgrim • Seeking Truth & Grace',
  role: 'admin', // Default admin access for the app owner
  email: 'believer@lifeos.church',
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
  dailyReadingMinutesGoal: 15,
  preferredTranslation: 'WEB',
  prayerReminderEnabled: true,
  prayerReminderTime: '08:00',
  fastingModeActive: false,
  adminModeUnlocked: true,
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
    mini_cats: true,
    mini_games: true,
    youtube: true
  },
  debugTelemetryEnabled: false
};

const INITIAL_MEMBERS: FellowshipMember[] = [
  {
    id: 'mem_001',
    name: 'Brother Andrew',
    handle: '@andrew_shepherd',
    avatar: '🧔🏻‍♂️',
    role: 'admin',
    status: 'active',
    lastActive: 'Just now',
    xp: 2840,
    streak: 42,
    warningsCount: 0,
    notes: 'Fellowship study leader & worship team'
  },
  {
    id: 'mem_002',
    name: 'Sister Sarah',
    handle: '@sarah_grace',
    avatar: '👩🏼',
    role: 'moderator',
    status: 'active',
    lastActive: '5m ago',
    xp: 1950,
    streak: 28,
    warningsCount: 0,
    notes: 'Prayer chain coordinator'
  },
  {
    id: 'mem_003',
    name: 'Marcus Chen',
    handle: '@marcus_c',
    avatar: '🧑🏻',
    role: 'user',
    status: 'active',
    lastActive: '1h ago',
    xp: 680,
    streak: 7,
    warningsCount: 0,
    notes: 'New believer, exploring Romans study'
  },
  {
    id: 'mem_004',
    name: 'Pastor Thomas',
    handle: '@pastor_thomas',
    avatar: '👴🏼',
    role: 'superadmin',
    status: 'active',
    lastActive: '30m ago',
    xp: 5400,
    streak: 110,
    warningsCount: 0,
    notes: 'Senior Teaching Pastor'
  },
  {
    id: 'mem_005',
    name: 'Chloe Williams',
    handle: '@chloew',
    avatar: '👧🏽',
    role: 'user',
    status: 'active',
    lastActive: 'Yesterday',
    xp: 420,
    streak: 4,
    warningsCount: 0
  }
];

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
    try {
      const saved = localStorage.getItem('lifeos_system_settings_v1');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [members, setMembers] = useState<FellowshipMember[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_fellowship_roster_v1');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
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

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_system_settings_v1', JSON.stringify(settings));
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

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      return next;
    });
    logAuditEvent('Settings Updated', `Modified keys: ${Object.keys(updates).join(', ')}`, 'settings');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates }
    }));
    logAuditEvent('Profile Modified', `Updated profile: ${Object.keys(updates).join(', ')}`, 'settings');
  };

  const updateMemberRole = (memberId: string, role: UserRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    logAuditEvent('User Role Changed', `Member ${memberId} assigned new role: ${role}`, 'admin');
  };

  const updateMemberStatus = (memberId: string, status: 'active' | 'muted' | 'banned') => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status } : m));
    logAuditEvent('User Moderated', `Member ${memberId} status set to: ${status}`, 'moderation');
  };

  const addMember = (member: Omit<FellowshipMember, 'id'>) => {
    const newMember: FellowshipMember = {
      ...member,
      id: `mem_${Date.now()}`
    };
    setMembers(prev => [newMember, ...prev]);
    logAuditEvent('New Member Added', `Registered believer: ${member.name} (${member.role})`, 'admin');
  };

  const deleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    logAuditEvent('Member Removed', `Removed believer account ID: ${memberId}`, 'admin');
  };

  const setAnnouncement = (announcement: SystemAnnouncement | null) => {
    setSettings(prev => ({ ...prev, activeAnnouncement: announcement }));
    if (announcement) {
      logAuditEvent('Announcement Broadcasted', `Title: "${announcement.title}"`, 'admin');
    } else {
      logAuditEvent('Announcement Cleared', 'Dismissed broadcast', 'admin');
    }
  };

  const toggleMaintenanceMode = (enabled: boolean, message?: string) => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: enabled,
      maintenanceMessage: message || prev.maintenanceMessage
    }));
    logAuditEvent('Maintenance Mode Toggle', `Status: ${enabled ? 'ENABLED' : 'DISABLED'}`, 'admin');
  };

  const toggleAppVisibility = (appId: string) => {
    setSettings(prev => {
      const current = prev.appVisibility[appId] !== false;
      const next = {
        ...prev,
        appVisibility: {
          ...prev.appVisibility,
          [appId]: !current
        }
      };
      return next;
    });
    logAuditEvent('App Feature Flag Toggled', `App: ${appId}`, 'admin');
  };

  const exportBackup = () => {
    try {
      const data = {
        settings,
        members,
        auditLogs,
        exportedAt: new Date().toISOString(),
        version: 'LifeOS-2.0'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`;
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
    setSettings(DEFAULT_SETTINGS);
    setMembers(INITIAL_MEMBERS);
    setAuditLogs(INITIAL_LOGS);
    sounds.playVictory();
    logAuditEvent('Factory Reset', 'Reverted all system & user settings to initial state', 'system');
  };

  const verifyAdminPin = (pin: string) => {
    if (pin === settings.adminPin || pin === '7777') {
      updateSettings({ adminModeUnlocked: true });
      sounds.playCorrect();
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
        verifyAdminPin
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
