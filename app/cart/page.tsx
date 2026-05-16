"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronRight, Minus, Plus, Trash2, ShoppingBag,
  Tag, Lock, ArrowRight, Gift,
} from "lucide-react";

/* ─── Mock data ────────────────────────────────────────────────────────── */

const INITIAL_ITEMS = [
  {
    id: 1,
    name: "Personalised Grad Cap Cartoon Character Graduation Sash",
    variant: "Gold · Class of 2026",
    price: 37.00,
    original: 52.00,
    qty: 1,
    emoji: "🎓",
    bg: "from-purple-100 to-pink-100",
    tags: [["Character", "Gold Bear"], ["Name", "Emily Johnson"], ["Year", "2026"]],
  },
  {
    id: 2,
    name: "Personalised Graduation Frame – Class of 2026",
    variant: "Silver · Landscape",
    price: 28.00,
    original: null,
    qty: 1,
    emoji: "🖼️",
    bg: "from-blue-100 to-indigo-100",
    tags: [["Style", "Silver"], ["Orientation", "Landscape"]],
  },
];

const FLAT_SHIPPING_RATE = 9.95;

/* ─── Cart item row ────────────────────────────────────────────────────── */

function CartItem({
  item,
  onQty,
  onRemove,
}: {
  item: any;
  onQty: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4">
      <div className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden`}>
        {item.previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewImageUrl}
            alt={item.productName}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-3xl">🎁</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{item.productName}</h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(item.customization).map(([k, v]: [string, any]) => (
                <span key={k} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onRemove} className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => onQty(-1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => onQty(1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "ok" | "err">("idle");
  const [giftMsg, setGiftMsg] = useState("");

  const items = cart?.items || [];

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = promoState === "ok" ? subtotal * 0.1 : 0;
  const shipping = items.length === 0 ? 0 : FLAT_SHIPPING_RATE;
  const total = subtotal - discount + shipping;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "GRAD10") {
      setPromoState("ok");
    } else {
      setPromoState("err");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#ff6b6b]/20 border-t-[#ff6b6b] rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  /* Empty state */
  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-4">
          <div className="w-20 h-20 rounded-full bg-[#fff0f0] flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[#ff6b6b]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm">Add some personalised gifts to get started.</p>
          </div>
          <Link href="/" className="px-6 py-3 rounded-2xl bg-[#ff6b6b] text-white font-semibold text-sm hover:bg-[#ee5253] transition-colors flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
            {["Home", "Cart"].map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <a href="#" className="hover:text-[#ff6b6b] transition-colors">{crumb}</a>
              </span>
            ))}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: items ──────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Cart{" "}
                  <span className="text-gray-400 font-normal text-base">({totalQty} items)</span>
                </h1>
                <Link href="/" className="text-sm text-[#ff6b6b] hover:underline font-medium">
                  ← Continue shopping
                </Link>
              </div>

              {/* Items */}
              {items.map(item => (
                <CartItem
                  key={item.id ?? `${item.productId}-${item.customizationHash ?? ''}`}
                  item={item}
                  onQty={(d) =>
                    item.id != null && updateItem(item.id, item.quantity + d)
                  }
                  onRemove={() =>
                    item.id != null && removeItem(item.id)
                  }
                />
              ))}

              {/* Gift message */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-[#ff6b6b]" />
                  <span className="text-sm font-semibold text-gray-800">Add a gift message (optional)</span>
                </div>
                <textarea
                  value={giftMsg}
                  onChange={e => setGiftMsg(e.target.value)}
                  placeholder="Write a personal message for the recipient..."
                  rows={3}
                  maxLength={200}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] resize-none placeholder:text-gray-300"
                />
                <p className="text-right text-xs text-gray-300 mt-1">{giftMsg.length}/200</p>
              </div>
            </div>

            {/* ── Right: summary ────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

                  {/* Promo */}
                  <div className="flex gap-2 mb-1">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={promo}
                        onChange={e => { setPromo(e.target.value); setPromoState("idle"); }}
                        placeholder="Promo code"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                      />
                    </div>
                    <button
                      onClick={applyPromo}
                      className="px-3 py-2 text-sm font-semibold bg-[#ff6b6b] text-white rounded-xl hover:bg-[#ee5253] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoState === "ok" && <p className="text-xs text-[#ff6b6b] font-medium mb-3">✓ 10% discount applied!</p>}
                  {promoState === "err" && <p className="text-xs text-red-400 mb-3">Invalid code — try GRAD10</p>}

                  {/* Totals */}
                  <div className="flex flex-col gap-2.5 text-sm border-t border-gray-100 pt-4 mt-2">
                    <Row label={`Subtotal (${totalQty} items)`} value={`$${subtotal.toFixed(2)}`} />
                    {discount > 0 && (
                      <Row label="Promo (10%)" value={`-$${discount.toFixed(2)}`} highlight />
                    )}
                    <Row
                      label="Shipping"
                      value={shipping === 0 ? "—" : `$${shipping.toFixed(2)}`}
                    />
                    <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3 mt-1">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 -mt-1">Including GST</p>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-4 w-full py-3.5 rounded-2xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ff6b6b]/20"
                  >
                    <Lock className="w-4 h-4" /> Proceed to Checkout
                  </Link>
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Secure & encrypted checkout
                  </p>
                </div>

                {/* Trust */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5">
                  {[
                    ["🔒", "SSL encrypted & secure"],
                    ["📦", "Tracked shipping on every order"],
                    ["↩️", "99-day hassle-free returns"],
                    ["✨", "Hand-finished, made to order"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500">
                      <span className="text-base leading-none">{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Payment methods */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-400">We accept</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"].map(m => (
                      <span key={m} className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-500 font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between ${highlight ? "text-[#ff6b6b] font-medium" : "text-gray-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
