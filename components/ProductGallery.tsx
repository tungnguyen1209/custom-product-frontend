"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const fallbackImages = [
  { id: 1, alt: "Front view", bg: "from-purple-100 to-pink-100", emoji: "🎓", label: "Front View" },
  { id: 2, alt: "Name detail", bg: "from-teal-100 to-cyan-100", emoji: "✨", label: "Name Detail" },
  { id: 3, alt: "Worn style", bg: "from-yellow-100 to-orange-100", emoji: "🎉", label: "Worn Style" },
  { id: 4, alt: "Gold edition", bg: "from-blue-100 to-indigo-100", emoji: "⭐", label: "Gold Edition" },
];

interface GalleryEntry {
  id: number;
  url?: string;
  alt: string;
  bg?: string;
  emoji?: string;
  label?: string;
}

export default function ProductGallery({
  showCanvas = false,
  setShowCanvas = () => {},
  canvas = null,
  images,
  alt = "Product image",
}: {
  showCanvas?: boolean;
  setShowCanvas?: (v: boolean) => void;
  canvas?: React.ReactNode;
  images?: string[];
  alt?: string;
}) {
  const productImages: GalleryEntry[] = images && images.length > 0
    ? images.map((url, i) => ({
        id: i + 1,
        url,
        alt: `${alt} ${i + 1}`,
      }))
    : fallbackImages;
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const prev = () => {
    setShowCanvas(false);
    setActiveIndex((i) => (i === 0 ? productImages.length - 1 : i - 1));
  };
  const next = () => {
    setShowCanvas(false);
    setActiveIndex((i) => (i === productImages.length - 1 ? 0 : i + 1));
  };

  /* Touch Events for Mobile */
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const dragEndX = e.changedTouches[0].clientX;
    const diff = dragStartX.current - dragEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }
    dragStartX.current = null;
  };

  /* Mouse Events for Desktop Drag */
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only track left click
    if (e.button !== 0) return;
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    // We could add visual offset here if needed
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const dragEndX = e.clientX;
    const diff = dragStartX.current - dragEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }

    isDragging.current = false;
    dragStartX.current = null;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    dragStartX.current = null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 select-none">
      {/* Thumbnail strip — vertical column on desktop (left), hidden on mobile */}
      <div className="hidden lg:flex lg:flex-col gap-2 overflow-y-auto scrollbar-hide p-1 max-h-[var(--gallery-h,100%)] lg:max-h-[640px] lg:w-20 flex-shrink-0">
        {productImages.map((img, i) => (
          <button
            key={img.id}
            onClick={(e) => {
              e.stopPropagation();
              setShowCanvas(false);
              setActiveIndex(i);
            }}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
              i === activeIndex
                ? "ring-2 ring-[#ff6b6b] ring-offset-1"
                : "ring-1 ring-gray-200 hover:ring-[#ff6b6b] opacity-70 hover:opacity-100"
            }`}
          >
            {img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${img.bg} flex items-center justify-center`}
              >
                <span className="text-2xl">{img.emoji}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Main image / Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square border border-gray-100 shadow-sm flex-1 min-w-0">
        {/* Canvas View */}
        <div
          className={`absolute inset-0 z-10 bg-white ${
            showCanvas ? "block" : "hidden"
          }`}
        >
          {canvas}
        </div>

        {/* Slider View */}
        <div
          className={`absolute inset-0 group cursor-grab active:cursor-grabbing ${
            !showCanvas ? "block" : "hidden"
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {productImages.map((img) => (
              <div
                key={img.id}
                className={`w-full h-full flex-shrink-0 ${img.url ? "bg-white" : `bg-gradient-to-br ${img.bg}`} flex items-center justify-center cursor-zoom-in`}
                onClick={() => setZoomed(!zoomed)}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-4">{img.emoji}</div>
                    <p className="text-gray-500 text-sm font-medium">{img.label}</p>
                    <p className="text-gray-400 text-xs mt-1 max-w-[180px] mx-auto">
                      {img.alt}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {productImages.length}
          </div>

          {/* Zoom icon */}
          <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

    </div>
  );
}
