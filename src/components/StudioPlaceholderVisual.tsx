import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface StudioPlaceholderVisualProps {
  type?: 'clay-sculpture' | 'traditional-relief' | 'charcoal-drawing' | 'fine-painting' | 'artist-portrait';
  title: string;
  replacementPathHint: string;
  onImageUpload?: (dataUrl: string) => void;
  className?: string;
}

export const StudioPlaceholderVisual: React.FC<StudioPlaceholderVisualProps> = ({
  type = 'clay-sculpture',
  title,
  replacementPathHint,
  onImageUpload,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-6 sm:p-8 bg-[#F1F2F2] text-[#202124] overflow-hidden select-none ${className}`}
    >
      {/* Subtle architectural proportion grid */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(32,33,36,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(32,33,36,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top honest label */}
      <div className="relative z-10 w-full flex items-center justify-between gap-2 text-[11px] tracking-widest uppercase text-[#202124]/60 font-mono-tabular border-b border-[#202124]/10 pb-3">
        <span>Replaceable Visual Placeholder</span>
        <span>Studio Slot</span>
      </div>

      {/* Center bespoke architectural / sculptural study schematic */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center max-w-xs">
        {type === 'artist-portrait' && (
          <svg
            viewBox="0 0 160 180"
            className="w-28 h-32 text-[#B69A68] mb-4 stroke-current"
            fill="none"
            strokeWidth="1.25"
          >
            <circle cx="80" cy="58" r="28" />
            <path d="M80 22 v72 M44 58 h72" strokeDasharray="3 3" strokeOpacity="0.45" />
            <path d="M32 156 c0-28 22-46 48-46 s48 18 48 46" />
            <rect x="16" y="12" width="128" height="156" rx="12" strokeOpacity="0.3" />
          </svg>
        )}

        {type === 'clay-sculpture' && (
          <svg
            viewBox="0 0 160 180"
            className="w-28 h-32 text-[#B69A68] mb-4 stroke-current"
            fill="none"
            strokeWidth="1.25"
          >
            {/* Classical bust & pedestal proportion wireframe */}
            <ellipse cx="80" cy="48" rx="22" ry="28" />
            <path d="M58 48 c14 6 30 6 44 0" strokeOpacity="0.45" />
            <path d="M80 16 v148" strokeDasharray="3 3" strokeOpacity="0.4" />
            <path d="M46 98 c8-14 20-20 34-20 s26 6 34 20 l-10 24 H56 Z" />
            <rect x="48" y="122" width="64" height="14" />
            <rect x="38" y="136" width="84" height="22" />
          </svg>
        )}

        {type === 'charcoal-drawing' && (
          <svg
            viewBox="0 0 180 140"
            className="w-32 h-24 text-[#7C9185] mb-4 stroke-current"
            fill="none"
            strokeWidth="1.25"
          >
            {/* Golden ratio & perspective study lines */}
            <rect x="18" y="16" width="144" height="108" rx="6" strokeOpacity="0.4" />
            <circle cx="74" cy="70" r="34" />
            <path d="M18 124 L162 16 M74 16 v108" strokeDasharray="3 3" strokeOpacity="0.45" />
            <path d="M98 92 L138 42" strokeWidth="2" />
          </svg>
        )}

        {type === 'fine-painting' && (
          <svg
            viewBox="0 0 180 140"
            className="w-32 h-24 text-[#B69A68] mb-4 stroke-current"
            fill="none"
            strokeWidth="1.25"
          >
            <rect x="20" y="18" width="140" height="104" rx="8" />
            <path d="M20 94 Q65 62 105 84 T160 68" />
            <circle cx="122" cy="48" r="14" />
            <path d="M36 34 h36 M36 44 h22" strokeOpacity="0.4" />
          </svg>
        )}

        {type === 'traditional-relief' && (
          <svg
            viewBox="0 0 160 160"
            className="w-28 h-28 text-[#B69A68] mb-4 stroke-current"
            fill="none"
            strokeWidth="1.25"
          >
            <circle cx="80" cy="80" r="54" />
            <circle cx="80" cy="80" r="38" strokeDasharray="4 3" />
            <path d="M80 26 v108 M26 80 h108" strokeOpacity="0.35" />
          </svg>
        )}

        <p className="font-display text-lg font-medium text-[#202124] mb-1">{title}</p>
        <p className="text-xs text-[#202124]/65 max-w-[240px] leading-relaxed">
          Reserved placeholder slot. No generated artwork is shown as the artist’s own work.
        </p>

        {onImageUpload && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label={`Upload replacement image for ${title}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-[#202124] text-xs font-medium shadow-xs border border-[#202124]/15 hover:border-[#B69A68] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-[#B69A68]" />
              <span>Preview Your Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom file path instruction */}
      <div className="relative z-10 w-full flex items-center justify-between gap-2 text-[11px] text-[#202124]/55 font-mono-tabular pt-3 border-t border-[#202124]/10">
        <span className="inline-flex items-center gap-1.5 truncate">
          <ImageIcon className="w-3 h-3 shrink-0 text-[#B69A68]" />
          <span className="truncate">{replacementPathHint}</span>
        </span>
        <span className="shrink-0">Replaceable</span>
      </div>
    </div>
  );
};
