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

type MeetEventListener = (event: { type: string; data: any }) => void;

class MeetService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private eventSource: EventSource | null = null;
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
  public async createRoom(params: { title?: string; customCode?: string; isPublic?: boolean; prayerFocus?: string; hostId?: string }): Promise<MeetRoomInfo | null> {
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
      console.error('Error creating meet room:', err);
    }
    return null;
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
      console.warn('Could not access real camera/mic (using fallback stream):', err.message);
      // Fallback synthetic stream (canvas + audio oscillator silent track)
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
            const isSpeaking = level > 14;

            if (now - lastEmitTime > 120 || isSpeaking !== lastSpeakingState) {
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

  // Join a meeting room
  public async joinRoom(roomId: string, user: { id: string; name: string; photoURL?: string; isGoogleUser?: boolean }): Promise<{
    room: MeetRoomInfo;
    participant: MeetParticipant;
    allParticipants: MeetParticipant[];
    messages: MeetChatMessage[];
  } | null> {
    this.currentRoomId = roomId;
    this.currentUser = user;

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

    // Create PeerConnections to all existing participants
    if (Array.isArray(data.allParticipants)) {
      data.allParticipants.forEach((p: MeetParticipant) => {
        if (p.id !== user.id) {
          this.createPeerConnection(p.id, true); // true = initiate offer
        }
      });
    }

    return data;
  }

  // Initialize SSE Signal Stream
  private initSignalStream(roomId: string, userId: string) {
    if (this.eventSource) {
      this.eventSource.close();
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
          // A new peer joined, prepare connection
          this.createPeerConnection(peer.id, false);
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
        const { senderId, signalData, type } = JSON.parse(e.data);
        if (senderId === this.currentUser?.id) return;

        let pc = this.peerConnections.get(senderId);
        if (!pc) {
          pc = this.createPeerConnection(senderId, false);
        }

        if (type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.sendSignal(senderId, answer, 'answer');
        } else if (type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        } else if (type === 'ice') {
          if (signalData) {
            await pc.addIceCandidate(new RTCIceCandidate(signalData));
          }
        }
      } catch (err) {
        console.warn('Error handling incoming WebRTC signal:', err);
      }
    });

    this.eventSource.onerror = () => {
      console.warn('Meet SSE stream disconnected, reconnecting...');
    };
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
        pc.addTrack(track, currentStream);
      });
    }

    // Handle remote track arrival
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.emit('remote_stream', { peerId: remotePeerId, stream: remoteStream });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(remotePeerId, event.candidate, 'ice');
      }
    };

    // If we are initiator, create and send Offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          this.sendSignal(remotePeerId, offer, 'offer');
        } catch (err) {
          console.warn('Error creating WebRTC offer:', err);
        }
      };
    }

    return pc;
  }

  // Send WebRTC Signal (Offer/Answer/Candidate) to target peer via server
  private async sendSignal(targetId: string, signalData: any, type: 'offer' | 'answer' | 'ice') {
    if (!this.currentRoomId || !this.currentUser) return;
    try {
      await fetch('/api/meet/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          senderId: this.currentUser.id,
          targetId,
          signalData,
          type
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
        const currentFacing = currentTrack.getSettings().facingMode;
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';

        currentTrack.stop();
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacing },
          audio: !this.isAudioMuted
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        this.localStream.removeTrack(currentTrack);
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
      // Stop screen sharing
      this.stopScreenSharing();
      return false;
    } else {
      // Start screen sharing
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

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
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
