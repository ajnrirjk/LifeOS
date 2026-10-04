import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Users,
  Radio,
  Flame
} from 'lucide-react';
import { meetService, MeetParticipant, MeetRoomInfo } from '../../services/meetService';
import { useLifeOS } from '../../context/LifeOSContext';
import { sounds } from '../../services/soundEffects';

export const LifeMeetFloatingPiP: React.FC = () => {
  const { activeAppId, isDesktopView, openWindows, launchApp } = useLifeOS();

  const [isInCall, setIsInCall] = useState(() => meetService.getIsInCall());
  const [roomInfo, setRoomInfo] = useState<MeetRoomInfo | null>(() => meetService.getCurrentRoomInfo());
  const [participants, setParticipants] = useState<MeetParticipant[]>(() => meetService.getParticipantsList());
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>(() => meetService.getRemoteStreamsObject());
  const [isAudioMuted, setIsAudioMuted] = useState(() => meetService.getState().isAudioMuted);
  const [isVideoMuted, setIsVideoMuted] = useState(() => meetService.getState().isVideoMuted);
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [duration, setDuration] = useState(() => meetService.getCallDuration());

  const videoRef = useRef<HTMLVideoElement>(null);

  // Subscribe to meetService events
  useEffect(() => {
    const updateAll = () => {
      setIsInCall(meetService.getIsInCall());
      setRoomInfo(meetService.getCurrentRoomInfo());
      setParticipants(meetService.getParticipantsList());
      setRemoteStreams(meetService.getRemoteStreamsObject());
      setIsAudioMuted(meetService.getState().isAudioMuted);
      setIsVideoMuted(meetService.getState().isVideoMuted);
    };

    updateAll();

    const unsubscribe = meetService.subscribe((event) => {
      const { type, data } = event;
      if (type === 'call_ended') {
        setIsInCall(false);
        setRoomInfo(null);
        setParticipants([]);
        setRemoteStreams({});
        setSpeakingPeers({});
      } else if (type === 'peer_joined' || type === 'peer_left' || type === 'participants_updated' || type === 'peer_state_changed') {
        updateAll();
      } else if (type === 'remote_stream') {
        setRemoteStreams(meetService.getRemoteStreamsObject());
      } else if (type === 'local_state_changed') {
        setIsAudioMuted(data.isAudioMuted);
        setIsVideoMuted(data.isVideoMuted);
      } else if (type === 'peer_speaking') {
        setSpeakingPeers(prev => ({
          ...prev,
          [data.peerId]: data.isSpeaking
        }));
      } else if (type === 'local_audio_level') {
        setLocalSpeaking(data.isSpeaking);
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer loop
  useEffect(() => {
    let timer: any = null;
    if (isInCall) {
      timer = setInterval(() => {
        setDuration(meetService.getCallDuration());
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCall]);

  // Determine active speaker or primary remote stream to display in PiP
  const activeSpeakerId = Object.entries(speakingPeers).find(([_, speaking]) => speaking)?.[0];
  const activeStream =
    (activeSpeakerId && remoteStreams[activeSpeakerId]) ||
    Object.values(remoteStreams)[0] ||
    meetService.getLocalStream();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      video.srcObject = null;
    }
  }, [activeStream]);

  // Check if LifeMeet window is currently active and focused in foreground
  const isLifeMeetForeground =
    !isDesktopView &&
    activeAppId === 'faith_meet' &&
    openWindows['faith_meet'] &&
    !openWindows['faith_meet'].isMinimized;

  // Only show floating PiP if user is in call BUT navigating elsewhere in LifeOS (Desktop, Bible, Fellowship, Journal, etc.)
  if (!isInCall || isLifeMeetForeground) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReturnToCall = () => {
    sounds.playTap();
    launchApp('faith_meet');
  };

  const handleToggleMic = async () => {
    sounds.playTap();
    await meetService.toggleAudio();
  };

  const handleToggleCam = async () => {
    sounds.playTap();
    await meetService.toggleVideo();
  };

  const handleEndCall = async () => {
    sounds.playTap();
    await meetService.leaveRoom();
  };

  const activeSpeakerParticipant = participants.find(p => p.id === activeSpeakerId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed z-50 bottom-20 md:bottom-24 right-3 sm:right-6 max-w-[calc(100vw-24px)] bg-stone-900/95 dark:bg-black/95 text-white rounded-3xl p-3 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl flex items-center gap-3 select-none"
        style={{
          boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.25), 0 0 15px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Mini Video / Avatar preview */}
        <div
          onClick={handleReturnToCall}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-stone-800 flex items-center justify-center cursor-pointer group shrink-0 border-2 transition-all ${
            activeSpeakerId || localSpeaking
              ? 'border-emerald-400 ring-2 ring-emerald-500/50'
              : 'border-white/10 group-hover:border-emerald-500/40'
          }`}
          title="Click to expand LifeMeet"
        >
          {activeStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={true}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-stone-900 flex items-center justify-center">
              <span className="text-xl">🕊️</span>
            </div>
          )}

          {/* Glowing live dot */}
          <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Room / Speaker Info */}
        <div
          onClick={handleReturnToCall}
          className="flex flex-col cursor-pointer max-w-[130px] sm:max-w-[180px] overflow-hidden"
          title="Click to return to LifeMeet"
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-white truncate">
            <span className="truncate">{roomInfo?.title || 'LifeMeet Call'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
            <span className="font-mono text-emerald-400 font-bold">{formatDuration(duration)}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-stone-300">
              <Users className="w-2.5 h-2.5" />
              {participants.length}
            </span>
          </div>

          {activeSpeakerParticipant && (
            <div className="text-[9px] text-emerald-300 truncate mt-0.5 flex items-center gap-1">
              <Radio className="w-2 h-2 animate-pulse text-emerald-400" />
              <span className="truncate">{activeSpeakerParticipant.name.split(' ')[0]} speaking</span>
            </div>
          )}
        </div>

        {/* Quick In-Call Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {/* Mute Mic */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleMic}
            className={`p-2 rounded-xl transition-all shadow-sm ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/10 text-emerald-400 border border-white/10 hover:bg-white/20'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </motion.button>

          {/* Toggle Video */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleCam}
            className={`p-2 rounded-xl transition-all shadow-sm ${
              isVideoMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/10 text-stone-300 border border-white/10 hover:bg-white/20'
            }`}
            title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </motion.button>

          {/* Expand to full LifeMeet */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReturnToCall}
            className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-sm"
            title="Expand to full LifeMeet"
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>

          {/* Leave Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEndCall}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm ml-0.5"
            title="Leave call"
          >
            <PhoneOff className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
