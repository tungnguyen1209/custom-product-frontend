"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
  Headset,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  supportApi,
  TICKET_STATUS_LABELS,
  type SupportMessage,
  type SupportTicket,
  type TicketStatus,
} from "@/lib/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-[#fff0f0] text-[#ff6b6b] border-[#ff6b6b]/20",
  in_progress: "bg-amber-50 text-amber-600 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TrackTicketInner() {
  const params = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState(
    params.get("ticketNumber") ?? "",
  );
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (tn: string, em: string) => {
    if (!tn.trim() || !em.trim()) return;
    setLoading(true);
    setError(null);
    setTicket(null);
    try {
      const data = await supportApi.track(tn.trim(), em.trim());
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

      {!ticket && (
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
      )}

      {ticket && (
        <TicketThread
          ticket={ticket}
          onReplied={(updated) => setTicket(updated)}
          onSwitchTicket={() => {
            setTicket(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
}

function TicketThread({
  ticket,
  onReplied,
  onSwitchTicket,
}: {
  ticket: SupportTicket;
  onReplied: (t: SupportTicket) => void;
  onSwitchTicket: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const closed = ticket.status === "closed";

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (trimmed.length < 2) {
      setReplyError("Please write a message.");
      return;
    }
    setSending(true);
    setReplyError(null);
    try {
      const updated = await supportApi.reply(ticket.ticketNumber, {
        email: ticket.email,
        body: trimmed,
      });
      onReplied(updated);
      setReply("");
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : "Couldn't send your reply.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Ticket
            </p>
            <p className="text-base font-bold text-gray-900 font-mono break-all">
              {ticket.ticketNumber}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Opened {formatStamp(ticket.createdAt)}
            </p>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${STATUS_STYLES[ticket.status]}`}
          >
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mt-4">
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

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Subject
          </p>
          <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
        </div>

        <div className="mt-3 text-right">
          <button
            onClick={onSwitchTicket}
            className="text-xs text-gray-400 hover:text-[#ff6b6b]"
          >
            Look up a different ticket
          </button>
        </div>
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-3">
        <ConversationBubble
          authorType="customer"
          authorName={ticket.name}
          body={ticket.message}
          createdAt={ticket.createdAt}
        />
        {ticket.messages.map((m) => (
          <ConversationBubble
            key={m.id}
            authorType={m.authorType}
            authorName={m.authorName}
            body={m.body}
            createdAt={m.createdAt}
          />
        ))}
      </div>

      {/* Reply box */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        {closed ? (
          <p className="text-sm text-gray-500">
            This ticket has been closed. Need more help?{" "}
            <Link
              href="/help-center"
              className="text-[#ff6b6b] hover:underline font-medium"
            >
              Open a new ticket
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={sendReply} className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-800">
              Write a reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                if (replyError) setReplyError(null);
              }}
              rows={4}
              maxLength={5000}
              placeholder="Add more details, share an update, or ask a follow-up…"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 resize-none transition-colors ${
                replyError
                  ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
              }`}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {reply.length}/5000
              </span>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm transition-colors shadow-md shadow-[#ff6b6b]/20 disabled:opacity-60 disabled:cursor-wait inline-flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Sending…" : "Send reply"}
              </button>
            </div>
            {replyError && (
              <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{replyError}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function ConversationBubble({
  authorType,
  authorName,
  body,
  createdAt,
}: Pick<SupportMessage, "authorType" | "authorName" | "body" | "createdAt">) {
  const isAdmin = authorType === "admin";
  const displayName = isAdmin ? "Support team" : authorName;
  return (
    <div className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
      <div className={`flex gap-2 max-w-[85%] ${isAdmin ? "" : "flex-row-reverse"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAdmin ? "bg-[#fff0f0] text-[#ff6b6b]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isAdmin ? (
            <Headset className="w-4 h-4" />
          ) : (
            <span className="text-xs font-bold">
              {authorName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 border ${
            isAdmin
              ? "bg-[#fff0f0]/40 border-[#ff6b6b]/15"
              : "bg-white border-gray-100"
          }`}
        >
          <p
            className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
              isAdmin ? "text-[#ff6b6b]" : "text-gray-400"
            }`}
          >
            {displayName} · {formatStamp(createdAt)}
          </p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {body}
          </p>
        </div>
      </div>
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
