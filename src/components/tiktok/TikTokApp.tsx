import React, { useState, useEffect, useRef } from 'react';
import {
  TIKTOK_CURATED_VIDEOS,
  TikTokVideo,
  extractTikTokId
} from '../../data/mediaAppsData';
import { sounds } from '../../services/soundEffects';
import {
  Play,
  Search,
  Bookmark,
  Share2,
  Heart,
  Maximize2,
  Minimize2,
  ListVideo,
  ExternalLink,
  Plus,
  Check,
  LogIn,
  X,
  TrendingUp,
  Laugh,
  Utensils,
  Cpu,
  Music,
  Lightbulb,
  Dumbbell,
  Flame,
  Globe,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Compass,
  Film
} from 'lucide-react';

type AppTab = 'stream' | 'browser' | 'signin';

type CategoryFilter =
  | 'All'
  | 'Trending'
  | 'Comedy'
  | 'Dance'
  | 'Food'
  | 'Sports'
  | 'Music'
  | 'Life Hacks'
  | 'Tech'
  | 'Faith'
  | 'Saved';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Trending',
  'Comedy',
  'Dance',
  'Food',
  'Sports',
  'Music',
  'Life Hacks',
  'Tech',
  'Faith',
  'Saved'
];

const CATEGORY_ICON: Record<CategoryFilter, React.ReactNode> = {
  All: <Flame className="w-3 h-3 text-amber-400" />,
  Trending: <TrendingUp className="w-3 h-3 text-cyan-400" />,
  Comedy: <Laugh className="w-3 h-3 text-yellow-400" />,
  Dance: <Music className="w-3 h-3 text-pink-400" />,
  Food: <Utensils className="w-3 h-3 text-orange-400" />,
  Sports: <Dumbbell className="w-3 h-3 text-emerald-400" />,
  Music: <Music className="w-3 h-3 text-purple-400" />,
  'Life Hacks': <Lightbulb className="w-3 h-3 text-lime-400" />,
  Tech: <Cpu className="w-3 h-3 text-blue-400" />,
  Faith: <span className="text-[10px]">🕊️</span>,
  Saved: <Bookmark className="w-3 h-3 text-amber-400" />
};

