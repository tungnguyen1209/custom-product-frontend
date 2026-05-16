"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniCart({ open, onClose }: MiniCartProps) {
  const { cart, updateItem, removeItem } = useCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#ff6b6b]" />
            <h2 className="text-base font-bold text-gray-900">
              Your Cart {items.length > 0 && <span className="text-gray-400 font-medium">({items.length})</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-9 h-9 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Discover personalized gifts your loved ones will adore.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-bold transition-colors"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li
                  key={item.id ?? `${item.productId}-${item.customizationHash ?? ''}`}
                  className="flex gap-3 px-5 py-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                    {item.previewImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewImageUrl}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🎁</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => item.id != null && removeItem(item.id)}
                        className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {Object.keys(item.customization || {}).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(item.customization).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            item.id != null && updateItem(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            item.id != null && updateItem(item.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                        {item.comparePrice != null &&
                          item.comparePrice > item.unitPrice && (
                            <div className="text-[11px] text-gray-400 line-through leading-none">
                              ${(item.comparePrice * item.quantity).toFixed(2)}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-2">Shipping &amp; taxes calculated at checkout.</p>
            <div className="flex gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex-1 py-3 rounded-full border border-gray-200 hover:border-gray-300 text-center text-sm font-semibold text-gray-700 transition-colors"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-center text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#ff6b6b]/20"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
