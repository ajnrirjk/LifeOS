import React, { useState, useEffect, useRef } from 'react';
import { TikTokClip, TIKTOK_CURATED_CLIPS, extractYouTubeId } from '../../data/mediaAppsData';
import { sounds } from '../../services/soundEffects';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Music,
  Plus,
  Send,
  X,
  Sparkles,
  Check,
  Disc,
  Play,
  Pause,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export const TikTokApp: React.FC = () => {
  // Always ensure fresh, working clips by checking version tag
  const [clips, setClips] = useState<TikTokClip[]>(() => {
    try {
      const savedVersion = localStorage.getItem('lifeos_tiktok_version');
      if (savedVersion === 'v2_native_video') {
        const saved = localStorage.getItem('lifeos_tiktok_clips_v2');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    // Reset to verified working clips
    try {
      localStorage.setItem('lifeos_tiktok_version', 'v2_native_video');
      localStorage.setItem('lifeos_tiktok_clips_v2', JSON.stringify(TIKTOK_CURATED_CLIPS));
    } catch {}
    return TIKTOK_CURATED_CLIPS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'foryou' | 'faith' | 'pets'>('foryou');
  const [likedClipIds, setLikedClipIds] = useState<Set<string>>(() => new Set());
  const [savedClipIds, setSavedClipIds] = useState<Set<string>>(() => new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video element ref for HTML5 video playback
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Comments state per clip
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(() => {
    try {
      const saved = localStorage.getItem('lifeos_tiktok_comments_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      tt_1: [
        { id: 'c1', author: 'Sarah Jenkins', avatar: '🌸', text: 'Amen! Needed this reminder today 🙌', timestamp: '2h ago', likes: 142 },
        { id: 'c2', author: 'Caleb Miller', avatar: '✝️', text: 'God is never late. Perfect timing always.', timestamp: '5h ago', likes: 89 }
      ],
      tt_2: [
        { id: 'c3', author: 'Hannah Grace', avatar: '☕', text: 'The peace in this video is unmatched 🌿', timestamp: '1d ago', likes: 210 }
      ],
      tt_4: [
        { id: 'c4', author: 'Cat Mom 99', avatar: '🐾', text: 'Orange cats are universally chaotic 😂', timestamp: '3h ago', likes: 320 }
      ]
    };
  });

  const [newCommentText, setNewCommentText] = useState('');
  const [heartsAnimation, setHeartsAnimation] = useState<{ id: number; x: number; y: number }[]>([]);

  // Filter clips based on active tab
  const filteredClips = clips.filter(c => {
    if (activeTab === 'faith') return c.category === 'Inspiration' || c.category === 'Worship';
    if (activeTab === 'pets') return c.category === 'Pets';
    return true;
  });

  const currentClip = filteredClips[currentIndex] || filteredClips[0] || clips[0];

  // Sync video play/pause & mute with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isMuted, isPlaying]);

  // Persist clips & comments
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_tiktok_clips_v2', JSON.stringify(clips));
    } catch {}
  }, [clips]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeos_tiktok_comments_v2', JSON.stringify(commentsMap));
    } catch {}
  }, [commentsMap]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNext = () => {
    if (currentIndex < filteredClips.length - 1) {
      sounds.playTap();
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sounds.playTap();
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  // Keyboard navigation up / down / spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isAddModalOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredClips.length, isCommentsOpen, isAddModalOpen, isPlaying]);

  const togglePlayPause = () => {
    sounds.playTap();
    setIsPlaying(prev => !prev);
    setShowPlayPauseIcon(true);
    setTimeout(() => setShowPlayPauseIcon(false), 800);
  };

  const handleLike = (e?: React.MouseEvent) => {
    sounds.playTap();
    if (!currentClip) return;
    const clipId = currentClip.id;

    setLikedClipIds(prev => {
      const next = new Set(prev);
      const isLiking = !next.has(clipId);
      if (isLiking) {
        next.add(clipId);
        // Spawn floating heart animation
        const heartId = Date.now() + Math.random();
        const x = e ? e.clientX : window.innerWidth / 2;
        const y = e ? e.clientY : window.innerHeight / 2;
        setHeartsAnimation(h => [...h, { id: heartId, x, y }]);
        setTimeout(() => setHeartsAnimation(h => h.filter(item => item.id !== heartId)), 1000);
      } else {
        next.delete(clipId);
      }
      return next;
    });
  };

  const handleBookmark = () => {
    sounds.playTap();
    if (!currentClip) return;
    setSavedClipIds(prev => {
      const next = new Set(prev);
      if (next.has(currentClip.id)) {
        next.delete(currentClip.id);
        showToast('Removed from favorites');
      } else {
        next.add(currentClip.id);
        showToast('Saved to your TikTok favorites! 🔖');
      }
      return next;
    });
  };

  const handleShare = () => {
    sounds.playTap();
    if (!currentClip) return;
    const url = currentClip.videoUrl || `https://www.youtube.com/watch?v=${currentClip.videoId}`;
    navigator.clipboard?.writeText(url);
    showToast('Video link copied to clipboard! 🔗');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentClip) return;
    sounds.playTap();

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: 'You (LifeOS User)',
      avatar: '🌟',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 0
    };

    setCommentsMap(prev => ({
      ...prev,
      [currentClip.id]: [newComment, ...(prev[currentClip.id] || [])]
    }));
    setNewCommentText('');
  };

  const handleResetClips = () => {
    sounds.playTap();
    setClips(TIKTOK_CURATED_CLIPS);
    setCurrentIndex(0);
    try {
      localStorage.setItem('lifeos_tiktok_clips_v2', JSON.stringify(TIKTOK_CURATED_CLIPS));
    } catch {}
    showToast('Restored all verified clips!');
  };

  const handleAddCustomClip = (e: React.FormEvent) => {
    e.preventDefault();
    const input = customLinkInput.trim();
    if (!input) return;

    // Check if direct video file (.mp4, .webm)
    if (input.endsWith('.mp4') || input.endsWith('.webm') || input.includes('assets.mixkit.co')) {
      const newClip: TikTokClip = {
        id: `custom_tt_${Date.now()}`,
        videoUrl: input,
        author: 'Custom Creator',
        handle: '@mycustomclip',
        avatar: '✨',
        description: 'Custom video stream added directly in LifeOS! #lifeos #customclip',
        soundTitle: 'Original Audio - LifeOS Media',
        likes: 1200,
        commentsCount: 0,
        shares: 42,
        category: 'Inspiration',
        tags: ['custom', 'lifeos']
      };
      setClips(prev => [newClip, ...prev]);
      setCurrentIndex(0);
      setCustomLinkInput('');
      setIsAddModalOpen(false);
      showToast('Video added to your feed!');
      return;
    }

    // Check YouTube / Shorts ID
    const extractedId = extractYouTubeId(input);
    if (extractedId) {
      const newClip: TikTokClip = {
        id: `custom_tt_${Date.now()}`,
        videoId: extractedId,
        author: 'YouTube / Shorts Creator',
        handle: `@yt_${extractedId.substring(0, 6)}`,
        avatar: '▶️',
        description: `YouTube video playback: ${input} #youtube #shorts`,
        soundTitle: 'YouTube Audio Stream',
        likes: 2400,
        commentsCount: 1,
        shares: 88,
        category: 'Inspiration',
        tags: ['youtube', 'shorts']
      };
      setClips(prev => [newClip, ...prev]);
      setCurrentIndex(0);
      setCustomLinkInput('');
      setIsAddModalOpen(false);
      showToast('YouTube Short added to your feed!');
      return;
    }

    showToast('Please enter a valid video link (.mp4 or YouTube link).');
  };

  return (
    <div className="h-full flex flex-col bg-black text-white select-none overflow-hidden relative font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 border border-white/20 text-white text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Hearts Animation */}
      {heartsAnimation.map(h => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-50 text-4xl animate-out fade-out slide-out-to-top duration-700 -translate-x-1/2 -translate-y-1/2"
          style={{ left: h.x, top: h.y }}
        >
          ❤️
        </div>
      ))}

      {/* TOP HEADER: TikTok Tabs & Add Clip Button */}
      <div className="h-12 px-4 bg-black/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-black p-0.5 shadow">
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center text-xs">
              🎵
            </div>
          </div>
          <span className="font-black text-sm tracking-tight text-white hidden sm:inline">
            TikTok
          </span>
        </div>

        {/* Center Feed Tabs */}
        <div className="flex items-center gap-4 text-xs font-black">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('foryou');
              setCurrentIndex(0);
            }}
            className={`transition-all pb-1 border-b-2 ${
              activeTab === 'foryou' ? 'text-white border-white scale-105' : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('faith');
              setCurrentIndex(0);
            }}
            className={`transition-all pb-1 border-b-2 ${
              activeTab === 'faith' ? 'text-white border-cyan-400 scale-105' : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            Faith & Praise
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('pets');
              setCurrentIndex(0);
            }}
            className={`transition-all pb-1 border-b-2 ${
              activeTab === 'pets' ? 'text-white border-rose-400 scale-105' : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            Cats & Pets
          </button>
        </div>

        {/* Right Actions: Add Clip & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetClips}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="Reload verified clips"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setIsAddModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 flex items-center gap-1.5 transition-all active:scale-95"
            title="Paste any video link"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Add Clip</span>
          </button>
        </div>
      </div>

      {/* MAIN VERTICAL FEED VIEWPORT */}
      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-gradient-to-b from-stone-950 via-black to-stone-950">
        {currentClip ? (
          <div
            className="relative h-full aspect-[9/16] max-h-[780px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-stone-900 flex flex-col justify-between group cursor-pointer"
            onClick={togglePlayPause}
          >
            {/* 1. NATIVE HTML5 VIDEO STREAM (100% Reliable, Zero "Video Unavailable" errors!) */}
            {currentClip.videoUrl ? (
              <video
                ref={videoRef}
                key={currentClip.videoUrl}
                src={currentClip.videoUrl}
                poster={currentClip.posterUrl}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : currentClip.videoId ? (
              /* 2. YOUTUBE EMBED PLAYER (with verified IDs) */
              <div className="absolute inset-0 z-0 pointer-events-auto">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentClip.videoId}?autoplay=1&loop=1&playlist=${currentClip.videoId}&controls=1&modestbranding=1&rel=0`}
                  title={currentClip.description}
                  className="w-full h-full border-0 object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Play / Pause Animated Icon Overlay */}
            {showPlayPauseIcon && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in fade-in zoom-in-50 duration-200">
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                  {isPlaying ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}
                </div>
              </div>
            )}

            {/* Top Bar inside card: Audio toggle & category tag */}
            <div className="relative z-10 p-3 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white/90 border border-white/20 pointer-events-auto">
                {currentClip.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(prev => !prev);
                }}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:scale-110 active:scale-90 transition-transform"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Bottom Content & Right Action Bar */}
            <div className="relative z-10 p-4 pb-5 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
              {/* Creator Info & Description */}
              <div className="flex-1 flex flex-col gap-2 pointer-events-auto max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-rose-500 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-sm font-black">
                      {currentClip.avatar}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white flex items-center gap-1 drop-shadow">
                      {currentClip.author}
                      <span className="text-[10px] text-cyan-400">✓</span>
                    </span>
                    <span className="text-[11px] text-stone-300 font-bold drop-shadow">
                      {currentClip.handle}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-white/95 font-medium leading-relaxed drop-shadow line-clamp-3">
                  {currentClip.description}
                </p>

                {/* Sound Bar with Scrolling marquee vibe */}
                <div className="flex items-center gap-2 text-[11px] font-black text-stone-200">
                  <Music className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="truncate drop-shadow">{currentClip.soundTitle}</span>
                </div>
              </div>

              {/* Side Floating Action Column */}
              <div className="flex flex-col items-center gap-4 pointer-events-auto shrink-0 pb-1">
                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(e);
                  }}
                  className="flex flex-col items-center gap-1 group/btn hover:scale-110 active:scale-90 transition-transform"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-colors ${
                    likedClipIds.has(currentClip.id) ? 'bg-rose-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'
                  }`}>
                    <Heart className={`w-5 h-5 ${likedClipIds.has(currentClip.id) ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow">
                    {(currentClip.likes + (likedClipIds.has(currentClip.id) ? 1 : 0)).toLocaleString()}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playTap();
                    setIsCommentsOpen(true);
                  }}
                  className="flex flex-col items-center gap-1 hover:scale-110 active:scale-90 transition-transform"
                >
                  <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow">
                    {(commentsMap[currentClip.id]?.length || currentClip.commentsCount).toLocaleString()}
                  </span>
                </button>

                {/* Bookmark / Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark();
                  }}
                  className="flex flex-col items-center gap-1 hover:scale-110 active:scale-90 transition-transform"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-colors ${
                    savedClipIds.has(currentClip.id) ? 'bg-amber-400 text-stone-950' : 'bg-black/60 text-white hover:bg-black/80'
                  }`}>
                    <Bookmark className={`w-5 h-5 ${savedClipIds.has(currentClip.id) ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow">
                    Save
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex flex-col items-center gap-1 hover:scale-110 active:scale-90 transition-transform"
                >
                  <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-white drop-shadow">
                    {currentClip.shares.toLocaleString()}
                  </span>
                </button>

                {/* Spinning Vinyl Record Disc */}
                <div className="w-10 h-10 rounded-full bg-stone-900 border-2 border-stone-800 p-1 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-xl mt-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 to-rose-500 flex items-center justify-center text-[10px]">
                    🎵
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-stone-400 flex flex-col items-center gap-2">
            <span className="text-3xl">📱</span>
            <p className="text-xs font-bold">No clips found in this category.</p>
            <button
              onClick={handleResetClips}
              className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
            >
              Reset Feeds
            </button>
          </div>
        )}

        {/* Up / Down Navigation Controls (floating on right) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 disabled:opacity-30 text-white shadow-2xl border border-white/20 transition-all hover:scale-110 active:scale-90"
            title="Previous Clip (Up Arrow)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentIndex >= filteredClips.length - 1}
            className="p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 disabled:opacity-30 text-white shadow-2xl border border-white/20 transition-all hover:scale-110 active:scale-90"
            title="Next Clip (Down Arrow)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SLIDE-OVER COMMENTS DRAWER */}
      {isCommentsOpen && currentClip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border-l border-white/20 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-black text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <span>Comments ({(commentsMap[currentClip.id]?.length || 0)})</span>
              </span>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {(commentsMap[currentClip.id] || []).map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[11px] font-black text-stone-300">
                      {comment.author}
                    </span>
                    <p className="text-xs text-white mt-0.5 leading-snug">
                      {comment.text}
                    </p>
                    <span className="text-[10px] text-stone-500 mt-1">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-white/10 bg-stone-950 flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add comment..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-stone-950 font-black transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PASTE SHORT / TIKTOK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-rose-500 flex items-center justify-center text-stone-950">
                <Plus className="w-5 h-5 font-black" />
              </div>
              <h3 className="text-base font-black text-white">Add Clip to Feed</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Paste any video link (direct MP4 stream or YouTube link) to play it in your vertical feed.
            </p>

            <form onSubmit={handleAddCustomClip} className="flex flex-col gap-3">
              <input
                type="text"
                value={customLinkInput}
                onChange={(e) => setCustomLinkInput(e.target.value)}
                placeholder="Paste video link here..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400 transition-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customLinkInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-90 disabled:opacity-40 text-stone-950 text-xs font-black shadow-lg transition-transform active:scale-95"
                >
                  Add to Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
