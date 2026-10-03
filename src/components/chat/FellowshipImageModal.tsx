import React, { useState } from 'react';
import { X, Image as ImageIcon, Link2, Upload, Search, Check, Sparkles, AlertCircle } from 'lucide-react';
import { FELLOWSHIP_GALLERY, FellowshipGalleryImage } from '../../data/fellowshipGallery';

interface FellowshipImageModalProps {
  channelName: string;
  isOpen: boolean;
  onClose: () => void;
  onSendImage: (imageData: {
    url: string;
    title: string;
    caption?: string;
    verse?: string;
  }) => void;
}

export const FellowshipImageModal: React.FC<FellowshipImageModalProps> = ({
  channelName,
  isOpen,
  onClose,
  onSendImage,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<FellowshipGalleryImage | null>(FELLOWSHIP_GALLERY[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // URL Tab State
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlCaption, setUrlCaption] = useState('');
  const [urlVerse, setUrlVerse] = useState('');
  const [urlError, setUrlError] = useState(false);

  // Upload Tab State
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadVerse, setUploadVerse] = useState('');

  if (!isOpen) return null;

  const filteredGallery = FELLOWSHIP_GALLERY.filter((img) => {
    const matchesSearch =
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.verse && img.verse.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Please upload an image smaller than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedBase64(result);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'gallery' && selectedGalleryImg) {
      onSendImage({
        url: selectedGalleryImg.url,
        title: selectedGalleryImg.title,
        caption: selectedGalleryImg.description,
        verse: selectedGalleryImg.verse,
      });
      onClose();
    } else if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      onSendImage({
        url: urlInput.trim(),
        title: urlTitle.trim() || 'Shared Image',
        caption: urlCaption.trim() || undefined,
        verse: urlVerse.trim() || undefined,
      });
      onClose();
    } else if (activeTab === 'upload' && uploadedBase64) {
      onSendImage({
        url: uploadedBase64,
        title: uploadTitle.trim() || 'Uploaded Photo',
        caption: uploadCaption.trim() || undefined,
        verse: uploadVerse.trim() || undefined,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[90] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#313338] border border-[#3f4147] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Share Image in #{channelName}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-[#949ba4]">
                Pick from the Fellowship Gallery, paste a direct URL, or upload from your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#35373c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f2023] bg-[#2b2d31]/50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'border-[#5865F2] text-white'
                : 'border-transparent text-[#949ba4] hover:text-stone-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fellowship Gallery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-[#5865F2] text-white'
                : 'border-transparent text-[#949ba4] hover:text-stone-300'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Paste Image URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#5865F2] text-white'
                : 'border-transparent text-[#949ba4] hover:text-stone-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Device Photo</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* TAB 1: FELLOWSHIP GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              {/* Search & Categories */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search inspiring Christian images..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'symbol', label: '✝️ Cross' },
                    { id: 'scripture', label: '📖 Scripture' },
                    { id: 'creation', label: '🌅 Creation' },
                    { id: 'worship', label: '🕊️ Worship' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#5865F2] text-white'
                          : 'bg-[#2b2d31] text-stone-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                {filteredGallery.map((item) => {
                  const isSelected = selectedGalleryImg?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGalleryImg(item)}
                      className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                          : 'border-transparent hover:border-white/30'
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                        <span className="text-[11px] font-bold text-white leading-tight line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-stone-900 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Preview Box */}
              {selectedGalleryImg && (
                <div className="p-3 bg-[#2b2d31] rounded-xl border border-[#3f4147] flex gap-3 items-center">
                  <img
                    src={selectedGalleryImg.thumbnailUrl}
                    alt={selectedGalleryImg.title}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{selectedGalleryImg.title}</h4>
                    <p className="text-[11px] text-stone-300 font-serif italic line-clamp-2">
                      {selectedGalleryImg.verse || selectedGalleryImg.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                  Direct Image URL (PNG, JPG, WEBP, GIF)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError(false);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3.5 py-2 bg-[#1e1f22] border border-[#3f4147] focus:border-[#5865F2] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                    Title / Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    placeholder="e.g. Sunday Service or Sunset"
                    className="w-full px-3 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                    Scripture Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={urlVerse}
                    onChange={(e) => setUrlVerse(e.target.value)}
                    placeholder="e.g. Psalm 23:1"
                    className="w-full px-3 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                  Caption / Message (Optional)
                </label>
                <input
                  type="text"
                  value={urlCaption}
                  onChange={(e) => setUrlCaption(e.target.value)}
                  placeholder="Add an encouraging word with this photo..."
                  className="w-full px-3.5 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                />
              </div>

              {/* URL Preview */}
              {urlInput && (
                <div className="p-3 bg-[#2b2d31] rounded-xl border border-[#3f4147] flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-[#949ba4] uppercase mb-2">Live Image Preview</span>
                  {urlError ? (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs py-4">
                      <AlertCircle className="w-4 h-4" />
                      <span>Could not load image from this URL. Please verify the link.</span>
                    </div>
                  ) : (
                    <img
                      src={urlInput}
                      alt="Preview"
                      onError={() => setUrlError(true)}
                      className="max-h-48 rounded-lg object-contain border border-white/10 shadow-md"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOAD DEVICE PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {!uploadedBase64 ? (
                <label className="border-2 border-dashed border-[#3f4147] hover:border-[#5865F2] bg-[#1e1f22] hover:bg-[#2b2d31] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                  <div className="w-12 h-12 rounded-full bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">Click or drag & drop to choose photo</span>
                  <span className="text-[11px] text-stone-400 mt-1">Supports PNG, JPG, WEBP, GIF up to 8MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative p-2 bg-[#2b2d31] rounded-xl border border-[#3f4147] flex justify-center">
                    <img
                      src={uploadedBase64}
                      alt="Uploaded preview"
                      className="max-h-52 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedBase64(null)}
                      className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                        Title / Subject
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Church gathering"
                        className="w-full px-3 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                        Scripture Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={uploadVerse}
                        onChange={(e) => setUploadVerse(e.target.value)}
                        placeholder="e.g. 1 Thessalonians 5:11"
                        className="w-full px-3 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                      Caption / Encouragement (Optional)
                    </label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Add notes or testimony..."
                      className="w-full px-3.5 py-1.5 bg-[#1e1f22] border border-[#3f4147] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#2b2d31] border-t border-[#1f2023] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-stone-300 hover:bg-[#35373c] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              (activeTab === 'gallery' && !selectedGalleryImg) ||
              (activeTab === 'url' && (!urlInput.trim() || urlError)) ||
              (activeTab === 'upload' && !uploadedBase64)
            }
            className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-[#5865F2]/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Send to #{channelName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
