"use client";

import Link from "next/link";
import { Star, Eye, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  category: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  isNew?: boolean;
  inStock: boolean;
}

export default function ProductCard({
  id,
  slug,
  name,
  category,
  originalPrice,
  discountPrice,
  discountPercent,
  rating,
  reviewCount,
  image,
  isNew,
  inStock,
}: ProductCardData) {
  const hasDiscount = discountPercent > 0;
  const roundedRating = Math.round(rating);
  const { isInWishlist, toggleItem } = useWishlist();
  const saved = isInWishlist(id);

  // The whole card is a Link; the heart sits on top of the image. We
  // both stopPropagation AND preventDefault — propagation alone leaves
  // Next.js's <Link> intercepting the click on the parent.
  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleItem(id);
  };

  return (
    <Link
      href={`/${slug + '-p' + id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isNew && (
            <span className="px-2 py-0.5 bg-[#ff6b6b] text-white text-[11px] font-bold rounded-full shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 transition-all ${
            saved
              ? "bg-[#ff6b6b] text-white"
              : "bg-white/95 text-gray-500 hover:text-[#ff6b6b]"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
            strokeWidth={2.2}
          />
        </button>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 bg-gray-800/90 text-white text-xs font-semibold rounded-full tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover quick-view pill */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md ring-1 ring-black/5">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* ── Info ──────────────────────────────────────────────────────── */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <span className="text-[11px] text-[#ff6b6b] font-semibold uppercase tracking-wider">
          {category}
        </span>

        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#ff6b6b] transition-colors duration-200">
          {name}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= roundedRating
                    ? "fill-[#e9b44c] text-[#e9b44c]"
                    : "fill-gray-100 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 tabular-nums">
            ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-gray-900">
            ${discountPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          {hasDiscount && (
            <span className="ml-auto text-[11px] font-semibold text-red-500">
              Save ${(originalPrice - discountPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
