"use client";

import { ZoomIn } from "lucide-react";
import TemplatePreviewLoader from "@/components/TemplatePreviewLoader";
import StickyPreviewWrapper from "@/components/StickyPreviewWrapper";

interface Props {
  gallery: string[];
  alt: string;
}

export default function ProductGallerySection({ gallery, alt }: Props) {
  const handleZoom = () => {
    window.dispatchEvent(new CustomEvent("wm-request-preview"));
  };

  return (
    // `sticky top-* z-*` removed from the inner wrapper — the page-level
    // outer sticky wrapper (in `[productSlug]/page.tsx`) now pins the
    // gallery and the personalization-progress bar together. Leaving an
    // inner sticky here caused the gallery to outlive the outer wrapper's
    // pin window: as the outer released at the row boundary, the inner
    // kept sticking and (with its old z-40) painted over the progress
    // bar siblings inside the same wrapper. `StickyPreviewWrapper`'s JS
    // still works against `getBoundingClientRect` — it just reads the
    // outer's pinned position now, which lines up with the 96/128
    // thresholds it already uses for the mobile width-shrink effect.
    <StickyPreviewWrapper
      onClick={handleZoom}
      className="bg-white lg:bg-transparent -mx-4 lg:mx-0 shadow-md lg:shadow-none cursor-pointer group"
    >
      <TemplatePreviewLoader gallery={gallery} alt={alt} />

      {/* Desktop zoom hint */}
      <div className="hidden lg:group-hover:flex absolute inset-0 items-center justify-center bg-black/5 transition-colors rounded-2xl pointer-events-none">
        <div className="bg-white/90 p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
          <ZoomIn className="w-6 h-6 text-[#ff6b6b]" />
        </div>
      </div>

      {/* Mobile Live + Zoom hint */}
      <div className="lg:hidden absolute top-4 right-6 flex items-center gap-2">
        <span className="bg-[#ff6b6b] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
          Live
        </span>
        <div className="bg-white/90 p-1.5 rounded-full shadow-md text-[#ff6b6b]">
          <ZoomIn className="w-3.5 h-3.5" />
        </div>
      </div>
    </StickyPreviewWrapper>
  );
}
