"use client";

import { useState } from "react";
import { Truck, ShoppingCart, Package, RefreshCw } from "lucide-react";

/** Add N calendar days to a date, returning a new Date (does not mutate). */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** "May 16" */
function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "May 18-19" when same month, "Apr 28 – May 2" when spanning months. */
function fmtRange(a: Date, b: Date): string {
  const sameMonth =
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  if (sameMonth) {
    const month = a.toLocaleDateString("en-US", { month: "short" });
    return `${month} ${a.getDate()}-${b.getDate()}`;
  }
  return `${fmtDay(a)} – ${fmtDay(b)}`;
}

export default function ShippingInfo() {
  // DeferMount wraps this component, so it only mounts client-side once
  // scrolled into view — no SSR hydration mismatch from `new Date()`.
  const [today] = useState(() => new Date());
  const shipsStart = addDays(today, 2);
  const shipsEnd = addDays(today, 3);
  const deliveredStart = addDays(today, 10);
  const deliveredEnd = addDays(today, 15);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Trust badges row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/50">
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <Truck className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Tracked Shipping</span>
          <span className="text-[10px] text-gray-400">Worldwide delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <Package className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Made-to-Order</span>
          <span className="text-[10px] text-gray-400">Ready in 2–3 days</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-5 px-2 text-center">
          <RefreshCw className="w-5 h-5 text-[#ff6b6b]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">30-Day Returns</span>
          <span className="text-[10px] text-gray-400">Hassle-free policy</span>
        </div>
      </div>

      {/* Delivery ETA timeline */}
      <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-gray-700 flex-shrink-0" strokeWidth={1.8} />
          <p className="text-sm text-gray-800 leading-snug">
            Arrives by <strong>{fmtRange(deliveredStart, deliveredEnd)}</strong>{" "}
            if you order today. Hooray!
          </p>
        </div>

        <div className="relative">
          {/* Connector line — sits behind the circles via z-index. The
              left/right insets push the line to the centers of columns 1
              and 3 so it doesn't poke past the outer circles. */}
          <div className="absolute top-5 left-[16.67%] right-[16.67%] h-px bg-amber-200" />

          <div className="relative grid grid-cols-3 gap-2">
            <Step
              icon={<ShoppingCart className="w-4 h-4 text-gray-700" strokeWidth={2} />}
              date={fmtDay(today)}
              label="Order placed"
            />
            <Step
              icon={<Truck className="w-4 h-4 text-gray-700" strokeWidth={2} />}
              date={fmtRange(shipsStart, shipsEnd)}
              label="Order ships"
            />
            <Step
              icon={<Package className="w-4 h-4 text-gray-700" strokeWidth={2} />}
              date={fmtRange(deliveredStart, deliveredEnd)}
              label="Delivered!"
            />
          </div>
        </div>

        <p className="text-xs text-[#ff6b6b] leading-relaxed">
          *ETA is applied for US only, international orders may take longer.
        </p>
      </div>
    </div>
  );
}

function Step({
  icon,
  date,
  label,
}: {
  icon: React.ReactNode;
  date: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center relative z-10">
        {icon}
      </div>
      <div className="text-sm font-bold text-gray-900 leading-tight">{date}</div>
      <div className="text-xs text-gray-500 leading-tight">{label}</div>
    </div>
  );
}
