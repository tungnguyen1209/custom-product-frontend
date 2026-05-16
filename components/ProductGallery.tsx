"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Hover-zoom state for the active gallery image. We don't store the
  // mouse position in React state — that would trigger a re-render on
  // every mousemove. Instead we write the translation directly onto the
  // image element via a ref + CSS vars. `hoverZoomActive` only toggles
  // visibility of the zoomed state.
  const [hoverZoomActive, setHoverZoomActive] = useState(false);
  const activeImgRef = useRef<HTMLImageElement | null>(null);

  // Click-to-open lightbox modal with full-screen slider.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Track drag start for the lightbox swipe gesture. Kept separate from
  // `dragStartX` so the main slider and the lightbox don't share state.
  const lightboxDragX = useRef<number | null>(null);
  const lightboxIsDragging = useRef(false);

  const prev = () => {
    setShowCanvas(false);
    setActiveIndex((i) => (i === 0 ? productImages.length - 1 : i - 1));
  };
  const next = () => {
    setShowCanvas(false);
    setActiveIndex((i) => (i === productImages.length - 1 ? 0 : i + 1));
  };

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const lightboxPrev = () =>
    setLightboxIndex((i) => (i === 0 ? productImages.length - 1 : i - 1));
  const lightboxNext = () =>
    setLightboxIndex((i) => (i === productImages.length - 1 ? 0 : i + 1));

  /* Lightbox swipe — same 50px threshold as the main slider so the
     gesture feel matches. Touch covers mobile; mouse drag covers desktop
     since the lightbox has no hover preview to compete with. */
  const lightboxTouchStart = (e: React.TouchEvent) => {
    lightboxDragX.current = e.touches[0].clientX;
  };
  const lightboxTouchEnd = (e: React.TouchEvent) => {
    if (lightboxDragX.current === null) return;
    const diff = lightboxDragX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) lightboxNext();
      else lightboxPrev();
    }
    lightboxDragX.current = null;
  };
  const lightboxMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    lightboxDragX.current = e.clientX;
    lightboxIsDragging.current = true;
  };
  const lightboxMouseUp = (e: React.MouseEvent) => {
    if (!lightboxIsDragging.current || lightboxDragX.current === null) return;
    const diff = lightboxDragX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) lightboxNext();
      else lightboxPrev();
    }
    lightboxIsDragging.current = false;
    lightboxDragX.current = null;
  };
  const lightboxMouseLeave = () => {
    lightboxIsDragging.current = false;
    lightboxDragX.current = null;
  };

  // Keyboard nav when lightbox is open: ESC closes, ←/→ navigate.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open so wheel/touch doesn't
    // bleed through to the page underneath.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

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
    void e;
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

  // Hover-zoom: translate the image so the point under the cursor stays
  // anchored under the cursor as the image scales up. We mutate
  // `transform-origin` directly (no React state) so mousemove stays cheap.
  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = activeImgRef.current;
    if (!target) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    target.style.transformOrigin = `${x}% ${y}%`;
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
                loading="lazy"
                decoding="async"
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
          className={`absolute inset-0 group ${
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
            {productImages.map((img, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={img.id}
                  className={`relative w-full h-full flex-shrink-0 overflow-hidden ${img.url ? "bg-white" : `bg-gradient-to-br ${img.bg}`} flex items-center justify-center ${img.url ? "cursor-zoom-in" : ""}`}
                  // Hover-zoom only when this slide is the active one — we
                  // don't want the off-screen slides reacting to mouse
                  // movement during a swipe.
                  onMouseEnter={() => isActive && img.url && setHoverZoomActive(true)}
                  onMouseLeave={() => {
                    if (isActive && activeImgRef.current) {
                      activeImgRef.current.style.transformOrigin = "center center";
                    }
                    setHoverZoomActive(false);
                  }}
                  onMouseMove={(e) => isActive && img.url && handleZoomMove(e)}
                  onClick={(e) => {
                    if (!img.url) return;
                    e.stopPropagation();
                    // Don't open the lightbox if the user was dragging.
                    if (
                      dragStartX.current !== null &&
                      Math.abs(e.clientX - dragStartX.current) > 5
                    ) {
                      return;
                    }
                    openLightbox(i);
                  }}
                >
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={isActive ? activeImgRef : undefined}
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-contain transition-transform duration-200 ease-out"
                      style={{
                        transform:
                          isActive && hoverZoomActive ? "scale(2)" : "scale(1)",
                      }}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "auto"}
                      draggable={false}
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
              );
            })}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full z-10">
            {activeIndex + 1} / {productImages.length}
          </div>
        </div>
      </div>

      {/* Lightbox modal — full-screen slider triggered by click on the
          main image. Portaled to <body> so its z-index isn't trapped
          by the gallery's sticky-wrapper stacking context (otherwise
          the mobile sticky Add-to-Cart bar, also portaled to body,
          renders over the lightbox's thumbnail rail). */}
      {lightboxOpen && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close gallery"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main image — click on it shouldn't close the modal. Touch
              and mouse drag both navigate prev/next via the swipe
              handlers above. */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={lightboxTouchStart}
            onTouchEnd={lightboxTouchEnd}
            onMouseDown={lightboxMouseDown}
            onMouseUp={lightboxMouseUp}
            onMouseLeave={lightboxMouseLeave}
          >
            {productImages[lightboxIndex]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImages[lightboxIndex].url}
                alt={productImages[lightboxIndex].alt}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                draggable={false}
              />
            ) : (
              <div className="text-9xl">
                {productImages[lightboxIndex]?.emoji}
              </div>
            )}
          </div>

          {/* Thumbnail rail at bottom */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-2xl bg-white/10 max-w-[90vw] overflow-x-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {productImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                aria-label={`Show image ${i + 1}`}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all ${
                  i === lightboxIndex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black/85"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${img.bg} flex items-center justify-center`}
                  >
                    <span className="text-xl">{img.emoji}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/90 text-sm font-medium px-3 py-1 rounded-full bg-white/10">
            {lightboxIndex + 1} / {productImages.length}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
