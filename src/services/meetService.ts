// ==========================================
// REAL-TIME WEBRTC GROUP CALL SERVICE (Google Meet Architecture)
// Powered by Serverless MQTT WebSockets + BroadcastChannel Signaling
// ==========================================

import mqtt, { MqttClient } from 'mqtt';

export interface MeetParticipant {
  id: string;
  name: string;
  photoURL?: string;
  isGoogleUser: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  role: 'host' | 'participant';
  joinedAt: number;
  stream?: MediaStream;
  audioLevel?: number;
  isSpeaking?: boolean;
}

export interface MeetChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: number;
}

export interface MeetRoomInfo {
  id: string;
  title: string;
  hostId: string;
  prayerFocus?: string;
  createdAt: number;
}

export type MeetEventListener = (event: { type: string; data: any }) => void;

export const DEFAULT_PUBLIC_MEET_ROOMS: MeetRoomInfo[] = [
  {
    id: 'fellowship-sanctuary',
    title: '🕊️ Fellowship Global Sanctuary',
    hostId: 'host_anthony',
    prayerFocus: 'Worldwide Unity & Revival in Christ',
    createdAt: 1790900000000
  },
  {
    id: 'morning-prayer-altar',
    title: '🙏 Morning Prayer & Intercession Altar',
    hostId: 'prayer_team',
    prayerFocus: 'Praying for Families, Nations & Healing',
    createdAt: 1790900000000
  },
  {
    id: 'scripture-study-lounge',
    title: '📖 Scripture Academy Study Room',
    hostId: 'bible_academy',
    prayerFocus: 'Greek & Hebrew Exegesis Discussion',
    createdAt: 1790900000000
  },
  {
    id: 'worship-circle',
    title: '🎵 Praise & Worship Acoustic Lounge',
    hostId: 'worship_team',
    prayerFocus: 'Exalting Jesus in Song & Testimony',
    createdAt: 1790900000000
  }
];

const MQTT_BROKER_PRIMARY = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_BROKER_FALLBACK = 'wss://broker.hivemq.com:8884/mqtt';
const BROADCAST_BUS_NAME = 'lifeos_meet_sync_bus_v2';

interface ParticipantRecord extends MeetParticipant {
  lastSeen: number;
}

