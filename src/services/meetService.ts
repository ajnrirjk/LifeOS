// ==========================================
// REAL-TIME WEBRTC GROUP CALL SERVICE (Google Meet Architecture)
// Powered by Serverless MQTT WebSockets + BroadcastChannel Signaling
// With Mobile Background Audio Keep-Alive & WakeLock Protection
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

const MQTT_BROKER_PRIMARY = 'wss://mqtt.tyckr.io:8081';
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
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private processedSignalIds: Set<string> = new Set();
  private listeners: Set<MeetEventListener> = new Set();

  private currentRoomId: string | null = null;
  private currentRoomInfo: MeetRoomInfo | null = null;
  private currentUser: { id: string; name: string; email?: string; photoURL?: string; isGoogleUser?: boolean; role?: 'host' | 'participant' } | null = null;
  private callStartTime: number | null = null;
  public isInCall: boolean = false;
  private isRoomLocked: boolean = false;

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

  // Mobile Background & WakeLock
  private wakeLock: any = null;
  private backgroundAudio: HTMLAudioElement | null = null;

  // Real-time Transport
  private mqttClient: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private isMqttConnected: boolean = false;
  private heartbeatIntervalId: any = null;
  private pruneIntervalId: any = null;

  private iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      {
        urls: [
          'stun:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelay',
        credential: 'openrelay'
      }
    ],
    iceCandidatePoolSize: 10
  };

  constructor() {
    this.initDefaultRooms();
    this.initBroadcastChannel();
    this.initMqttTransport();
    this.setupVisibilityAndFocusListeners();
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
  // MOBILE BACKGROUND & WAKELOCK MANAGEMENT
  // ==========================================

  private setupVisibilityAndFocusListeners() {
    if (typeof document === 'undefined') return;

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        if (this.isInCall) {
          this.requestWakeLock();
          await this.ensureTracksActive();
          if (this.audioContext && this.audioContext.state === 'suspended') {
            try { await this.audioContext.resume(); } catch {}
          }
          if (this.currentRoomId && (!this.mqttClient || !this.mqttClient.connected)) {
            this.initMqttTransport();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
  }

  private async requestWakeLock() {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock) {
        if (!this.wakeLock) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.wakeLock.addEventListener('release', () => {
            this.wakeLock = null;
          });
        }
      }
    } catch (err) {
      console.warn('WakeLock request error:', err);
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      try { this.wakeLock.release(); } catch {}
      this.wakeLock = null;
    }
  }

  private startBackgroundAudioKeepAlive() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.backgroundAudio) {
        // Silent WAV sound looping in an HTMLAudioElement signals to mobile OS media subsystems that playback is active
        const silentWavUri = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.backgroundAudio = new Audio(silentWavUri);
        this.backgroundAudio.loop = true;
        this.backgroundAudio.volume = 0.001;
      }
      this.backgroundAudio.play().catch(() => {});
    } catch {}
  }

  private stopBackgroundAudioKeepAlive() {
    if (this.backgroundAudio) {
      try {
        this.backgroundAudio.pause();
        this.backgroundAudio.currentTime = 0;
      } catch {}
    }
  }

  // Guarantee mic and camera tracks resume immediately after mobile app switching
  public async ensureTracksActive() {
    if (!this.isInCall || !this.localStream) return;

    // 1. Microphone track recovery
    const audioTracks = this.localStream.getAudioTracks();
    const isAudioDead = audioTracks.length === 0 || audioTracks.some(t => t.readyState === 'ended' || t.muted);
    if (isAudioDead && !this.isAudioMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        const newTrack = stream.getAudioTracks()[0];
        if (newTrack) {
          audioTracks.forEach(t => {
            try { t.stop(); } catch {}
            this.localStream?.removeTrack(t);
          });
          this.localStream.addTrack(newTrack);
          newTrack.enabled = !this.isAudioMuted;

          this.peerConnections.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
            if (sender) sender.replaceTrack(newTrack);
          });
        }
      } catch (err) {
        console.warn('Microphone recovery error:', err);
      }
    } else {
      audioTracks.forEach(t => {
        t.enabled = !this.isAudioMuted;
      });
    }

    // 2. Camera track recovery (if user has camera on)
    if (!this.isVideoMuted && !this.isScreenSharing) {
      const videoTracks = this.localStream.getVideoTracks();
      const isVideoDead = videoTracks.length === 0 || videoTracks.some(t => t.readyState === 'ended' || t.muted);
      if (isVideoDead) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
          });
          const newTrack = stream.getVideoTracks()[0];
          if (newTrack) {
            videoTracks.forEach(t => {
              try { t.stop(); } catch {}
              this.localStream?.removeTrack(t);
            });
            this.localStream.addTrack(newTrack);
            newTrack.enabled = true;

            this.peerConnections.forEach(pc => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(newTrack);
            });

            this.emit('local_stream', { stream: this.localStream });
          }
        } catch (err) {
          console.warn('Camera recovery error:', err);
        }
      } else {
        videoTracks.forEach(t => {
          t.enabled = true;
        });
      }
    }
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
          } else if (topic === 'control') {
            this.handleControlPayload(data);
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
        connectTimeout: 8000,
        reconnectPeriod: 2000,
        keepalive: 30,
      });

      this.mqttClient = client;

      client.on('connect', () => {
        this.isMqttConnected = true;
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
          } else if (subTopic === 'controls') {
            this.handleControlPayload(parsed);
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
      `${prefix}/controls`,
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
      `${prefix}/controls`,
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
      if (this.localStream && !this.isInCall) {
        this.stopLocalStream(true);
      }

      if (this.localStream && this.isInCall) {
        return this.localStream;
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
        gain.gain.value = 0.0001;
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
    email?: string;
    photoURL?: string;
    isGoogleUser?: boolean;
    role?: 'host' | 'participant';
  }): Promise<{
    room: MeetRoomInfo;
    participant: MeetParticipant;
    allParticipants: MeetParticipant[];
    messages: MeetChatMessage[];
  } | null> {
    const isMasterAdmin = (user.email?.toLowerCase().trim() === 'aw03102008@gmail.com');
    if (this.isRoomLocked && !isMasterAdmin) {
      throw new Error('This room has been locked by the Host. No new participants may join.');
    }

    this.currentRoomId = roomId;
    this.currentUser = user;

    // Ensure local stream is ready
    if (!this.localStream) {
      await this.startLocalPreview(true, true);
    }

    const assignedRole = (isMasterAdmin || user.role === 'host') ? 'host' : 'participant';

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
      role: assignedRole,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    };

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

    this.currentRoomInfo = room;
    this.isInCall = true;
    this.callStartTime = Date.now();

    // Enable mobile background keep-alive & screen wake lock
    this.requestWakeLock();
    this.startBackgroundAudioKeepAlive();

    this.participantsMap.clear();
    this.participantsMap.set(user.id, localParticipant);

    this.subscribeRoomMqtt(roomId, user.id);
    this.publishPresence('peer_join');

    if (this.heartbeatIntervalId) clearInterval(this.heartbeatIntervalId);
    this.heartbeatIntervalId = setInterval(() => {
      if (this.currentRoomId && this.currentUser) {
        this.publishPresence('heartbeat');
      }
    }, 3500);

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

    this.isInCall = false;
    this.currentRoomInfo = null;
    this.callStartTime = null;

    this.releaseWakeLock();
    this.stopBackgroundAudioKeepAlive();

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

    // Clean up dedicated remote audio elements
    this.remoteAudioElements.forEach(audioEl => {
      try {
        audioEl.pause();
        audioEl.srcObject = null;
      } catch {}
    });
    this.remoteAudioElements.clear();

    this.stopLocalStream(true);
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

  public getParticipantsList(): MeetParticipant[] {
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

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/presence`,
        JSON.stringify(payload)
      );
    }

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
        this.publishPresence('heartbeat', peerId);

        this.emit('peer_joined', {
          peer: participant,
          participants: this.getParticipantsList()
        });
      } else if (existing) {
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

    const audioEl = this.remoteAudioElements.get(peerId);
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.srcObject = null;
      } catch {}
      this.remoteAudioElements.delete(peerId);
    }

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

      if (typeof updates.isAudioMuted === 'boolean') {
        const audioEl = this.remoteAudioElements.get(peerId);
        if (audioEl) {
          audioEl.muted = updates.isAudioMuted;
        }
      }

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

  private handleControlPayload(payload: {
    type?: string;
    action: 'mute_all' | 'lock_room' | 'end_meeting';
    locked?: boolean;
    hostId: string;
    hostName?: string;
    timestamp: number;
  }) {
    if (!payload || !this.currentRoomId) return;

    if (payload.action === 'mute_all') {
      // Don't auto-mute the host who initiated the command
      if (this.currentUser && payload.hostId !== this.currentUser.id) {
        if (!this.isAudioMuted) {
          this.isAudioMuted = true;
          if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
              track.enabled = false;
            });
          }
          this.updateParticipantState({ isAudioMuted: true });
          this.emit('local_state_changed', { isAudioMuted: true, isVideoMuted: this.isVideoMuted });
        }
        this.emit('host_directive', {
          type: 'mute_all',
          message: '👑 The Host has muted all participant microphones in this room.'
        });
      }
    } else if (payload.action === 'lock_room') {
      this.isRoomLocked = !!payload.locked;
      this.emit('room_lock_changed', { locked: this.isRoomLocked });
      this.emit('host_directive', {
        type: 'lock_room',
        locked: this.isRoomLocked,
        message: this.isRoomLocked
          ? '🔒 The Host has locked this meeting room. No new participants may join.'
          : '🔓 The Host has unlocked this meeting room.'
      });
    } else if (payload.action === 'end_meeting') {
      if (this.currentUser && payload.hostId !== this.currentUser.id) {
        this.emit('meeting_ended_by_host', {
          message: '🛑 The Host has ended this meeting for all participants.'
        });
        setTimeout(() => {
          this.leaveRoom();
        }, 500);
      }
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

      // Continuous background audio playback for remote peer
      if (stream.getAudioTracks().length > 0) {
        let audioEl = this.remoteAudioElements.get(remotePeerId);
        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          audioEl.setAttribute('playsinline', 'true');
          (audioEl as any).playsInline = true;
          this.remoteAudioElements.set(remotePeerId, audioEl);
        }
        if (audioEl.srcObject !== stream) {
          audioEl.srcObject = stream;
        }
        audioEl.play().catch(() => {});
      }

      this.setupRemoteAudioAnalysis(remotePeerId, stream);
      this.emit('remote_stream', { peerId: remotePeerId, stream });
    };

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

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/signals/${targetId}`,
        JSON.stringify(payload)
      );
    }

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
  // IN-CALL CONTROLS & GETTERS
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

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/chat`,
        JSON.stringify(payload)
      );
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          topic: 'chat',
          roomId: this.currentRoomId,
          data: payload
        });
      } catch {}
    }

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

    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/state`,
        JSON.stringify(payload)
      );
    }

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

  public stopLocalStream(force: boolean = false) {
    if (this.isInCall && !force) {
      // Protect active call from being muted/stopped on component unmount
      return;
    }
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

  public getIsInCall(): boolean {
    return this.isInCall;
  }

  public getCurrentRoomInfo(): MeetRoomInfo | null {
    return this.currentRoomInfo;
  }

  public getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  public getCurrentUser(): { id: string; name: string; photoURL?: string; isGoogleUser?: boolean } | null {
    return this.currentUser;
  }

  public getCallDuration(): number {
    return this.callStartTime ? Math.floor((Date.now() - this.callStartTime) / 1000) : 0;
  }

  public getCallStartTime(): number | null {
    return this.callStartTime;
  }

  public getRemoteStreamsObject(): Record<string, MediaStream> {
    const result: Record<string, MediaStream> = {};
    this.remoteStreams.forEach((stream, peerId) => {
      result[peerId] = stream;
    });
    return result;
  }

  public getChatHistory(roomId?: string): MeetChatMessage[] {
    const id = roomId || this.currentRoomId;
    if (!id) return [];
    return this.chatHistory.get(id) || [];
  }

  // ==========================================
  // MASTER HOST COMMANDS (aw03102008@gmail.com)
  // ==========================================

  public async hostMuteAllPeers(): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUser) return false;
    const payload = {
      type: 'control',
      action: 'mute_all' as const,
      hostId: this.currentUser.id,
      hostName: this.currentUser.name,
      timestamp: Date.now()
    };
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(`lifeos/meet/v2/rooms/${this.currentRoomId}/controls`, JSON.stringify(payload));
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ topic: 'control', roomId: this.currentRoomId, data: payload });
      } catch {}
    }
    await this.sendChatMessage('👑 [HOST DIRECTIVE]: All participant microphones have been muted by Host.');
    return true;
  }

  public async hostSetRoomLock(locked: boolean): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUser) return false;
    this.isRoomLocked = locked;
    const payload = {
      type: 'control',
      action: 'lock_room' as const,
      locked,
      hostId: this.currentUser.id,
      hostName: this.currentUser.name,
      timestamp: Date.now()
    };
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `lifeos/meet/v2/rooms/${this.currentRoomId}/controls`,
        JSON.stringify(payload),
        { retain: true, qos: 1 }
      );
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ topic: 'control', roomId: this.currentRoomId, data: payload });
      } catch {}
    }
    await this.sendChatMessage(
      locked
        ? '🔒 [HOST DIRECTIVE]: Meeting room is now LOCKED by the Host. No new entries permitted.'
        : '🔓 [HOST DIRECTIVE]: Meeting room has been UNLOCKED by the Host.'
    );
    this.emit('room_lock_changed', { locked });
    return true;
  }

  public async hostEndMeeting(): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUser) return false;
    const payload = {
      type: 'control',
      action: 'end_meeting' as const,
      hostId: this.currentUser.id,
      hostName: this.currentUser.name,
      timestamp: Date.now()
    };
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(`lifeos/meet/v2/rooms/${this.currentRoomId}/controls`, JSON.stringify(payload));
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ topic: 'control', roomId: this.currentRoomId, data: payload });
      } catch {}
    }
    await this.sendChatMessage('🛑 [HOST DIRECTIVE]: Meeting has been ended by the Host for all participants.');
    return true;
  }

  public getIsRoomLocked(): boolean {
    return this.isRoomLocked;
  }

  public resumeAllAudioElements() {
    this.remoteAudioElements.forEach(audioEl => {
      try {
        if (audioEl.paused && audioEl.srcObject) {
          audioEl.play().catch(() => {});
        }
      } catch {}
    });
  }

  public getState() {
    return {
      isInCall: this.isInCall,
      isAudioMuted: this.isAudioMuted,
      isVideoMuted: this.isVideoMuted,
      isScreenSharing: this.isScreenSharing,
      isHandRaised: this.isHandRaised,
      roomId: this.currentRoomId,
      user: this.currentUser,
      isRoomLocked: this.isRoomLocked
    };
  }
}

export const meetService = new MeetService();
