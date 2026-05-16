import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Gift,
  Heart,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import {
  getCollections,
  getProducts,
  type ProductListItem,
  type TaxonomyTerm,
} from "@/lib/api";

export const revalidate = 300;

const FEATURED_LIMIT = 8;

const RECIPIENTS: Array<{
  label: string;
  href: string;
  emoji: string;
  Icon: React.ComponentType<{ className?: string }>;
  blurb: string;
  bg: string;
  ring: string;
  pillBg: string;
  pillText: string;
}> = [
  {
    label: "For Family",
    href: "/products?tags=family",
    emoji: "👨‍👩‍👧",
    Icon: Heart,
    blurb: "Mum, Dad, Grandma — gifts they'll keep on the mantelpiece.",
    bg: "bg-gradient-to-br from-[#fff0f0] to-[#ffe6e6]",
    ring: "ring-[#ff6b6b]/15",
    pillBg: "bg-[#ff6b6b]",
    pillText: "text-white",
  },
  {
    label: "For Friends",
    href: "/products?tags=friends",
    emoji: "🥂",
    Icon: Users,
    blurb: "Inside-joke ready. The one they'll snap a photo of.",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    ring: "ring-amber-200/60",
    pillBg: "bg-amber-500",
    pillText: "text-white",
  },
  {
    label: "For Pets",
    href: "/products?tags=pets",
    emoji: "🐾",
    Icon: PawPrint,
    blurb: "Because the dog is family too — and so is the cat (sometimes).",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    ring: "ring-emerald-200/60",
    pillBg: "bg-emerald-600",
    pillText: "text-white",
  },
];

const OCCASIONS: Array<{ label: string; emoji: string; slug: string }> = [
  { label: "Birthday", emoji: "🎂", slug: "birthday" },
  { label: "Anniversary", emoji: "💕", slug: "anniversary" },
  { label: "Wedding", emoji: "💍", slug: "wedding" },
  { label: "New Baby", emoji: "🍼", slug: "new-baby" },
  { label: "Christmas", emoji: "🎄", slug: "christmas" },
  { label: "Graduation", emoji: "🎓", slug: "graduation" },
];

const HOW_STEPS: Array<{
  step: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    step: "01",
    title: "Pick the perfect canvas",
    body: "Browse mugs, sashes, throw pillows, blankets — every item ready for your story.",
    Icon: Gift,
  },
  {
    step: "02",
    title: "Personalise it in seconds",
    body: "Add names, dates, photos and cartoon characters. Live preview as you type.",
    Icon: Sparkles,
  },
  {
    step: "03",
    title: "We craft and deliver",
    body: "Hand-finished and quality-checked, on its way within 3 business days.",
    Icon: Truck,
  },
];

const TESTIMONIALS: Array<{
  author: string;
  body: string;
  rating: number;
  product: string;
}> = [
  {
    author: "Jessica M.",
    rating: 5,
    product: "Personalised Graduation Sash",
    body: "Ordered for my daughter's uni grad. She wore it proudly and three friends asked where I got it. The packaging alone made her tear up.",
  },
  {
    author: "Thomas K.",
    rating: 5,
    product: "Family Throw Pillow",
    body: "Six weeks before our anniversary I panicked — Gifthub had it personalised, printed, boxed and at our door in nine days. Life saver.",
  },
  {
    author: "Priya S.",
    rating: 5,
    product: "Pet Portrait Mug",
    body: "The cartoon they made looked exactly like our beagle. My partner now drinks coffee with a doe-eyed sketch of his best mate. Worth every cent.",
  },
];

