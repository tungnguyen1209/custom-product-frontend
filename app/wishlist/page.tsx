"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { wishlist, loading, removeItem } = useWishlist();
  const items = wishlist?.items ?? [];

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#ff6b6b]/20 border-t-[#ff6b6b] rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff0f0] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#ff6b6b]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Your wishlist
                </h1>
                <p className="text-sm text-gray-500">
                  {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-sm text-[#ff6b6b] hover:underline font-medium"
            >
              Continue shopping →
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl py-20 px-6 flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#fff0f0] flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-[#ff6b6b]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Save products you love to come back to them later. Tap the
                heart on any product to add it here.
              </p>
              <Link
                href="/products"
                className="px-5 py-2.5 rounded-2xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                Browse products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const href = item.slug
                  ? `/${item.slug}`
                  : `/product-p${item.productId}`;
                const onSale =
                  item.comparePrice != null &&
                  item.comparePrice > item.basePrice;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                  >
                    <Link href={href} className="relative block">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 text-3xl">
                            🎁
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3 flex flex-col flex-1">
                      <Link href={href} className="flex-1">
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-2">
                          {item.productName}
                        </p>
                      </Link>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-bold text-gray-900 text-sm">
                          ${item.basePrice.toFixed(2)}
                        </span>
                        {onSale && item.comparePrice != null && (
                          <span className="text-xs text-gray-400 line-through">
                            ${item.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={href}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Customize
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label="Remove from wishlist"
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
