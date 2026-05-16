"use client";

import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: string;
  total: number;
  shippingCost: number;
  subtotal: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
  };
  items: OrderItem[];
  createdAt: string;
}

/** Stepper config — order matters and matches the OrderStatus enum
 *  progression on the backend. "cancelled" is rendered separately
 *  because it short-circuits the normal flow. */
const STEPS: Array<{
  key: Order["status"];
  label: string;
  Icon: typeof Package;
}> = [
  { key: "pending", label: "Order placed", Icon: Clock },
  { key: "confirmed", label: "Confirmed", Icon: CheckCircle },
  { key: "processing", label: "In production", Icon: Package },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: CheckCircle },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      const data = await apiRequest(`/orders/track?${params.toString()}`);
      setOrder(data);
    } catch {
      setError(
        "We couldn't find an order matching that number and email. Please double-check both fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepIndex =
    order != null
      ? STEPS.findIndex((s) => s.key === order.status)
      : -1;
  const cancelled = order?.status === "cancelled";

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff0f0] flex items-center justify-center mb-4">
              <Truck className="w-7 h-7 text-[#ff6b6b]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Track your order
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Enter the order number we sent in your confirmation email along
              with the email used at checkout.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 mb-8"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Order number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-1234567890-ABCDE"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent placeholder:text-gray-400"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-2xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ff6b6b]/20 disabled:opacity-60 disabled:cursor-wait"
            >
              <Search className="w-4 h-4" />
              {loading ? "Looking up…" : "Track order"}
            </button>
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {order && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Order
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                    cancelled
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : "bg-[#fff0f0] text-[#ff6b6b] border border-[#ff6b6b]/20"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Status stepper */}
              {cancelled ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    This order has been cancelled. Contact support if you
                    didn&apos;t expect this.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 relative">
                  <div className="absolute top-5 left-[10%] right-[10%] h-px bg-gray-200" />
                  {STEPS.map((s, i) => {
                    const done = stepIndex >= i;
                    const current = stepIndex === i;
                    return (
                      <div
                        key={s.key}
                        className="flex flex-col items-center text-center gap-1.5 relative"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                            done
                              ? current
                                ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/30"
                                : "bg-emerald-100 text-emerald-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <s.Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[11px] font-semibold leading-tight ${
                            done ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                  Items
                </p>
                <ul className="flex flex-col gap-2">
                  {order.items.map((it, idx) => (
                    <li
                      key={`${it.productName}-${idx}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-800 truncate">
                        {it.productName}{" "}
                        <span className="text-gray-400">× {it.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">
                        ${(it.unitPrice * it.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-5 grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-right text-gray-800">
                  ${order.subtotal.toFixed(2)}
                </span>
                <span className="text-gray-500">Shipping</span>
                <span className="text-right text-gray-800">
                  ${order.shippingCost.toFixed(2)}
                </span>
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-right font-bold text-gray-900">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              {/* Shipping address */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                  Shipping to
                </p>
                <p className="text-sm text-gray-800">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-gray-500 leading-snug">
                  {order.shippingAddress.street}, {order.shippingAddress.suburb}
                  ,{" "}
                  {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postcode},{" "}
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
