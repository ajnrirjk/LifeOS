export interface PrayerItem {
  id: string;
  text: string;
  isAnswered: boolean;
  answeredDate?: string;
  praiseNote?: string;
}

export interface PhotoAttachment {
  id: string;
  dataUrl: string; // base64 / data URL
  caption?: string;
  dateAdded: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  speaker?: string; // Preacher / speaker name
  passage?: string; // Scripture passage / reference
  content: string; // Sermon notes & personal thoughts
  tags: string[];
  photos?: PhotoAttachment[];
  driveFileId?: string;
  driveWebViewLink?: string;
  lastDriveSync?: string;
  // Legacy / optional fields for compatibility:
  verseReference?: string;
  verseText?: string;
  reflection?: string;
  prayerRequests?: PrayerItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedBackupPayload {
  version: number;
  algorithm: 'AES-GCM-256';
  salt: string;
  iv: string;
  ciphertext: string;
  entryCount: number;
  exportedAt: string;
}

export type JournalTheme = 'parchment' | 'midnight' | 'sepia' | 'emerald';
