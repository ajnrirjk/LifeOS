import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
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

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token caching (NOT stored in localStorage as per security policy)
let cachedAccessToken: string | null = null;
let isSigningIn = false;
let cachedFolderId: string | null = null;

export const googleDriveService = {
  // Initialize auth listener
  initAuth(
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
  ) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  },

  // Interactive Google Sign-In with Drive Scope
  async signIn(): Promise<{ user: User; accessToken: string }> {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to obtain Google Drive access token');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  },

  // Sign out
  async signOutUser() {
    await signOut(auth);
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

${content || '(No note content written yet)'}

${dividerLight}
Recorded with ChurchNotes • Backed up to Google Drive
`;
  },

  // Save single sermon note to Google Drive
  async saveNoteToDrive(note: JournalEntry): Promise<{ fileId: string; webViewLink?: string }> {
    const accessToken = cachedAccessToken;
    if (!accessToken) {
      throw new Error('Not connected to Google Drive');
    }

    const folderId = await this.getOrCreateChurchNotesFolder(accessToken);
    const cleanTitle = (note.title || 'Sermon Note').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const cleanDate = (note.date || '').replace(/[/\\?%*:|"<>•]/g, ' ').replace(/\s+/g, ' ').trim();
    const fileName = cleanDate ? `${cleanTitle} - ${cleanDate}.txt` : `${cleanTitle}.txt`;
    const textContent = this.formatNoteContent(note);

    if (note.driveFileId) {
      // Update existing file content
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${note.driveFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/plain; charset=UTF-8',
          },
          body: textContent,
        }
      );

      // Update filename and appProperties metadata in Drive
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${note.driveFileId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: fileName,
            appProperties: {
              lifeos_id: note.id,
              lifeos_updatedAt: note.updatedAt,
            }
          }),
        }
      );

      if (updateRes.ok) {
        const data = await updateRes.json();
        return { fileId: note.driveFileId, webViewLink: data.webViewLink || note.driveWebViewLink };
      }
    }

    // Create new file in Google Drive folder using multipart upload
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'text/plain',
      description: `Sermon note: ${note.title || 'Church Note'}`,
      appProperties: {
        lifeos_id: note.id,
        lifeos_updatedAt: note.updatedAt,
      },
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
      textContent +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Drive upload failed:', errText);
      throw new Error('Failed to save sermon note to Google Drive');
    }

    const data = await res.json();
    return {
      fileId: data.id,
      webViewLink: data.webViewLink,
    };
  },

  // Save full master notes JSON backup in the Church Notes folder
  async saveMasterBackupToDrive(notes: JournalEntry[]): Promise<string> {
    const accessToken = cachedAccessToken;
    if (!accessToken) throw new Error('Not connected to Google Drive');

    const folderId = await this.getOrCreateChurchNotesFolder(accessToken);
    const fileName = 'ChurchNotes_All_MasterBackup.json';
    const jsonContent = JSON.stringify(notes, null, 2);

    // Check if master backup exists
    const q = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents and trashed=false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let existingFileId: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        existingFileId = searchData.files[0].id;
      }
    }

    if (existingFileId) {
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonContent,
        }
      );
      return existingFileId;
    } else {
      const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json',
      };
      const boundary = '-------backupboundary314159';
      const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${jsonContent}\r\n` +
        `--${boundary}--`;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
      const data = await createRes.json();
      return data.id;
    }
  },

  // Delete note file from Google Drive (with permission / confirmation)
  async deleteNoteFromDrive(fileId: string): Promise<boolean> {
    const accessToken = cachedAccessToken;
    if (!accessToken || !fileId) return false;

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
