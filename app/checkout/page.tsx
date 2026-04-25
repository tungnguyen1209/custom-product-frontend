"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  Lock, Check, ChevronDown, ChevronUp,
  Truck, Zap, CreditCard, Shield,
} from "lucide-react";

/* ─── Mock order data ──────────────────────────────────────────────────── */

const ORDER_ITEMS = [
  { id: 1, name: "Personalised Grad Cap Graduation Sash", variant: "Gold · 2026 · Emily Johnson", price: 37.00, qty: 1, emoji: "🎓", bg: "from-purple-100 to-pink-100" },
  { id: 2, name: "Personalised Graduation Frame", variant: "Silver · Landscape", price: 28.00, qty: 1, emoji: "🖼️", bg: "from-blue-100 to-indigo-100" },
];

const SUBTOTAL = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

/* ─── Field ────────────────────────────────────────────────────────────── */

function Field({
  label, type = "text", placeholder, value, onChange, required, className,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean; className?: string;
}) {
  return (
    <div className={className ?? "w-full"}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent bg-white placeholder:text-gray-300"
      />
    </div>
  );
}

/* ─── Order summary sidebar ─────────────────────────────────────────────── */

function OrderSummary({ shippingCost, finalTotal }: { shippingCost: number; finalTotal: number }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100"
      >
        <span className="text-sm font-bold text-gray-900">Order Summary</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 py-4 flex flex-col gap-3">
          {ORDER_ITEMS.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center relative`}>
                <span className="text-xl">{item.emoji}</span>
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] bg-gray-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {item.qty}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-[11px] text-gray-400">{item.variant}</p>
              </div>
              <span className="text-sm font-bold text-gray-900 flex-shrink-0">AU${item.price.toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>AU${SUBTOTAL.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? "text-[#2a9d8f] font-medium" : ""}>
                {shippingCost === 0 ? "FREE" : `AU$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span>AU${finalTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 -mt-1">Including GST</p>
          </div>
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-col gap-2">
        {[["🎁", "Free gift box with every order"], ["🔒", "Secure & encrypted payment"]].map(([icon, text]) => (
          <p key={text} className="text-xs text-gray-500 flex items-center gap-2">
            <span>{icon}</span> {text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── Confirmation ──────────────────────────────────────────────────────── */

function Confirmation({ name, email }: { name: string; email: string }) {
  const ref = `CAL-${Math.floor(100000 + Math.random() * 900000)}`;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-4">
      <div className="w-20 h-20 rounded-full bg-[#e8f5f4] flex items-center justify-center">
        <Check className="w-10 h-10 text-[#2a9d8f]" strokeWidth={2.5} />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 text-sm">
          Thank you{name ? `, ${name}` : ""}! A confirmation has been sent to{" "}
          <strong>{email || "your email"}</strong>.
        </p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl px-8 py-5 text-center shadow-sm">
        <p className="text-xs text-gray-400 mb-1">Order reference</p>
        <p className="text-xl font-bold text-gray-900">#{ref}</p>
        <p className="text-xs text-gray-400 mt-2">Estimated delivery: 5–8 business days</p>
      </div>
      <Link href="/" className="text-sm text-[#2a9d8f] hover:underline font-medium">← Continue shopping</Link>
    </div>
  );
}

/* ─── Checkout header ───────────────────────────────────────────────────── */

function CheckoutHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#2a9d8f] flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">callie</span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5" /> Secure checkout
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */

type FormState = {
  email: string; firstName: string; lastName: string;
  address: string; address2: string; suburb: string;
  state: string; postcode: string; country: string; phone: string;
  shippingMethod: string;
  cardNumber: string; cardName: string; expiry: string; cvv: string;
  sameAsShipping: boolean;
};

export default function CheckoutPage() {
  const [done, setDone] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    email: "", firstName: "", lastName: "",
    address: "", address2: "", suburb: "",
    state: "VIC", postcode: "", country: "Australia", phone: "",
    shippingMethod: "standard",
    cardNumber: "", cardName: "", expiry: "", cvv: "",
    sameAsShipping: true,
  });

  const set = (key: string) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }));

  const shippingCost = form.shippingMethod === "express" ? 14.95 : 0;
  const finalTotal = SUBTOTAL + shippingCost;

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(.{2})(.+)/, "$1/$2");

  const handlePlace = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    setDone(true);
  };

  return (
    <>
      <CheckoutHeader />
      <main className="flex-1 bg-gray-50/40">
        {done ? (
          <Confirmation name={form.firstName} email={form.email} />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Mobile order summary toggle */}
            <button
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm text-[#2a9d8f] font-medium">
                <span>🛍️</span>
                {summaryOpen ? "Hide" : "Show"} order summary
                {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              <span className="text-sm font-bold text-gray-900">AU${finalTotal.toFixed(2)}</span>
            </button>

            {summaryOpen && (
              <div className="lg:hidden mb-4">
                <OrderSummary shippingCost={shippingCost} finalTotal={finalTotal} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* ── Left: contact + address ────────────────────── */}
              <div className="lg:col-span-3 flex flex-col gap-5">

                {/* Contact */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    Contact
                  </h2>
                  <Field label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
                  <p className="text-xs text-gray-400 mt-2">Order confirmation will be sent here.</p>
                </div>

                {/* Shipping address */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    Shipping Address
                  </h2>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Field label="First name" placeholder="Emily" value={form.firstName} onChange={set("firstName")} required className="flex-1 min-w-0" />
                      <Field label="Last name" placeholder="Johnson" value={form.lastName} onChange={set("lastName")} required className="flex-1 min-w-0" />
                    </div>
                    <Field label="Street address" placeholder="12 Maple Street" value={form.address} onChange={set("address")} required />
                    <Field label="Apartment, suite (optional)" placeholder="Unit 3" value={form.address2} onChange={set("address2")} />
                    <div className="flex gap-3">
                      <Field label="Suburb / City" placeholder="Melbourne" value={form.suburb} onChange={set("suburb")} required className="flex-1 min-w-0" />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">State<span className="text-red-400 ml-0.5">*</span></label>
                        <select
                          value={form.state}
                          onChange={e => set("state")(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-white appearance-none"
                        >
                          {AU_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Field label="Postcode" placeholder="3000" value={form.postcode} onChange={set("postcode")} required className="flex-1 min-w-0" />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                        <select
                          value={form.country}
                          onChange={e => set("country")(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] bg-white"
                        >
                          <option>Australia</option>
                          <option>New Zealand</option>
                        </select>
                      </div>
                    </div>
                    <Field label="Phone (for delivery notifications)" type="tel" placeholder="+61 4xx xxx xxx" value={form.phone} onChange={set("phone")} />
                  </div>
                </div>
              </div>

              {/* ── Right: order summary + shipping + payment ──── */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                  <OrderSummary shippingCost={shippingCost} finalTotal={finalTotal} />

                  {/* Shipping method */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                      Shipping Method
                    </h2>
                    <div className="flex flex-col gap-2">
                      {[
                        { value: "standard", icon: <Truck className="w-4 h-4 text-[#2a9d8f]" />, label: "Standard", eta: "5–8 business days", price: "FREE", badge: null },
                        { value: "express", icon: <Zap className="w-4 h-4 text-orange-500" />, label: "Express", eta: "2–3 business days", price: "AU$14.95", badge: "Fastest" },
                      ].map(opt => {
                        const active = form.shippingMethod === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => set("shippingMethod")(opt.value)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${active ? "border-[#2a9d8f] bg-[#e8f5f4]" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? "border-[#2a9d8f]" : "border-gray-300"}`}>
                              {active && <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" />}
                            </div>
                            {opt.icon}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-900">{opt.label}</span>
                                {opt.badge && <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
                              </div>
                              <p className="text-[11px] text-gray-500">{opt.eta}</p>
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ${opt.price === "FREE" ? "text-[#2a9d8f]" : "text-gray-900"}`}>{opt.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">4</span>
                      Payment
                    </h2>
                    <p className="text-xs text-gray-400 mb-3 ml-7 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Encrypted & secure
                    </p>

                    <div className="flex flex-col gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Card number<span className="text-red-400 ml-0.5">*</span></label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={form.cardNumber}
                            onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                            className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] font-mono tracking-wide"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                      <Field label="Name on card" placeholder="Emily Johnson" value={form.cardName} onChange={set("cardName")} required />
                      <div className="flex gap-2.5">
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry<span className="text-red-400 ml-0.5">*</span></label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={form.expiry}
                            onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] font-mono"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">CVV<span className="text-red-400 ml-0.5">*</span></label>
                          <input
                            type="text"
                            placeholder="•••"
                            maxLength={4}
                            value={form.cvv}
                            onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] font-mono tracking-widest"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                      <div
                        onClick={() => setForm(f => ({ ...f, sameAsShipping: !f.sameAsShipping }))}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${form.sameAsShipping ? "bg-[#2a9d8f] border-[#2a9d8f]" : "border-gray-300"}`}
                      >
                        {form.sameAsShipping && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-gray-700">Billing address same as shipping</span>
                    </label>
                  </div>

                  {/* Place order */}
                  <button
                    onClick={handlePlace}
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-[#2a9d8f] hover:bg-[#21867a] disabled:opacity-70 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2a9d8f]/25"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Place Order · AU${finalTotal.toFixed(2)}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 leading-relaxed">
                    By placing your order you agree to our{" "}
                    <a href="#" className="text-[#2a9d8f] hover:underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-[#2a9d8f] hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
