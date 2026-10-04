import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  Hand,
  Settings as SettingsIcon,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  Send,
  BookOpen,
  Heart,
  Grid,
  Monitor,
  RefreshCw,
  Clock,
  ShieldCheck,
  Pin,
  Flame,
  Subtitles,
  Smile,
  FileText,
  Crown,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { meetService, MeetParticipant, MeetChatMessage, MeetRoomInfo } from '../../services/meetService';
import { useSettings } from '../../context/SettingsContext';
import { useLifeOS } from '../../context/LifeOSContext';
import { sounds } from '../../services/soundEffects';

interface ParticipantTileProps {
  participant: MeetParticipant;
  isLocal?: boolean;
  stream?: MediaStream | null;
  isSpeaking?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
}

// Stable video player that prevents camera flickering by only re-assigning srcObject when stream reference changes
const VideoStreamPlayer = React.memo(({
  stream,
  isLocal = false,
  className = '',
  onVideoRef
}: {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (onVideoRef) onVideoRef(videoRef.current);
  }, [onVideoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      if (video.srcObject !== null) {
        video.srcObject = null;
      }
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      // @ts-ignore
      autoPictureInPicture="true"
      muted={true}
      className={className}
    />
  );
});

// Dedicated Audio Player for each Remote Participant
// Guarantees remote voice is ALWAYS audible even if their camera is turned off
const RemoteAudioPlayer = React.memo(({
  peerId,
  stream,
  isMuted,
  onAutoplayBlocked
}: {
  peerId: string;
  stream: MediaStream;
  isMuted: boolean;
  onAutoplayBlocked?: () => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.srcObject !== stream) {
      audio.srcObject = stream;
    }
    audio.muted = isMuted;
    if (!isMuted) {
      audio.play().catch((err: any) => {
        if (err && err.name === 'NotAllowedError') {
          onAutoplayBlocked?.();
        }
      });
    }
  }, [stream, isMuted, onAutoplayBlocked]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={isMuted}
      className="hidden"
      data-peer-id={peerId}
    />
  );
});

