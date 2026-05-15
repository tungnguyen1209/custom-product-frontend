"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AdminOrder,
  ORDER_STATUSES,
  OrderStatus,
  ordersAdminApi,
} from "@/lib/orders-admin";

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  processing: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  shipped: "bg-purple-50 text-purple-700 ring-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function AdminOrdersListPage() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersAdminApi.list({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await ordersAdminApi.exportCsv({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} total · click an order to view items and update status.
          </p>
        </div>
        <button
          onClick={() => void handleExport()}
          disabled={exporting || total === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
          title="Download CSV of orders matching current filters"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
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
          placeholder="Search order # / customer email…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as OrderStatus | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5 w-28">Items</th>
              <th className="px-4 py-2.5 w-28 text-right">Total</th>
              <th className="px-4 py-2.5 w-28">Status</th>
              <th className="px-4 py-2.5 w-28">Payment</th>
              <th className="px-4 py-2.5 w-40">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No orders match.
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs font-medium text-slate-900 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {o.user ? (
                      <>
                        <div className="text-sm">{o.user.email}</div>
                        {(o.user.firstName || o.user.lastName) && (
                          <div className="text-xs text-slate-500">
                            {[o.user.firstName, o.user.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {o.shippingAddress.email ?? "(guest)"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {o.items.length}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {o.paymentStatus}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
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
