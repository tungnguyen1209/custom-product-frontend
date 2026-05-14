"use client";

import { useEffect, useState, useRef } from "react";
import { Heart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "./StarRating";
import Image from "next/image";
import { API_BASE_URL, decodeHtmlEntities } from "@/lib/api";

interface RelatedProduct {
  id: number;
  externalId: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  price: number;
  displayPrice: string;
  url: string;
}

export default function RelatedProducts({ productId }: { productId: string | null }) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (!scrollRef.current) return;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    async function fetchRelated() {
      try {
        // 2 rows × max 5 columns = 10 products. Anything beyond would force
        // a 6th column and break the "max 5 per row" requirement.
        const res = await fetch(
          `${API_BASE_URL}/products/${encodeURIComponent(productId!)}/related?limit=10`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { items?: RelatedProduct[] };
        if (!cancelled) {
          const items = (data.items ?? [])
            .slice(0, 10)
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
    <section className="py-4 bg-[#f7f7f7] border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            You might love these
          </h2>
          
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-all bg-white shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-all bg-white shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Horizontal scroll container with 2 rows */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none scroll-smooth"
        >
          <div
            className="gap-4 w-max"
            style={{
              display: "grid",
              // Always 5 columns — items fill row 1 left-to-right first, then
              // wrap into row 2. 8 items → row 1: 5, row 2: 3 (cols 4-5 empty).
              gridTemplateColumns: "repeat(5, auto)",
            }}
          >
            {products.map((product) => (
              <a
                key={product.id}
                href={product.url || `/product-p${product.id}`}
                rel="noopener noreferrer"
                className="group bg-white w-44 sm:w-56 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col snap-start shrink-0"
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
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <Heart className="w-3.5 h-3.5 text-gray-500" />
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
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}