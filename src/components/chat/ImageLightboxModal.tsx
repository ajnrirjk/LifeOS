import React, { useEffect } from 'react';
import { X, Download, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
  verse?: string;
  senderName?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  verse,
  senderName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/92 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white px-2">
          <div className="flex items-center gap-2 min-w-0">
            {senderName && (
              <span className="text-xs text-stone-300 font-medium truncate">
                Shared by <strong className="text-amber-400 font-bold">@{senderName}</strong>
              </span>
            )}
            {title && (
              <span className="text-xs text-white font-bold truncate">
                • {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={title || 'fellowship-image'}
              className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white transition-all shadow-md"
              title="Open Original / Download"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white transition-all shadow-md"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[72vh] flex items-center justify-center bg-black/40">
          <img
            src={imageUrl}
            alt={title || 'Fellowship full image'}
            className="max-h-[72vh] max-w-full object-contain rounded-2xl"
          />
        </div>

        {/* Bottom Info Bar (Caption & Verse) */}
        {(caption || verse || title) && (
          <div className="w-full mt-3 p-3.5 bg-[#2b2d31]/90 backdrop-blur-md rounded-xl border border-white/10 text-stone-200 space-y-1 max-w-2xl text-center shadow-lg">
            {verse && (
              <p className="text-xs sm:text-sm font-serif italic text-amber-300 flex items-center justify-center gap-1.5 leading-relaxed">
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{verse}</span>
              </p>
            )}
            {caption && (
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
