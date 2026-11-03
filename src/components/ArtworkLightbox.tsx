import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { ArtworkItem } from '../data/portfolioData';
import { StudioPlaceholderVisual } from './StudioPlaceholderVisual';

interface ArtworkLightboxProps {
  artwork: ArtworkItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateArtworkImage: (id: string, dataUrl: string) => void;
}

export const ArtworkLightbox: React.FC<ArtworkLightboxProps> = ({
  artwork,
  onClose,
  onPrev,
  onNext,
  onUpdateArtworkImage,
}) => {
  const [showCompanion, setShowCompanion] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setShowCompanion(false);
    setIsZoomed(false);
  }, [artwork?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!artwork) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artwork, onClose, onPrev, onNext]);

  if (!artwork) return null;

  const activeImageUrl =
    showCompanion && artwork.companionImageUrl ? artwork.companionImageUrl : artwork.imageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#202124]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-artwork-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#F8F7F3] text-[#202124] shadow-2xl border border-white/15 grid grid-cols-1 lg:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left / Top Media Viewer (7 cols) */}
        <div className="lg:col-span-7 relative bg-[#202124] flex items-center justify-center min-h-[340px] sm:min-h-[480px] lg:min-h-[620px] overflow-hidden">
          {activeImageUrl && !artwork.isPlaceholder ? (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
              <img
                src={activeImageUrl}
                alt={artwork.title}
                referrerPolicy="no-referrer"
                className={`max-h-[75vh] w-auto object-contain rounded-xl transition-transform duration-200 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed((z) => !z)}
              />

              {/* Top-left badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202124]/75 backdrop-blur-md text-[#F8F7F3] text-xs font-mono-tabular border border-white/10">
                <span>{artwork.catalogueNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{showCompanion ? 'Companion Study View' : 'Primary View'}</span>
              </div>

              {/* Bottom controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                {artwork.companionImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowCompanion((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-[#202124] text-xs font-medium shadow-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#B69A68]" />
                    <span>
                      {showCompanion
                        ? 'Switch to Primary Render'
                        : artwork.companionLabel || 'Switch Angle'}
                    </span>
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#202124]/75 hover:bg-[#202124] text-white text-xs font-medium border border-white/15 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? '100%' : '125%'}</span>
                </button>
              </div>
            </div>
          ) : (
            <StudioPlaceholderVisual
              type={artwork.placeholderType}
              title={artwork.title}
              replacementPathHint={artwork.replacementPathHint}
              onImageUpload={(dataUrl) => onUpdateArtworkImage(artwork.id, dataUrl)}
              className="w-full h-full min-h-[420px]"
            />
          )}

          {/* Prev / Next arrows */}
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous artwork"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#202124] shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next artwork"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#202124] shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Curatorial Details Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[92vh]">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#202124]/10">
              <div className="flex items-center gap-2 text-xs text-[#202124]/60 font-mono-tabular">
                <span>{artwork.catalogueNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{artwork.year}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#B69A68] font-medium">
                  {artwork.isPlaceholder ? 'Replaceable Slot' : 'Original Work'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close artwork viewer"
                className="p-2 rounded-xl text-[#202124]/60 hover:text-[#202124] hover:bg-[#202124]/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3
              id="lightbox-artwork-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#202124] leading-tight"
            >
              {artwork.title}
            </h3>

            {artwork.tamilTitle && (
              <p className="text-sm text-[#B69A68] font-medium mt-1.5">{artwork.tamilTitle}</p>
            )}

            {/* Unboxed metadata with typographic separators */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#202124]/65">
              {artwork.categories.map((cat, index) => (
                <React.Fragment key={cat}>
                  {index > 0 && <span aria-hidden="true">·</span>}
                  <span>{cat}</span>
                </React.Fragment>
              ))}
            </div>

            <dl className="mt-6 pt-6 border-t border-[#202124]/10 space-y-4 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[#202124]/50 font-medium">
                  Artist
                </dt>
                <dd className="font-medium text-[#202124] mt-0.5">
                  Pravin Kumar · BFA Sculpture (2026)
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[#202124]/50 font-medium">
                  Medium &amp; Presentation
                </dt>
                <dd className="text-[#202124]/85 mt-0.5">{artwork.medium}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[#202124]/50 font-medium">
                  Curatorial Description
                </dt>
                <dd className="text-[#202124]/80 leading-relaxed mt-1">{artwork.description}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[#202124]/50 font-medium">
                  Sculptural &amp; Technical Notes
                </dt>
                <dd className="text-[#202124]/75 text-xs leading-relaxed mt-1">
                  {artwork.technicalNotes}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 pt-4 border-t border-[#202124]/10 flex items-center justify-between text-xs text-[#202124]/55">
            <span>Use ← / → keys to browse works</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
