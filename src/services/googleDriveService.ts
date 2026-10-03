import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  setPersistence,
  browserLocalPersistence,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { JournalEntry } from '../types/journal';

// Scopes required for Google Drive file management
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Active Firebase Configuration (supports Vercel env vars or firebase-applet-config.json)
const activeFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Enable persistent authentication across browser sessions and refreshes
try {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} catch {}

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;
let cachedFolderId: string | null = null;

export function getFriendlyAuthErrorMessage(error: any): { title: string; message: string; actionTip?: string } {
  const code = error?.code || '';
  const message = error?.message || String(error);

  if (code === 'auth/unauthorized-domain') {
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
    return {
      title: 'Domain Not Authorized in Firebase',
      message: `The current website domain ("${currentDomain}") is not yet authorized in your Firebase project.`,
      actionTip: `To fix: Open Firebase Console ➔ Project "gen-lang-client-0080772173" ➔ Authentication ➔ Settings ➔ Authorized Domains ➔ Add "${currentDomain}".`
    };
  }
  if (code === 'auth/popup-closed-by-user') {
    return {
      title: 'Sign-In Cancelled',
      message: 'The Google popup was closed before completing login.',
      actionTip: 'Click Connect or Sign In again to complete authentication.'
    };
  }
  if (code === 'auth/popup-blocked') {
    return {
      title: 'Popup Blocked by Browser',
      message: 'Your browser prevented the Google Sign-In popup from opening.',
      actionTip: 'Please click the popup blocked icon in your browser address bar and allow popups for this site.'
    };
  }
  if (code === 'auth/operation-not-allowed') {
    return {
      title: 'Google Sign-In Not Enabled',
      message: 'Google authentication provider is disabled in Firebase.',
      actionTip: 'Go to Firebase Console ➔ Authentication ➔ Sign-in method ➔ Enable Google.'
    };
  }
  if (message.includes('access_denied') || message.includes('403') || message.includes('verification') || message.includes('blocked')) {
    return {
      title: 'Google OAuth Test User Required',
      message: 'Google OAuth blocked access because the app is in "Testing" mode.',
      actionTip: 'In Google Cloud Console ➔ APIs & Services ➔ OAuth consent screen ➔ Under "Test users", click "Add users" and add aw03102008@gmail.com.'
    };
  }
  return {
    title: 'Sign-In Error',
    message: message || 'An unexpected error occurred during Google Sign-In.',
    actionTip: 'Check your network connection or review the developer console.'
  };
}

