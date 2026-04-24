"use client";

import dynamic from "next/dynamic";

const TemplatePreview = dynamic(
  () => import("./TemplatePreview"),
  { ssr: false, loading: () => <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse" /> },
);

export default function TemplatePreviewLoader() {
  return <TemplatePreview />;
}
