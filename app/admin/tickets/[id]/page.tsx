"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supportAdminApi } from "@/lib/support-admin";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  type SupportMessage,
  type SupportTicket,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/support";

const STATUS_FLOW: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const CATEGORIES: TicketCategory[] = [
  "order",
  "shipping",
  "product",
  "refund",
  "payment",
  "other",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const ticketId = Number(id);
  const router = useRouter();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!Number.isFinite(ticketId)) {
      setError("Invalid ticket id");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supportAdminApi
      .detail(ticketId)
      .then((t) => {
        if (!cancelled) setTicket(t);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  // Scroll thread to bottom whenever messages change so the latest reply
  // is in view after sending.
  useEffect(() => {
    if (!ticket) return;
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (!ticket || trimmed.length < 2) return;
    setReplying(true);
    setError(null);
    try {
      const updated = await supportAdminApi.reply(ticket.id, trimmed);
      setTicket(updated);
      setReply("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const updateMeta = async (patch: {
    status?: TicketStatus;
    category?: TicketCategory;
  }) => {
    if (!ticket) return;
    setSavingMeta(true);
    setError(null);
    try {
      const updated = await supportAdminApi.update(ticket.id, patch);
      setTicket(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    if (
      !window.confirm(
        `Permanently delete ticket ${ticket.ticketNumber} and its thread?`,
      )
    )
      return;
    setDeleting(true);
    try {
      await supportAdminApi.delete(ticket.id);
      router.replace("/admin/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  if (error && !ticket) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}{" "}
        <Link href="/admin/tickets" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/tickets"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            ← Back to tickets
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {ticket.subject}
          </h1>
          <p className="text-sm text-slate-500">
            <span className="font-mono">{ticket.ticketNumber}</span> · opened{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete ticket"}
        </button>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — conversation */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Conversation
              </h2>
              <span className="text-xs text-slate-400">
                {1 + ticket.messages.length} message
                {ticket.messages.length === 0 ? "" : "s"}
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5 max-h-[60vh] overflow-y-auto">
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
              <div ref={threadEndRef} />
            </div>

            {/* Reply box */}
            <form
              onSubmit={sendReply}
              className="border-t border-slate-100 p-5 flex flex-col gap-3"
            >
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reply as Support
              </label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Write a reply to the customer…"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {reply.length}/5000
                </span>
                <button
                  type="submit"
                  disabled={replying || reply.trim().length < 2}
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {replying ? "Sending…" : "Send reply"}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Sending a reply moves an Open ticket to In progress automatically.
              </p>
            </form>
          </section>
        </div>

        {/* Right — meta */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Customer
            </h2>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">{ticket.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${ticket.email}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {ticket.email}
                  </a>
                </dd>
              </div>
              {ticket.orderNumber && (
                <div>
                  <dt className="text-xs text-slate-500">Order #</dt>
                  <dd className="font-mono">{ticket.orderNumber}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Status
            </h2>
            <div className="flex flex-col gap-2">
              {STATUS_FLOW.map((s) => {
                const active = s === ticket.status;
                return (
                  <button
                    key={s}
                    onClick={() => void updateMeta({ status: s })}
                    disabled={savingMeta || active}
                    className={`rounded-md border px-3 py-2 text-sm text-left transition-colors disabled:cursor-default ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {TICKET_STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Category
            </h2>
            <select
              value={ticket.category}
              disabled={savingMeta}
              onChange={(e) =>
                void updateMeta({ category: e.target.value as TicketCategory })
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {TICKET_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </section>
        </aside>
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
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex gap-2 max-w-[85%] ${isAdmin ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
            isAdmin
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isAdmin ? "S" : authorName.slice(0, 1).toUpperCase()}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAdmin
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-900"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
              isAdmin ? "text-white/70" : "text-slate-500"
            }`}
          >
            {isAdmin ? "Support" : authorName} ·{" "}
            {new Date(createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
