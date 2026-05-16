"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supportAdminApi } from "@/lib/support-admin";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  type PaginatedSupportTickets,
  type SupportTicket,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/support";

const PAGE_SIZE = 20;
const STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const CATEGORIES: TicketCategory[] = [
  "order",
  "shipping",
  "product",
  "refund",
  "payment",
  "other",
];

export default function AdminTicketsPage() {
  const [data, setData] = useState<PaginatedSupportTickets | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await supportAdminApi.list({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        category: category || undefined,
        search: search.trim() || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [page, status, category, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Support tickets</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data?.total ?? 0} total · reply, change status, and triage inbound
          help requests.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search subject / message / email / TCK-…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as TicketStatus | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {TICKET_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value as TicketCategory | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TICKET_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 w-32">Ticket #</th>
              <th className="px-4 py-2.5">Subject / customer</th>
              <th className="px-4 py-2.5 w-28">Category</th>
              <th className="px-4 py-2.5 w-28">Status</th>
              <th className="px-4 py-2.5 w-36">Last activity</th>
              <th className="px-4 py-2.5 w-20 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No tickets match these filters.
                </td>
              </tr>
            ) : (
              data.items.map((t) => <TicketRow key={t.id} ticket={t} />)
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const last = ticket.lastMessageAt ?? ticket.updatedAt;
  return (
    <tr className="border-b border-slate-100 align-top last:border-0">
      <td className="px-4 py-3 font-mono text-xs text-slate-700">
        {ticket.ticketNumber}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900 line-clamp-1">
          {ticket.subject}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {ticket.name} · <span className="text-slate-400">{ticket.email}</span>
        </div>
        {ticket.orderNumber && (
          <div className="mt-0.5 text-xs text-slate-400 font-mono">
            order: {ticket.orderNumber}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          {TICKET_CATEGORY_LABELS[ticket.category]}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusPill status={ticket.status} />
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {new Date(last).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/tickets/${ticket.id}`}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-100"
        >
          Open
        </Link>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    open: "bg-rose-50 text-rose-700 ring-rose-200",
    in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    closed: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