export const googleDriveService = {
  // Get stored persistent user (works immediately on page refresh)
  getStoredUser(): { uid: string; email: string; displayName: string; photoURL?: string } | null {
    try {
      const saved = localStorage.getItem('lifeos_persistent_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  // Initialize auth listener with persistent session recovery
  initAuth(
    onAuthSuccess?: (user: User | any, token: string) => void,
    onAuthFailure?: () => void
  ) {
    // 1. Immediately restore saved user from localStorage to eliminate any flash of logged-out state
    const storedUser = this.getStoredUser();
    if (storedUser && onAuthSuccess) {
      onAuthSuccess(storedUser as any, cachedAccessToken || '');
    }

    // 2. Listen to Firebase Auth state
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          localStorage.setItem('lifeos_persistent_google_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }));
        } catch {}

        if (onAuthSuccess) {
          onAuthSuccess(user, cachedAccessToken || '');
        }
      } else {
        const stillStored = this.getStoredUser();
        if (!stillStored) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    });
  },

  // Interactive Google Sign-In with Drive Scope
  async signIn(): Promise<{ user: User; accessToken: string }> {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      cachedAccessToken = credential?.accessToken || null;

      try {
        localStorage.setItem('lifeos_persistent_google_user', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }));
      } catch {}

      return { user: result.user, accessToken: cachedAccessToken || '' };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  },

  // Explicit user Sign Out
  async signOutUser() {
    try {
      localStorage.removeItem('lifeos_persistent_google_user');
      localStorage.removeItem('lifeos_discord_user_v6');
      await signOut(auth);
    } catch {}
    cachedAccessToken = null;
    cachedFolderId = null;
  },

  // Get current token
  getAccessToken(): string | null {
    return cachedAccessToken;
  },

  // Get or create dedicated folder in Google Drive: "Church Notes & Sermons"
  async getOrCreateChurchNotesFolder(accessToken: string): Promise<string> {
    if (cachedFolderId) return cachedFolderId;

    const folderName = 'Church Notes & Sermons';
    const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    
    // Check if folder exists
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        cachedFolderId = searchData.files[0].id;
        return cachedFolderId!;
      }
    }

    // Create the folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Automatic backup folder for Church & Sermon Notes',
      }),
    });

    if (!createRes.ok) {
      throw new Error('Could not create Church Notes folder in Google Drive');
    }

    const created = await createRes.json();
    cachedFolderId = created.id;
    return cachedFolderId!;
  },

  // Format note content as clean, elegant, readable church notes (no raw JSON dump)
  formatNoteContent(note: JournalEntry): string {
    const title = (note.title || 'Untitled Sermon Note').trim();
    const date = (note.date || 'Church Service').trim();
    const speaker = note.speaker?.trim();
    const passage = note.passage?.trim();
    const tags = (note.tags || []).filter(Boolean);
    const content = (note.content || '').trim();

    let headerInfo = `TITLE:      ${title}\nDATE:       ${date}`;
    if (speaker) headerInfo += `\nPREACHER:   ${speaker}`;
    if (passage) headerInfo += `\nSCRIPTURE:  ${passage}`;
    if (tags.length > 0) headerInfo += `\nTAGS:       ${tags.map(t => `#${t.replace(/^#/, '')}`).join(' ')}`;

    const dividerHeavy = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const dividerLight = '─────────────────────────────────────────────────────────────';

    return `${dividerHeavy}
                     CHURCH & SERMON NOTES
${dividerHeavy}

${headerInfo}

${dividerLight}
                    TRANSCRIPTION & STUDY NOTES
${dividerLight}

${content || '(No note content recorded)'}

${dividerHeavy}
 Exported from LifeOS Bible & Sermon Sanctuary
${dividerHeavy}`;
  },

  // Save/Upload single note to Google Drive
  async saveNoteToGoogleDrive(accessToken: string, note: JournalEntry): Promise<string> {
    const folderId = await this.getOrCreateChurchNotesFolder(accessToken);
    const textContent = this.formatNoteContent(note);
    
    // Clean filename
    const safeTitle = (note.title || 'Church_Note')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const fileName = `${safeTitle}_${note.date || 'sermon'}.txt`;

    // Metadata for Google Drive
    const metadata = {
      name: fileName,
      mimeType: 'text/plain',
      parents: [folderId],
      description: `Church Sermon Note: ${note.title || 'Untitled'} (${note.passage || 'Scripture'})`,
    };

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
      textContent +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Drive Upload Failed:', errText);
      throw new Error(`Failed to upload note to Google Drive: ${response.statusText}`);
    }

    const file = await response.json();
    return file.id;
  },

  // Sync / Upload all notes to Google Drive
  async syncAllNotesToGoogleDrive(
    accessToken: string, 
    notes: JournalEntry[],
    onProgress?: (current: number, total: number, noteTitle: string) => void
  ): Promise<{ uploaded: number; failed: number }> {
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (onProgress) {
        onProgress(i + 1, notes.length, note.title || 'Untitled Note');
      }

      try {
        await this.saveNoteToGoogleDrive(accessToken, note);
        uploaded++;
      } catch (err) {
        console.error(`Failed to sync note: ${note.title}`, err);
        failed++;
      }
    }

    return { uploaded, failed };
  },

  // Save/Upload single note to Google Drive
  async saveNoteToDrive(note: JournalEntry): Promise<{ fileId: string; webViewLink?: string }> {
    const token = cachedAccessToken;
    if (!token) {
      return { fileId: `local_${note.id}` };
    }
    const fileId = await this.saveNoteToGoogleDrive(token, note);
    return { fileId, webViewLink: `https://drive.google.com/file/d/${fileId}/view` };
  },

  // Save Master Backup of all notes to Google Drive
  async saveMasterBackupToDrive(notes: JournalEntry[]): Promise<string | null> {
    const token = cachedAccessToken;
    if (!token) return null;
    const folderId = await this.getOrCreateChurchNotesFolder(token);
    const content = this.formatNoteContent({
      id: 'master_archive',
      title: 'Full Church Notes Backup Archive',
      date: new Date().toLocaleDateString(),
      content: notes.map(n => `### ${n.title}\n${n.content}\n`).join('\n---\n'),
      tags: ['ArchiveBackup'],
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const metadata = {
      name: `Fellowship_Church_Notes_Master_Backup.txt`,
      mimeType: 'text/plain',
      parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
      content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (response.ok) {
      const file = await response.json();
      return file.id;
    }
    return null;
  },

  // Delete file from Drive
  async deleteNoteFromDrive(fileId: string): Promise<boolean> {
    const token = cachedAccessToken;
    if (!token || fileId.startsWith('local_')) return true;

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Export note as downloadable text file
  downloadNoteAsText(note: JournalEntry) {
    const content = this.formatNoteContent(note);
    const safeTitle = (note.title || 'Church_Note')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const fileName = `${safeTitle}_${note.date || 'sermon'}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export all notes as single master text file
  downloadAllNotesAsText(notes: JournalEntry[]) {
    if (notes.length === 0) return;

    const dividerMaster = '=============================================================\n';
    let fullArchive = `${dividerMaster}             FELLOWSHIP SERMON & BIBLE NOTES ARCHIVE\n${dividerMaster}\nTotal Notes: ${notes.length}\nExport Date: ${new Date().toLocaleDateString()}\n\n`;

    notes.forEach((note, idx) => {
      fullArchive += `\n[NOTE ${idx + 1} OF ${notes.length}]\n`;
      fullArchive += this.formatNoteContent(note);
      fullArchive += '\n\n';
    });

    const blob = new Blob([fullArchive], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Church_Sermon_Notes_Archive_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