function mapProductForCard(p: ProductListItem): ProductCardData {
  // ProductCard builds the final href as `${slug}-p${id}`, so this function
  // only returns the leading slug part. Falls back to `product` when the
  // catalogue row has no slug yet, keeping the URL valid.
  const slug = (p.slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const price = Number.isFinite(p.price) ? p.price : 0;
  // Wire comparePrice through: when discounted, the strikethrough value is
  // the original `comparePrice` and the live price stays as `price`. When
  // there's no discount, both values collapse to `price` and ProductCard's
  // `hasDiscount = discountPercent > 0` check hides the strikethrough/badge.
  const compare =
    p.comparePrice != null && Number.isFinite(p.comparePrice)
      ? p.comparePrice
      : null;
  const discountPercent = p.discountPercent ?? 0;
  return {
    id: p.id,
    slug: slug || "product",
    name: p.name || `Product ${p.id}`,
    category: "Personalised Gift",
    originalPrice: compare ?? price,
    discountPrice: price,
    discountPercent,
    rating: 4.8,
    reviewCount: 0,
    image: p.imageUrl ?? "",
    isNew: false,
    inStock: true,
  };
}

export default async function HomePage() {
  const [featured, collections] = await Promise.all([
    getProducts({ page: 1, limit: FEATURED_LIMIT, sort: "newest" }).catch(
      () => null,
    ),
    getCollections().catch(() => [] as TaxonomyTerm[]),
  ]);

  const featuredItems = (featured?.items ?? []).map(mapProductForCard);
  const heroTiles = featuredItems
    .filter((p) => p.image)
    .slice(0, 5);

  // Surface up to 6 collections for the secondary nav strip.
  const topCollections = collections
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 6);

  return (
    <>
      <Header />

      <main className="flex-1 bg-white">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F5] via-white to-white">
          <div className="absolute inset-0 -z-0 pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-[#ff6b6b]/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-amber-200/40 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 flex flex-col gap-6">
                <span className="self-start inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b6b] bg-[#fff0f0] px-3.5 py-1.5 rounded-full border border-[#ff6b6b]/15">
                  <Sparkles className="w-3.5 h-3.5" /> Personalised in seconds
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                  Gifts that tell{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-[#ff6b6b]">
                      their story
                    </span>
                    <span className="absolute inset-x-0 bottom-1 h-3 bg-[#FFD93D]/55 -skew-x-6 -z-0 rounded-sm" />
                  </span>
                  .
                </h1>

                <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                  Custom mugs, blankets, sashes and throw pillows — with their
                  name on it, their face on it, or the inside joke only the two
                  of you understand. Hand-finished and shipped from our studio.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm shadow-lg shadow-[#ff6b6b]/30 hover:shadow-[#ff6b6b]/40 transition-all"
                  >
                    Shop personalised gifts
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-semibold text-sm transition-colors"
                  >
                    How it works
                  </Link>
                </div>

                {/* Trust micro-bar */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <StarRating rating={4.9} size="sm" />
                    <span className="text-sm font-semibold text-gray-800">
                      4.9
                    </span>
                    <span className="text-sm text-gray-500">
                      / 1,200+ happy gift-givers
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 text-[#ff6b6b]" />
                    Hand-finished, ready in 3 days
                  </div>
                </div>
              </div>

              {/* Hero visual — masonry of real product images */}
              <div className="lg:col-span-6">
                <HeroMosaic tiles={heroTiles} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Value props strip ───────────────────────────────────────── */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {[
              { Icon: Sparkles, title: "Made-to-order", body: "Hand-finished in 3 days" },
              { Icon: Truck, title: "Tracked shipping", body: "Worldwide delivery" },
              { Icon: ShieldCheck, title: "100% happiness", body: "Or your money back" },
              { Icon: Gift, title: "Personalised", body: "Names, photos & dates" },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#ff6b6b]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Shop by recipient ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            eyebrow="Shop by recipient"
            title="Who are you making smile today?"
            subtitle="Three corners of the gift universe. Pick yours."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-10">
            {RECIPIENTS.map((r) => (
              <Link
                key={r.label}
                href={r.href}
                className={`group relative rounded-3xl ${r.bg} ring-1 ${r.ring} p-7 overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-5xl leading-none drop-shadow-sm">
                    {r.emoji}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${r.pillBg} ${r.pillText} px-2.5 py-1 rounded-full`}
                  >
                    Bestsellers inside
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-8">
                  {r.label}
                </h3>
                <p className="text-sm text-gray-600 mt-2 max-w-[26ch]">
                  {r.blurb}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 mt-6 group-hover:text-[#ff6b6b] transition-colors">
                  Browse the collection
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>

                {/* subtle accent ring (icon, pushed bottom-right) */}
                <r.Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-white/40 stroke-[1]" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured products ───────────────────────────────────────── */}
        <section className="bg-[#FFF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <SectionHeader
                eyebrow="Fresh from the studio"
                title="This week's most-loved gifts"
                subtitle="Real bestsellers from real customers — restocked, redesigned and ready to personalise."
                align="left"
              />
              <Link
                href="/products"
                className="text-sm font-bold text-[#ff6b6b] hover:text-[#ee5253] inline-flex items-center gap-1"
              >
                See all gifts
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {featuredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 mt-10">
                {featuredItems.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-400">
                Our studio is restocking — check back soon for fresh gift ideas.
              </div>
            )}
          </div>
        </section>

        {/* ── Shop by occasion ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            eyebrow="By the calendar"
            title="Got an occasion coming up?"
            subtitle="Tap one and we'll line up the right gifts for the day."
          />
          <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4">
            {OCCASIONS.map((o) => (
              <Link
                key={o.slug}
                href={`/products?tags=${o.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#ff6b6b] hover:shadow-md hover:shadow-[#ff6b6b]/10 transition-all"
              >
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                  {o.emoji}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">
                  {o.label}
                </span>
              </Link>
            ))}
          </div>

          {topCollections.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">
                Or browse collections:
              </span>
              {topCollections.map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  className="text-xs font-medium text-gray-600 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-[#fff0f0] hover:text-[#ff6b6b] transition-colors"
                >
                  {c.name}{" "}
                  <span className="text-gray-400">({c.productCount})</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── How it works ────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="bg-gradient-to-br from-[#fff0f0] via-[#FFF9F5] to-amber-50/40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <SectionHeader
              eyebrow="How it works"
              title="From idea to inbox in three steps"
              subtitle="No design skills needed. We've made it so simple you'll wonder why every gift isn't personalised."
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {HOW_STEPS.map(({ step, title, body, Icon }, i) => (
                <div
                  key={step}
                  className="relative bg-white rounded-3xl p-7 shadow-sm border border-white"
                >
                  <span className="absolute -top-4 left-7 text-[11px] font-extrabold tracking-[0.2em] text-[#ff6b6b] bg-white px-3 py-1 rounded-full border border-[#ff6b6b]/20 shadow-sm">
                    STEP {step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-[#fff0f0] flex items-center justify-center mb-5 mt-2">
                    <Icon className="w-6 h-6 text-[#ff6b6b]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">
                    {body}
                  </p>
                  {i < HOW_STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-[#ff6b6b]/40 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            eyebrow="Real customers, real reactions"
            title="Loved by 1,200+ gift-givers"
            subtitle="A few of the messages that make us love this job."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.author}
                className="relative bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-md transition-shadow"
              >
                <StarRating rating={t.rating} size="sm" />
                <p className="text-gray-700 leading-relaxed mt-4">
                  &ldquo;{t.body}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b6b] text-white flex items-center justify-center font-bold">
                    {t.author
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      Verified · {t.product}
                    </p>
                  </div>
                </div>
                <CheckCircle className="absolute top-7 right-7 w-5 h-5 text-emerald-500" />
              </article>
            ))}
          </div>
        </section>

        {/* ── Final CTA banner ────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ff6b6b] via-[#ff7a7a] to-[#ff8e8e] text-white p-10 sm:p-14 lg:p-20">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] bg-white/15 px-3 py-1.5 rounded-full">
                  <Gift className="w-3.5 h-3.5" /> Ready in 3 days
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-5 leading-tight tracking-tight">
                  Ready to make their day?
                </h2>
                <p className="text-white/90 mt-3 text-base sm:text-lg max-w-xl">
                  Start with a blank canvas, add their story, and we&apos;ll
                  hand-finish it in 3 business days.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white text-[#ff6b6b] font-bold text-sm shadow-lg shadow-black/10 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Start designing
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-white/40 hover:bg-white/10 font-semibold text-sm transition-colors"
                >
                  Browse all gifts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* ─── Local helpers ─────────────────────────────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignment =
    align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignment} gap-3`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HeroMosaic({ tiles }: { tiles: ProductCardData[] }) {
  // Five-tile editorial mosaic. Gracefully degrades to a single hero card
  // when the catalogue is empty.
  if (tiles.length === 0) {
    return (
      <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-[#fff0f0] via-amber-50 to-[#FFF9F5] ring-1 ring-[#ff6b6b]/10 flex items-center justify-center">
        <Gift className="w-24 h-24 text-[#ff6b6b]/70" />
      </div>
    );
  }

  const pad = (i: number) => tiles[i % tiles.length];

  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-3 sm:gap-4 aspect-[5/6] sm:aspect-[6/5]">
      {/* Big anchor */}
      <Link
        href={`/${pad(0).slug}`}
        className="col-span-4 row-span-4 relative rounded-[2rem] overflow-hidden ring-1 ring-black/5 shadow-xl shadow-black/10 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pad(0).image}
          alt={pad(0).name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/55 via-black/15 to-transparent text-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
            Trending
          </span>
          <p className="text-base font-bold leading-snug line-clamp-2 mt-1">
            {pad(0).name}
          </p>
        </div>
      </Link>

      {/* Top-right tall */}
      <Link
        href={`/${pad(1).slug}`}
        className="col-span-2 row-span-3 relative rounded-3xl overflow-hidden ring-1 ring-black/5 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pad(1).image}
          alt={pad(1).name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-gray-800 px-2.5 py-1 rounded-full shadow-sm">
          New
        </span>
      </Link>

      {/* Mid-right floating card with stats */}
      <div className="col-span-2 row-span-1 relative rounded-3xl overflow-hidden bg-white ring-1 ring-black/5 shadow-md p-3 sm:p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-[#ff6b6b]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 leading-tight">
            1,200+ reviews
          </p>
          <p className="text-[11px] text-gray-500">Average 4.9 / 5</p>
        </div>
      </div>

      {/* Bottom-left two-up */}
      <Link
        href={`/${pad(2).slug}`}
        className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden ring-1 ring-black/5 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pad(2).image}
          alt={pad(2).name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <Link
        href={`/${pad(3).slug}`}
        className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden ring-1 ring-black/5 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pad(3).image}
          alt={pad(3).name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Bottom-right CTA card */}
      <Link
        href="/products"
        className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff6b6b] to-[#ff8e8e] text-white p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform shadow-lg shadow-[#ff6b6b]/30"
      >
        <Sparkles className="w-6 h-6 text-white/90" />
        <div>
          <p className="text-sm font-extrabold leading-tight">
            300+ gift ideas
          </p>
          <p className="text-xs text-white/85 mt-1">Made-to-order, daily</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold">
            Shop all <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
