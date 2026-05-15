"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AdminProduct,
  productsAdminApi,
} from "@/lib/products-admin";

const PAGE_SIZE = 20;

type ActiveFilter = "" | "true" | "false";

export default function AdminProductsListPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsAdminApi.list({
        page,
        limit: PAGE_SIZE,
        active: activeFilter === "" ? undefined : activeFilter === "true",
        search: search.trim() || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  // Clear selection when the result set changes — the IDs in `selected`
  // wouldn't correspond to visible rows otherwise.
  useEffect(() => {
    setSelected(new Set());
  }, [page, activeFilter, search]);

  const toggleRow = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)));

  const handleBulkActive = async (isActive: boolean) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const ids = [...selected];
      await productsAdminApi.bulkSetActive(ids, isActive);
      setItems((prev) =>
        prev.map((p) => (selected.has(p.id) ? { ...p, isActive } : p)),
      );
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} total · click a product to edit basics, tags, collections, and relations.
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
          placeholder="Search product name…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <select
          value={activeFilter}
          onChange={(e) => {
            setPage(1);
            setActiveFilter(e.target.value as ActiveFilter);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-300 bg-slate-900 px-4 py-2.5 text-sm text-white">
          <span className="font-medium">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => void handleBulkActive(true)}
              disabled={bulkBusy}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {bulkBusy ? "Working…" : "Set active"}
            </button>
            <button
              onClick={() => void handleBulkActive(false)}
              disabled={bulkBusy}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-600 disabled:opacity-50"
            >
              {bulkBusy ? "Working…" : "Set inactive"}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              disabled={bulkBusy}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="rounded border-slate-300"
                  aria-label="Select all rows on this page"
                />
              </th>
              <th className="px-4 py-2.5 w-16">ID</th>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5 w-32 text-right">Price</th>
              <th className="px-4 py-2.5 w-28">Status</th>
              <th className="px-4 py-2.5 w-44">Tags / Collections</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No products match.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-slate-100 align-top last:border-0 ${selected.has(p.id) ? "bg-slate-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleRow(p.id)}
                      className="rounded border-slate-300"
                      aria-label={`Select product ${p.id}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {p.id}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-start gap-3 hover:underline"
                    >
                      {p.gallery?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.gallery[0]}
                          alt=""
                          className="h-12 w-12 flex-shrink-0 rounded border border-slate-200 object-cover"
                        />
                      )}
                      <div>
                        <div className="line-clamp-2 text-sm font-medium">
                          {p.name}
                        </div>
                        {p.slug && (
                          <div className="mt-0.5 font-mono text-xs text-slate-400">
                            {p.slug}
                          </div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${Number(p.basePrice).toFixed(2)}
                    {p.comparePrice != null && (
                      <div className="text-xs text-slate-400 line-through">
                        ${Number(p.comparePrice).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill active={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {p.tags.length > 0 && (
                      <div>
                        {p.tags.slice(0, 3).map((t) => t.name).join(", ")}
                        {p.tags.length > 3 && ` +${p.tags.length - 3}`}
                      </div>
                    )}
                    {p.collections.length > 0 && (
                      <div className="mt-1 text-slate-400">
                        in{" "}
                        {p.collections.slice(0, 2).map((c) => c.name).join(", ")}
                        {p.collections.length > 2 &&
                          ` +${p.collections.length - 2}`}
                      </div>
                    )}
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

function StatusPill({ active }: { active: boolean }) {
  const styles = active
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
