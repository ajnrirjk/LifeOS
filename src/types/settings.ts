export const MASTER_ADMIN_EMAIL = 'aw03102008@gmail.com';

export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

export type ThemeAccent = 'emerald' | 'purple' | 'blue' | 'amber' | 'rose' | 'cyan';

export type FontScale = 'compact' | 'normal' | 'large' | 'senior';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  photoURL?: string;
  bio: string;
  role: UserRole;
  email?: string;
  joinedDate: string;
  statusText?: string;
  isOnline?: boolean;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  category: 'auth' | 'admin' | 'settings' | 'moderation' | 'economy' | 'system';
}

export interface FellowshipMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: UserRole;
  status: 'active' | 'muted' | 'banned' | 'pending';
  lastActive: string;
  xp: number;
  streak: number;
  warningsCount: number;
  notes?: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'celebration';
  isActive: boolean;
  author: string;
  timestamp: string;
}

export interface UserSettings {
  // Profile
  profile: UserProfile;

  // Appearance & Display
  themeMode: 'dark' | 'light' | 'amoled';
  accentColor: ThemeAccent;
  fontScale: FontScale;
  reducedMotion: boolean;
  dockPosition: 'center' | 'left' | 'right';
  desktopGlassEffect: boolean;

  // Audio & Haptics
  masterVolume: number; // 0 - 100
  soundFxEnabled: boolean;
  narratorVoiceEnabled: boolean;
  hapticFeedbackEnabled: boolean;

  // Spiritual Goals
  dailyReadingMinutesGoal: number;
  preferredTranslation: string;
  prayerReminderEnabled: boolean;
  prayerReminderTime: string;
  fastingModeActive: boolean;

  // Admin & System Flags (Accessible to Admins)
  adminModeUnlocked: boolean;
  adminPin: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  activeAnnouncement: SystemAnnouncement | null;
  appVisibility: Record<string, boolean>; // appId -> enabled
  debugTelemetryEnabled: boolean;
}
