"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Flame,
  Gift,
  Heart,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// MiniCart is a drawer — only mount once it has actually been opened. Saves
// ~210 LOC + dependencies from the initial Header chunk on every page load.
const MiniCart = dynamic(() => import("./MiniCart"), { ssr: false });

/* ─── Static menu data ────────────────────────────────────────────────── */

const RECIPIENTS: Array<{
  label: string;
  blurb: string;
  emoji: string;
  href: string;
  accent: string;
}> = [
  {
    label: "Family",
    blurb: "Mum, Dad, Grandparents",
    emoji: "👨‍👩‍👧",
    href: "/products?tags=family",
    accent: "from-rose-100 to-pink-100",
  },
  {
    label: "Friends",
    blurb: "BFFs & inside jokes",
    emoji: "🥂",
    href: "/products?tags=friends",
    accent: "from-amber-100 to-orange-100",
  },
  {
    label: "Pets",
    blurb: "For the four-legged family",
    emoji: "🐾",
    href: "/products?tags=pets",
    accent: "from-emerald-100 to-teal-100",
  },
  {
    label: "Couples",
    blurb: "Anniversary, His & Hers",
    emoji: "💕",
    href: "/products?tags=couples",
    accent: "from-fuchsia-100 to-pink-100",
  },
];

const OCCASIONS: Array<{ label: string; emoji: string; href: string }> = [
  { label: "Birthday", emoji: "🎂", href: "/products?tags=birthday" },
  { label: "Anniversary", emoji: "💍", href: "/products?tags=anniversary" },
  { label: "Wedding", emoji: "💒", href: "/products?tags=wedding" },
  { label: "New Baby", emoji: "🍼", href: "/products?tags=new-baby" },
  { label: "Christmas", emoji: "🎄", href: "/products?tags=christmas" },
  { label: "Graduation", emoji: "🎓", href: "/products?tags=graduation" },
];

const PROMO_MESSAGES: Array<{
  Icon: React.ComponentType<{ className?: string }>;
  text: string;
}> = [
  { Icon: Truck, text: "Made-to-order, ready in 2–3 business days" },
  { Icon: Star, text: "Rated 4.9 / 5 by 1,200+ happy gift-givers" },
  { Icon: ShieldCheck, text: "365-day satisfaction guarantee" },
];

/* ─── Component ───────────────────────────────────────────────────────── */