class MeetService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private processedSignalIds: Set<string> = new Set();
  private listeners: Set<MeetEventListener> = new Set();
  private currentRoomId: string | null = null;
  private currentUser: { id: string; name: string; photoURL?: string; isGoogleUser?: boolean } | null = null;
  private isAudioMuted: boolean = false;
  private isVideoMuted: boolean = false;
  private isScreenSharing: boolean = false;
  private isHandRaised: boolean = false;
  private audioAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private audioAnimationId: number | null = null;
  private remoteAnalysers: Map<string, AnalyserNode> = new Map();

  // Participant & Room Directory
  private participantsMap: Map<string, ParticipantRecord> = new Map();
  private chatHistory: Map<string, MeetChatMessage[]> = new Map();
  private knownRooms: Map<string, MeetRoomInfo> = new Map();

  // Real-time Transport
  private mqttClient: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isMqttConnected: boolean = false;
  private heartbeatIntervalId: any = null;
  private pruneIntervalId: any = null;

  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ]
  };

  constructor() {
    this.initDefaultRooms();
    this.initBroadcastChannel();
    this.initMqttTransport();
  }

  private initDefaultRooms() {
    DEFAULT_PUBLIC_MEET_ROOMS.forEach(room => {
      this.knownRooms.set(room.id, room);
    });
    try {
      const saved = localStorage.getItem('lifeos_meet_custom_rooms');
      if (saved) {
        const parsed: MeetRoomInfo[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(r => this.knownRooms.set(r.id, r));
        }
      }
    } catch {}
  }

  private saveCustomRoom(room: MeetRoomInfo) {
    this.knownRooms.set(room.id, room);
    try {
      const customRooms = Array.from(this.knownRooms.values()).filter(
        r => !DEFAULT_PUBLIC_MEET_ROOMS.some(d => d.id === r.id)
      );
      localStorage.setItem('lifeos_meet_custom_rooms', JSON.stringify(customRooms.slice(-20)));
    } catch {}
  }

  public subscribe(listener: MeetEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: string, data: any) {
    this.listeners.forEach(l => {
      try { l({ type, data }); } catch {}
    });
  }

  // ==========================================
  // REAL-TIME TRANSPORT: BroadcastChannel + MQTT
  // ==========================================

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_BUS_NAME);
        this.broadcastChannel.onmessage = (e) => {
          if (!e.data || !this.currentRoomId) return;
          const { topic, roomId, data } = e.data;
          if (roomId !== this.currentRoomId) return;

          if (topic === 'presence') {
            this.handlePresencePayload(data);
          } else if (topic === 'state') {
            this.handleStatePayload(data);
          } else if (topic === 'chat') {
            this.handleChatPayload(data);
          } else if (topic === 'signal') {
            this.handleIncomingSignal(data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel init error:', err);
      }
    }
  }

  private initMqttTransport(useFallback: boolean = false) {
    if (typeof window === 'undefined') return;

    try {
      const brokerUrl = useFallback ? MQTT_BROKER_FALLBACK : MQTT_BROKER_PRIMARY;
      const clientId = `lifeos_meet_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;

      if (this.mqttClient) {
        try { this.mqttClient.end(true); } catch {}
        this.mqttClient = null;
      }

      const client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2500,
        keepalive: 30,
      });

      this.mqttClient = client;

      client.on('connect', () => {
        this.isMqttConnected = true;
        // If already in a room, resubscribe and announce presence
        if (this.currentRoomId && this.currentUser) {
          this.subscribeRoomMqtt(this.currentRoomId, this.currentUser.id);
          this.publishPresence('peer_join');
        }
      });

      client.on('message', (topic, payload) => {
        try {
          if (!this.currentRoomId) return;
          const parsed = JSON.parse(payload.toString());
          if (!parsed) return;

          const prefix = `lifeos/meet/v2/rooms/${this.currentRoomId}/`;
          if (!topic.startsWith(prefix)) return;

          const subTopic = topic.substring(prefix.length);

          if (subTopic === 'presence') {
            this.handlePresencePayload(parsed);
          } else if (subTopic === 'state') {
            this.handleStatePayload(parsed);
          } else if (subTopic === 'chat') {
            this.handleChatPayload(parsed);
          } else if (subTopic.startsWith('signals/')) {
            this.handleIncomingSignal(parsed);
          }
        } catch (err) {
          console.warn('Error parsing incoming MQTT payload:', err);
        }
      });

      client.on('error', (err) => {
        console.warn('Meet MQTT error:', err);
        if (!useFallback && !this.isMqttConnected) {
          // Attempt fallback broker
          this.initMqttTransport(true);
        }
      });

      client.on('close', () => {
        this.isMqttConnected = false;
      });
    } catch (err) {
      console.warn('MQTT transport initialization failed:', err);
      if (!useFallback) {
        this.initMqttTransport(true);
      }
    }
  }

  private subscribeRoomMqtt(roomId: string, userId: string) {
    if (!this.mqttClient || !this.mqttClient.connected) return;
    const prefix = `lifeos/meet/v2/rooms/${roomId}`;
    const topics = [
      `${prefix}/presence`,
      `${prefix}/state`,
      `${prefix}/chat`,
      `${prefix}/signals/${userId}`
    ];
    this.mqttClient.subscribe(topics, (err) => {
      if (err) {
        console.warn('Error subscribing to room topics:', err);
      }
    });
  }

  private unsubscribeRoomMqtt(roomId: string, userId: string) {
    if (!this.mqttClient || !this.mqttClient.connected) return;
    const prefix = `lifeos/meet/v2/rooms/${roomId}`;
    const topics = [
      `${prefix}/presence`,
      `${prefix}/state`,
      `${prefix}/chat`,
      `${prefix}/signals/${userId}`
    ];
    this.mqttClient.unsubscribe(topics);
  }

  // ==========================================
  // ROOM DIRECTORY & METADATA
  // ==========================================

  public async getPublicRooms(): Promise<MeetRoomInfo[]> {
    return Array.from(this.knownRooms.values());
  }

  public async createRoom(params: {
    title?: string;
    customCode?: string;
    isPublic?: boolean;
    prayerFocus?: string;
    hostId?: string;
  }): Promise<MeetRoomInfo> {
    const defaultCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const cleanCode = (params.customCode || defaultCode)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') || defaultCode;

    const roomInfo: MeetRoomInfo = {
      id: cleanCode,
      title: params.title || `Fellowship Call ${cleanCode.slice(-4).toUpperCase()}`,
      hostId: params.hostId || 'host',
      createdAt: Date.now(),
      prayerFocus: params.prayerFocus || ''
    };

    this.saveCustomRoom(roomInfo);
    return roomInfo;
  }

  // ==========================================
  // LOCAL MEDIA CAPTURE & AUDIO ANALYSIS
  // ==========================================

  public async startLocalPreview(video: boolean = true, audio: boolean = true): Promise<MediaStream | null> {
    try {
      if (this.localStream) {
        this.stopLocalStream();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
          audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
        });

        this.localStream = stream;
        this.isVideoMuted = !video;
        this.isAudioMuted = !audio;

        this.setupAudioAnalysis(stream);
        this.emit('local_stream', { stream });
        return stream;
      }
    } catch (err: any) {
      console.warn('Could not access hardware camera/mic (using synthetic stream fallback):', err?.message);
      const synthetic = this.createSyntheticStream();
      this.localStream = synthetic;
      this.emit('local_stream', { stream: synthetic });
      return synthetic;
    }
    return null;
  }

  private createSyntheticStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕊️ LifeMeet Camera Ready', canvas.width / 2, canvas.height / 2);
    }
    const stream = canvas.captureStream(15);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctxAudio = new AudioCtx();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        gain.gain.value = 0.0001; // Silent
        const dst = ctxAudio.createMediaStreamDestination();
        osc.connect(gain);
        gain.connect(dst);
        osc.start();
        const silentTrack = dst.stream.getAudioTracks()[0];
        if (silentTrack) {
          silentTrack.enabled = false;
          stream.addTrack(silentTrack);
        }
      }
    } catch {}

    return stream;
  }

  private setupAudioAnalysis(stream: MediaStream) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (this.audioContext && stream.getAudioTracks().length > 0) {
        const source = this.audioContext.createMediaStreamSource(stream);
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 64;
        source.connect(this.audioAnalyser);

        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        let lastEmitTime = 0;
        let lastSpeakingState = false;

        const checkAudio = () => {
          const now = Date.now();
          if (this.audioAnalyser && !this.isAudioMuted) {
            this.audioAnalyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            const level = Math.min(100, Math.round((avg / 255) * 100));
            const isSpeaking = level > 12;

            if (now - lastEmitTime > 100 || isSpeaking !== lastSpeakingState) {
              lastEmitTime = now;
              lastSpeakingState = isSpeaking;
              this.emit('local_audio_level', { level, isSpeaking });
            }
          }
          this.audioAnimationId = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      }
    } catch {}
  }

  private setupRemoteAudioAnalysis(peerId: string, stream: MediaStream) {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (!this.audioContext) return;
      if (this.remoteAnalysers.has(peerId)) return;

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      this.remoteAnalysers.set(peerId, analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSpeaking = false;

      const checkPeerAudio = () => {
        if (!this.currentRoomId || !this.peerConnections.has(peerId)) {
          this.remoteAnalysers.delete(peerId);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const level = Math.min(100, Math.round((avg / 255) * 100));
        const isSpeaking = level > 14;

        if (isSpeaking !== lastSpeaking) {
          lastSpeaking = isSpeaking;
          this.emit('peer_speaking', { peerId, isSpeaking, level });
        }
        requestAnimationFrame(checkPeerAudio);
      };
      requestAnimationFrame(checkPeerAudio);
    } catch (err) {
      console.warn('Remote audio analysis setup error:', err);
    }
  }

  // ==========================================
  // ROOM JOIN / LEAVE
  // ==========================================

  public async joinRoom(roomId: string, user: {
    id: string;
    name: string;
    photoURL?: string;
    isGoogleUser?: boolean;
  }): Promise<{
    room: MeetRoomInfo;
    participant: MeetParticipant;
    allParticipants: MeetParticipant[];
    messages: MeetChatMessage[];
  } | null> {
    this.currentRoomId = roomId;
    this.currentUser = user;

    // Ensure local stream is ready
    if (!this.localStream) {
      await this.startLocalPreview(true, true);
    }

    // Initialize local participant
    const localParticipant: ParticipantRecord = {
      id: user.id,
      name: user.name || 'Believer in Christ',
      photoURL: user.photoURL,
      isGoogleUser: !!user.isGoogleUser,
      isAudioMuted: this.isAudioMuted,
      isVideoMuted: this.isVideoMuted,
      isScreenSharing: this.isScreenSharing,
      isHandRaised: this.isHandRaised,
      role: 'participant',
      joinedAt: Date.now(),
      lastSeen: Date.now()
    };

    // Check if room metadata is known
    let room = this.knownRooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        title: `Fellowship Room ${roomId.slice(-4).toUpperCase()}`,
        hostId: user.id,
        createdAt: Date.now()
      };
      this.knownRooms.set(roomId, room);
    }

    // Set self in participant map
    this.participantsMap.clear();
    this.participantsMap.set(user.id, localParticipant);

    // Subscribe to MQTT topics for this room
    this.subscribeRoomMqtt(roomId, user.id);

    // Announce presence immediately via MQTT and BroadcastChannel
    this.publishPresence('peer_join');

    // Start 3.5s Heartbeat to continuously discover and retain peers
    if (this.heartbeatIntervalId) clearInterval(this.heartbeatIntervalId);
    this.heartbeatIntervalId = setInterval(() => {
      if (this.currentRoomId && this.currentUser) {
        this.publishPresence('heartbeat');
      }
    }, 3500);

    // Start 4s Stale Participant Pruning
    if (this.pruneIntervalId) clearInterval(this.pruneIntervalId);
    this.pruneIntervalId = setInterval(() => {
      this.pruneStaleParticipants();
    }, 4000);

    const initialMessages = this.chatHistory.get(roomId) || [];

    return {
      room,
      participant: localParticipant,
      allParticipants: this.getParticipantsList(),
      messages: initialMessages
    };
  }

  public async leaveRoom() {
    if (this.currentRoomId && this.currentUser) {
      this.publishPresence('peer_leave');
      this.unsubscribeRoomMqtt(this.currentRoomId, this.currentUser.id);
    }

    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
    if (this.pruneIntervalId) {
      clearInterval(this.pruneIntervalId);
      this.pruneIntervalId = null;
    }

    this.peerConnections.forEach(pc => {
      try { pc.close(); } catch {}
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingIceCandidates.clear();
    this.remoteAnalysers.clear();
    this.participantsMap.clear();

    this.stopLocalStream();
    this.stopScreenSharing();

    if (this.audioAnimationId) {
      cancelAnimationFrame(this.audioAnimationId);
      this.audioAnimationId = null;
    }

    this.currentRoomId = null;
    this.isHandRaised = false;
    this.isScreenSharing = false;

    this.emit('call_ended', {});
  }

  // ==========================================
  // REAL-TIME SIGNALING & PRESENCE PROTOCOL
  // ==========================================

  private getParticipantsList(): MeetParticipant[] {
    return Array.from(this.participantsMap.values()).map(p => ({
      id: p.id,
      name: p.name,
      photoURL: p.photoURL,
      isGoogleUser: p.isGoogleUser,
      isAudioMuted: p.isAudioMuted,
      isVideoMuted: p.isVideoMuted,
      isScreenSharing: p.isScreenSharing,
      isHandRaised: p.isHandRaised,
      role: p.role,
      joinedAt: p.joinedAt,
      audioLevel: p.audioLevel,
      isSpeaking: p.isSpeaking
    }));
  }

  private publishPresence(type: 'peer_join' | 'heartbeat' | 'peer_leave', targetPeerId?: string) {
    if (!this.currentRoomId || !this.currentUser) return;

    const localP = this.participantsMap.get(this.currentUser.id);
    const payload = {
      type,
      roomId: this.currentRoomId,
      peerId: this.currentUser.id,
      targetPeerId,
      participant: localP ? {
        id: localP.id,
        name: localP.name,
        photoURL: localP.photoURL,
        isGoogleUser: localP.isGoogleUser,
        isAudioMuted: localP.isAudioMuted,
        isVideoMuted: localP.isVideoMuted,
        isScreenSharing: localP.isScreenSharing,
        isHandRaised: localP.isHandRaised,
        role: localP.role,
        joinedAt: localP.joinedAt
      } : undefined,
      timestamp: Date.now()
    };

    // 1. Send via MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/presence`,
        JSON.stringify(payload)
      );
    }

    // 2. Send via BroadcastChannel (local cross-tab sync)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          topic: 'presence',
          roomId: this.currentRoomId,
          data: payload
        });
      } catch {}
    }
  }

  private handlePresencePayload(payload: {
    type: 'peer_join' | 'heartbeat' | 'peer_leave';
    peerId: string;
    targetPeerId?: string;
    participant?: MeetParticipant;
    timestamp: number;
  }) {
    if (!payload || !this.currentUser || payload.peerId === this.currentUser.id) return;
    if (payload.targetPeerId && payload.targetPeerId !== this.currentUser.id) return;

    const { type, peerId, participant } = payload;

    if (type === 'peer_leave') {
      this.handlePeerLeft(peerId);
      return;
    }

    if (participant) {
      const isNewPeer = !this.participantsMap.has(peerId);
      const existing = this.participantsMap.get(peerId);

      this.participantsMap.set(peerId, {
        ...participant,
        lastSeen: Date.now()
      });

      if (isNewPeer) {
        // Immediately reply with targeted heartbeat so the new peer registers us without delay
        this.publishPresence('heartbeat', peerId);

        this.emit('peer_joined', {
          peer: participant,
          participants: this.getParticipantsList()
        });
      } else if (existing) {
        // Check if any state changed
        if (
          existing.isAudioMuted !== participant.isAudioMuted ||
          existing.isVideoMuted !== participant.isVideoMuted ||
          existing.isScreenSharing !== participant.isScreenSharing ||
          existing.isHandRaised !== participant.isHandRaised
        ) {
          this.emit('peer_state_changed', {
            peerId,
            updates: participant,
            participants: this.getParticipantsList()
          });
        }
      }

      this.emit('participants_updated', {
        participants: this.getParticipantsList()
      });

      // Deterministically establish WebRTC connection if not already created
      if (!this.peerConnections.has(peerId)) {
        const isInitiator = this.currentUser.id.localeCompare(peerId) < 0;
        this.createPeerConnection(peerId, isInitiator);
      }
    }
  }

  private handlePeerLeft(peerId: string) {
    if (!this.participantsMap.has(peerId)) return;

    this.participantsMap.delete(peerId);

    const pc = this.peerConnections.get(peerId);
    if (pc) {
      try { pc.close(); } catch {}
      this.peerConnections.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    this.pendingIceCandidates.delete(peerId);
    this.remoteAnalysers.delete(peerId);

    this.emit('peer_left', {
      peerId,
      participants: this.getParticipantsList()
    });
    this.emit('participants_updated', {
      participants: this.getParticipantsList()
    });
  }

  private pruneStaleParticipants() {
    if (!this.currentRoomId || !this.currentUser) return;
    const now = Date.now();
    const staleIds: string[] = [];

    this.participantsMap.forEach((record, id) => {
      if (id !== this.currentUser?.id && now - record.lastSeen > 12000) {
        staleIds.push(id);
      }
    });

    staleIds.forEach(id => this.handlePeerLeft(id));
  }

  private handleStatePayload(payload: {
    peerId: string;
    updates: Partial<MeetParticipant>;
  }) {
    if (!payload || !this.currentUser || payload.peerId === this.currentUser.id) return;
    const { peerId, updates } = payload;
    const existing = this.participantsMap.get(peerId);
    if (existing) {
      this.participantsMap.set(peerId, {
        ...existing,
        ...updates,
        lastSeen: Date.now()
      });
      this.emit('peer_state_changed', {
        peerId,
        updates,
        participants: this.getParticipantsList()
      });
      this.emit('participants_updated', {
        participants: this.getParticipantsList()
      });
    }
  }

  private handleChatPayload(payload: {
    message: MeetChatMessage;
  }) {
    if (!payload || !payload.message || !this.currentRoomId) return;
    const { message } = payload;
    if (message.senderId === this.currentUser?.id) return;

    const list = this.chatHistory.get(this.currentRoomId) || [];
    if (!list.some(m => m.id === message.id)) {
      list.push(message);
      this.chatHistory.set(this.currentRoomId, list);
      this.emit('chat_message', message);
    }
  }

  // ==========================================
  // WEBRTC PEER CONNECTION & SIGNALING
  // ==========================================

  private createPeerConnection(remotePeerId: string, isInitiator: boolean): RTCPeerConnection {
    if (this.peerConnections.has(remotePeerId)) {
      return this.peerConnections.get(remotePeerId)!;
    }

    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(remotePeerId, pc);

    // Add local media tracks
    const currentStream = this.isScreenSharing && this.screenStream ? this.screenStream : this.localStream;
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, currentStream);
        } catch (e) {
          console.warn('Error adding track to peer connection:', e);
        }
      });
    }

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      let stream = this.remoteStreams.get(remotePeerId);
      if (!stream) {
        stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
        this.remoteStreams.set(remotePeerId, stream);
      } else {
        if (!stream.getTracks().some(t => t.id === event.track.id)) {
          stream.addTrack(event.track);
          stream = new MediaStream(stream.getTracks());
          this.remoteStreams.set(remotePeerId, stream);
        }
      }

      this.setupRemoteAudioAnalysis(remotePeerId, stream);
      this.emit('remote_stream', { peerId: remotePeerId, stream });
    };

    // Gather and send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(remotePeerId, event.candidate.toJSON(), 'ice');
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        try { pc.restartIce(); } catch {}
      }
    };

    // If deterministic initiator, produce WebRTC Offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(remotePeerId, offer, 'offer');
          }
        } catch (err) {
          console.warn('Error creating WebRTC offer on negotiation needed:', err);
        }
      };

      // Fallback timer to guarantee offer generation even if onnegotiationneeded was delayed
      setTimeout(async () => {
        try {
          if (pc.signalingState === 'stable' && !pc.localDescription) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(remotePeerId, offer, 'offer');
          }
        } catch (err) {
          console.warn('Error creating WebRTC offer timeout fallback:', err);
        }
      }, 350);
    }

    return pc;
  }

  private sendSignal(targetId: string, signalData: any, type: 'offer' | 'answer' | 'ice') {
    if (!this.currentRoomId || !this.currentUser) return;
    const signalId = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.processedSignalIds.add(signalId);

    const payload = {
      id: signalId,
      roomId: this.currentRoomId,
      senderId: this.currentUser.id,
      targetId,
      type,
      signalData,
      timestamp: Date.now()
    };

    // 1. MQTT directed to target peer's signal topic
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/signals/${targetId}`,
        JSON.stringify(payload)
      );
    }

    // 2. BroadcastChannel local delivery
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          topic: 'signal',
          roomId: this.currentRoomId,
          data: payload
        });
      } catch {}
    }
  }

  private async handleIncomingSignal(sig: {
    id?: string;
    senderId: string;
    targetId?: string;
    type: 'offer' | 'answer' | 'ice';
    signalData: any;
  }) {
    if (!sig || !this.currentUser || sig.senderId === this.currentUser.id) return;
    if (sig.targetId && sig.targetId !== this.currentUser.id) return;

    const { id, senderId, type, signalData } = sig;

    // Deduplicate
    if (id) {
      if (this.processedSignalIds.has(id)) return;
      this.processedSignalIds.add(id);
      if (this.processedSignalIds.size > 2000) {
        const first = this.processedSignalIds.values().next().value;
        if (first) this.processedSignalIds.delete(first);
      }
    }

    let pc = this.peerConnections.get(senderId);
    if (!pc) {
      const isInit = this.currentUser.id.localeCompare(senderId) < 0;
      pc = this.createPeerConnection(senderId, isInit);
    }

    try {
      if (type === 'offer') {
        if (pc.signalingState !== 'stable') {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' } as any).catch(() => {})
          ]);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        await this.flushPendingIceCandidates(senderId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignal(senderId, answer, 'answer');
      } else if (type === 'answer') {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          await this.flushPendingIceCandidates(senderId, pc);
        }
      } else if (type === 'ice') {
        if (signalData) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(signalData));
          } else {
            if (!this.pendingIceCandidates.has(senderId)) {
              this.pendingIceCandidates.set(senderId, []);
            }
            this.pendingIceCandidates.get(senderId)!.push(signalData);
          }
        }
      }
    } catch (err) {
      console.warn('Error handling incoming WebRTC signal:', err);
    }
  }

  private async flushPendingIceCandidates(peerId: string, pc: RTCPeerConnection) {
    const candidates = this.pendingIceCandidates.get(peerId);
    if (candidates && candidates.length > 0) {
      this.pendingIceCandidates.delete(peerId);
      for (const cand of candidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('Error adding queued ICE candidate:', e);
        }
      }
    }
  }

  // ==========================================
  // IN-CALL CONTROLS & FEATURES
  // ==========================================

  public async toggleAudio(): Promise<boolean> {
    this.isAudioMuted = !this.isAudioMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isAudioMuted;
      });
    }
    await this.updateParticipantState({ isAudioMuted: this.isAudioMuted });
    this.emit('local_state_changed', { isAudioMuted: this.isAudioMuted, isVideoMuted: this.isVideoMuted });
    return !this.isAudioMuted;
  }

  public async toggleVideo(): Promise<boolean> {
    this.isVideoMuted = !this.isVideoMuted;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !this.isVideoMuted;
      });
    }
    await this.updateParticipantState({ isVideoMuted: this.isVideoMuted });
    this.emit('local_state_changed', { isAudioMuted: this.isAudioMuted, isVideoMuted: this.isVideoMuted });
    return !this.isVideoMuted;
  }

  public async switchCamera(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return false;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length > 1 && this.localStream) {
        const currentTrack = this.localStream.getVideoTracks()[0];
        const currentFacing = currentTrack ? currentTrack.getSettings().facingMode : 'user';
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        if (currentTrack) currentTrack.stop();
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacing },
          audio: !this.isAudioMuted
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        if (currentTrack) this.localStream.removeTrack(currentTrack);
        this.localStream.addTrack(newVideoTrack);

        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        this.emit('local_stream', { stream: this.localStream });
        return true;
      }
    } catch (err) {
      console.warn('Could not switch camera:', err);
    }
    return false;
  }

  public async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing) {
      this.stopScreenSharing();
      return false;
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen sharing not supported on this device');
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        this.screenStream = stream;
        this.isScreenSharing = true;

        const screenVideoTrack = stream.getVideoTracks()[0];

        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        screenVideoTrack.onended = () => {
          this.stopScreenSharing();
        };

        await this.updateParticipantState({ isScreenSharing: true });
        this.emit('screen_share_started', { stream });
        return true;
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
        return false;
      }
    }
  }

  private async stopScreenSharing() {
    this.isScreenSharing = false;
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }

    if (this.localStream) {
      const cameraTrack = this.localStream.getVideoTracks()[0];
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && cameraTrack) {
          sender.replaceTrack(cameraTrack);
        }
      });
    }

    await this.updateParticipantState({ isScreenSharing: false });
    this.emit('screen_share_stopped', {});
  }

  public async toggleRaiseHand(): Promise<boolean> {
    this.isHandRaised = !this.isHandRaised;
    await this.updateParticipantState({ isHandRaised: this.isHandRaised });
    this.emit('local_hand_raised', { isHandRaised: this.isHandRaised });
    return this.isHandRaised;
  }

  public async sendChatMessage(text: string): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUser || !text.trim()) return false;

    const message: MeetChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderPhoto: this.currentUser.photoURL,
      text: text.trim(),
      createdAt: Date.now()
    };

    const list = this.chatHistory.get(this.currentRoomId) || [];
    list.push(message);
    this.chatHistory.set(this.currentRoomId, list);

    const payload = {
      message
    };

    // 1. MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/chat`,
        JSON.stringify(payload)
      );
    }

    // 2. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          topic: 'chat',
          roomId: this.currentRoomId,
          data: payload
        });
      } catch {}
    }

    // Emit locally
    this.emit('chat_message', message);
    return true;
  }

  private async updateParticipantState(updates: Partial<MeetParticipant>) {
    if (!this.currentRoomId || !this.currentUser) return;

    const localP = this.participantsMap.get(this.currentUser.id);
    if (localP) {
      this.participantsMap.set(this.currentUser.id, {
        ...localP,
        ...updates
      });
    }

    const payload = {
      peerId: this.currentUser.id,
      updates
    };

    // 1. MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/state`,
        JSON.stringify(payload)
      );
    }

    // 2. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          topic: 'state',
          roomId: this.currentRoomId,
          data: payload
        });
      } catch {}
    }
  }

  public stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  public getState() {
    return {
      isAudioMuted: this.isAudioMuted,
      isVideoMuted: this.isVideoMuted,
      isScreenSharing: this.isScreenSharing,
      isHandRaised: this.isHandRaised,
      roomId: this.currentRoomId,
      user: this.currentUser
    };
  }
}

export const meetService = new MeetService();
