"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ProductGallery from "./ProductGallery";

const TemplatePreview = dynamic(
  () => import("./TemplatePreview"),
  { ssr: false, loading: () => <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" /> },
);

export default function TemplatePreviewLoader() {
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

  return <ProductGallery showCanvas={showCanvas} setShowCanvas={setShowCanvas} canvas={<TemplatePreview />} />;
}
