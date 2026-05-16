"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import StarRating from "./StarRating";
import Image from "next/image";
import { API_BASE_URL, decodeHtmlEntities } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";

interface RelatedProduct {
  id: number;
  externalId: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  price: number;
  displayPrice: string;
  /** Strikethrough "was" price; `null` when the product isn't discounted. */
  comparePrice: number | null;
  displayComparePrice: string | null;
  /** Whole-number percent off; `null` when not discounted. */
  discountPercent: number | null;
  url: string;
}

export default function RelatedProducts({ productId }: { productId: string | null }) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleItem } = useWishlist();

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    async function fetchRelated() {
      try {
        // 2 rows × 4 columns = 8 products. Anything beyond would force a
        // partially-filled 3rd row.
        const res = await fetch(
          `${API_BASE_URL}/products/${encodeURIComponent(productId!)}/related?limit=8`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { items?: RelatedProduct[] };
        if (!cancelled) {
          const items = (data.items ?? [])
            .slice(0, 8)
            .map((p) => ({
              ...p,
              name: p.name ? decodeHtmlEntities(p.name) : p.name,
            }));
          setProducts(items);
        }
      } catch (err) {
        console.error("Failed to fetch related products", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <section className="py-12 bg-[#f7f7f7] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm">Loading more products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-4 bg-[#f7f7f7] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            You might love these
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.url || `/product-p${product.id}`}
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 text-3xl">
                    🎁
                  </div>
                )}
                {product.discountPercent != null && product.discountPercent > 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-[#ff6b6b] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    -{product.discountPercent}%
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void toggleItem(product.id);
                  }}
                  aria-label={
                    isInWishlist(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  aria-pressed={isInWishlist(product.id)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 transition-all ${
                    isInWishlist(product.id)
                      ? "bg-[#ff6b6b] text-white opacity-100"
                      : "bg-white/90 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-[#ff6b6b]"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isInWishlist(product.id) ? "fill-current" : ""
                    }`}
                    strokeWidth={2.2}
                  />
                </button>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1.5 flex-1">
                  {product.name}
                </p>

                {/* Static rating placeholder — replace once we track reviews. */}
                <StarRating rating={5.0} count={42} />

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-bold text-gray-900 text-sm">
                    {product.displayPrice}
                  </span>
                  {product.displayComparePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {product.displayComparePrice}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
