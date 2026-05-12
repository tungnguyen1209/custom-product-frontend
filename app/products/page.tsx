import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductFilters, { ProductFilterBar } from "@/components/ProductFilters";
import {
  getProducts,
  getCollections,
  getTags,
  type ProductListItem,
  type ProductSort,
} from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
} from "lucide-react";

const ITEMS_PER_PAGE = 24;
const ALLOWED_SORTS: ProductSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
];

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    tags?: string;
    collections?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

function parseCsv(s?: string): string[] {
  return (s ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseNum(s?: string): number | undefined {
  if (!s) return undefined;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
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

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = (params.q ?? "").trim();
  const tagSlugs = parseCsv(params.tags);
  const collectionSlugs = parseCsv(params.collections);
  const minPrice = parseNum(params.minPrice);
  const maxPrice = parseNum(params.maxPrice);
  const sort: ProductSort = ALLOWED_SORTS.includes(
    params.sort as ProductSort,
  )
    ? (params.sort as ProductSort)
    : "newest";

  const [data, collections, tags] = await Promise.all([
    getProducts({
      page,
      limit: ITEMS_PER_PAGE,
      search: search || undefined,
      tags: tagSlugs,
      collections: collectionSlugs,
      minPrice,
      maxPrice,
      sort,
    }),
    getCollections(),
    getTags(),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const safePage = Math.min(page, totalPages);

  // Build base query (preserved across pagination links).
  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("q", search);
  if (tagSlugs.length) baseQuery.set("tags", tagSlugs.join(","));
  if (collectionSlugs.length)
    baseQuery.set("collections", collectionSlugs.join(","));
  if (minPrice != null) baseQuery.set("minPrice", String(minPrice));
  if (maxPrice != null) baseQuery.set("maxPrice", String(maxPrice));
  if (sort !== "newest") baseQuery.set("sort", sort);

  return (
    <>
      <Header />

      <main className="flex-1 bg-[#f7f7f7] min-h-screen">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#ff6b6b] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">All Products</span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Personalised Products
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-gray-800">
                    {data.total}
                  </span>{" "}
                  {data.total === 1 ? "product" : "products"}
                  {search && (
                    <>
                      {" "}
                      matching{" "}
                      <span className="text-gray-700 font-medium">
                        “{search}”
                      </span>
                    </>
                  )}
                </p>
              </div>

              <form
                action="/products"
                method="get"
                className="relative w-full sm:w-72"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent shadow-sm"
                />
                {/* Preserve other filters across search submits. */}
                {tagSlugs.length > 0 && (
                  <input type="hidden" name="tags" value={tagSlugs.join(",")} />
                )}
                {collectionSlugs.length > 0 && (
                  <input
                    type="hidden"
                    name="collections"
                    value={collectionSlugs.join(",")}
                  />
                )}
                {minPrice != null && (
                  <input type="hidden" name="minPrice" value={String(minPrice)} />
                )}
                {maxPrice != null && (
                  <input type="hidden" name="maxPrice" value={String(maxPrice)} />
                )}
                {sort !== "newest" && (
                  <input type="hidden" name="sort" value={sort} />
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 items-start">
            <ProductFilters collections={collections} tags={tags} />

            <div className="flex-1 min-w-0">
              <ProductFilterBar collections={collections} tags={tags} />

              {data.items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.items.map((p) => (
                    <ProductGridCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <EmptyState search={search} hasFilters={baseQuery.size > 0} />
              )}

              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1">
                    <PaginationLink
                      page={safePage - 1}
                      base={baseQuery}
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
                          page={item as number}
                          base={baseQuery}
                          active={item === safePage}
                        >
                          {item}
                        </PaginationLink>
                      ),
                    )}

                    <PaginationLink
                      page={safePage + 1}
                      base={baseQuery}
                      disabled={safePage === totalPages}
                      ariaLabel="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </PaginationLink>
                  </div>

                  <p className="text-xs text-gray-400">
                    Page {safePage} of {totalPages} · Showing{" "}
                    {(safePage - 1) * data.limit + 1}–
                    {Math.min(safePage * data.limit, data.total)} of{" "}
                    {data.total}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ─── Product card ─────────────────────────────────────────────── */

function ProductGridCard({ product }: { product: ProductListItem }) {
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

/* ─── Pagination link ───────────────────────────────────────────── */

function PaginationLink({
  page,
  base,
  active,
  disabled,
  ariaLabel,
  children,
}: {
  page: number;
  base: URLSearchParams;
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

  const next = new URLSearchParams(base.toString());
  if (page > 1) next.set("page", String(page));
  else next.delete("page");
  const qs = next.toString();
  const href = qs ? `/products?${qs}` : `/products`;

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function EmptyState({
  search,
  hasFilters,
}: {
  search: string;
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <PackageSearch className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-gray-600 font-semibold">
        {search
          ? `No products match “${search}”`
          : hasFilters
            ? "No products match your filters"
            : "No products available yet"}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "Check back soon."}
      </p>
      {(search || hasFilters) && (
        <Link
          href="/products"
          className="mt-4 px-5 py-2 rounded-xl bg-[#ff6b6b] text-white text-sm font-semibold hover:bg-[#ee5253] transition-colors"
        >
          Clear all filters
        </Link>
      )}
    </div>
  );
}

export const metadata = {
  title: "All Products – Personalised Gifts",
  description: "Browse our full catalog of personalised products and gifts.",
};
