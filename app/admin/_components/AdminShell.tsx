"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Products", icon: "▢" },
  { href: "/admin/orders", label: "Orders", icon: "▤" },
  { href: "/admin/reviews", label: "Reviews", icon: "★" },
  { href: "/admin/posts", label: "Posts", icon: "✎" },
  { href: "/admin/collections", label: "Collections", icon: "▥" },
  { href: "/admin/tags", label: "Tags", icon: "#" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth gate. Cookie-less JWT lives in localStorage, so we can't redirect
  // from a server middleware — do it client-side after AuthContext finishes
  // its initial `getMe` round-trip.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(pathname || "/admin")}`,
      );
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [loading, user, router, pathname]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-pulse text-sm">Checking access…</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname?.startsWith(href) ?? false;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 transform border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <Link href="/admin" className="text-base font-semibold tracking-tight">
            Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="w-4 text-center opacity-70">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            aria-label="Open sidebar"
            className="md:hidden rounded-md border border-slate-200 px-2 py-1 text-sm"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right text-xs leading-tight">
              <div className="font-medium text-slate-900">
                {user.firstName || user.email}
              </div>
              <div className="text-slate-500">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
