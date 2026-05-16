"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/api";

interface Ticket {
  id: number;
  ticketNumber: string;
  email: string;
  name: string;
  orderNumber: string | null;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<Ticket["status"], { label: string; cls: string }> = {
  open: {
    label: "Open",
    cls: "bg-[#fff0f0] text-[#ff6b6b] border-[#ff6b6b]/20",
  },
  in_progress: {
    label: "In progress",
    cls: "bg-amber-50 text-amber-600 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  closed: {
    label: "Closed",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

function TrackTicketInner() {
  const params = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState(
    params.get("ticketNumber") ?? "",
  );
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (tn: string, em: string) => {
    if (!tn.trim() || !em.trim()) return;
    setLoading(true);
    setError(null);
    setTicket(null);
    try {
      const qs = new URLSearchParams({
        ticketNumber: tn.trim(),
        email: em.trim(),
      });
      const data = await apiRequest(
        `/support/tickets/track?${qs.toString()}`,
      );
      setTicket(data);
    } catch {
      setError(
        "We couldn't find a ticket matching that number and email. Please double-check both fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup when the page is opened from the "ticket created" success
  // screen so the customer lands directly on their ticket details.
  useEffect(() => {
    const tn = params.get("ticketNumber");
    const em = params.get("email");
    if (tn && em) void lookup(tn, em);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void lookup(ticketNumber, email);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/help-center"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#ff6b6b] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Help Center
      </Link>

      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff0f0] flex items-center justify-center mb-4">
          <LifeBuoy className="w-7 h-7 text-[#ff6b6b]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Track your ticket</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Enter the ticket number we showed you after submitting, plus the
          email you used.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 mb-8"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-800">
            Ticket number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="TCK-ABCDEF12"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent placeholder:text-gray-400 font-mono"
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
          {loading ? "Looking up…" : "Look up ticket"}
        </button>
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {ticket && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Ticket
              </p>
              <p className="text-base font-bold text-gray-900 font-mono">
                {ticket.ticketNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Opened{" "}
                {new Date(ticket.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${
                STATUS_LABELS[ticket.status].cls
              }`}
            >
              {STATUS_LABELS[ticket.status].label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Category
              </p>
              <p className="text-gray-800 capitalize">
                {ticket.category.replace("_", " ")}
              </p>
            </div>
            {ticket.orderNumber && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Related order
                </p>
                <p className="text-gray-800 font-mono">{ticket.orderNumber}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Subject
            </p>
            <p className="text-sm font-bold text-gray-900 mb-3">
              {ticket.subject}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Your message
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>
          </div>

          {ticket.adminReply && (
            <div className="bg-[#fff0f0]/40 border border-[#ff6b6b]/15 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#ff6b6b] mb-1">
                Reply from support
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {ticket.adminReply}
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                Last updated{" "}
                {new Date(ticket.updatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackTicketPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50/40">
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#ff6b6b]/20 border-t-[#ff6b6b] rounded-full animate-spin" />
            </div>
          }
        >
          <TrackTicketInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