const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  isLocal,
  stream,
  isSpeaking,
  isPinned,
  onPin,
}) => {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const handleTogglePiP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (document.pictureInPictureEnabled && videoEl) {
      videoEl.requestPictureInPicture().catch(() => {});
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-[#1e293b] rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center border transition-all duration-200 group shadow-lg ${
        isSpeaking
          ? 'ring-4 ring-emerald-400 border-emerald-400 shadow-emerald-500/20'
          : isPinned
          ? 'ring-2 ring-amber-400 border-amber-400'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Video Stream Element */}
      {!participant.isVideoMuted && stream ? (
        <VideoStreamPlayer
          stream={stream}
          isLocal={isLocal}
          onVideoRef={setVideoEl}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        /* Avatar Placeholder when video is disabled */
        <div className="flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="relative">
            {participant.photoURL ? (
              <img
                src={participant.photoURL}
                alt={participant.name}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-700 to-indigo-800 flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-2xl border-4 border-white/20">
                {participant.name.charAt(0).toUpperCase()}
              </div>
            )}
            {isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border-4 border-emerald-400"
              />
            )}
          </div>
          <span className="mt-3 font-extrabold text-sm sm:text-base text-stone-200">
            {participant.name}
          </span>
          <span className="text-[10px] text-stone-400 font-semibold mt-0.5">
            {participant.isVideoMuted ? 'Camera Off' : 'Connecting...'}
          </span>
        </div>
      )}

      {/* Raised Hand Badge Indicator */}
      {participant.isHandRaised && (
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xl ring-2 ring-amber-300"
        >
          <span className="text-sm">✋</span>
          <span>Hand Raised</span>
        </motion.div>
      )}

      {/* Top Right Controls: PiP & Pin Buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled && !participant.isVideoMuted && stream && (
          <button
            onClick={handleTogglePiP}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-stone-300 hover:text-white backdrop-blur-md transition-all shadow-md"
            title="Pop out Picture-in-Picture window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onPin && (
          <button
            onClick={onPin}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md ${
              isPinned
                ? 'bg-amber-500 text-stone-950 opacity-100'
                : 'bg-black/60 hover:bg-black/80 text-stone-300 hover:text-white'
            }`}
            title={isPinned ? 'Unpin participant' : 'Pin to spotlight'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Information Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        {/* Name and Role Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold truncate max-w-[80%]">
          <span className="truncate">{isLocal ? `${participant.name} (You)` : participant.name}</span>
          {participant.role === 'host' && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/40 text-amber-300 text-[9px] font-black uppercase">
              Host
            </span>
          )}
        </div>

        {/* Mic Status Indicator */}
        <div
          className={`p-1.5 rounded-xl backdrop-blur-md flex items-center justify-center ${
            participant.isAudioMuted
              ? 'bg-rose-500/90 text-white'
              : isSpeaking
              ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 animate-pulse'
              : 'bg-black/70 text-stone-300'
          }`}
        >
          {participant.isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
};

export const LifeMeetApp: React.FC = () => {
  const { settings, googleUser, isAuthorizedAdmin } = useSettings();
  const { launchApp } = useLifeOS();

  // Master Host Controls State (Only for aw03102008@gmail.com)
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);

  // Call / Room State (Restored from meetService singleton)
  const [isInCall, setIsInCall] = useState(() => meetService.getIsInCall());
  const [roomInfo, setRoomInfo] = useState<MeetRoomInfo | null>(() => meetService.getCurrentRoomInfo());
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Local Media & Participant State
  const [localStream, setLocalStream] = useState<MediaStream | null>(() => meetService.getLocalStream());
  const [isAudioMuted, setIsAudioMuted] = useState(() => meetService.getState().isAudioMuted);
  const [isVideoMuted, setIsVideoMuted] = useState(() => meetService.getState().isVideoMuted);
  const [isScreenSharing, setIsScreenSharing] = useState(() => meetService.getState().isScreenSharing);
  const [isHandRaised, setIsHandRaised] = useState(() => meetService.getState().isHandRaised);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

  // Remote Participants & Streams
  const [participants, setParticipants] = useState<MeetParticipant[]>(() => meetService.getParticipantsList());
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>(() => meetService.getRemoteStreamsObject());
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);

  // In-Call Features
  const [chatMessages, setChatMessages] = useState<MeetChatMessage[]>(() => meetService.getChatHistory(meetService.getCurrentRoomId() || undefined));
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isPrayModalOpen, setIsPrayModalOpen] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerFocusShared, setPrayerFocusShared] = useState<string | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Live Closed Captions / Subtitles
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<{ speaker: string; text: string } | null>(null);

  // Call Duration Timer
  const [callDuration, setCallDuration] = useState(() => meetService.getCallDuration());

  // Create User Identity with guaranteed unique persistent client ID for multi-device support
  const currentUser = useMemo(() => {
    let persistentId = '';
    try {
      persistentId = sessionStorage.getItem('lifemeet_device_sid') || '';
      if (!persistentId) {
        persistentId = `dev_${Math.random().toString(36).substring(2, 7)}_${Date.now().toString(36).slice(-4)}`;
        sessionStorage.setItem('lifemeet_device_sid', persistentId);
      }
    } catch {
      persistentId = `dev_${Math.random().toString(36).substring(2, 7)}`;
    }

    const email = googleUser?.email?.toLowerCase().trim() || '';
    const isMaster = isAuthorizedAdmin || email === 'aw03102008@gmail.com' || settings.profile.role === 'superadmin' || settings.profile.role === 'admin';
    const slug = email ? email.replace(/[^a-z0-9]/g, '_') : 'guest';
    const uniquePeerId = `usr_${slug}_${persistentId}`;

    return {
      id: uniquePeerId,
      name: googleUser?.displayName || settings.profile.name || (email ? email.split('@')[0] : `Believer (${persistentId.slice(-4)})`),
      email,
      photoURL: googleUser?.photoURL || undefined,
      isGoogleUser: !!googleUser,
      role: isMaster ? ('host' as const) : ('participant' as const)
    };
  }, [googleUser, settings.profile.name, settings.profile.role, isAuthorizedAdmin]);

  // Check URL hash for direct meeting invite link (e.g. /#meet=fellowship-prayer-room)
  useEffect(() => {
    const handleMeetHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/meet=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        const code = match[1];
        setRoomCodeInput(code);
        if (!isInCall) {
          handleJoinMeeting(code);
        }
      }
    };
    handleMeetHash();
    window.addEventListener('hashchange', handleMeetHash);
    return () => window.removeEventListener('hashchange', handleMeetHash);
  }, [isInCall]);

  // 1. Fetch Public Lounges on Mount & start preview
  useEffect(() => {
    loadPublicRooms();
    startPreview();

    return () => {
      if (!meetService.getIsInCall()) {
        meetService.stopLocalStream();
      }
    };
  }, []);

  const loadPublicRooms = async () => {
    const list = await meetService.getPublicRooms();
    setPublicRooms(list);
  };

  const startPreview = async () => {
    if (meetService.getIsInCall()) {
      setLocalStream(meetService.getLocalStream());
      return;
    }
    const stream = await meetService.startLocalPreview(true, true);
    setLocalStream(stream);
  };

  // 2. Setup Meet Service Event Listeners
  useEffect(() => {
    const unsubscribe = meetService.subscribe((event) => {
      const { type, data } = event;

      if (type === 'local_stream') {
        setLocalStream(data.stream);
      } else if (type === 'local_audio_level') {
        setLocalAudioLevel(data.level);
        setIsLocalSpeaking(data.isSpeaking);
      } else if (type === 'peer_speaking') {
        setSpeakingPeers(prev => ({
          ...prev,
          [data.peerId]: data.isSpeaking
        }));
      } else if (type === 'local_state_changed') {
        setIsAudioMuted(data.isAudioMuted);
        setIsVideoMuted(data.isVideoMuted);
      } else if (type === 'local_hand_raised') {
        setIsHandRaised(data.isHandRaised);
      } else if (type === 'screen_share_started') {
        setIsScreenSharing(true);
      } else if (type === 'screen_share_stopped') {
        setIsScreenSharing(false);
      } else if (type === 'peer_joined') {
        sounds.playCorrect();
        setParticipants(data.participants || []);
      } else if (type === 'participants_updated') {
        if (Array.isArray(data.participants)) {
          setParticipants(data.participants);
        }
      } else if (type === 'peer_left') {
        setParticipants(data.participants || []);
        if (data.peerId) {
          setSpeakingPeers(prev => {
            const next = { ...prev };
            delete next[data.peerId];
            return next;
          });
          setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[data.peerId];
            return next;
          });
        }
      } else if (type === 'peer_state_changed') {
        setParticipants(data.participants || []);
        if (data.updates?.prayerFocus) {
          setPrayerFocusShared(data.updates.prayerFocus);
        }
      } else if (type === 'remote_stream') {
        setRemoteStreams(prev => ({
          ...prev,
          [data.peerId]: data.stream
        }));
      } else if (type === 'chat_message') {
        setChatMessages(prev => [...prev, data]);
        if (!isChatOpen) {
          setUnreadChatCount(prev => prev + 1);
        }
        sounds.playTap();
      } else if (type === 'host_directive') {
        sounds.playTap();
        alert(data.message || 'Host Directive issued');
      } else if (type === 'room_lock_changed') {
        setIsRoomLocked(data.locked);
      } else if (type === 'meeting_ended_by_host') {
        sounds.playIncorrect();
        alert(data.message || 'The Host has ended this meeting.');
        setIsInCall(false);
        setRoomInfo(null);
        setParticipants([]);
        setRemoteStreams({});
        setSpeakingPeers({});
        startPreview();
      } else if (type === 'call_ended') {
        setIsInCall(false);
        setRoomInfo(null);
        setParticipants([]);
        setRemoteStreams({});
        setSpeakingPeers({});
        startPreview();
      }
    });

    return () => unsubscribe();
  }, [isChatOpen]);

  // 3. Call Duration Timer
  useEffect(() => {
    let interval: any = null;
    if (isInCall) {
      setCallDuration(meetService.getCallDuration());
      interval = setInterval(() => {
        setCallDuration(meetService.getCallDuration());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions: Join / Create Meeting
  const handleJoinMeeting = async (targetRoomId: string) => {
    if (!targetRoomId.trim()) return;
    setIsLoading(true);
    sounds.playTap();

    try {
      const data = await meetService.joinRoom(targetRoomId.trim().toLowerCase(), currentUser);
      if (data) {
        setRoomInfo(data.room);
        setParticipants(data.allParticipants);
        setChatMessages(data.messages || []);
        setIsInCall(true);
        sounds.playVictory();
      }
    } catch (err: any) {
      console.error('Error joining meeting:', err);
      sounds.playIncorrect();
      alert(err?.message || 'Could not join meeting call. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInstantMeeting = async (isPublic: boolean = false, customTitle?: string) => {
    setIsLoading(true);
    sounds.playTap();
    try {
      const fallbackCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
      let targetCode = fallbackCode;

      const newRoom = await meetService.createRoom({
        title: customTitle || `${currentUser.name}'s Fellowship Call`,
        isPublic,
        hostId: currentUser.id,
        customCode: fallbackCode
      });

      if (newRoom && newRoom.id) {
        targetCode = newRoom.id;
      }

      await handleJoinMeeting(targetCode);
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      const fallbackCode = `meet-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
      await handleJoinMeeting(fallbackCode);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCall = async () => {
    sounds.playTap();
    await meetService.leaveRoom();
    setIsInCall(false);
    setRoomInfo(null);
    setParticipants([]);
    setRemoteStreams({});
    loadPublicRooms();
  };

  const copyMeetingCode = () => {
    if (!roomInfo) return;
    sounds.playVictory();
    const link = `${window.location.origin}/#meet=${roomInfo.id}`;
    navigator.clipboard.writeText(roomInfo.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    await meetService.sendChatMessage(text);
  };

  const handleShareScripture = async (refText: string) => {
    sounds.playVictory();
    await meetService.sendChatMessage(`📖 Scripture Sharing: "${refText}"`);
    setIsPrayModalOpen(false);
  };

  // Master Host Control Handlers (aw03102008@gmail.com)
  const handleHostMuteAll = async () => {
    sounds.playTap();
    await meetService.hostMuteAllPeers();
    setIsHostControlsOpen(false);
  };

  const handleHostToggleLock = async () => {
    sounds.playTap();
    const newLockState = !isRoomLocked;
    setIsRoomLocked(newLockState);
    await meetService.hostSetRoomLock(newLockState);
  };

  const handleHostEndMeeting = async () => {
    if (confirm('Are you sure you want to end this meeting for everyone?')) {
      sounds.playIncorrect();
      await meetService.hostEndMeeting();
      setIsHostControlsOpen(false);
      setTimeout(() => {
        handleLeaveCall();
      }, 400);
    }
  };

  // Calculate Grid Layout Classes based on participant count
  const allTileCount = participants.length > 0 ? participants.length : 1;
  const getGridClasses = () => {
    if (pinnedPeerId) return 'grid-cols-1';
    if (allTileCount === 1) return 'grid-cols-1 max-w-4xl max-h-[78vh] mx-auto';
    if (allTileCount === 2) return 'grid-cols-1 md:grid-cols-2';
    if (allTileCount <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (allTileCount <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div
      onClick={() => meetService.resumeAllAudioElements()}
      className="relative flex flex-col h-full w-full bg-[#0b0f19] text-white select-none overflow-hidden font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. LOBBY / PRE-JOIN SCREEN                                               */}
      {/* ========================================================================= */}
      {!isInCall ? (
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 sm:py-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-2xl shadow-xl">
                📹
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>LifeMeet</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Live Video
                  </span>
                </h1>
                <p className="text-xs text-stone-400 font-medium">
                  High-definition group video calling, screen sharing & prayer fellowship.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartInstantMeeting(false)}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>New Meeting</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Camera & Microphone Preview */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-video w-full bg-[#131b2e] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl flex items-center justify-center">
                {!isVideoMuted && localStream ? (
                  <VideoStreamPlayer
                    stream={localStream}
                    isLocal={true}
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/20 mb-3">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-base text-stone-200">{currentUser.name}</span>
                    <span className="text-xs text-stone-400">Camera is turned off</span>
                  </div>
                )}

                {/* Microphone Level Meter Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15">
                    {isAudioMuted ? (
                      <MicOff className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Mic className={`w-4 h-4 ${isLocalSpeaking ? 'text-emerald-400 animate-pulse' : 'text-stone-300'}`} />
                    )}
                    <div className="w-20 h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          isAudioMuted ? 'w-0' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${isAudioMuted ? 0 : localAudioLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Controls in Preview */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => meetService.toggleAudio()}
                      className={`p-3 rounded-full backdrop-blur-md shadow-xl transition-all ${
                        isAudioMuted ? 'bg-rose-500 text-white' : 'bg-black/70 hover:bg-black/90 text-white'
                      }`}
                      title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => meetService.toggleVideo()}
                      className={`p-3 rounded-full backdrop-blur-md shadow-xl transition-all ${
                        isVideoMuted ? 'bg-rose-500 text-white' : 'bg-black/70 hover:bg-black/90 text-white'
                      }`}
                      title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
                    >
                      {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center justify-between text-xs text-stone-400 px-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>End-to-end WebRTC encrypted calls</span>
                </span>
                <span>Ready to join</span>
              </div>
            </div>

            {/* Right: Join / Create Actions & Public Lounges */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Join with Code Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#131b2e] border border-white/10 shadow-2xl space-y-4">
                <h2 className="font-black text-sm uppercase tracking-wider text-stone-300 flex items-center gap-2">
                  <span>🔑</span>
                  <span>Join with Meeting Code</span>
                </h2>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting(roomCodeInput)}
                    placeholder="e.g. fellowship-prayer-room"
                    className="flex-1 bg-stone-900/90 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                  <button
                    onClick={() => handleJoinMeeting(roomCodeInput)}
                    disabled={!roomCodeInput.trim() || isLoading}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl transition-all disabled:opacity-40 active:scale-95"
                  >
                    Join
                  </button>
                </div>
              </div>

              {/* Public Fellowship Lounges */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#131b2e] border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-sm uppercase tracking-wider text-stone-300 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Public Fellowship Lounges</span>
                  </h2>
                  <button
                    onClick={loadPublicRooms}
                    className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    title="Refresh rooms"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {publicRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleJoinMeeting(room.id)}
                      className="p-3.5 rounded-2xl bg-stone-900/80 hover:bg-stone-800/90 border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg shrink-0">
                          🕊️
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-xs sm:text-sm text-white truncate group-hover:text-blue-300 transition-colors">
                            {room.title}
                          </h3>
                          <p className="text-[11px] text-stone-400 truncate">
                            {room.prayerFocus || room.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{room.participantCount || 0}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. IN-MEETING CALL SCREEN (Google Meet Layout)                           */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
          {/* Top Bar with Meeting Title, Code, Copy Link & Timer */}
          <div className="h-13 px-4 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 shrink-0 z-20">
            {/* Left Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm shadow-md shrink-0">
                📹
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-xs sm:text-sm text-white truncate">
                  {roomInfo?.title || 'Fellowship Call'}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                  <span>{roomInfo?.id}</span>
                  <button
                    onClick={copyMeetingCode}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                    title="Copy Meeting Code"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Prayer Focus or Live Timer */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatDuration(callDuration)}</span>
              {roomInfo?.prayerFocus && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="text-amber-300 font-medium truncate max-w-xs">
                    {roomInfo.prayerFocus}
                  </span>
                </>
              )}
            </div>

            {/* Right: Participants & Chat Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPrayModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                title="Pray together & share scripture"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pray Together</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsParticipantsOpen(!isParticipantsOpen);
                }}
                className={`p-2 rounded-xl border transition-all relative ${
                  isParticipantsOpen
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/10'
                }`}
                title="View Participants"
              >
                <Users className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blue-500 text-white text-[9px] font-black rounded-full">
                  {participants.length}
                </span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsChatOpen(!isChatOpen);
                  setUnreadChatCount(0);
                }}
                className={`p-2 rounded-xl border transition-all relative ${
                  isChatOpen
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/10'
                }`}
                title="In-call Chat"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* Main Video Area with Dynamic Grid Layout */}
          <div className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3 relative">
            {/* Video Tiles Grid */}
            <div className={`flex-1 grid ${getGridClasses()} gap-2.5 sm:gap-4 h-full w-full overflow-y-auto no-scrollbar items-center justify-center content-center`}>
              {/* Local Participant Tile */}
              <ParticipantTile
                participant={{
                  id: currentUser.id,
                  name: currentUser.name,
                  photoURL: currentUser.photoURL,
                  isGoogleUser: currentUser.isGoogleUser,
                  isAudioMuted,
                  isVideoMuted,
                  isScreenSharing,
                  isHandRaised,
                  role: roomInfo?.hostId === currentUser.id ? 'host' : 'participant',
                  joinedAt: Date.now()
                }}
                isLocal={true}
                stream={isScreenSharing ? meetService.getScreenStream() : localStream}
                isSpeaking={isLocalSpeaking}
                isPinned={pinnedPeerId === currentUser.id}
                onPin={() => setPinnedPeerId(pinnedPeerId === currentUser.id ? null : currentUser.id)}
              />

              {/* Remote Participant Tiles */}
              {participants
                .filter((p) => p.id !== currentUser.id)
                .map((peer) => (
                  <ParticipantTile
                    key={peer.id}
                    participant={peer}
                    isLocal={false}
                    stream={remoteStreams[peer.id] || null}
                    isSpeaking={speakingPeers[peer.id] || false}
                    isPinned={pinnedPeerId === peer.id}
                    onPin={() => setPinnedPeerId(pinnedPeerId === peer.id ? null : peer.id)}
                  />
                ))}

              {/* Waiting for Others Card when alone in call */}
              {participants.filter(p => p.id !== currentUser.id).length === 0 && (
                <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-stone-900/60 border border-white/10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl">
                    🕊️
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-200">You're the first one here!</h3>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Share the meeting code <span className="font-mono text-blue-400 font-bold">{roomInfo?.id}</span> with brothers and sisters to invite them into this fellowship.
                  </p>
                  <button
                    onClick={copyMeetingCode}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Copied Invite Link!' : 'Copy Meeting Invite Link'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated Remote Audio Players (Always audible even if remote camera is disabled) */}
            {participants
              .filter((p) => p.id !== currentUser.id && remoteStreams[p.id])
              .map((p) => (
                <RemoteAudioPlayer
                  key={`remote-audio-${p.id}`}
                  peerId={p.id}
                  stream={remoteStreams[p.id]}
                  isMuted={p.isAudioMuted}
                  onAutoplayBlocked={() => setAutoplayBlocked(true)}
                />
              ))}

            {/* Autoplay blocked banner */}
            {autoplayBlocked && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-stone-950 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black ring-2 ring-amber-300">
                <span>🔊 Click to enable participant audio</span>
                <button
                  onClick={() => {
                    setAutoplayBlocked(false);
                    document.querySelectorAll('audio').forEach(a => a.play().catch(() => {}));
                  }}
                  className="px-3 py-1 bg-stone-950 text-white rounded-xl hover:bg-stone-900 transition-colors"
                >
                  Unmute
                </button>
              </div>
            )}

            {/* Live Closed Captions Subtitle Overlay */}
            {isCaptionsEnabled && currentCaption && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-xl w-full px-4 text-center pointer-events-none z-30">
                <div className="inline-block px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium shadow-2xl">
                  <span className="font-extrabold text-blue-300 mr-2">{currentCaption.speaker}:</span>
                  <span>{currentCaption.text}</span>
                </div>
              </div>
            )}

            {/* In-Call Chat Drawer (Slide-out) */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="w-80 sm:w-96 bg-[#131b2e] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-30 shrink-0"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span>In-Call Chat</span>
                    </h3>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-400">
                        <span className="text-3xl mb-2">💬</span>
                        <p className="text-xs font-bold">Messages sent here are visible to everyone in the call.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span className="font-extrabold text-stone-300">{msg.senderName}</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-stone-900/90 border border-white/10 text-stone-200 leading-relaxed break-words">
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#0f172a]">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send message to everyone..."
                      className="flex-1 bg-stone-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants Drawer (Slide-out) */}
            <AnimatePresence>
              {isParticipantsOpen && (
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="w-80 sm:w-96 bg-[#131b2e] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-30 shrink-0"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Participants ({participants.length})</span>
                    </h3>
                    <button
                      onClick={() => setIsParticipantsOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* List */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2">
                    {/* You */}
                    <div className="p-3 rounded-2xl bg-stone-900/90 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                            <span>{currentUser.name} (You)</span>
                            {roomInfo?.hostId === currentUser.id && (
                              <span className="text-[9px] px-1 bg-amber-500/30 text-amber-300 rounded font-black">HOST</span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400">Local Device</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                        {isVideoMuted ? <VideoOff className="w-3.5 h-3.5 text-stone-400" /> : <Video className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    </div>

                    {/* Remote Participants */}
                    {participants
                      .filter(p => p.id !== currentUser.id)
                      .map((p) => (
                        <div key={p.id} className="p-3 rounded-2xl bg-stone-900/60 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs">
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-stone-200 flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.role === 'host' && (
                                  <span className="text-[9px] px-1 bg-amber-500/30 text-amber-300 rounded font-black">HOST</span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400">Connected</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {p.isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                            {p.isVideoMuted ? <VideoOff className="w-3.5 h-3.5 text-stone-400" /> : <Video className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Invite Button */}
                  <div className="p-3 border-t border-white/10 bg-[#0f172a]">
                    <button
                      onClick={copyMeetingCode}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>{copiedCode ? 'Meeting Code Copied!' : 'Copy Meeting Invite Code'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* Bottom Floating Control Dock (Google Meet Signature Toolbar)             */}
          {/* ========================================================================= */}
          <div className="h-20 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-center px-4 shrink-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mic Toggle */}
              <button
                onClick={() => meetService.toggleAudio()}
                className={`p-3.5 rounded-full transition-all shadow-xl ${
                  isAudioMuted
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300'
                    : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}
                title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => meetService.toggleVideo()}
                className={`p-3.5 rounded-full transition-all shadow-xl ${
                  isVideoMuted
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300'
                    : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}
                title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Raise Hand Toggle */}
              <button
                onClick={() => {
                  sounds.playTap();
                  meetService.toggleRaiseHand();
                }}
                className={`p-3.5 rounded-full transition-all shadow-xl ${
                  isHandRaised
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 ring-2 ring-amber-300'
                    : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}
                title={isHandRaised ? 'Lower hand' : 'Raise hand'}
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* Screen Share (Desktop) */}
              <button
                onClick={() => {
                  sounds.playTap();
                  meetService.toggleScreenShare();
                }}
                className={`p-3.5 rounded-full transition-all shadow-xl hidden sm:flex ${
                  isScreenSharing
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
              >
                <Monitor className="w-5 h-5" />
              </button>

              {/* Quick Sermon Notes button */}
              <button
                onClick={() => {
                  sounds.playTap();
                  launchApp('bible_journal');
                }}
                className="p-3.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all shadow-xl"
                title="Open ChurchNotes to take meeting notes"
              >
                <FileText className="w-5 h-5 text-amber-400" />
              </button>

              {/* Flip Camera (Mobile Friendly) */}
              <button
                onClick={() => {
                  sounds.playTap();
                  meetService.switchCamera();
                }}
                className="p-3.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all shadow-xl sm:hidden"
                title="Switch Camera (Front/Back)"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Master Host Controls Trigger (aw03102008@gmail.com) */}
              {isAuthorizedAdmin && (
                <button
                  onClick={() => {
                    sounds.playTap();
                    setIsHostControlsOpen(true);
                  }}
                  className="p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black transition-all shadow-xl active:scale-95 ring-2 ring-amber-300"
                  title="Master Host Controls (aw03102008@gmail.com)"
                >
                  <Crown className="w-5 h-5" />
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleLeaveCall}
                className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 ring-2 ring-rose-400"
                title="Leave Meeting Call"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRAY TOGETHER & SHARE SCRIPTURE MODAL                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPrayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131b2e] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Pray Together & Scripture Sharing</span>
                </h3>
                <button
                  onClick={() => setIsPrayModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-stone-400"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Click any scripture below to broadcast it to all participants in this meeting call:
              </p>

              <div className="space-y-2">
                {[
                  'For where two or three gather in my name, there am I with them. — Matthew 18:20',
                  'The Lord bless you and keep you; the Lord make his face shine on you. — Numbers 6:24-25',
                  'Cast all your anxiety on him because he cares for you. — 1 Peter 5:7',
                  'I can do all this through him who gives me strength. — Philippians 4:13'
                ].map((verse, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleShareScripture(verse)}
                    className="w-full p-3 rounded-2xl bg-stone-900/90 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-left text-xs text-stone-200 transition-all flex items-center justify-between group"
                  >
                    <span className="italic line-clamp-2">"{verse}"</span>
                    <span className="text-[10px] font-bold text-amber-400 shrink-0 ml-2 group-hover:underline">Share</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsPrayModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MASTER HOST CONTROLS MODAL (Exclusive to aw03102008@gmail.com)          */}
        {/* ========================================================================= */}
        {isHostControlsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131b2e] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-amber-300">Master Host Controls</h3>
                    <p className="text-[10px] text-stone-400">Host Authority (aw03102008@gmail.com)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHostControlsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-stone-400"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Mute All */}
                <button
                  onClick={handleHostMuteAll}
                  className="w-full p-3.5 rounded-2xl bg-stone-800/80 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                      <MicOff className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100">Mute All Participants</div>
                      <div className="text-[10px] text-stone-400">Silence all participant audio feeds instantly</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-1 rounded-md">
                    Mute All
                  </span>
                </button>

                {/* Lock Room */}
                <button
                  onClick={handleHostToggleLock}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all group ${
                    isRoomLocked
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-stone-800/80 border-white/10 hover:border-amber-500/40 text-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isRoomLocked ? 'bg-amber-500 text-stone-950' : 'bg-amber-500/20 text-amber-400'}`}>
                      {isRoomLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100">
                        {isRoomLocked ? 'Room is Locked' : 'Lock Meeting Room'}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isRoomLocked ? 'New participants cannot join call' : 'Allow or prevent new participant entries'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                    isRoomLocked ? 'bg-amber-500 text-stone-950' : 'bg-white/10 text-stone-300'
                  }`}>
                    {isRoomLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </button>

                {/* Force End Meeting */}
                <button
                  onClick={handleHostEndMeeting}
                  className="w-full p-3.5 rounded-2xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/40 hover:border-rose-500 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500 text-white group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-rose-300">End Meeting for Everyone</div>
                      <div className="text-[10px] text-stone-400">Disconnect all participants and close the room</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider bg-rose-500/20 px-2 py-1 rounded-md">
                    End Call
                  </span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsHostControlsOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