export const TikTokApp: React.FC = () => {
  // ── Mode / Tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AppTab>('stream');

  // ── Stream Mode State ──────────────────────────────────────────────────────
  const [videos, setVideos] = useState<TikTokVideo[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_tiktok_videos_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasInvalid = parsed.some(
            (v: any) => v.tiktokId === '7106594312292453678' || String(v.tiktokId).includes('1234567890')
          );
          if (!hasInvalid) return parsed;
        }
      }
    } catch {}
    return TIKTOK_CURATED_VIDEOS;
  });

  const [activeVideo, setActiveVideo] = useState<TikTokVideo>(() => {
    const first = videos[0] || TIKTOK_CURATED_VIDEOS[0];
    if (first.tiktokId === '7106594312292453678' || String(first.tiktokId).includes('1234567890')) {
      return TIKTOK_CURATED_VIDEOS[0];
    }
    return first;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('lifeos_tiktok_likes_v3');
      if (s) return new Set(JSON.parse(s));
    } catch {}
    return new Set();
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('lifeos_tiktok_saved_ids_v3');
      if (s) return new Set(JSON.parse(s));
    } catch {}
    return new Set();
  });

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Web Browser Mode State ─────────────────────────────────────────────────
  const [browserUrl, setBrowserUrl] = useState('https://www.tiktok.com/explore');
  const [browserInput, setBrowserInput] = useState('https://www.tiktok.com/explore');
  const [browserIframeKey, setBrowserIframeKey] = useState(0);
  const browserIframeRef = useRef<HTMLIFrameElement>(null);

  // ── LocalStorage Sync ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_tiktok_videos_v3', JSON.stringify(videos));
    } catch {}
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeos_tiktok_saved_ids_v3', JSON.stringify(Array.from(savedIds)));
    } catch {}
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeos_tiktok_likes_v3', JSON.stringify(Array.from(likedIds)));
    } catch {}
  }, [likedIds]);

  // ── Toast Helper ───────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Handlers: Stream Player ────────────────────────────────────────────────
  const handleSelectVideo = (video: TikTokVideo) => {
    sounds.playTap();
    setActiveVideo(video);
  };

  const handleToggleLike = (id: string) => {
    sounds.playTap();
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSave = (id: string) => {
    sounds.playTap();
    setSavedIds(prev => {
      const next = new Set(prev);
      const isSaving = !next.has(id);
      if (isSaving) {
        next.add(id);
        showToast('Saved to your LifeOS TikTok library!');
      } else {
        next.delete(id);
        showToast('Removed from saved library');
      }
      return next;
    });
  };

  const handleShare = (video: TikTokVideo) => {
    sounds.playTap();
    const url = `https://www.tiktok.com/@${video.creatorHandle.replace('@', '')}/video/${video.tiktokId}`;
    navigator.clipboard?.writeText(url);
    showToast('TikTok link copied to clipboard!');
  };

  // Direct search bar submission: if URL/ID pasted, plays immediately; otherwise filters list
  const handleSearchOrPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const extractedId = extractTikTokId(searchQuery);
    if (extractedId) {
      sounds.playTap();
      const newVideo: TikTokVideo = {
        id: `custom_${Date.now()}`,
        tiktokId: extractedId,
        title: `TikTok Video (${extractedId.slice(-8)})`,
        creator: 'TikTok Creator',
        creatorHandle: '@tiktok',
        views: 'Live View',
        likes: '—',
        timestamp: 'Just now',
        category: 'Trending',
        description: `Direct TikTok playback for: ${searchQuery.trim()}`
      };
      setVideos(prev => [newVideo, ...prev.filter(v => v.tiktokId !== extractedId)]);
      setActiveVideo(newVideo);
      setSearchQuery('');
      showToast('Loaded TikTok video!');
    }
  };

  // Add custom video modal submit
  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = extractTikTokId(customUrlInput);
    if (!extractedId) {
      showToast('Invalid TikTok URL or ID. Paste a valid tiktok.com link or numeric video ID.');
      return;
    }

    const newVideo: TikTokVideo = {
      id: `custom_${Date.now()}`,
      tiktokId: extractedId,
      title: `Custom TikTok (${extractedId.slice(-8)})`,
      creator: 'Custom Stream',
      creatorHandle: '@tiktok',
      views: 'Added by you',
      likes: '—',
      timestamp: 'Just now',
      category: 'Trending',
      description: `Custom video added via URL: ${customUrlInput}`
    };

    setVideos(prev => [newVideo, ...prev]);
    setActiveVideo(newVideo);
    setCustomUrlInput('');
    setIsAddModalOpen(false);
    showToast('Video added and streaming!');
  };

  // ── Handlers: Web Browser ──────────────────────────────────────────────────
  const handleNavigateBrowser = (url: string) => {
    sounds.playTap();
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('tiktok.com')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        // search TikTok
        finalUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(finalUrl)}`;
      }
    }
    setBrowserUrl(finalUrl);
    setBrowserInput(finalUrl);
    setBrowserIframeKey(k => k + 1);
  };

  // ── Filtered videos list ───────────────────────────────────────────────────
  const filteredVideos = videos.filter(v => {
    if (selectedCategory === 'Saved') return savedIds.has(v.id);
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creatorHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="h-full flex flex-col bg-stone-950 text-white select-none overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 border border-white/20 text-white text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER: Brand, Universal Search, Navigation Tabs & Actions ── */}
      <div className="h-14 px-3 sm:px-4 bg-stone-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 sm:gap-3 z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-pink-600/30">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1 font-black text-sm sm:text-base tracking-tighter">
            <span className="text-white">TikTok</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-stone-300 hidden xs:inline">
              Browser
            </span>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center p-1 bg-stone-950/80 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('stream');
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stream'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Watch & Discover</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('browser');
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'browser'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TikTok Web</span>
          </button>
        </div>

        {/* Center Search / Paste URL Input (Shown in stream mode) */}
        {activeTab === 'stream' && (
          <form onSubmit={handleSearchOrPlay} className="flex-1 max-w-md relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search or paste ANY TikTok link / video ID to play..."
              className="w-full pl-9 pr-16 py-1.5 rounded-2xl bg-stone-800/90 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white text-[11px] font-black shadow transition-transform active:scale-95 flex items-center gap-1"
            >
              <span>Play</span>
            </button>
          </form>
        )}

        {/* Right Actions: Paste Link Modal & Sign In Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeTab === 'stream' && (
            <button
              onClick={() => {
                sounds.playTap();
                setIsAddModalOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 border border-white/15 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Paste Link</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('signin');
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'stream' && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Mobile search bar */}
          <div className="p-2 bg-stone-900 border-b border-white/10 md:hidden">
            <form onSubmit={handleSearchOrPlay} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search or paste TikTok link..."
                className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-stone-800 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-pink-600 text-white text-[10px] font-bold"
              >
                Play
              </button>
            </form>
          </div>

          {/* CATEGORY FILTER CHIPS BAR (like YouTube) */}
          <div className="px-3 sm:px-4 py-2 bg-stone-950/90 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-900 shadow-md font-black'
                    : 'bg-white/10 hover:bg-white/15 text-stone-300'
                }`}
              >
                {CATEGORY_ICON[cat]}
                <span>{cat === 'Saved' ? `Saved (${savedIds.size})` : cat}</span>
              </button>
            ))}
          </div>

          {/* MAIN VIEWPORT: ACTIVE PLAYER + SIDEBAR QUEUE */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4 sm:gap-5">
            {/* Left Column: Embedded TikTok Player & Video Details */}
            <div
              className={`flex flex-col gap-3 transition-all duration-300 ${
                isTheaterMode ? 'w-full' : 'flex-1'
              }`}
            >
              {/* Responsive Video Container */}
              <div className="w-full flex justify-center bg-black/60 rounded-2xl sm:rounded-3xl p-2 sm:p-4 border border-white/10 shadow-2xl relative">
                <div
                  className="w-full max-w-md rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl relative"
                  style={{ aspectRatio: '9/16', maxHeight: '68vh' }}
                >
                  {activeVideo?.tiktokId ? (
                    <iframe
                      key={activeVideo.tiktokId}
                      src={`https://www.tiktok.com/player/v1/${activeVideo.tiktokId}?autoplay=0&music_info=1&description=1`}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                      <Play className="w-12 h-12 text-stone-600" />
                      <span className="text-sm font-bold">Select a video to start watching</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Title & Primary Metadata */}
              {activeVideo && (
                <div className="flex flex-col gap-2.5 p-1">
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                    {activeVideo.title}
                  </h2>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-white/10 pb-3">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-cyan-500 flex items-center justify-center text-lg shadow-md font-bold">
                        🎬
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
                          {activeVideo.creator}
                          <span className="text-[10px] text-cyan-400">✓</span>
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {activeVideo.creatorHandle} · {activeVideo.views} views · {activeVideo.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Interaction Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(activeVideo.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          likedIds.has(activeVideo.id)
                            ? 'bg-rose-600 text-white shadow'
                            : 'bg-white/10 hover:bg-white/15 text-stone-300'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedIds.has(activeVideo.id) ? 'fill-current text-white' : ''
                          }`}
                        />
                        <span>{likedIds.has(activeVideo.id) ? 'Liked' : 'Like'}</span>
                      </button>

                      {/* Save to Favorites */}
                      <button
                        onClick={() => handleToggleSave(activeVideo.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          savedIds.has(activeVideo.id)
                            ? 'bg-amber-500 text-stone-950 font-black shadow'
                            : 'bg-white/10 hover:bg-white/15 text-stone-300'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            savedIds.has(activeVideo.id) ? 'fill-current' : ''
                          }`}
                        />
                        <span>{savedIds.has(activeVideo.id) ? 'Saved' : 'Save'}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(activeVideo)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-stone-300 flex items-center gap-1.5 transition-all"
                        title="Copy TikTok link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>

                      {/* Open on TikTok external */}
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.tiktok.com/@${activeVideo.creatorHandle.replace('@', '')}/video/${activeVideo.tiktokId}`,
                            '_blank'
                          )
                        }
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-all"
                        title="Open in TikTok"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Theater Mode Toggle */}
                      <button
                        onClick={() => setIsTheaterMode(prev => !prev)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-all"
                        title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
                      >
                        {isTheaterMode ? (
                          <Minimize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-300 font-medium leading-relaxed">
                    <span className="font-bold text-white block mb-1">About this video:</span>
                    {activeVideo.description}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Up Next / Recommended List (like YouTube App) */}
            {!isTheaterMode && (
              <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <ListVideo className="w-4 h-4 text-cyan-400" />
                    <span>Up Next · Recommended</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {filteredVideos.length} videos
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[700px] pr-1">
                  {filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-3xl mb-2">🔍</p>
                      <p className="text-stone-400 text-xs font-bold">No videos found</p>
                      <p className="text-stone-500 text-[10px] mt-1">
                        Try a different search or paste a direct TikTok link!
                      </p>
                    </div>
                  ) : (
                    filteredVideos.map(video => {
                      const isActive = activeVideo?.id === video.id;

                      return (
                        <button
                          key={video.id}
                          onClick={() => handleSelectVideo(video)}
                          className={`p-2.5 rounded-2xl flex items-start gap-3 text-left transition-all hover:bg-white/10 ${
                            isActive
                              ? 'bg-white/15 border border-cyan-500/50 shadow-lg'
                              : 'bg-white/5 border border-white/5'
                          }`}
                        >
                          {/* Thumbnail / Category Badge */}
                          <div
                            className="w-16 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 border border-white/10 overflow-hidden relative shrink-0 flex flex-col items-center justify-center gap-1 shadow-md"
                            style={{ aspectRatio: '9/14', minHeight: '80px' }}
                          >
                            <span className="text-2xl">
                              {video.category === 'Faith'
                                ? '🕊️'
                                : video.category === 'Food'
                                ? '🍔'
                                : video.category === 'Sports'
                                ? '⚽'
                                : video.category === 'Comedy'
                                ? '😂'
                                : video.category === 'Dance'
                                ? '💃'
                                : video.category === 'Music'
                                ? '🎵'
                                : video.category === 'Tech'
                                ? '📱'
                                : video.category === 'Life Hacks'
                                ? '💡'
                                : '🔥'}
                            </span>
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">
                              TikTok
                            </span>
                          </div>

                          {/* Metadata */}
                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                              {video.title}
                            </h4>
                            <div className="mt-1 flex flex-col gap-0.5">
                              <span className="text-[11px] text-stone-400 truncate">
                                {video.creatorHandle}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-stone-500">
                                  {video.views} views
                                </span>
                                <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                                  <Heart className="w-2.5 h-2.5 fill-current" /> {video.likes}
                                </span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-cyan-300 w-fit mt-0.5 font-semibold">
                                {video.category}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: FULL TIKTOK WEB BROWSER ── */}
      {activeTab === 'browser' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
          {/* Browser Navigation Toolbar */}
          <div className="px-3 py-2 bg-stone-900 border-b border-white/10 flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sounds.playTap();
                if (browserIframeRef.current) {
                  try {
                    browserIframeRef.current.contentWindow?.history.back();
                  } catch {}
                }
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-all"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                if (browserIframeRef.current) {
                  try {
                    browserIframeRef.current.contentWindow?.history.forward();
                  } catch {}
                }
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-all"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                setBrowserIframeKey(k => k + 1);
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-all"
              title="Reload"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Address Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleNavigateBrowser(browserInput);
              }}
              className="flex-1 flex items-center bg-stone-800 rounded-xl px-3 py-1.5 border border-white/10"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
              <input
                type="text"
                value={browserInput}
                onChange={e => setBrowserInput(e.target.value)}
                placeholder="Enter URL or TikTok search query..."
                className="bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none w-full font-mono"
              />
              <button
                type="submit"
                className="ml-2 px-2 py-0.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold"
              >
                Go
              </button>
            </form>

            {/* Quick Destination Shortcuts */}
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleNavigateBrowser('https://www.tiktok.com/foryou')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-300 hover:text-white transition-all"
              >
                🔥 For You
              </button>
              <button
                onClick={() => handleNavigateBrowser('https://www.tiktok.com/explore')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-300 hover:text-white transition-all"
              >
                🔍 Explore
              </button>
              <button
                onClick={() => handleNavigateBrowser('https://www.tiktok.com/trending')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-300 hover:text-white transition-all"
              >
                📈 Trending
              </button>
            </div>

            {/* Open in external browser */}
            <button
              onClick={() => {
                sounds.playTap();
                window.open(browserUrl, '_blank');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 border border-white/15 flex items-center gap-1.5 transition-all shrink-0"
              title="Open current page in browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>
          </div>

          {/* Browser Notification Banner */}
          <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-950/60 via-stone-900 to-pink-950/60 border-b border-white/5 flex items-center justify-between text-[11px] text-stone-300">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                Live TikTok Webview. To watch individual TikToks with full player controls, use the{' '}
                <strong className="text-white">Watch & Discover</strong> tab.
              </span>
            </div>
            <button
              onClick={() => window.open(browserUrl, '_blank')}
              className="text-cyan-400 hover:underline font-bold shrink-0 ml-2"
            >
              Open Externally ↗
            </button>
          </div>

          {/* Live Webview Iframe */}
          <div className="flex-1 relative bg-black">
            <iframe
              ref={browserIframeRef}
              key={browserIframeKey}
              src={browserUrl}
              title="TikTok Web Browser"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; camera; microphone"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
            />
          </div>
        </div>
      )}

      {/* ── TAB: ACCOUNT SIGN IN ── */}
      {activeTab === 'signin' && (
        <div className="flex-1 flex flex-col bg-stone-950">
          <div className="flex items-center justify-between px-4 py-3 bg-stone-900/95 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-pink-600 to-cyan-600 flex items-center justify-center">
                <LogIn className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide text-white">
                  TikTok Account Login
                </h3>
                <p className="text-[11px] text-stone-400">
                  Log into your official TikTok account to sync likes, followers & FYP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('https://www.tiktok.com/login/', '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/15 transition-all text-white"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in Tab</span>
              </button>
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('stream');
                }}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-black">
            <iframe
              src="https://www.tiktok.com/login/"
              title="TikTok Sign In"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media"
            />
          </div>
        </div>
      )}

      {/* ── PASTE TIKTOK LINK MODAL (like YouTube App) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-pink-600 to-cyan-500 flex items-center justify-center text-white">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-base font-black text-white">Watch Any TikTok Video</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Paste any TikTok video link (e.g.{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-cyan-300">
                https://www.tiktok.com/@creator/video/123456...
              </code>{' '}
              or numeric ID) to stream it directly inside LifeOS.
            </p>

            <form onSubmit={handleAddCustomVideo} className="flex flex-col gap-3">
              <input
                type="text"
                value={customUrlInput}
                onChange={e => setCustomUrlInput(e.target.value)}
                placeholder="Paste TikTok URL or ID here..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold text-white placeholder-stone-500 focus:outline-none focus:border-cyan-500 transition-all"
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
                  disabled={!customUrlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-black shadow-lg transition-transform active:scale-95"
                >
                  Play Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
