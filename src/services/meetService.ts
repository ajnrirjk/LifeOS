// ==========================================
// REAL-TIME WEBRTC GROUP CALL SERVICE (Google Meet Architecture)
// ==========================================

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

class MeetService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private processedSignalIds: Set<string> = new Set();
  private eventSource: EventSource | null = null;
  private pollIntervalId: any = null;
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

  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ]
  };

  public subscribe(listener: MeetEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: string, data: any) {
    this.listeners.forEach(l => {
      try { l({ type, data }); } catch {}
    });
  }

  // List public / available rooms
  public async getPublicRooms(): Promise<any[]> {
    try {
      const res = await fetch('/api/meet/rooms');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Error fetching meet rooms:', err);
    }
    return [];
  }

  // Create a new meeting room
  public async createRoom(params: { title?: string; customCode?: string; isPublic?: boolean; prayerFocus?: string; hostId?: string }): Promise<MeetRoomInfo> {
    try {
      const res = await fetch('/api/meet/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Error creating meet room on server, generating local room:', err);
    }

    const defaultCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const cleanCode = (params.customCode || defaultCode)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') || defaultCode;

    return {
      id: cleanCode,
      title: params.title || `Fellowship Call ${cleanCode.slice(-4).toUpperCase()}`,
      hostId: params.hostId || 'host',
      createdAt: Date.now(),
      prayerFocus: params.prayerFocus || ''
    };
  }

  // Initialize local media (Camera + Mic preview)
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
      console.warn('Could not access real camera/mic (using fallback synthetic stream):', err.message);
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

    // Provide a silent Web Audio track so WebRTC media description includes audio
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
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
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

  // Setup Remote Peer Audio Analyser to show green ring when remote peer speaks
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

  // Join a meeting room
  public async joinRoom(roomId: string, user: { id: string; name: string; photoURL?: string; isGoogleUser?: boolean }): Promise<{
    room: MeetRoomInfo;
    participant: MeetParticipant;
    allParticipants: MeetParticipant[];
    messages: MeetChatMessage[];
  } | null> {
    this.currentRoomId = roomId;
    this.currentUser = user;

    // Ensure local stream exists
    if (!this.localStream) {
      await this.startLocalPreview(true, true);
    }

    let data: any = null;
    try {
      const res = await fetch('/api/meet/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          user,
          isAudioMuted: this.isAudioMuted,
          isVideoMuted: this.isVideoMuted
        })
      });

      if (res.ok) {
        data = await res.json();
      }
    } catch (err) {
      console.warn('Backend join route unreachable, using local fallback:', err);
    }

    if (!data) {
      const hostParticipant: MeetParticipant = {
        id: user.id,
        name: user.name || 'Believer in Christ',
        photoURL: user.photoURL,
        isGoogleUser: !!user.isGoogleUser,
        isAudioMuted: this.isAudioMuted,
        isVideoMuted: this.isVideoMuted,
        isScreenSharing: false,
        isHandRaised: false,
        role: 'host',
        joinedAt: Date.now()
      };
      data = {
        room: {
          id: roomId,
          title: `Fellowship Room ${roomId}`,
          hostId: user.id,
          createdAt: Date.now()
        },
        participant: hostParticipant,
        allParticipants: [hostParticipant],
        messages: []
      };
    }

    // Start SSE Signaling stream
    try {
      this.initSignalStream(roomId, user.id);
    } catch {}

    // Create PeerConnections to all existing participants using deterministic initiator
    if (Array.isArray(data.allParticipants)) {
      data.allParticipants.forEach((p: MeetParticipant) => {
        if (p.id !== user.id) {
          const isInit = user.id.localeCompare(p.id) < 0;
          this.createPeerConnection(p.id, isInit);
        }
      });
    }

    return data;
  }

  // Initialize SSE Signal Stream & HTTP Polling Fallback
  private initSignalStream(roomId: string, userId: string) {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    const sseUrl = `/api/meet/stream?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId)}`;
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.addEventListener('connected', (e) => {
      try {
        const payload = JSON.parse(e.data);
        this.emit('connected', payload);
      } catch {}
    });

    this.eventSource.addEventListener('peer_joined', (e) => {
      try {
        const payload = JSON.parse(e.data);
        const { peer } = payload;
        if (peer && peer.id !== this.currentUser?.id) {
          const isInit = (this.currentUser?.id || '').localeCompare(peer.id) < 0;
          this.createPeerConnection(peer.id, isInit);
          this.emit('peer_joined', payload);
        }
      } catch {}
    });

    this.eventSource.addEventListener('peer_left', (e) => {
      try {
        const payload = JSON.parse(e.data);
        const { peerId } = payload;
        if (peerId) {
          const pc = this.peerConnections.get(peerId);
          if (pc) {
            pc.close();
            this.peerConnections.delete(peerId);
          }
          this.remoteStreams.delete(peerId);
          this.pendingIceCandidates.delete(peerId);
          this.remoteAnalysers.delete(peerId);
          this.emit('peer_left', payload);
        }
      } catch {}
    });

    this.eventSource.addEventListener('peer_state_changed', (e) => {
      try {
        const payload = JSON.parse(e.data);
        this.emit('peer_state_changed', payload);
      } catch {}
    });

    this.eventSource.addEventListener('chat_message', (e) => {
      try {
        const payload = JSON.parse(e.data);
        this.emit('chat_message', payload);
      } catch {}
    });

    this.eventSource.addEventListener('signal', async (e) => {
      try {
        const sig = JSON.parse(e.data);
        await this.handleIncomingSignal(sig);
      } catch (err) {
        console.warn('Error handling incoming WebRTC signal:', err);
      }
    });

    this.eventSource.onerror = () => {
      console.warn('Meet SSE stream disconnected, relying on HTTP polling signals & room sync...');
    };

    // Robust Polling Interval (Signals + Room Sync every 1.2 seconds)
    this.pollIntervalId = setInterval(async () => {
      if (!this.currentRoomId || !this.currentUser) {
        if (this.pollIntervalId) clearInterval(this.pollIntervalId);
        return;
      }
      try {
        const sigRes = await fetch(`/api/meet/signals?roomId=${encodeURIComponent(this.currentRoomId)}&userId=${encodeURIComponent(this.currentUser.id)}`);
        if (sigRes.ok) {
          const { signals, participants } = await sigRes.json();
          if (Array.isArray(participants) && participants.length > 0) {
            this.emit('participants_updated', { participants });
            participants.forEach((p: MeetParticipant) => {
              if (p.id !== this.currentUser?.id && !this.peerConnections.has(p.id)) {
                const isInit = (this.currentUser?.id || '').localeCompare(p.id) < 0;
                this.createPeerConnection(p.id, isInit);
              }
            });
          }
          if (Array.isArray(signals)) {
            for (const sig of signals) {
              await this.handleIncomingSignal(sig);
            }
          }
        }
      } catch {}
    }, 1200);
  }

  // Handle incoming WebRTC signal with deduplication and ICE candidate queue
  private async handleIncomingSignal(sig: { id?: string; senderId: string; signalData: any; type: string }) {
    const { id, senderId, signalData, type } = sig;
    if (senderId === this.currentUser?.id) return;

    // Deduplicate signals
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
      const isInit = (this.currentUser?.id || '').localeCompare(senderId) < 0;
      pc = this.createPeerConnection(senderId, isInit);
      this.emit('peer_joined', { peer: { id: senderId }, participants: [] });
    }

    try {
      if (type === 'offer') {
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
            // Buffer candidate until remote description is applied
            if (!this.pendingIceCandidates.has(senderId)) {
              this.pendingIceCandidates.set(senderId, []);
            }
            this.pendingIceCandidates.get(senderId)!.push(signalData);
          }
        }
      }
    } catch (err) {
      console.warn('Error applying incoming WebRTC signal:', err);
    }
  }

  // Flush queued ICE candidates after remote description is applied
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

  // Create RTCPeerConnection for a remote peer
  private createPeerConnection(remotePeerId: string, isInitiator: boolean): RTCPeerConnection {
    if (this.peerConnections.has(remotePeerId)) {
      return this.peerConnections.get(remotePeerId)!;
    }

    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(remotePeerId, pc);

    // Add local tracks to peer connection
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

    // Handle remote track arrival
    pc.ontrack = (event) => {
      let stream = this.remoteStreams.get(remotePeerId);
      if (!stream) {
        stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
        this.remoteStreams.set(remotePeerId, stream);
      } else {
        // Add new track if not already included
        if (!stream.getTracks().some(t => t.id === event.track.id)) {
          stream.addTrack(event.track);
          // Re-instantiate MediaStream reference so React state recognizes change
          stream = new MediaStream(stream.getTracks());
          this.remoteStreams.set(remotePeerId, stream);
        }
      }

      this.setupRemoteAudioAnalysis(remotePeerId, stream);
      this.emit('remote_stream', { peerId: remotePeerId, stream });
    };

    // Handle ICE candidates
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

    // If we are initiator, create and send Offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(remotePeerId, offer, 'offer');
          }
        } catch (err) {
          console.warn('Error creating WebRTC offer:', err);
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
      }, 500);
    }

    return pc;
  }

  // Send WebRTC Signal (Offer/Answer/Candidate) to target peer via server
  private async sendSignal(targetId: string, signalData: any, type: 'offer' | 'answer' | 'ice') {
    if (!this.currentRoomId || !this.currentUser) return;
    const signalId = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.processedSignalIds.add(signalId);

    try {
      await fetch('/api/meet/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          senderId: this.currentUser.id,
          targetId,
          signalData,
          type,
          signalId
        })
      });
    } catch (err) {
      console.warn('Error sending signal:', err);
    }
  }

  // Toggle Microphone Mute
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

  // Toggle Camera Mute / On / Off
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

  // Flip Camera (Front / Back on Mobile devices)
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

        // Replace track in all peer connections
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

  // Toggle Screen Sharing
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

        // Replace track in all peer connections
        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        // Listen for browser "Stop Sharing" floating button
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

    // Revert back to local camera track
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

  // Toggle Hand Raise
  public async toggleRaiseHand(): Promise<boolean> {
    this.isHandRaised = !this.isHandRaised;
    await this.updateParticipantState({ isHandRaised: this.isHandRaised });
    this.emit('local_hand_raised', { isHandRaised: this.isHandRaised });
    return this.isHandRaised;
  }

  // Send In-Call Chat Message
  public async sendChatMessage(text: string): Promise<boolean> {
    if (!this.currentRoomId || !this.currentUser || !text.trim()) return false;
    try {
      const res = await fetch('/api/meet/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          senderId: this.currentUser.id,
          senderName: this.currentUser.name,
          senderPhoto: this.currentUser.photoURL,
          text: text.trim()
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Update State in Backend Room
  private async updateParticipantState(updates: Partial<MeetParticipant>) {
    if (!this.currentRoomId || !this.currentUser) return;
    try {
      await fetch('/api/meet/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          userId: this.currentUser.id,
          updates
        })
      });
    } catch {}
  }

  // Leave Call & Cleanup
  public async leaveRoom() {
    if (this.currentRoomId && this.currentUser) {
      try {
        await fetch('/api/meet/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: this.currentRoomId,
            userId: this.currentUser.id
          })
        });
      } catch {}
    }

    this.peerConnections.forEach(pc => {
      try { pc.close(); } catch {}
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingIceCandidates.clear();
    this.remoteAnalysers.clear();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

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
