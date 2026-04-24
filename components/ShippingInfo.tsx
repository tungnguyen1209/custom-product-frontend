"use client";

import { useState } from "react";
import { Truck, Clock, RefreshCw, ChevronDown, ChevronUp, Package } from "lucide-react";

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    days: "10–12 business days",
    price: "AU$6.00",
    icon: "📦",
  },
  {
    id: "express",
    name: "Express Shipping",
    days: "6–8 business days",
    price: "AU$18.00",
    icon: "🚀",
  },
  {
    id: "urgent",
    name: "Urgent Shipping",
    days: "4–6 business days",
    price: "AU$36.00",
    icon: "⚡",
  },
];

export default function ShippingInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {/* Trust badges row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50">
        <div className="flex flex-col items-center gap-1 py-4 px-2 text-center">
          <Truck className="w-5 h-5 text-[#2a9d8f]" />
          <span className="text-xs font-semibold text-gray-700">Free Shipping</span>
          <span className="text-[10px] text-gray-400">Orders over AU$60</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4 px-2 text-center">
          <RefreshCw className="w-5 h-5 text-[#2a9d8f]" />
          <span className="text-xs font-semibold text-gray-700">99-Day Returns</span>
          <span className="text-[10px] text-gray-400">Hassle-free policy</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4 px-2 text-center">
          <Package className="w-5 h-5 text-[#2a9d8f]" />
          <span className="text-xs font-semibold text-gray-700">Gift Box</span>
          <span className="text-[10px] text-gray-400">Always included</span>
        </div>
      </div>

      {/* Shipping options toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2a9d8f]" />
          View shipping options
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50 fade-in">
          {shippingOptions.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{opt.name}</p>
                <p className="text-xs text-gray-500">{opt.days}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {opt.price}
              </span>
            </div>
          ))}
          <div className="px-4 py-3 bg-[#e8f5f4]">
            <p className="text-xs text-[#1a6b61]">
              🎓 Order by <strong>30 May 2026</strong> to receive before most
              graduation ceremonies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
