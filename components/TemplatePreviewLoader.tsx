"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import ProductGallery from "./ProductGallery";

const TemplatePreview = dynamic(
  () => import("./TemplatePreview"),
  { ssr: false, loading: () => <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" /> },
);

interface Props {
  gallery?: string[];
  alt?: string;
}

export default function TemplatePreviewLoader({ gallery, alt }: Props) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [chunkReady, setChunkReady] = useState(false);

  // Pre-load the canvas chunk (Fabric.js + TemplatePreview, ~300KB) right
  // after mount so the moment the user touches a real personalization
  // control the canvas appears instantly instead of pulling the chunk
  // mid-interaction. Failure here isn't fatal — when the user engages,
  // the dynamic boundary will retry on real mount.
  useEffect(() => {
    let cancelled = false;
    import("./TemplatePreview")
      .then(() => {
        if (!cancelled) setChunkReady(true);
      })
      .catch(() => {
        // Swallow — the lazy boundary will retry on real mount.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ isUserInteraction?: boolean }>).detail;
      // Only flip when the producer (CustomizationForm) explicitly marks
      // this as a canvas-reveal interaction. Variant changes (size/style/
      // colour pills) pass `isUserInteraction: false` so the gallery stays
      // on static images until the customer actually starts personalizing.
      if (detail?.isUserInteraction) {
        setShowCanvas(true);
        // Leave the listener attached — going back to the gallery via the
        // thumbnail strip toggles showCanvas off, and a subsequent design
        // edit should re-reveal the canvas without a remount.
      }
    };
    window.addEventListener("wm-template-update", handleUpdate);
    return () => window.removeEventListener("wm-template-update", handleUpdate);
  }, []);

  return (
    <div className="relative">
      <ProductGallery
        showCanvas={showCanvas}
        setShowCanvas={setShowCanvas}
        canvas={showCanvas ? <TemplatePreview /> : null}
        images={gallery}
        alt={alt}
      />
      {/* Subtle status badge over the gallery so the user knows the live
          preview is being prepared in the background. Hidden once the
          canvas has taken over (showCanvas === true). */}
      {!showCanvas && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20">
          <div
            className={`flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold shadow-md backdrop-blur transition-opacity duration-300 ${
              chunkReady ? "text-gray-700" : "text-gray-500"
            }`}
          >
            {chunkReady ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Personalization ready
              </>
            ) : (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[#ff6b6b]" />
                Loading preview…
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
