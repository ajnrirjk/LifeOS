import React, { useState, useEffect } from 'react';
import { YouTubeVideo, YOUTUBE_CURATED_VIDEOS, extractYouTubeId } from '../../data/mediaAppsData';
import { sounds } from '../../services/soundEffects';
import {
  Play,
  Search,
  Bookmark,
  Share2,
  ThumbsUp,
  Maximize2,
  Minimize2,
  ListVideo,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  Flame,
  Music,
  BookOpen,
  Headphones,
  Film
} from 'lucide-react';

export const YouTubeApp: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_youtube_videos_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return YOUTUBE_CURATED_VIDEOS;
  });

  const [activeVideo, setActiveVideo] = useState<YouTubeVideo>(() => videos[0] || YOUTUBE_CURATED_VIDEOS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(() => new Set());
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('lifeos_youtube_saved_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Categories list
  const categories = ['All', 'Worship', 'Study & Bible', 'Lofi & Focus', 'The Chosen', 'Favorites'];

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_youtube_saved_ids', JSON.stringify(Array.from(savedVideoIds)));
    } catch {}
  }, [savedVideoIds]);

  // Save custom added videos
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_youtube_videos_v1', JSON.stringify(videos));
    } catch {}
  }, [videos]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectVideo = (video: YouTubeVideo) => {
    sounds.playTap();
    setActiveVideo(video);
  };

  const handleToggleLike = (id: string) => {
    sounds.playTap();
    setLikedVideoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSave = (id: string) => {
    sounds.playTap();
    setSavedVideoIds(prev => {
      const next = new Set(prev);
      const isSaving = !next.has(id);
      if (isSaving) {
        next.add(id);
        showToast('Saved to your LifeOS YouTube library!');
      } else {
        next.delete(id);
        showToast('Removed from saved library');
      }
      return next;
    });
  };

  const handleShare = (video: YouTubeVideo) => {
    sounds.playTap();
    const url = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    navigator.clipboard?.writeText(url);
    showToast('YouTube link copied to clipboard!');
  };

  // Submit custom video or direct URL in search bar
  const handleSearchOrPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if user pasted a YouTube URL or direct 11-char ID
    const extractedId = extractYouTubeId(searchQuery);
    if (extractedId) {
      sounds.playTap();
      const newVideo: YouTubeVideo = {
        id: `custom_${Date.now()}`,
        youtubeId: extractedId,
        title: `YouTube Video (${extractedId})`,
        channelTitle: 'YouTube User',
        channelAvatar: '▶️',
        views: 'Live View',
        timestamp: 'Just now',
        duration: 'Video',
        category: 'Study & Bible',
        description: `Direct YouTube playback for ${searchQuery}`
      };
      setVideos(prev => [newVideo, ...prev.filter(v => v.youtubeId !== extractedId)]);
      setActiveVideo(newVideo);
      setSearchQuery('');
      showToast('Loaded YouTube video!');
    }
  };

  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = extractYouTubeId(customUrlInput);
    if (!extractedId) {
      showToast('Invalid YouTube URL or ID. Please check and try again.');
      return;
    }

    const newVideo: YouTubeVideo = {
      id: `custom_${Date.now()}`,
      youtubeId: extractedId,
      title: `Custom Video (${extractedId})`,
      channelTitle: 'Custom Stream',
      channelAvatar: '▶️',
      views: 'Added by you',
      timestamp: 'Just now',
      duration: 'HD',
      category: 'Worship',
      description: `Custom video added via URL: ${customUrlInput}`
    };

    setVideos(prev => [newVideo, ...prev]);
    setActiveVideo(newVideo);
    setCustomUrlInput('');
    setIsAddModalOpen(false);
    showToast('Video added and playing!');
  };

  // Filtered videos list
  const filteredVideos = videos.filter(v => {
    if (selectedCategory === 'Favorites') {
      return savedVideoIds.has(v.id);
    }
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="h-full flex flex-col bg-stone-950 text-white select-none overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 border border-white/20 text-white text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: YouTube Branding, Search & Add Video */}
      <div className="h-14 px-4 bg-stone-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-7 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          </div>
          <div className="flex items-center gap-1 font-black text-base tracking-tighter">
            <span className="text-white">YouTube</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
              LifeOS
            </span>
          </div>
        </div>

        {/* Center Search / Paste URL Input */}
        <form onSubmit={handleSearchOrPlay} className="flex-1 max-w-xl relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, or paste ANY YouTube link / video ID to play..."
            className="w-full pl-10 pr-24 py-2 rounded-2xl bg-stone-800/90 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-black shadow transition-transform active:scale-95 flex items-center gap-1"
          >
            <span>Play</span>
          </button>
        </form>

        {/* Right Actions: Paste Link Modal */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 border border-white/15 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Paste Link</span>
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS BAR */}
      <div className="px-4 py-2 bg-stone-950/80 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sounds.playTap();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white text-stone-900 shadow-md'
                : 'bg-white/10 hover:bg-white/15 text-stone-300'
            }`}
          >
            {cat === 'Favorites' ? `Saved (${savedVideoIds.size})` : cat}
          </button>
        ))}
      </div>

      {/* MAIN VIEWPORT: ACTIVE PLAYER + SIDEBAR QUEUE */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col lg:flex-row gap-5">
        {/* Left Column: Embedded YouTube Player & Video Details */}
        <div className={`flex flex-col gap-3 transition-all duration-300 ${isTheaterMode ? 'w-full' : 'flex-1'}`}>
          {/* 16:9 Responsive Video Iframe Container */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl relative">
            {activeVideo?.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
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

          {/* Video Title & Primary Metadata */}
          {activeVideo && (
            <div className="flex flex-col gap-2.5 p-1">
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {activeVideo.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-white/10 pb-3">
                {/* Channel Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-xl shadow-md font-bold">
                    {activeVideo.channelAvatar || '▶️'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
                      {activeVideo.channelTitle}
                      <span className="text-[10px] text-emerald-400">✓</span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {activeVideo.views} · {activeVideo.timestamp}
                    </span>
                  </div>
                </div>

                {/* Interaction Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(activeVideo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      likedVideoIds.has(activeVideo.id)
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-white/10 hover:bg-white/15 text-stone-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedVideoIds.has(activeVideo.id) ? 'fill-current' : ''}`} />
                    <span>{likedVideoIds.has(activeVideo.id) ? 'Liked' : 'Like'}</span>
                  </button>

                  {/* Save to Favorites */}
                  <button
                    onClick={() => handleToggleSave(activeVideo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      savedVideoIds.has(activeVideo.id)
                        ? 'bg-amber-500 text-stone-950 font-black shadow'
                        : 'bg-white/10 hover:bg-white/15 text-stone-300'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedVideoIds.has(activeVideo.id) ? 'fill-current' : ''}`} />
                    <span>{savedVideoIds.has(activeVideo.id) ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => handleShare(activeVideo)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-stone-300 flex items-center gap-1.5 transition-all"
                    title="Copy YouTube Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Theater Mode Toggle */}
                  <button
                    onClick={() => setIsTheaterMode(prev => !prev)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-all"
                    title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
                  >
                    {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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

        {/* Right Column: Up Next / Recommended List */}
        {!isTheaterMode && (
          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-red-500" />
                <span>Up Next · Recommended</span>
              </span>
              <span className="text-[10px] text-stone-400 font-bold">
                {filteredVideos.length} videos
              </span>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[700px] pr-1">
              {filteredVideos.map((video) => {
                const isActive = activeVideo?.id === video.id;

                return (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`p-2 rounded-2xl flex items-start gap-3 text-left transition-all hover:bg-white/10 ${
                      isActive
                        ? 'bg-white/15 border border-red-500/40 shadow-lg'
                        : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="w-28 aspect-video rounded-xl bg-stone-900 border border-white/10 overflow-hidden relative shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback placeholder if thumbnail fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-black text-white">
                        {video.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                      <div className="mt-1 flex flex-col">
                        <span className="text-[11px] text-stone-400 truncate">
                          {video.channelTitle}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {video.views}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PASTE YOUTUBE LINK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-base font-black text-white">Watch Any YouTube Video</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Paste any YouTube video link (e.g. <code>https://youtube.com/watch?v=...</code>, <code>youtu.be/...</code>, or video ID) to stream it directly inside LifeOS.
            </p>

            <form onSubmit={handleAddCustomVideo} className="flex flex-col gap-3">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Paste YouTube URL here..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold text-white placeholder-stone-500 focus:outline-none focus:border-red-500 transition-all"
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
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-black shadow-lg transition-transform active:scale-95"
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
