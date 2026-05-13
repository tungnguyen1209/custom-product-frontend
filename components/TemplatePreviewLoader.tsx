"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ isUserInteraction?: boolean }>).detail;
      if (detail?.isUserInteraction) {
        setShowCanvas(true);
        // We probably don't want to remove the listener if we allow switching back and forth
      }
    };
    window.addEventListener("wm-template-update", handleUpdate);
    return () => window.removeEventListener("wm-template-update", handleUpdate);
  }, []);

  // Only render <TemplatePreview /> after the user opts into the live canvas.
  // Otherwise the dynamic import (Fabric.js, ~300KB) fires on page load and
  // blocks the main thread even though the canvas is CSS-hidden.
  return (
    <ProductGallery
      showCanvas={showCanvas}
      setShowCanvas={setShowCanvas}
      canvas={showCanvas ? <TemplatePreview /> : null}
      images={gallery}
      alt={alt}
    />
  );
}
