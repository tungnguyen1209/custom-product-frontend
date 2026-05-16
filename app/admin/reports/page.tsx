"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminReport,
  PaginatedAdminReports,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  reportsAdminApi,
} from "@/lib/reports-admin";
import type {
  ProductReportReason,
  ProductReportStatus,
} from "@/lib/api";

const PAGE_SIZE = 20;

const STATUSES: ProductReportStatus[] = [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
];
const REASONS: ProductReportReason[] = [
  "trademark",
  "community_standards",
  "unsuitable_for_kids",
  "other",
];

export default function AdminReportsPage() {
  const [data, setData] = useState<PaginatedAdminReports | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ProductReportStatus | "">("");
  const [reason, setReason] = useState<ProductReportReason | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAdminApi.list({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        reason: reason || undefined,
        search: search.trim() || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page, status, reason, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data?.total ?? 0} total · triage customer complaints about listings.
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
          placeholder="Search name / email / comments…"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as ProductReportStatus | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {REPORT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={reason}
          onChange={(e) => {
            setPage(1);
            setReason(e.target.value as ProductReportReason | "");
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All reasons</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {REPORT_REASON_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 w-16">#</th>
              <th className="px-4 py-2.5 w-44">Reason</th>
              <th className="px-4 py-2.5">Product / details</th>
              <th className="px-4 py-2.5 w-52">Reporter</th>
              <th className="px-4 py-2.5 w-28">Status</th>
              <th className="px-4 py-2.5 w-32">Filed</th>
              <th className="px-4 py-2.5 w-20 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No reports match these filters.
                </td>
              </tr>
            ) : (
              data.items.map((r) => <ReportRow key={r.id} report={r} />)
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

function ReportRow({ report }: { report: AdminReport }) {
  return (
    <tr className="border-b border-slate-100 align-top last:border-0">
      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{report.id}</td>
      <td className="px-4 py-3">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {REPORT_REASON_LABELS[report.reason]}
        </span>
        {report.attachments.length > 0 && (
          <div className="mt-1 text-[11px] text-slate-400">
            {report.attachments.length} attachment
            {report.attachments.length === 1 ? "" : "s"}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900 line-clamp-1">
          {report.product?.name ?? `Product #${report.productId}`}
        </div>
        {report.comments && (
          <div className="mt-1 text-xs text-slate-600 line-clamp-2">
            {report.comments}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs">
        <div className="font-medium text-slate-700">{report.name}</div>
        <div className="text-slate-500 truncate">{report.email}</div>
      </td>
      <td className="px-4 py-3">
        <StatusPill status={report.status} />
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {new Date(report.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/reports/${report.id}`}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-100"
        >
          Open
        </Link>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: ProductReportStatus }) {
  const styles: Record<ProductReportStatus, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    reviewing: "bg-blue-50 text-blue-700 ring-blue-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dismissed: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}
