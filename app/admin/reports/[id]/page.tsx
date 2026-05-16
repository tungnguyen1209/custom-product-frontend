"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminReport,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  reportsAdminApi,
} from "@/lib/reports-admin";
import type { ProductReportStatus } from "@/lib/api";

const STATUS_FLOW: ProductReportStatus[] = [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminReportDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const reportId = Number(id);
  const router = useRouter();

  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(reportId)) {
      setError("Invalid report id");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    reportsAdminApi
      .detail(reportId)
      .then((r) => {
        if (cancelled) return;
        setReport(r);
        setNotes(r.adminNotes ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const setStatus = async (next: ProductReportStatus) => {
    if (!report || next === report.status) return;
    setSavingStatus(true);
    try {
      const updated = await reportsAdminApi.update(report.id, { status: next });
      setReport(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const saveNotes = async () => {
    if (!report) return;
    setSavingNotes(true);
    try {
      const updated = await reportsAdminApi.update(report.id, {
        adminNotes: notes,
      });
      setReport(updated);
      setNotes(updated.adminNotes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    if (
      !window.confirm(
        `Permanently delete report #${report.id}? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    try {
      await reportsAdminApi.delete(report.id);
      router.replace("/admin/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  if (error && !report) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}{" "}
        <Link href="/admin/reports" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  if (!report) return null;

  const productHref = report.product?.slug
    ? `/${report.product.slug}-p${report.product.id}`
    : null;
  const reportFormHref = productHref
    ? `/report-product/${report.product?.slug}-p${report.product?.id}`
    : null;
  const hero = report.product?.gallery?.[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/reports"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            ← Back to reports
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Report #{report.id}
          </h1>
          <p className="text-sm text-slate-500">
            Filed{" "}
            {new Date(report.createdAt).toLocaleString()} ·{" "}
            <span className="font-medium text-slate-700">
              {REPORT_REASON_LABELS[report.reason]}
            </span>
          </p>
        </div>
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete report"}
        </button>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Product */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Reported listing
            </h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero}
                    alt={report.product?.name ?? "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🎁</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">
                  {report.product?.name ?? `Product #${report.productId}`}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  id: <span className="font-mono">{report.productId}</span>
                </div>
                {productHref && (
                  <div className="mt-2 flex gap-3 text-xs">
                    <Link
                      href={productHref}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      View listing ↗
                    </Link>
                    {reportFormHref && (
                      <Link
                        href={reportFormHref}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Public report form ↗
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Comments */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Comments
            </h2>
            {report.comments ? (
              <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">
                {report.comments}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No additional comments.
              </p>
            )}
          </section>

          {/* Attachments */}
          {report.attachments.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Attachments ({report.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.attachments.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 hover:opacity-90"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Attachment ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Admin notes */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Internal notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Moderator notes — not shown to the reporter."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => void saveNotes()}
                disabled={savingNotes || notes === (report.adminNotes ?? "")}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {savingNotes ? "Saving…" : "Save notes"}
              </button>
            </div>
          </section>
        </div>

        {/* Right — meta + actions */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Reporter
            </h2>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">{report.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${report.email}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {report.email}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Status
            </h2>
            <div className="flex flex-col gap-2">
              {STATUS_FLOW.map((s) => {
                const active = s === report.status;
                return (
                  <button
                    key={s}
                    onClick={() => void setStatus(s)}
                    disabled={savingStatus || active}
                    className={`rounded-md border px-3 py-2 text-sm text-left transition-colors disabled:opacity-100 disabled:cursor-default ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {REPORT_STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
            {report.reviewedAt && (
              <p className="mt-3 text-xs text-slate-500">
                Last reviewed{" "}
                {new Date(report.reviewedAt).toLocaleString()}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
