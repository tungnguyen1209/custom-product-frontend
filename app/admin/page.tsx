"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminStats, getAdminStats } from "@/lib/admin-stats";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
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
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Snapshot of catalog, orders, reviews, and posts.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && stats && stats.reviews.pending + (stats.orders.byStatus["pending"] ?? 0) + stats.posts.drafts > 0 && (
        <ActionsNeeded stats={stats} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          href="/admin/products"
          title="Products"
          loading={loading}
          primary={stats?.products.total}
          breakdown={
            stats && (
              <>
                <Badge color="emerald">{stats.products.active} active</Badge>
                <Badge color="slate">{stats.products.inactive} inactive</Badge>
              </>
            )
          }
        />
        <StatCard
          href="/admin/orders"
          title="Orders"
          loading={loading}
          primary={stats?.orders.total}
          breakdown={
            stats && (
              <>
                {Object.entries(stats.orders.byStatus).map(([status, count]) => (
                  <Badge key={status} color={STATUS_COLORS[status] ?? "slate"}>
                    {count} {status}
                  </Badge>
                ))}
              </>
            )
          }
        />
        <StatCard
          href="/admin/reviews"
          title="Reviews"
          loading={loading}
          primary={stats?.reviews.total}
          breakdown={
            stats && (
              <>
                <Badge color="emerald">{stats.reviews.approved} approved</Badge>
                {stats.reviews.pending > 0 && (
                  <Badge color="amber">{stats.reviews.pending} pending</Badge>
                )}
              </>
            )
          }
        />
        <StatCard
          href="/admin/posts"
          title="Posts"
          loading={loading}
          primary={stats?.posts.total}
          breakdown={
            stats && (
              <>
                <Badge color="emerald">{stats.posts.published} published</Badge>
                {stats.posts.drafts > 0 && (
                  <Badge color="amber">{stats.posts.drafts} drafts</Badge>
                )}
              </>
            )
          }
        />
        <StatCard
          href="/admin/collections"
          title="Collections"
          loading={loading}
          primary={stats?.collections}
        />
        <StatCard
          href="/admin/tags"
          title="Tags"
          loading={loading}
          primary={stats?.tags}
        />
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, BadgeColor> = {
  pending: "amber",
  confirmed: "blue",
  processing: "indigo",
  shipped: "purple",
  delivered: "emerald",
  cancelled: "rose",
};

function ActionsNeeded({ stats }: { stats: AdminStats }) {
  const items: Array<{ href: string; label: string; count: number }> = [];
  if (stats.reviews.pending > 0) {
    items.push({
      href: "/admin/reviews?approved=false",
      label: "review(s) awaiting moderation",
      count: stats.reviews.pending,
    });
  }
  const pendingOrders = stats.orders.byStatus["pending"] ?? 0;
  if (pendingOrders > 0) {
    items.push({
      href: "/admin/orders?status=pending",
      label: "order(s) pending",
      count: pendingOrders,
    });
  }
  if (stats.posts.drafts > 0) {
    items.push({
      href: "/admin/posts?status=draft",
      label: "draft post(s)",
      count: stats.posts.drafts,
    });
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        Needs attention
      </h2>
      <ul className="mt-2 flex flex-col gap-1.5 text-sm">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="inline-flex items-center gap-2 text-amber-900 hover:underline"
            >
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium">
                {it.count}
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({
  href,
  title,
  loading,
  primary,
  breakdown,
}: {
  href: string;
  title: string;
  loading: boolean;
  primary: number | undefined;
  breakdown?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-900"
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 group-hover:text-slate-700">
        {title}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {loading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          (primary ?? 0).toLocaleString()
        )}
      </div>
      {breakdown && (
        <div className="mt-3 flex flex-wrap gap-1.5">{breakdown}</div>
      )}
    </Link>
  );
}

type BadgeColor =
  | "slate"
  | "emerald"
  | "amber"
  | "blue"
  | "indigo"
  | "purple"
  | "rose";

const BADGE_STYLES: Record<BadgeColor, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
};

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: BadgeColor;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_STYLES[color]}`}
    >
      {children}
    </span>
  );
}
