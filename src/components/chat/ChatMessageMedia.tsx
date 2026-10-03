import React, { useState } from 'react';
import { ZoomIn, BookOpen, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/chat';

interface ChatMessageMediaProps {
  message: ChatMessage;
  onOpenLightbox: (data: {
    imageUrl: string;
    title?: string;
    caption?: string;
    verse?: string;
    senderName: string;
  }) => void;
}

// Regex to detect direct image URLs inside message text
const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)|https?:\/\/images\.unsplash\.com\/[^\s]+|https?:\/\/i\.imgur\.com\/[^\s]+|https?:\/\/media\.giphy\.com\/[^\s]+)/i;

export const ChatMessageMedia: React.FC<ChatMessageMediaProps> = ({
  message,
  onOpenLightbox,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check 1: Explicit attachment of type 'image'
  const isImageAttachment = message.attachment && message.attachment.type === 'image';

  // Check 2: Inline URL in text
  const matchInline = !isImageAttachment ? message.text.match(IMAGE_URL_REGEX) : null;
  const inlineImageUrl = matchInline ? matchInline[0] : null;

  const activeImageUrl = isImageAttachment
    ? message.attachment?.url
    : inlineImageUrl;

  if (!activeImageUrl || imageError) return null;

  const title = isImageAttachment ? message.attachment?.title : undefined;
  const caption = isImageAttachment ? (message.attachment?.caption || message.attachment?.content) : undefined;
  const verse = isImageAttachment ? (message.attachment?.verse || message.attachment?.reference) : undefined;

  const handleClick = () => {
    onOpenLightbox({
      imageUrl: activeImageUrl,
      title,
      caption,
      verse,
      senderName: message.senderName,
    });
  };

  return (
    <div className="mt-2.5 max-w-md sm:max-w-lg">
      <div
        onClick={handleClick}
        className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#1e1f22] cursor-pointer shadow-lg hover:border-amber-400/50 transition-all"
      >
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="w-full h-48 bg-[#2b2d31] animate-pulse flex items-center justify-center text-stone-500 text-xs">
            <span>Loading image...</span>
          </div>
        )}

        {/* The Image */}
        <img
          src={activeImageUrl}
          alt={title || 'Fellowship shared image'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full max-h-80 object-cover group-hover:scale-[1.02] transition-transform duration-300 ${
            isLoaded ? 'block' : 'hidden'
          }`}
          loading="lazy"
        />

        {/* Hover Zoom Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
          <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
            <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Click to Expand</span>
          </div>
        </div>

        {/* Title or Verse overlay badge */}
        {title && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white max-w-[85%] truncate border border-white/10 shadow-sm">
            {title}
          </div>
        )}
      </div>

      {/* Caption & Scripture Verse Underneath */}
      {(verse || caption) && (
        <div className="mt-1.5 p-2 bg-[#2b2d31]/80 rounded-lg border-l-2 border-amber-400 text-stone-200 text-xs space-y-0.5">
          {verse && (
            <div className="font-serif italic text-amber-300 text-[11px] flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{verse}</span>
            </div>
          )}
          {caption && <p className="text-[11px] text-stone-300">{caption}</p>}
        </div>
      )}
    </div>
  );
};
