import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Search, Sparkles, Gift, Heart, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found · Gifthub",
  description:
    "We couldn't find that gift — but we've got plenty of others. Browse personalized gifts your loved ones will adore.",
};

const popularCategories = [
  { label: "Family", href: "/products?category=family", emoji: "👨‍👩‍👧" },
  { label: "Pets", href: "/products?category=pets", emoji: "🐾" },
  { label: "Anniversary", href: "/products?category=anniversary", emoji: "💝" },
  { label: "Birthday", href: "/products?category=birthday", emoji: "🎂" },
  { label: "Best Sellers", href: "/products?sort=popular", emoji: "✨" },
];

const quickLinks = [
  {
    href: "/",
    icon: Home,
    title: "Back to home",
    description: "Start fresh from our front page",
  },
  {
    href: "/products",
    icon: Gift,
    title: "Browse all gifts",
    description: "Find personalized gifts for every occasion",
  },
  {
    href: "/cart",
    icon: Heart,
    title: "View your cart",
    description: "Pick up where you left off",
  },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-white via-[#fff7f7] to-white">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-[1.1fr,1fr] gap-10 lg:gap-16 items-center">
            {/* Left — copy + CTAs */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff6b6b] bg-[#fff0f0] px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Lost in transit
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.05]">
                This gift took a{" "}
                <span className="text-[#ff6b6b] relative inline-block">
                  wrong turn
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    className="absolute -bottom-1 left-0 w-full h-2 text-[#ff6b6b]/30"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 8 Q 50 0 100 6 T 200 4"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                The page you&apos;re looking for doesn&apos;t exist, may have been
                renamed, or is taking a long coffee break. While we sort that
                out, let&apos;s get you back to the good stuff.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff6b6b]/25"
                >
                  <Home className="w-4 h-4" /> Back to home
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-gray-900 font-bold text-sm transition-all"
                >
                  Browse gifts <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Mini search */}
              <form
                action="/products"
                className="mt-8 flex items-center gap-2 max-w-md bg-white border border-gray-200 rounded-full p-1.5 pl-5 shadow-sm focus-within:border-[#ff6b6b] focus-within:ring-2 focus-within:ring-[#ff6b6b]/20 transition-all"
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search for a gift..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-xs font-bold transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right — visual */}
            <div className="order-1 lg:order-2 relative h-[280px] sm:h-[360px] lg:h-[440px]">
              {/* Big 404 number */}
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center select-none"
              >
                <span className="text-[180px] sm:text-[240px] lg:text-[300px] font-black leading-none tracking-tighter bg-gradient-to-br from-[#ff6b6b]/15 via-[#ff6b6b]/30 to-[#ee5253]/40 bg-clip-text text-transparent">
                  404
                </span>
              </div>

              {/* Floating gift card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg]">
                <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-purple-200 via-pink-200 to-rose-200 shadow-2xl shadow-pink-200/50 flex items-center justify-center relative overflow-hidden">
                  {/* Ribbon vertical */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 bg-gradient-to-b from-[#ff6b6b] to-[#ee5253]" />
                  {/* Ribbon horizontal */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 sm:h-8 bg-gradient-to-r from-[#ff6b6b] to-[#ee5253]" />
                  {/* Bow */}
                  <div className="relative z-10 -translate-y-2">
                    <Gift
                      className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-md"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative dots */}
              <span
                aria-hidden
                className="absolute top-8 right-8 w-3 h-3 rounded-full bg-[#ff6b6b]/40"
              />
              <span
                aria-hidden
                className="absolute bottom-12 left-4 w-2 h-2 rounded-full bg-purple-300"
              />
              <span
                aria-hidden
                className="absolute top-20 left-12 w-4 h-4 rounded-full bg-pink-200"
              />
              <span
                aria-hidden
                className="absolute bottom-6 right-16 w-2.5 h-2.5 rounded-full bg-rose-300"
              />
            </div>
          </div>

          {/* Popular categories chip row */}
          <div className="mt-12 pt-10 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Or jump straight to a popular category
            </p>
            <div className="flex flex-wrap gap-2.5">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff0f0] hover:text-[#ff6b6b] border border-gray-200 hover:border-[#ff6b6b]/30 text-sm font-semibold text-gray-700 transition-all"
                >
                  <span className="text-base">{cat.emoji}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick links grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid sm:grid-cols-3 gap-4">
            {quickLinks.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[#ff6b6b]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#fff0f0] group-hover:bg-[#ff6b6b] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-[#ff6b6b] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {title}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#ff6b6b]" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
