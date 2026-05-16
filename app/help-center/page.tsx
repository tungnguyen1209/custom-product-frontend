"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api";

const CATEGORIES = [
  { id: "order", label: "Order issue" },
  { id: "shipping", label: "Shipping / delivery" },
  { id: "product", label: "Product question" },
  { id: "refund", label: "Refund / return" },
  { id: "payment", label: "Payment / billing" },
  { id: "other", label: "Other" },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How long until my order ships?",
    a: "Personalised items are hand-finished within 2–3 business days, then handed to the carrier. Standard delivery adds another 10–12 business days; express adds 6–8.",
  },
  {
    q: "Can I change my design after ordering?",
    a: "We freeze the design as soon as production starts (usually within an hour of checkout). If you spot a typo, open a ticket below with your order number and we'll catch it if we can.",
  },
  {
    q: "What's your return policy?",
    a: "30 days from delivery. Personalised items can be returned for defects or damage on arrival — submit a ticket with photos and we'll arrange a replacement or refund.",
  },
  {
    q: "Where do you ship?",
    a: "Worldwide, with tracked shipping. ETAs on the product page are quoted for US addresses; international orders can take longer depending on customs.",
  },
  {
    q: "I never got my confirmation email — what now?",
    a: "Check spam first, then track your order via the order tracking page using the email you used at checkout. If it's still missing, open a ticket below.",
  },
];

export default function HelpCenterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderNumber: "",
    category: "order",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{
    ticketNumber: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const onChange = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        orderNumber: form.orderNumber.trim() || undefined,
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      };
      const data = await apiRequest("/support/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCreatedTicket({
        ticketNumber: data.ticketNumber,
        email: data.email,
      });
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't submit your ticket. Please double-check the form and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff0f0] flex items-center justify-center mb-4">
              <LifeBuoy className="w-7 h-7 text-[#ff6b6b]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Help center</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
              Browse common questions below, or send a ticket and our team
              will reply within one business day.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/help-center/track"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff6b6b] hover:underline"
              >
                <Search className="w-4 h-4" /> Track an existing ticket
              </Link>
              <span className="text-gray-300">·</span>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff6b6b] hover:underline"
              >
                <Search className="w-4 h-4" /> Track an order
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* FAQ */}
            <section className="lg:col-span-3">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Common questions
              </h2>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {FAQ.map((item, i) => {
                  const open = openFaqIdx === i;
                  return (
                    <div
                      key={item.q}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <button
                        onClick={() => setOpenFaqIdx(open ? null : i)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:text-[#ff6b6b] transition-colors"
                      >
                        {item.q}
                        {open ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {open && (
                        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ticket form */}
            <section className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Send us a ticket
              </h2>
              {createdTicket ? (
                <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                  <p className="text-base font-bold text-gray-900 mb-1">
                    Ticket created
                  </p>
                  <p className="text-sm text-gray-500 mb-4 max-w-xs">
                    Save this ticket number — you can use it to check the
                    status of your request anytime.
                  </p>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Ticket number
                    </p>
                    <p className="text-base font-bold text-gray-900 font-mono">
                      {createdTicket.ticketNumber}
                    </p>
                  </div>
                  <Link
                    href={`/help-center/track?ticketNumber=${encodeURIComponent(
                      createdTicket.ticketNumber,
                    )}&email=${encodeURIComponent(createdTicket.email)}`}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-semibold transition-colors"
                  >
                    Check ticket status
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
                >
                  <Field label="Your name" required>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      className={inputCls}
                      placeholder="Sarah Johnson"
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => onChange("email", e.target.value)}
                      className={inputCls}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Order number (optional)">
                    <input
                      type="text"
                      maxLength={100}
                      value={form.orderNumber}
                      onChange={(e) =>
                        onChange("orderNumber", e.target.value)
                      }
                      className={inputCls}
                      placeholder="ORD-1234567890-ABCDE"
                    />
                  </Field>
                  <Field label="Category" required>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => onChange("category", e.target.value)}
                      className={`${inputCls} bg-white`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Subject" required>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={255}
                      value={form.subject}
                      onChange={(e) => onChange("subject", e.target.value)}
                      className={inputCls}
                      placeholder="Short summary"
                    />
                  </Field>
                  <Field label="Message" required>
                    <textarea
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      value={form.message}
                      onChange={(e) => onChange("message", e.target.value)}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us what's going on…"
                    />
                  </Field>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full py-3 rounded-2xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#ff6b6b]/20 disabled:opacity-60 disabled:cursor-wait"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending…" : "Send ticket"}
                  </button>
                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const inputCls =
  "w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent placeholder:text-gray-400";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
