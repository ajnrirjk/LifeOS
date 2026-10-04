import React, { useState, useEffect } from 'react';
import {
  CinemaMovie,
  CINEMA_FEATURED_MOVIES,
  formatCinejoySearchUrl
} from '../../data/mediaAppsData';
import { sounds } from '../../services/soundEffects';
import {
  Film,
  Play,
  Search,
  Bookmark,
  Share2,
  ExternalLink,
  Plus,
  Check,
  Star,
  Clock,
  Sparkles,
  Maximize2,
  Layers,
  Flame,
  Popcorn,
  X,
  Compass,
  Tv
} from 'lucide-react';

type GenreFilter =
  | 'All'
  | 'Featured'
  | 'Faith & Inspiration'
  | 'Action'
  | 'Sci-Fi'
  | 'Family'
  | 'Comedy'
  | 'Drama'
  | 'Animation'
  | 'Watchlist';

const GENRES: GenreFilter[] = [
  'All',
  'Featured',
  'Faith & Inspiration',
  'Action',
  'Sci-Fi',
  'Family',
  'Comedy',
  'Drama',
  'Animation',
  'Watchlist'
];

export const CinemaVaultApp: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [movies, setMovies] = useState<CinemaMovie[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_cinema_movies_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return CINEMA_FEATURED_MOVIES;
  });

  const [activeMovie, setActiveMovie] = useState<CinemaMovie>(
    () => movies[0] || CINEMA_FEATURED_MOVIES[0]
  );
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('lifeos_cinema_watchlist_v1');
      if (s) return new Set(JSON.parse(s));
    } catch {}
    return new Set();
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [customGenreInput, setCustomGenreInput] = useState<CinemaMovie['genre']>('Action');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── LocalStorage Sync ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_cinema_movies_v1', JSON.stringify(movies));
    } catch {}
  }, [movies]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'lifeos_cinema_watchlist_v1',
        JSON.stringify(Array.from(watchlistIds))
      );
    } catch {}
  }, [watchlistIds]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectMovie = (movie: CinemaMovie) => {
    sounds.playTap();
    setActiveMovie(movie);
  };

  const handleToggleWatchlist = (id: string) => {
    sounds.playTap();
    setWatchlistIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from your Watchlist');
      } else {
        next.add(id);
        showToast('Added to your Cinema Watchlist!');
      }
      return next;
    });
  };

  const handleShareMovie = (movie: CinemaMovie) => {
    sounds.playTap();
    const url = movie.cinejoyUrl;
    navigator.clipboard?.writeText(url);
    showToast(`Cinejoy link for "${movie.title}" copied!`);
  };

  // Launch dedicated cinema theater window
  const launchCinejoyPlayer = (movie: CinemaMovie) => {
    sounds.playTap();
    const targetUrl = movie.cinejoyUrl || formatCinejoySearchUrl(movie.title);
    window.open(
      targetUrl,
      'cinejoy_theater_window',
      'width=1366,height=850,menubar=no,toolbar=no,location=yes,status=no,resizable=yes'
    );
    showToast(`Launching ${movie.title} in Cinema Window...`);
  };

  // Search or direct play submission
  const handleSearchOrPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    sounds.playTap();
    const trimmed = searchQuery.trim();

    // Check if user entered a direct cinejoy.pk URL or title
    if (trimmed.includes('cinejoy.pk') || trimmed.startsWith('http')) {
      const newMovie: CinemaMovie = {
        id: `custom_${Date.now()}`,
        title: `Streaming Link (${trimmed.slice(0, 24)}...)`,
        year: new Date().getFullYear(),
        genre: 'Action',
        rating: 'HD',
        duration: 'Stream',
        posterEmoji: '🎬',
        posterBg: 'from-amber-600 to-rose-700',
        overview: `Direct playback link: ${trimmed}`,
        cinejoyQuery: trimmed,
        cinejoyUrl: trimmed
      };
      setMovies(prev => [newMovie, ...prev]);
      setActiveMovie(newMovie);
      setSearchQuery('');
      showToast('Loaded streaming link into CinemaVault!');
      launchCinejoyPlayer(newMovie);
    } else {
      // Find matching movie or launch search directly on Cinejoy
      const found = movies.find(m =>
        m.title.toLowerCase().includes(trimmed.toLowerCase())
      );
      if (found) {
        setActiveMovie(found);
        showToast(`Found: ${found.title}`);
      } else {
        const searchUrl = formatCinejoySearchUrl(trimmed);
        const searchMovie: CinemaMovie = {
          id: `search_${Date.now()}`,
          title: trimmed,
          year: new Date().getFullYear(),
          genre: 'Action',
          rating: 'HD',
          duration: 'Search',
          posterEmoji: '🔍',
          posterBg: 'from-blue-700 to-indigo-900',
          overview: `Search query on Cinejoy for "${trimmed}". Click "Stream on Cinejoy" to watch.`,
          cinejoyQuery: trimmed,
          cinejoyUrl: searchUrl
        };
        setMovies(prev => [searchMovie, ...prev]);
        setActiveMovie(searchMovie);
        setSearchQuery('');
        showToast(`Searching Cinejoy for "${trimmed}"...`);
      }
    }
  };

  // Add custom movie submission
  const handleAddCustomMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitleInput.trim()) return;

    sounds.playTap();
    const title = customTitleInput.trim();
    const cinejoyUrl = formatCinejoySearchUrl(title);

    const newMovie: CinemaMovie = {
      id: `custom_${Date.now()}`,
      title,
      year: new Date().getFullYear(),
      genre: customGenreInput,
      rating: '8.5',
      duration: '2h 00m',
      posterEmoji: customGenreInput === 'Faith & Inspiration' ? '🕊️' : '🎬',
      posterBg: 'from-amber-600 via-rose-600 to-red-800',
      overview: `Custom movie added to your CinemaVault library. Stream on Cinejoy with one click.`,
      cinejoyQuery: title,
      cinejoyUrl
    };

    setMovies(prev => [newMovie, ...prev]);
    setActiveMovie(newMovie);
    setCustomTitleInput('');
    setIsAddModalOpen(false);
    showToast(`Added "${title}" to CinemaVault!`);
  };

  // ── Filtered Movies ────────────────────────────────────────────────────────
  const filteredMovies = movies.filter(m => {
    if (selectedGenre === 'Watchlist') return watchlistIds.has(m.id);
    if (selectedGenre === 'Featured') return m.featured;
    const matchesGenre = selectedGenre === 'All' || m.genre === selectedGenre;
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-stone-950 text-white select-none overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 border border-white/20 text-white text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-4 h-4 text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER: Branding, Search, Cinejoy Direct Launch & Add ── */}
      <div className="h-14 px-3 sm:px-4 bg-stone-900/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 sm:gap-3 z-30 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-red-700 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base tracking-tight">
            <span className="text-white">CinemaVault</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 border border-lime-500/30">
              Cinejoy
            </span>
          </div>
        </div>

        {/* Universal Search & Link Input */}
        <form onSubmit={handleSearchOrPlay} className="flex-1 max-w-lg relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search movie titles, or paste any Cinejoy link to stream..."
            className="w-full pl-9 pr-20 py-1.5 rounded-2xl bg-stone-800/90 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all font-medium"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-600 hover:opacity-90 text-stone-950 text-[11px] font-black shadow transition-transform active:scale-95 flex items-center gap-1"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playTap();
              setIsAddModalOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 border border-white/15 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-lime-400" />
            <span className="hidden sm:inline">Add Movie</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              window.open(
                'https://cinejoy.pk/',
                'cinejoy_cinema',
                'width=1366,height=850,menubar=no,toolbar=no,location=yes,status=no,resizable=yes'
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:opacity-90 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all active:scale-95"
            title="Launch full Cinejoy website in borderless cinema theater window"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Cinejoy</span>
          </button>
        </div>
      </div>

      {/* ── GENRE FILTER CHIPS BAR ── */}
      <div className="px-3 sm:px-4 py-2 bg-stone-950/90 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => {
              sounds.playTap();
              setSelectedGenre(genre);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedGenre === genre
                ? 'bg-lime-400 text-stone-950 font-black shadow-md shadow-lime-400/20'
                : 'bg-white/10 hover:bg-white/15 text-stone-300'
            }`}
          >
            {genre === 'Watchlist' && <Bookmark className="w-3 h-3" />}
            {genre === 'Featured' && <Sparkles className="w-3 h-3 text-amber-400" />}
            {genre === 'Faith & Inspiration' && <span className="text-[10px]">🕊️</span>}
            <span>{genre === 'Watchlist' ? `Watchlist (${watchlistIds.size})` : genre}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT VIEWPORT: HERO BILLBOARD + CATALOG SHELF ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-6 min-h-0">
        {/* ── PREMIERE BILLBOARD (Hero Spotlight) ── */}
        {activeMovie && (
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 via-amber-600/10 to-transparent pointer-events-none" />

            {/* Left: Poster art badge & details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10 max-w-3xl">
              {/* Giant Poster Badge */}
              <div
                className={`w-24 h-36 sm:w-28 sm:h-40 rounded-2xl bg-gradient-to-br ${activeMovie.posterBg} border border-white/20 flex flex-col items-center justify-center shadow-2xl shrink-0 gap-1.5`}
              >
                <span className="text-4xl sm:text-5xl drop-shadow-md">
                  {activeMovie.posterEmoji}
                </span>
                <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">
                  HD
                </span>
              </div>

              {/* Title, Badges & Overview */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-lime-400 text-stone-950 text-[10px] font-black tracking-wide">
                    NOW STREAMING
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-stone-300 text-[10px] font-bold">
                    {activeMovie.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-stone-300 text-[10px] font-bold">
                    {activeMovie.duration}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{activeMovie.rating}</span>
                  </span>
                  <span className="text-xs text-stone-400 font-semibold">• {activeMovie.genre}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeMovie.title}
                </h1>

                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed font-medium">
                  {activeMovie.overview}
                </p>
              </div>
            </div>

            {/* Right: Primary Action Buttons */}
            <div className="flex flex-row lg:flex-col items-center gap-2.5 z-10 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => launchCinejoyPlayer(activeMovie)}
                className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-green-500 hover:opacity-90 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-lime-500/20 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream on Cinejoy</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleWatchlist(activeMovie.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    watchlistIds.has(activeMovie.id)
                      ? 'bg-amber-400 text-stone-950 font-black'
                      : 'bg-white/10 hover:bg-white/15 text-stone-300'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      watchlistIds.has(activeMovie.id) ? 'fill-current' : ''
                    }`}
                  />
                  <span>
                    {watchlistIds.has(activeMovie.id) ? 'In Watchlist' : 'Watchlist'}
                  </span>
                </button>

                <button
                  onClick={() => handleShareMovie(activeMovie)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-all"
                  title="Copy movie link"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => launchCinejoyPlayer(activeMovie)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-all"
                  title="Open movie on Cinejoy"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOVIE CATALOG GRID & SHELVES ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-sm font-black text-white flex items-center gap-2">
              <Popcorn className="w-4 h-4 text-lime-400" />
              <span>Movie Catalog & Streaming Shelves</span>
            </span>
            <span className="text-xs text-stone-400 font-bold">
              {filteredMovies.length} titles
            </span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Film className="w-12 h-12 text-stone-600 mb-2" />
              <p className="text-sm font-bold text-stone-300">No movies found</p>
              <p className="text-xs text-stone-500 mt-1">
                Try searching a different title or add a new movie!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredMovies.map(movie => {
                const isActive = activeMovie?.id === movie.id;
                const isSaved = watchlistIds.has(movie.id);

                return (
                  <div
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className={`group cursor-pointer rounded-2xl bg-stone-900/80 border transition-all duration-200 overflow-hidden flex flex-col p-3 hover:bg-stone-800/90 ${
                      isActive
                        ? 'border-lime-400 shadow-xl shadow-lime-400/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Poster Card */}
                    <div
                      className={`w-full aspect-[2/3] rounded-xl bg-gradient-to-br ${movie.posterBg} border border-white/15 flex flex-col items-center justify-center relative shadow-lg overflow-hidden group-hover:scale-[1.02] transition-transform`}
                    >
                      <span className="text-4xl drop-shadow-md">{movie.posterEmoji}</span>

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-black text-lime-400">
                          HD
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-black text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{movie.rating}</span>
                        </span>
                      </div>

                      {/* Quick Play Hover Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          launchCinejoyPlayer(movie);
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-lime-400 font-black text-xs"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Watch HD</span>
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
                        <span>{movie.year}</span>
                        <span className="text-stone-500">•</span>
                        <span>{movie.duration}</span>
                      </div>

                      <h3 className="text-xs font-bold text-white truncate leading-snug">
                        {movie.title}
                      </h3>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-stone-300 truncate max-w-[100px]">
                          {movie.genre}
                        </span>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleWatchlist(movie.id);
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            isSaved
                              ? 'text-amber-400'
                              : 'text-stone-500 hover:text-white'
                          }`}
                          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD MOVIE MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-600 flex items-center justify-center text-stone-950 font-black">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Add Movie to CinemaVault</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-4">
              Enter any movie title or Cinejoy link to save it into your personal LifeOS
              cinema library and stream on Cinejoy anytime.
            </p>

            <form onSubmit={handleAddCustomMovie} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Movie Title or Cinejoy Link
                </label>
                <input
                  type="text"
                  value={customTitleInput}
                  onChange={e => setCustomTitleInput(e.target.value)}
                  placeholder="e.g. Gladiator II, The Dark Knight, or Cinejoy link..."
                  autoFocus
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Genre
                </label>
                <select
                  value={customGenreInput}
                  onChange={e => setCustomGenreInput(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-white/20 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Action">Action</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Faith & Inspiration">Faith & Inspiration</option>
                  <option value="Family">Family</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Animation">Animation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customTitleInput.trim()}
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-stone-950 text-xs font-black shadow-lg transition-transform active:scale-95"
                >
                  Add & Watch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
