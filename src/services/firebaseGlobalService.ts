import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SystemAnnouncement, FellowshipMember, UserRole, MASTER_ADMIN_EMAIL } from '../types/settings';

// Active Firebase Configuration
const activeFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export interface GlobalConfigPayload {
  activeAnnouncement: SystemAnnouncement | null;
  appVisibility: Record<string, boolean>;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  updatedAt?: number;
}

const DEFAULT_CONFIG: GlobalConfigPayload = {
  activeAnnouncement: {
    id: 'ann_welcome',
    title: '🌿 Welcome to LifeOS',
    message: 'Global synchronization is live across all devices.',
    type: 'celebration',
    isActive: true,
    author: `Master Administrator (${MASTER_ADMIN_EMAIL})`,
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
  maintenanceMode: false,
  maintenanceMessage: 'System maintenance in progress.',
  updatedAt: Date.now()
};

class FirebaseGlobalService {
  private configDocRef = doc(db, 'global_system_config', 'settings');
  private membersColRef = collection(db, 'fellowship_members');

  // 1. Subscribe to Global System Config (Announcements & App Visibility) across all devices
  subscribeToGlobalConfig(callback: (config: GlobalConfigPayload) => void): () => void {
    const unsubscribeFirestore = onSnapshot(
      this.configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GlobalConfigPayload;
          callback(data);
        } else {
          // Initialize document in Firestore if it doesn't exist yet
          setDoc(this.configDocRef, DEFAULT_CONFIG).catch(() => {});
          callback(DEFAULT_CONFIG);
        }
      },
      (error) => {
        console.error('Firestore global config listener error:', error);
      }
    );

    return () => {
      unsubscribeFirestore();
    };
  }

  // 2. Publish Global Announcement to all devices
  async publishAnnouncement(announcement: SystemAnnouncement | null) {
    const payload = {
      activeAnnouncement: announcement || null,
      updatedAt: Date.now()
    };

    try {
      await setDoc(this.configDocRef, payload, { merge: true });
    } catch (err) {
      console.error('Error saving announcement to Firestore:', err);
    }

    // Secondary backup sync to server API
    try {
      await fetch('/api/global/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement ? {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          author: announcement.author || `Master Administrator (${MASTER_ADMIN_EMAIL})`,
          isActive: true
        } : { isActive: false })
      }).catch(() => {});
    } catch {}
  }

  // 3. Update Global App Visibility Feature Flags across all devices
  async updateAppVisibility(appVisibility: Record<string, boolean>) {
    const payload = {
      appVisibility,
      updatedAt: Date.now()
    };

    try {
      await setDoc(this.configDocRef, payload, { merge: true });
    } catch (err) {
      console.error('Error saving app visibility to Firestore:', err);
    }

    // Secondary backup sync to server API
    try {
      await fetch('/api/global/app-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appVisibility })
      }).catch(() => {});
    } catch {}
  }

  // 4. Subscribe to Real Fellowship Members Roster across all devices
  subscribeToFellowshipMembers(callback: (members: FellowshipMember[]) => void): () => void {
    const unsubscribeFirestore = onSnapshot(
      this.membersColRef,
      (snapshot) => {
        const list: FellowshipMember[] = [];
        snapshot.forEach((d) => {
          const m = d.data() as FellowshipMember;
          list.push({ ...m, id: d.id });
        });

        if (list.length > 0) {
          callback(list);
        } else {
          // If collection is empty, seed with Master Administrator
          const masterAdminMember: FellowshipMember = {
            id: 'usr_master_admin_aw',
            name: 'Master Administrator',
            handle: '@aw03102008',
            avatar: '👑',
            role: 'superadmin',
            status: 'active',
            email: MASTER_ADMIN_EMAIL,
            lastActive: 'Online',
            xp: 5000,
            streak: 100,
            warningsCount: 0,
            notes: 'Master Administrator'
          };
          setDoc(doc(db, 'fellowship_members', masterAdminMember.id), masterAdminMember).catch(() => {});
          callback([masterAdminMember]);
        }
      },
      (error) => {
        console.error('Firestore members listener error:', error);
      }
    );

    return () => {
      unsubscribeFirestore();
    };
  }

  // 5. Register or update a real user when they open LifeOS and put their name in
  async registerMember(member: FellowshipMember) {
    const memberId = member.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isMaster = (member.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
                     (member.handle.toLowerCase().includes('aw03102008'));

    const safeMember: FellowshipMember = {
      ...member,
      id: memberId,
      role: isMaster ? 'superadmin' : (member.role || 'user'),
      avatar: isMaster ? '👑' : (member.avatar || '🕊️'),
      status: member.status || 'active',
      lastActive: 'Just now'
    };

    try {
      await setDoc(doc(db, 'fellowship_members', memberId), safeMember, { merge: true });
    } catch (err) {
      console.error('Error saving member to Firestore:', err);
    }

    try {
      await fetch('/api/fellowship/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeMember)
      }).catch(() => {});
    } catch {}
  }

  // 6. Moderate Fellowship Member (role, status, delete)
  async moderateMember(memberId: string, updates: { role?: UserRole; status?: 'active' | 'muted' | 'banned'; action?: string }) {
    if (updates.action === 'delete') {
      try {
        await deleteDoc(doc(db, 'fellowship_members', memberId));
      } catch (err) {
        console.error('Error deleting member from Firestore:', err);
      }
    } else {
      try {
        await setDoc(doc(db, 'fellowship_members', memberId), updates, { merge: true });
      } catch (err) {
        console.error('Error moderating member in Firestore:', err);
      }
    }

    try {
      await fetch('/api/fellowship/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...updates })
      }).catch(() => {});
    } catch {}
  }
}

export const firebaseGlobalService = new FirebaseGlobalService();
