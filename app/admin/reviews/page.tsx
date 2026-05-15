"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminReview,
  ReviewSource,
  reviewsAdminApi,
} from "@/lib/reviews-admin";

const PAGE_SIZE = 20;

type ApprovedFilter = "" | "true" | "false";

export default function AdminReviewsPage() {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [approvedFilter, setApprovedFilter] = useState<ApprovedFilter>("");
  const [sourceFilter, setSourceFilter] = useState<ReviewSource | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsAdminApi.list({
        page,
        limit: PAGE_SIZE,
        approved: approvedFilter === "" ? undefined : approvedFilter === "true",
        source: sourceFilter || undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, approvedFilter, sourceFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (review: AdminReview) => {
    setBusyId(review.reviewId);
    setError(null);
    try {
      const updated = await reviewsAdminApi.setApproved(
        review.reviewId,
        !review.approved,
      );
      setItems((prev) =>
        prev.map((r) => (r.reviewId === updated.reviewId ? updated : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (review: AdminReview) => {
    if (
      !window.confirm(
        `Permanently delete this ${review.rating}-star review from ${review.author ?? "anonymous"}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusyId(review.reviewId);
    setError(null);
    try {
      await reviewsAdminApi.delete(review.reviewId);
      setItems((prev) => prev.filter((r) => r.reviewId !== review.reviewId));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} total · approve / hide / delete across Judge.me and customer
          reviews.
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
          placeholder="Search title / body / author…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <select
          value={approvedFilter}
          onChange={(e) => {
            setPage(1);
            setApprovedFilter(e.target.value as ApprovedFilter);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="true">Approved only</option>
          <option value="false">Hidden only</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => {
            setPage(1);
            setSourceFilter(e.target.value as ReviewSource | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All sources</option>
          <option value="judgeme">Judge.me</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 w-20">Rating</th>
              <th className="px-4 py-2.5">Review</th>
              <th className="px-4 py-2.5 w-44">Product</th>
              <th className="px-4 py-2.5 w-24">Source</th>
              <th className="px-4 py-2.5 w-28">Status</th>
              <th className="px-4 py-2.5 w-40 text-right">Actions</th>
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
                  No reviews match.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.reviewId}
                  className="border-b border-slate-100 align-top last:border-0"
                >
                  <td className="px-4 py-3">
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="px-4 py-3">
                    {r.title && (
                      <div className="font-medium">{r.title}</div>
                    )}
                    {r.body && (
                      <div className="mt-1 text-xs text-slate-600 line-clamp-3">
                        {r.body}
                      </div>
                    )}
                    <div className="mt-1.5 text-xs text-slate-400">
                      {r.author ?? "anonymous"}
                      {r.verifiedBuyer && (
                        <span className="ml-1 rounded bg-emerald-50 px-1 py-0.5 text-emerald-700">
                          verified
                        </span>
                      )}
                      {" · "}
                      {r.reviewedAt
                        ? new Date(r.reviewedAt).toLocaleDateString()
                        : new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.productId ? (
                      <span className="font-mono text-slate-700">
                        #{r.productId}
                      </span>
                    ) : (
                      <span className="text-slate-400">(unlinked)</span>
                    )}
                    {r.productTitle && (
                      <div className="mt-0.5 line-clamp-2 text-slate-500">
                        {r.productTitle}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {r.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill approved={r.approved} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => void handleToggle(r)}
                        disabled={busyId === r.reviewId}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
                      >
                        {r.approved ? "Hide" : "Approve"}
                      </button>
                      <button
                        onClick={() => void handleDelete(r)}
                        disabled={busyId === r.reviewId}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "" : "text-slate-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function StatusPill({ approved }: { approved: boolean }) {
  const styles = approved
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {approved ? "Approved" : "Hidden"}
    </span>
  );
}
