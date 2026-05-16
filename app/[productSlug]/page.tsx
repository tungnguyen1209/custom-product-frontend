import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import CustomizationFormLoader from "@/components/CustomizationFormLoader";
import CustomizationFormSkeleton from "@/components/CustomizationFormSkeleton";
import DeferMount from "@/components/DeferMount";
import DynamicPrice from "@/components/DynamicPrice";
import ShippingInfo from "@/components/ShippingInfo";
import ProductDescription from "@/components/ProductDescription";
import ReviewsSection from "@/components/ReviewsSection";
import RelatedProducts from "@/components/RelatedProducts";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import {
  getProduct,
  getProductReviews,
  getProductVariant,
  type ProductBasicInfo,
  type ProductReviewsResponse,
} from "@/lib/api";
import ProductGallerySection from "./ProductGallerySection";

interface Props {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SITE_NAME = "Gifthub";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CURRENCY = "USD";
const SEO_DESCRIPTION_LIMIT = 160;

/**
 * Parse a `<anything>-p<id>` slug. The leading part is informational (used
 * for SEO + nice URLs) and may contain dashes itself; the id is the numeric
 * suffix after the *last* `-p`. Returns `null` if the slug doesn't fit the
 * pattern.
 */
function parseProductSlug(
  slug: string,
): { id: string; leading: string } | null {
  if (!slug) return null;
  const match = /^(.*)-p(\d+)$/.exec(slug);
  if (!match) return null;
  return { leading: match[1] ?? "", id: match[2] };
}

/**
 * Canonical URL slug for a product = `<product.slug>-p<id>` (falls back to
 * `product-p<id>` when the product has no slug yet). Letters lower-cased and
 * stripped to a URL-safe shape so user-supplied leading text doesn't drift
 * from the canonical form.
 */
function canonicalSlugFor(
  product: { id: number; slug: string | null },
): string {
  const cleaned = (product.slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const leading = cleaned || "product";
  return `${leading}-p${product.id}`;
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

function buildSeoDescription(product: ProductBasicInfo): string {
  if (product.description) {
    const cleaned = stripHtml(product.description);
    if (cleaned) return truncate(cleaned, SEO_DESCRIPTION_LIMIT);
  }
  const fallback = `${product.name} — personalised gifts from ${SITE_NAME}. Custom designs that tell your story.`;
  return truncate(fallback, SEO_DESCRIPTION_LIMIT);
}

// Dedupe getProduct(id) within a single request — generateMetadata and the
// page component both fetch the same product. React `cache` memoizes by args
// for the duration of the request. The fetch itself is also tagged with
// `next.revalidate: 60` so the response stays cached across requests for a
// minute, reducing backend hits for repeat visitors and crawlers.
const fetchProduct = cache(async (id: string): Promise<ProductBasicInfo> =>
  getProduct(id, { next: { revalidate: 60, tags: [`product:${id}`] } }),
);

async function safeGetProduct(id: string): Promise<ProductBasicInfo | null> {
  try {
    return await fetchProduct(id);
  } catch {
    return null;
  }
}

const fetchReviewSummary = cache(
  async (id: string): Promise<ProductReviewsResponse | null> => {
    try {
      return await getProductReviews(
        id,
        { page: 1, limit: 1 },
        { next: { revalidate: 60, tags: [`product-reviews:${id}`] } },
      );
    } catch {
      return null;
    }
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const parsed = parseProductSlug(productSlug);
  if (!parsed) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const product = await safeGetProduct(parsed.id);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const name = product.name || `Product ${parsed.id}`;
  const description = buildSeoDescription(product);
  const images = (product.gallery ?? []).slice(0, 4);
  // Always point the canonical URL at the proper slug form so non-canonical
  // visits (e.g. `/anything-p123`) don't compete with the real product page
  // in search engines.
  const path = `/${canonicalSlugFor(product)}`;

  return {
    title: name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: name,
      description,
      url: path,
      siteName: SITE_NAME,
      images: images.map((src) => ({ url: src, alt: name })),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images,
    },
    robots: product.isActive
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { productSlug } = await params;
  const parsed = parseProductSlug(productSlug);
  if (!parsed) notFound();

  // Read `?variant=<id>` so we can SSR the variant's price directly instead
  // of rendering `basePrice` and letting CustomizationForm flip it after
  // hydration (which produces a visible price "jump" on shared links).
  const sp = await searchParams;
  const variantParam = typeof sp.variant === "string" ? sp.variant : null;

  const [product, reviewSummary] = await Promise.all([
    safeGetProduct(parsed.id),
    fetchReviewSummary(parsed.id),
  ]);
  // Backend filters isActive: true in findByExternalId, so an inactive (or
  // missing) product surfaces as a 404 here.
  if (!product) notFound();

  // If the visitor landed on a non-canonical leading slug (e.g.
  // `random-text-p123`), 301-redirect them to the proper `<slug>-p<id>` URL.
  // This keeps inbound links permissive while keeping the canonical URL clean.
  const canonical = canonicalSlugFor(product);
  if (canonical !== productSlug) {
    redirect(`/${canonical}`);
  }

  const productName = product.name || `Product ${parsed.id}`;
  const reviewCount = reviewSummary?.total ?? 0;
  const averageRating = reviewSummary?.averageRating ?? 0;
  const galleryImages = product.gallery ?? [];
  const basePrice = Number(product.basePrice);
  const comparePrice =
    product.comparePrice != null ? Number(product.comparePrice) : null;
  const productPath = `/${canonical}`;
  const productUrl = `${SITE_URL}${productPath}`;
  const cleanDescription = product.description
    ? stripHtml(product.description)
    : "";
  const productBasePrice = Number.isFinite(basePrice) ? basePrice : 0;
  const productCompare =
    comparePrice != null && Number.isFinite(comparePrice) ? comparePrice : null;

  // Resolve the initial display price. When the URL pins a variant, fetch
  // its price server-side and use that — so the first paint is correct and
  // CustomizationForm's later `wm-price-update` is a no-op rather than a
  // user-visible flip. Falls back to the product's base values when the
  // variant isn't stored or the lookup fails.
  const variantPreview = variantParam
    ? await getProductVariant(Number(parsed.id), variantParam)
    : null;
  const safeBasePrice =
    variantPreview?.price != null && Number.isFinite(variantPreview.price)
      ? variantPreview.price
      : productBasePrice;
  const safeComparePrice =
    variantPreview?.comparePrice != null &&
    Number.isFinite(variantPreview.comparePrice)
      ? variantPreview.comparePrice
      : productCompare;
  const hasDiscount =
    safeComparePrice != null && safeComparePrice > safeBasePrice;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description:
      cleanDescription ||
      `${productName} — personalised gifts from ${SITE_NAME}.`,
    sku: product.externalId,
    productID: product.externalId,
    url: productUrl,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: safeBasePrice.toFixed(2),
      priceCurrency: CURRENCY,
      availability: product.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (galleryImages.length > 0) {
    productJsonLd.image = galleryImages;
  }
  if (reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount,
    };
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Meaningful Gifts",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Preload the hero image so the browser kicks off the request before
          React hydrates the gallery client component. Hoisted to <head> by
          React 19. fetchPriority="high" promotes it above icon / font fetches. */}
      {galleryImages[0] && (
        <link
          rel="preload"
          as="image"
          href={galleryImages[0]}
          fetchPriority="high"
        />
      )}

      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-gray-400 flex-wrap"
          >
            <Link
              href="/"
              className="hover:text-[#ff6b6b] transition-colors"
            >
              {SITE_NAME}
            </Link>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <Link
                href="/products"
                className="hover:text-[#ff6b6b] transition-colors"
              >
                Meaningful Gifts
              </Link>
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <ChevronRight className="w-3 h-3" />
              <span
                className="truncate max-w-[200px]"
                aria-current="page"
              >
                {productName}
              </span>
            </span>
          </nav>
        </div>

        {/* Product section — 5-column grid on desktop so the gallery (3/5 ≈
            60%) gets visual priority over the customization column (2/5 ≈
            40%). Personalization options stay readable at 40% on the
            narrowest lg breakpoint; the gallery, which carries the bulk of
            the visual storytelling, gets the extra room. Mobile stacks
            unchanged. */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-16 items-start">
            {/* Left – Gallery (Sticky).
                Two breakpoint regimes:
                  • Mobile (`contents`): the wrapper effectively
                    disappears so `<ProductGallerySection>` becomes a
                    direct grid item. Sticky inside falls back to the
                    grid container as its containing block — i.e.
                    gallery + customization combined height — giving the
                    sticky range it needs to pin while the page scrolls.
                  • lg+ (`block lg:col-span-3 lg:self-stretch`): wrapper
                    is the grid item, spans 3 of 5 cols (= 60%), and
                    stretches to the row height (max of left/right) so
                    sticky inside still has range while the customization
                    column on the right is scrolled. */}
            <div className="contents lg:block lg:col-span-3 lg:self-stretch">
              {/* Gallery pins itself via `StickyPreviewWrapper`'s
                  internal `sticky top-24 lg:top-32`. The personalization
                  progress bar moved back to the right column (top of
                  the options list) so it sits next to the fields the
                  customer is actively filling. */}
              <ProductGallerySection
                gallery={galleryImages}
                alt={productName}
              />
            </div>

            {/* Right – Product info & Customization Form (40% on lg+) */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#ff6b6b] bg-[#fff0f0] px-3 py-1 rounded-full">
                  💝 Meaningful Gifts
                </span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  🔥 Popular — 48 sold this week
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                {productName}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                {reviewCount > 0 ? (
                  <>
                    <StarRating
                      rating={averageRating}
                      count={reviewCount}
                      size="md"
                    />
                    <a
                      href="#reviews"
                      className="text-sm text-[#ff6b6b] font-medium hover:underline"
                    >
                      See all reviews
                    </a>
                  </>
                ) : (
                  <a
                    href="#reviews"
                    className="text-sm text-[#ff6b6b] font-medium hover:underline"
                  >
                    Be the first to review
                  </a>
                )}
              </div>

              <DynamicPrice
                basePrice={safeBasePrice}
                baseComparePrice={safeComparePrice}
              />
              {/* SEO-friendly price hint for bots when the dynamic price hasn't
                  hydrated yet — read by crawlers, hidden visually. */}
              <p className="sr-only">
                Price: ${safeBasePrice.toFixed(2)} {CURRENCY}
                {hasDiscount && safeComparePrice != null
                  ? `, was $${safeComparePrice.toFixed(2)}`
                  : ""}
                .
              </p>

              {/* Defer the heavy customization stack (WM SDK + Fabric prep)
                  until the browser is idle or the user moves toward the form.
                  Skeleton is shown immediately so the layout is stable. */}
              <DeferMount
                trigger="idle"
                fallback={<CustomizationFormSkeleton />}
                timeoutMs={3000}
              >
                <CustomizationFormLoader
                  productId={parsed.id}
                  productName={productName}
                  basePrice={safeBasePrice}
                  imageUrl={galleryImages[0] ?? null}
                  sizeChartHtml={product.sizeChartHtml ?? null}
                />
              </DeferMount>
            </div>
          </div>
        </section>

        {/* Below-the-fold content uses the SAME 5-col grid so reviews +
            related-products track under the gallery (col-span-3) and
            shipping/description sit under the customization form
            (col-span-2). The related-products carousel was previously a
            full-width band — moving it into the left column keeps it
            visually aligned with the gallery + reviews stack and stops
            it from reading as an unrelated banner floating between the
            buy area and the info area. */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-16 items-start pt-4 border-t border-gray-100">
            <div
              id="reviews"
              className="lg:col-span-3 flex flex-col gap-12"
            >
              <DeferMount trigger="visible" rootMargin="400px">
                <ReviewsSection productId={parsed.id} />
              </DeferMount>
              <DeferMount trigger="visible" rootMargin="400px">
                <RelatedProducts productId={parsed.id} />
              </DeferMount>
            </div>
            <DeferMount
              className="lg:col-span-2 flex flex-col gap-12"
              trigger="visible"
              rootMargin="400px"
            >
              <ShippingInfo />
              <ProductDescription
                description={product.description ?? null}
              />
            </DeferMount>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
