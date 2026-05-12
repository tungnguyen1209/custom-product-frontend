import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductsByCollection, type ProductListItem } from "@/lib/api";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";

const ITEMS_PER_PAGE = 24;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function paginationRange(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const delta = 1;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  const range: (number | "…")[] = [1];
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push("…");
  range.push(totalPages);
  return range;
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let data;
  try {
    data = await getProductsByCollection(slug, page, ITEMS_PER_PAGE);
  } catch {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const safePage = Math.min(page, totalPages);
  const title = titleFromSlug(slug);

  return (
    <>
      <Header />

      <main className="flex-1 bg-[#f7f7f7] min-h-screen">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#ff6b6b] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/products"
                className="hover:text-[#ff6b6b] transition-colors"
              >
                Collections
              </Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">{title}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-800">{data.total}</span>{" "}
              {data.total === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {data.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.items.map((p) => (
                <CollectionProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState slug={slug} />
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1">
                <PaginationLink
                  slug={slug}
                  page={safePage - 1}
                  disabled={safePage === 1}
                  ariaLabel="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </PaginationLink>

                {paginationRange(safePage, totalPages).map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
                    >
                      …
                    </span>
                  ) : (
                    <PaginationLink
                      key={item}
                      slug={slug}
                      page={item as number}
                      active={item === safePage}
                    >
                      {item}
                    </PaginationLink>
                  ),
                )}

                <PaginationLink
                  slug={slug}
                  page={safePage + 1}
                  disabled={safePage === totalPages}
                  ariaLabel="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </PaginationLink>
              </div>

              <p className="text-xs text-gray-400">
                Page {safePage} of {totalPages} · Showing{" "}
                {(safePage - 1) * data.limit + 1}–
                {Math.min(safePage * data.limit, data.total)} of {data.total}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ─── Product card (data-only — no rating/category placeholders) ─── */

function CollectionProductCard({ product }: { product: ProductListItem }) {
  // Backend returns `url` as `/s-p${id}` — matches the product page route
  // which strips `s-p` and calls `getProduct(internalId)`.
  const href = product.url || `/s-p${product.id}`;
  const fallbackImage = "https://placehold.co/480x480?text=No+Image";

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl ?? fallbackImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#ff6b6b] transition-colors duration-200">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-gray-900">
            {product.displayPrice}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Pagination link (server-rendered, no client state) ──────────── */

function PaginationLink({
  slug,
  page,
  active,
  disabled,
  ariaLabel,
  children,
}: {
  slug: string;
  page: number;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const className = `w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
    active
      ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/30"
      : disabled
        ? "border border-gray-100 bg-white text-gray-300 cursor-not-allowed pointer-events-none"
        : "border border-gray-200 bg-white text-gray-600 hover:border-[#ff6b6b] hover:text-[#ff6b6b]"
  }`;

  if (disabled) {
    return (
      <span aria-disabled className={className} aria-label={ariaLabel}>
        {children}
      </span>
    );
  }

  const href =
    page === 1
      ? `/collections/${slug}`
      : `/collections/${slug}?page=${page}`;

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <PackageSearch className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-gray-600 font-semibold">
        No products in “{titleFromSlug(slug)}” yet
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Check back soon, or browse other collections.
      </p>
      <Link
        href="/products"
        className="mt-4 px-5 py-2 rounded-xl bg-[#ff6b6b] text-white text-sm font-semibold hover:bg-[#ee5253] transition-colors"
      >
        Browse all products
      </Link>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const title = titleFromSlug(slug);
  return {
    title: `${title} – Collections`,
    description: `Browse personalised products in the ${title} collection.`,
  };
}