export default function Header() {
  const pathname = usePathname();
  const { cart, isMiniCartOpen, openMiniCart, closeMiniCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [promoIndex, setPromoIndex] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const itemCount =
    cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const accountLabel = isAuthenticated
    ? user?.firstName || user?.email?.split("@")[0] || "Account"
    : "Sign in";

  /* Subtle shadow once the page is scrolled. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Rotate the promo bar every few seconds. */
  useEffect(() => {
    const t = setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMO_MESSAGES.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  /* Close dropdowns when the user clicks outside the header nav row. */
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && navRef.current && !navRef.current.contains(target)) {
        setOpenDropdown(null);
      }
      if (target && accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  /* Close mobile drawer + dropdowns on route change. Deferred to a microtask
   * so the state setters don't fire synchronously inside the effect body — at
   * worst this triggers one render when a menu was open, which is the whole
   * point. */
  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      setOpenDropdown(null);
      setAccountOpen(false);
    });
  }, [pathname]);

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    const base = href.split("?")[0];
    return pathname.startsWith(base);
  };

  const PromoIcon = PROMO_MESSAGES[promoIndex].Icon;
  const promoText = PROMO_MESSAGES[promoIndex].text;

  return (
    <header
      // z-50 keeps the header (and its dropdown menus, which expand DOWN past
      // the header band) above other page-level sticky elements. The product
      // page's sticky gallery sits at z-40; same-z gave it a paint-order win
      // because it appears later in the DOM, and the dropdown menus hid
      // behind the thumbnails.
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-md shadow-black/5" : "shadow-sm"
      }`}
    >
      {/* ── Promo bar ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#ee5253] via-[#ff6b6b] to-[#ff8e6a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center text-xs font-medium tracking-wide">
          <span
            key={promoIndex}
            className="flex items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 duration-500"
          >
            <PromoIcon className="w-3.5 h-3.5" />
            <span>{promoText}</span>
          </span>
        </div>
      </div>

      {/* ── Main row ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 h-16">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden -ml-2 p-2 text-gray-700 hover:text-[#ff6b6b] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 group"
            aria-label="Gifthub home"
          >
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6b6b] to-[#ff8e6a] flex items-center justify-center shadow-md shadow-[#ff6b6b]/30 group-hover:shadow-lg group-hover:shadow-[#ff6b6b]/40 transition-shadow">
              <Gift className="text-white w-5 h-5" strokeWidth={2.4} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-[#ff6b6b]">Gift</span>
              <span className="text-gray-900">hub</span>
            </span>
          </Link>

          {/* Search */}
          <form
            action="/products"
            method="get"
            className="hidden md:flex flex-1 max-w-xl relative group"
            role="search"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#ff6b6b] transition-colors"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for gifts for mum, dad, your dog…"
              className="w-full pl-11 pr-24 py-2.5 rounded-full border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b] transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/wishlist"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>

            {/* Account: dropdown when authenticated, link when not */}
            {isAuthenticated ? (
              <div ref={accountRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((s) => !s)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-[#fff0f0] text-[#ff6b6b] flex items-center justify-center text-xs font-bold uppercase">
                    {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                  </span>
                  <span className="max-w-[110px] truncate hidden lg:inline">
                    {accountLabel}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-black/10 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.firstName
                          ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                          : "Hello!"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My account
                      </Link>
                      <Link
                        href="/account#orders"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Heart className="w-4 h-4 text-gray-400" />
                        Wishlist
                      </Link>
                      <Link
                        href="/track-order"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Truck className="w-4 h-4 text-gray-400" />
                        Track order
                      </Link>
                      <Link
                        href="/help-center"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LifeBuoy className="w-4 h-4 text-gray-400" />
                        Help center
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountOpen(false);
                          void logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <LogOut className="w-4 h-4 text-gray-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline">Sign in</span>
              </Link>
            )}

            <button
              type="button"
              onClick={openMiniCart}
              aria-label={`Open cart, ${itemCount} items`}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fff0f0] hover:bg-[#ffe0e0] text-[#ff6b6b] text-sm font-semibold transition-colors"
            >
              <span className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-[#ff6b6b] rounded-full text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Nav row (desktop) ────────────────────────────────────────── */}
      <div className="hidden md:block border-t border-gray-100 bg-white">
        <div
          ref={navRef}
          data-header-nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <nav className="flex items-center justify-center gap-1 h-12">
            <NavLink href="/products" active={isActive("/products")}>
              Shop All
            </NavLink>

            <NavDropdownTrigger
              label="Recipients"
              isOpen={openDropdown === "recipients"}
              onOpen={() => setOpenDropdown("recipients")}
              onClose={() =>
                setOpenDropdown((p) => (p === "recipients" ? null : p))
              }
              onToggle={() =>
                setOpenDropdown((p) =>
                  p === "recipients" ? null : "recipients",
                )
              }
            >
              <div className="grid grid-cols-2 gap-2 p-3 w-[480px]">
                {RECIPIENTS.map((r) => (
                  <Link
                    key={r.label}
                    href={r.href}
                    className={`group flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br ${r.accent} hover:scale-[1.02] transition-transform`}
                  >
                    <span className="text-3xl leading-none">{r.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {r.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{r.blurb}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/products"
                  className="col-span-2 flex items-center justify-between mt-1 px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-[#ff6b6b] transition-colors"
                >
                  <span className="text-sm font-bold">Browse all gifts</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              </div>
            </NavDropdownTrigger>

            <NavDropdownTrigger
              label="Occasions"
              isOpen={openDropdown === "occasions"}
              onOpen={() => setOpenDropdown("occasions")}
              onClose={() =>
                setOpenDropdown((p) => (p === "occasions" ? null : p))
              }
              onToggle={() =>
                setOpenDropdown((p) =>
                  p === "occasions" ? null : "occasions",
                )
              }
            >
              <div className="grid grid-cols-3 gap-2 p-3 w-[520px]">
                {OCCASIONS.map((o) => (
                  <Link
                    key={o.label}
                    href={o.href}
                    className="flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl bg-gray-50 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors text-center"
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {o.label}
                    </span>
                  </Link>
                ))}
              </div>
            </NavDropdownTrigger>

            <NavLink
              href="/products?sort=newest"
              active={isActive("/products?sort=newest")}
            >
              New In
            </NavLink>

            <Link
              href="/products?sort=newest"
              className="ml-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-white px-4 py-1.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] transition-colors shadow-sm shadow-[#ff6b6b]/30"
            >
              <Sparkles className="w-3.5 h-3.5" /> Best Sellers
            </Link>
            <Link
              href="/products"
              className="ml-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-700 px-4 py-1.5 rounded-full bg-amber-50 ring-1 ring-amber-200/60 hover:bg-amber-100 transition-colors"
            >
              <Flame className="w-3.5 h-3.5" /> Sale
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <aside className="relative w-[88%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-xl bg-[#ff6b6b] flex items-center justify-center">
                  <Gift className="text-white w-4 h-4" />
                </span>
                <span className="text-lg font-extrabold tracking-tight">
                  <span className="text-[#ff6b6b]">Gift</span>
                  <span className="text-gray-900">hub</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-900"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Search */}
              <form action="/products" method="get" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search for gifts…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
                />
              </form>

              {/* Quick links */}
              <div className="space-y-1">
                <Link
                  href="/products"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors"
                >
                  <span className="text-sm font-semibold">Shop All</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                </Link>
                <Link
                  href="/products?sort=newest"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors"
                >
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Best Sellers
                  </span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors"
                >
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" /> Sale
                  </span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                </Link>
              </div>

              {/* Recipients */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Shop by recipient
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {RECIPIENTS.map((r) => (
                    <Link
                      key={r.label}
                      href={r.href}
                      className={`flex flex-col items-start gap-1 p-3 rounded-2xl bg-gradient-to-br ${r.accent}`}
                    >
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {r.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Occasions
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {OCCASIONS.map((o) => (
                    <Link
                      key={o.label}
                      href={o.href}
                      className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-50 hover:bg-[#fff0f0] text-center"
                    >
                      <span className="text-xl">{o.emoji}</span>
                      <span className="text-[11px] font-semibold text-gray-700">
                        {o.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer (account row) */}
            <div className="border-t border-gray-100 p-5 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50"
                  >
                    <span className="w-9 h-9 rounded-full bg-[#fff0f0] text-[#ff6b6b] flex items-center justify-center text-sm font-bold uppercase">
                      {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {accountLabel}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#ff6b6b] text-white text-sm font-bold text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 text-center"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {isMiniCartOpen && (
        <MiniCart open={isMiniCartOpen} onClose={closeMiniCart} />
      )}
    </header>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center text-[13px] font-semibold px-4 py-2 rounded-full transition-colors ${
        active
          ? "text-[#ff6b6b] bg-[#fff0f0]"
          : "text-gray-700 hover:text-[#ff6b6b] hover:bg-[#fff0f0]"
      }`}
    >
      {children}
    </Link>
  );
}

function NavDropdownTrigger({
  label,
  isOpen,
  onOpen,
  onClose,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  // ~120 ms grace period after the pointer leaves so the user can travel
  // from the trigger button across the small gap into the dropdown panel
  // without it collapsing underneath them.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      onClose();
      closeTimer.current = null;
    }, 120);
  };

  // Clean up any pending timer if the trigger unmounts mid-flight.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleEnter = () => {
    cancelClose();
    onOpen();
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 text-[13px] font-semibold px-4 py-2 rounded-full transition-colors ${
          isOpen
            ? "text-[#ff6b6b] bg-[#fff0f0]"
            : "text-gray-700 hover:text-[#ff6b6b] hover:bg-[#fff0f0]"
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5 overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
