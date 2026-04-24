"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const productImages = [
  {
    id: 1,
    alt: "Graduation sash with cartoon character – front view",
    bg: "from-purple-100 to-pink-100",
    emoji: "🎓",
    label: "Front View",
  },
  {
    id: 2,
    alt: "Graduation sash personalised with name",
    bg: "from-teal-100 to-cyan-100",
    emoji: "✨",
    label: "Name Detail",
  },
  {
    id: 3,
    alt: "Graduation sash worn by graduate",
    bg: "from-yellow-100 to-orange-100",
    emoji: "🎉",
    label: "Worn Style",
  },
  {
    id: 4,
    alt: "Graduation sash – gold cartoon character",
    bg: "from-blue-100 to-indigo-100",
    emoji: "⭐",
    label: "Gold Edition",
  },
  {
    id: 5,
    alt: "Graduation sash gift packaging",
    bg: "from-rose-100 to-pink-100",
    emoji: "🎁",
    label: "Gift Box",
  },
  {
    id: 6,
    alt: "Graduation sash close-up embroidery",
    bg: "from-green-100 to-emerald-100",
    emoji: "🪡",
    label: "Embroidery",
  },
  {
    id: 7,
    alt: "Graduation sash – size reference",
    bg: "from-violet-100 to-purple-100",
    emoji: "📏",
    label: "Size Guide",
  },
  {
    id: 8,
    alt: "Graduation sash – care instructions",
    bg: "from-amber-100 to-yellow-100",
    emoji: "💝",
    label: "Keepsake",
  },
];

export default function ProductGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? productImages.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === productImages.length - 1 ? 0 : i + 1));

  const active = productImages[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative group rounded-2xl overflow-hidden bg-gray-50 aspect-square">
        <div
          className={`w-full h-full bg-gradient-to-br ${active.bg} flex items-center justify-center cursor-zoom-in`}
          onClick={() => setZoomed(!zoomed)}
        >
          <div className="text-center">
            <div className="text-8xl mb-4">{active.emoji}</div>
            <p className="text-gray-500 text-sm font-medium">{active.label}</p>
            <p className="text-gray-400 text-xs mt-1 max-w-[180px] mx-auto">
              {active.alt}
            </p>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={next}
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

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {productImages.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
              i === activeIndex
                ? "ring-2 ring-[#2a9d8f] ring-offset-1"
                : "ring-1 ring-gray-200 hover:ring-[#2a9d8f] opacity-70 hover:opacity-100"
            }`}
          >
            <div
              className={`w-full h-full bg-gradient-to-br ${img.bg} flex items-center justify-center`}
            >
              <span className="text-2xl">{img.emoji}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
