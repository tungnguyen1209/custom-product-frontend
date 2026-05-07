"use client";

import { useState } from "react";
import { Truck, Clock, RefreshCw, ChevronDown, ChevronUp, Package } from "lucide-react";

const shippingOptions = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    days: "10–12 ngày làm việc",
    price: "35.000đ",
    icon: "📦",
  },
  {
    id: "express",
    name: "Giao hàng nhanh",
    days: "6–8 ngày làm việc",
    price: "55.000đ",
    icon: "🚀",
  },
  {
    id: "urgent",
    name: "Giao hàng hỏa tốc",
    days: "4–6 ngày làm việc",
    price: "120.000đ",
    icon: "⚡",
  },
];

export default function ShippingInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Trust badges row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/50">
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <Truck className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Miễn phí ship</span>
          <span className="text-[10px] text-gray-400">Đơn từ 500k</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <RefreshCw className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Đổi trả 30 ngày</span>
          <span className="text-[10px] text-gray-400">Yên tâm mua sắm</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <Package className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Hộp quà cao cấp</span>
          <span className="text-[10px] text-gray-400">Luôn đi kèm</span>
        </div>
      </div>

      {/* Shipping options toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#ff6b6b]" />
          Xem các tùy chọn vận chuyển
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
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{opt.name}</p>
                <p className="text-xs text-gray-500">{opt.days}</p>
              </div>
              <span className="text-sm font-black text-gray-900">
                {opt.price}
              </span>
            </div>
          ))}
          <div className="px-5 py-4 bg-[#fff0f0]">
            <p className="text-[11px] text-[#ee5253] leading-relaxed">
              💝 Đặt hàng trước ngày <strong>20/05/2026</strong> để đảm bảo nhận quà đúng dịp Ngày Của Cha.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
