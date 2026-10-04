import React, { useState, useRef, useCallback } from 'react';
import {
  Play, Pause, Heart, Share2, Bookmark, Volume2, VolumeX,
  User, LogIn, ChevronUp, ChevronDown, Search, X, ExternalLink
} from 'lucide-react';
import { TIKTOK_CURATED_VIDEOS, TikTokVideo } from '../../data/mediaAppsData';

type CategoryFilter = 'All' | 'Trending' | 'Comedy' | 'Dance' | 'Food' | 'Sports' | 'Music' | 'Life Hacks' | 'Tech' | 'Faith';

const CATEGORIES: CategoryFilter[] = ['All', 'Trending', 'Comedy', 'Dance', 'Food', 'Sports', 'Music', 'Life Hacks', 'Tech', 'Faith'];

const CATEGORY_EMOJI: Record<CategoryFilter, string> = {
  All: '🔥',
  Trending: '📈',
  Comedy: '😂',
  Dance: '💃',
  Food: '🍔',
  Sports: '⚽',
  Music: '🎵',
  'Life Hacks': '💡',
  Tech: '📱',
  Faith: '🙏'
};

export const TikTokApp: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<TikTokVideo>(TIKTOK_CURATED_VIDEOS[0]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredVideos = TIKTOK_CURATED_VIDEOS.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchesSearch = !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creatorHandle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentIndex = filteredVideos.findIndex(v => v.id === activeVideo.id);

  const goToNext = useCallback(() => {
    const next = filteredVideos[(currentIndex + 1) % filteredVideos.length];
    if (next) setActiveVideo(next);
  }, [currentIndex, filteredVideos]);

  const goToPrev = useCallback(() => {
    const prev = filteredVideos[(currentIndex - 1 + filteredVideos.length) % filteredVideos.length];
    if (prev) setActiveVideo(prev);
  }, [currentIndex, filteredVideos]);

  const toggleLike = (id: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const embedUrl = `https://www.tiktok.com/embed/v2/${activeVideo.tiktokId}`;

  if (showSignIn) {
    return (
      <div className="w-full h-full flex flex-col bg-stone-950">
        {/* Sign In Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800">
          <span className="text-white font-black text-sm tracking-wide">TikTok — Sign In</span>
          <button
            onClick={() => setShowSignIn(false)}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Embedded TikTok Login */}
        <div className="flex-1 relative">
          <iframe
            src="https://www.tiktok.com/login/"
            title="TikTok Sign In"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={() => window.open('https://www.tiktok.com/login/', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              <ExternalLink size={12} /> Open in Browser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-stone-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/95 border-b border-stone-800/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <div>
            <p className="text-white font-black text-sm tracking-wide leading-none">TikFeed</p>
            <p className="text-stone-500 text-[10px] leading-none mt-0.5">Trending Videos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center gap-2 bg-stone-800 rounded-xl px-3 py-1.5 border border-stone-700">
              <Search size={12} className="text-stone-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="bg-transparent text-white text-xs outline-none w-32 placeholder:text-stone-500"
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                <X size={12} className="text-stone-400 hover:text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <Search size={15} />
            </button>
          )}
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all active:scale-95"
          >
            <LogIn size={12} />
            Sign In
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-stone-900/60 border-b border-stone-800/40">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setActiveVideo(filteredVideos[0] || TIKTOK_CURATED_VIDEOS[0]); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <span>{CATEGORY_EMOJI[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Main Layout: Video Player + Sidebar List */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Video Player */}
        <div className="flex-1 flex flex-col relative bg-black min-w-0">
          {/* Embed iframe */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              key={activeVideo.tiktokId}
              src={embedUrl}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            />
            {/* Overlay gradient for bottom info */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>

          {/* Video Info Bar */}
          <div className="px-4 py-3 bg-stone-900/95 border-t border-stone-800/60">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-black text-sm leading-tight truncate">{activeVideo.title}</p>
                <p className="text-emerald-400 text-xs font-semibold mt-0.5">{activeVideo.creatorHandle}</p>
                <p className="text-stone-500 text-[10px] mt-1 leading-relaxed line-clamp-2">{activeVideo.description}</p>
              </div>
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                {/* Like */}
                <button
                  onClick={() => toggleLike(activeVideo.id)}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className={`p-2 rounded-2xl transition-all ${likedVideos.has(activeVideo.id) ? 'bg-rose-500/20 text-rose-400' : 'bg-stone-800 text-stone-400 hover:text-rose-400'}`}>
                    <Heart size={16} fill={likedVideos.has(activeVideo.id) ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-[9px] text-stone-500">{activeVideo.likes}</span>
                </button>
                {/* Save */}
                <button
                  onClick={() => toggleSave(activeVideo.id)}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className={`p-2 rounded-2xl transition-all ${savedVideos.has(activeVideo.id) ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400 hover:text-amber-400'}`}>
                    <Bookmark size={16} fill={savedVideos.has(activeVideo.id) ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-[9px] text-stone-500">Save</span>
                </button>
                {/* Share */}
                <button
                  onClick={() => window.open(`https://www.tiktok.com/video/${activeVideo.tiktokId}`, '_blank')}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className="p-2 rounded-2xl bg-stone-800 text-stone-400 hover:text-emerald-400 transition-all">
                    <ExternalLink size={16} />
                  </div>
                  <span className="text-[9px] text-stone-500">Open</span>
                </button>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-600">{currentIndex + 1} / {filteredVideos.length}</span>
                <span className="text-[10px] text-stone-700">•</span>
                <span className="text-[10px] text-stone-500">{activeVideo.views} views</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goToPrev}
                  disabled={filteredVideos.length <= 1}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={goToNext}
                  disabled={filteredVideos.length <= 1}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Video List */}
        <div className="w-56 flex-shrink-0 flex flex-col bg-stone-900/80 border-l border-stone-800/60 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] text-stone-500 font-black uppercase tracking-widest border-b border-stone-800/60">
            {activeCategory === 'All' ? 'For You' : activeCategory}
          </p>
          {filteredVideos.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <div>
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-stone-500 text-xs">No videos found</p>
              </div>
            </div>
          ) : (
            filteredVideos.map((video, i) => (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={`w-full text-left px-3 py-3 border-b border-stone-800/40 transition-all hover:bg-stone-800/60 ${
                  activeVideo.id === video.id ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Thumbnail placeholder */}
                  <div className="w-10 h-14 rounded-lg bg-stone-800 flex-shrink-0 flex items-center justify-center text-lg overflow-hidden border border-stone-700/50">
                    {CATEGORY_EMOJI[video.category as CategoryFilter] || '🎵'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                      activeVideo.id === video.id ? 'text-emerald-400' : 'text-white'
                    }`}>{video.title}</p>
                    <p className="text-stone-500 text-[9px] mt-1 truncate">{video.creatorHandle}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Heart size={8} className="text-rose-500" />
                      <span className="text-[9px] text-stone-500">{video.likes}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
