import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SystemAnnouncement, FellowshipMember, UserRole } from '../types/settings';
import mqtt, { MqttClient } from 'mqtt';

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

// Secondary real-time push channel via MQTT over WebSockets
let mqttClient: MqttClient | null = null;
try {
  if (typeof window !== 'undefined') {
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: `lifeos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clean: true,
      reconnectPeriod: 5000,
    });
  }
} catch {
  // MQTT is optional fallback to Firestore
}

export interface GlobalConfigPayload {
  activeAnnouncement: SystemAnnouncement | null;
  appVisibility: Record<string, boolean>;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  updatedAt?: number;
}

class FirebaseGlobalService {
  private configDocRef = doc(db, 'global_system_config', 'settings');
  private membersColRef = collection(db, 'fellowship_members');

  // 1. Subscribe to Global System Config (Announcements & App Visibility) across all devices
  subscribeToGlobalConfig(callback: (config: GlobalConfigPayload) => void): () => void {
    // A. Firestore Live onSnapshot Listener
    const unsubscribeFirestore = onSnapshot(
      this.configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GlobalConfigPayload;
          callback(data);
        }
      },
      (error) => {
        console.warn('Firestore global config listener error, falling back:', error);
      }
    );

    // B. MQTT Instant Push Listener
    if (mqttClient) {
      const topic = 'lifeos/global/settings_v2';
      mqttClient.subscribe(topic, { qos: 0 });
      const handleMqttMessage = (t: string, payload: Buffer) => {
        if (t === topic) {
          try {
            const data = JSON.parse(payload.toString());
            callback(data);
          } catch {}
        }
      };
      mqttClient.on('message', handleMqttMessage);
    }

    return () => {
      unsubscribeFirestore();
    };
  }

  // 2. Publish Global Announcement to all devices
  async publishAnnouncement(announcement: SystemAnnouncement | null) {
    const payload: Partial<GlobalConfigPayload> = {
      activeAnnouncement: announcement,
      updatedAt: Date.now()
    };

    // A. Write to Firestore
    try {
      await setDoc(this.configDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('Error saving announcement to Firestore:', err);
    }

    // B. Broadcast via MQTT
    try {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish('lifeos/global/settings_v2', JSON.stringify(payload));
      }
    } catch {}

    // C. Sync with server API
    try {
      await fetch('/api/global/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement ? {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          author: announcement.author || 'Master Administrator',
          isActive: true
        } : { isActive: false })
      });
    } catch {}
  }

  // 3. Update Global App Visibility Feature Flags across all devices
  async updateAppVisibility(appVisibility: Record<string, boolean>) {
    const payload: Partial<GlobalConfigPayload> = {
      appVisibility,
      updatedAt: Date.now()
    };

    // A. Write to Firestore
    try {
      await setDoc(this.configDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('Error saving app visibility to Firestore:', err);
    }

    // B. Broadcast via MQTT
    try {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish('lifeos/global/settings_v2', JSON.stringify(payload));
      }
    } catch {}

    // C. Sync with server API
    try {
      await fetch('/api/global/app-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appVisibility })
      });
    } catch {}
  }

  // 4. Subscribe to Real Fellowship Members Roster across all devices
  subscribeToFellowshipMembers(callback: (members: FellowshipMember[]) => void): () => void {
    // A. Firestore Live Collection Listener
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
        }
      },
      (error) => {
        console.warn('Firestore members listener error:', error);
      }
    );

    // B. MQTT Instant Member Push Listener
    if (mqttClient) {
      const topic = 'lifeos/fellowship/roster_v2';
      mqttClient.subscribe(topic, { qos: 0 });
      const handleMqttMessage = (t: string, payload: Buffer) => {
        if (t === topic) {
          try {
            const list = JSON.parse(payload.toString());
            if (Array.isArray(list) && list.length > 0) {
              callback(list);
            }
          } catch {}
        }
      };
      mqttClient.on('message', handleMqttMessage);
    }

    return () => {
      unsubscribeFirestore();
    };
  }

  // 5. Register or update a real user when they open LifeOS and put their name in
  async registerMember(member: FellowshipMember) {
    const safeMember: FellowshipMember = {
      ...member,
      id: member.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: member.status || 'active',
      lastActive: 'Just now'
    };

    // A. Write to Firestore
    try {
      await setDoc(doc(db, 'fellowship_members', safeMember.id), safeMember, { merge: true });
    } catch (err) {
      console.warn('Error saving member to Firestore:', err);
    }

    // B. Broadcast via MQTT
    try {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish('lifeos/fellowship/new_member', JSON.stringify(safeMember));
      }
    } catch {}

    // C. Sync with server API
    try {
      await fetch('/api/fellowship/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeMember)
      });
    } catch {}
  }

  // 6. Moderate Fellowship Member (role, status, delete)
  async moderateMember(memberId: string, updates: { role?: UserRole; status?: 'active' | 'muted' | 'banned'; action?: string }) {
    if (updates.action === 'delete') {
      try {
        await deleteDoc(doc(db, 'fellowship_members', memberId));
      } catch {}
    } else {
      try {
        await setDoc(doc(db, 'fellowship_members', memberId), updates, { merge: true });
      } catch {}
    }

    try {
      await fetch('/api/fellowship/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...updates })
      });
    } catch {}
  }
}

export const firebaseGlobalService = new FirebaseGlobalService();
