"use client";

import { useEffect, useState } from "react";

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export interface PriceChangeDetail {
  price: number | null;
  comparePrice?: number | null;
  variantId?: string | null;
}

export default function DynamicPrice({
  basePrice,
  baseComparePrice = null,
}: {
  basePrice: number;
  baseComparePrice?: number | null;
}) {
  const [price, setPrice] = useState<number>(basePrice);
  const [comparePrice, setComparePrice] = useState<number | null>(
    baseComparePrice,
  );

  useEffect(() => {
    setPrice(basePrice);
  }, [basePrice]);

  useEffect(() => {
    setComparePrice(baseComparePrice);
  }, [baseComparePrice]);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<PriceChangeDetail>).detail;
      if (!detail) return;
      if (detail.price != null && !Number.isNaN(detail.price)) {
        setPrice(detail.price);
      }
      setComparePrice(
        detail.comparePrice != null && !Number.isNaN(detail.comparePrice)
          ? detail.comparePrice
          : null,
      );
    };
    window.addEventListener("wm-price-update", onUpdate);
    return () => window.removeEventListener("wm-price-update", onUpdate);
  }, []);

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-bold text-gray-900">
        {formatPrice(price)}
      </span>
      {comparePrice != null && comparePrice > price && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(comparePrice)}
          </span>
          <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
          </span>
        </>
      )}
    </div>
  );
}
