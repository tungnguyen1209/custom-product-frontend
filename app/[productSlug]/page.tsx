import { notFound } from "next/navigation";
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
import { getProduct, type ProductBasicInfo } from "@/lib/api";
import ProductGallerySection from "./ProductGallerySection";

interface Props {
  params: Promise<{ productSlug: string }>;
}

const SITE_NAME = "Gifthub";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const CURRENCY = "USD";
const SEO_DESCRIPTION_LIMIT = 160;

function extractProductId(slug: string): string | null {
  // URL pattern is `/s-p{id}` — strip the 3-char prefix to recover the id.
  if (!slug || slug.length <= 3) return null;
  const id = slug.slice(3);
  return id || null;
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

async function safeGetProduct(id: string): Promise<ProductBasicInfo | null> {
  try {
    return await getProduct(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const productId = extractProductId(productSlug);
  if (!productId) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const product = await safeGetProduct(productId);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const name = product.name || `Product ${productId}`;
  const description = buildSeoDescription(product);
  const images = (product.gallery ?? []).slice(0, 4);
  const path = `/${productSlug}`;

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

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  const productId = extractProductId(productSlug);
  if (!productId) notFound();

  const product = await safeGetProduct(productId);
  // Backend filters isActive: true in findByExternalId, so an inactive (or
  // missing) product surfaces as a 404 here.
  if (!product) notFound();

  const productName = product.name || `Product ${productId}`;
  const galleryImages = product.gallery ?? [];
  const basePrice = Number(product.basePrice);
  const comparePrice =
    product.comparePrice != null ? Number(product.comparePrice) : null;
  const productPath = `/${productSlug}`;
  const productUrl = `${SITE_URL}${productPath}`;
  const cleanDescription = product.description
    ? stripHtml(product.description)
    : "";
  const safeBasePrice = Number.isFinite(basePrice) ? basePrice : 0;
  const safeComparePrice =
    comparePrice != null && Number.isFinite(comparePrice) ? comparePrice : null;
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

        {/* Product section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
            {/* Left – Gallery (Sticky) */}
            <ProductGallerySection
              gallery={galleryImages}
              alt={productName}
            />

            {/* Right – Product info & Customization Form */}
            <div className="flex flex-col gap-6">
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
                <StarRating rating={4.8} count={9} size="md" />
                <a
                  href="#reviews"
                  className="text-sm text-[#ff6b6b] font-medium hover:underline"
                >
                  See all reviews
                </a>
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
                  productId={productId}
                  productName={productName}
                  basePrice={safeBasePrice}
                />
              </DeferMount>
            </div>
          </div>
        </section>

        {/* Below-the-fold — mount only when scrolling near so they don't
            block the main thread during the initial paint. */}
        <DeferMount trigger="visible" rootMargin="400px">
          <RelatedProducts productId={productId} />
        </DeferMount>

        <DeferMount trigger="visible" rootMargin="400px">
          <section
            id="reviews"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-12">
                <ReviewsSection />
              </div>
              <div className="flex flex-col gap-12">
                <ShippingInfo />
                <ProductDescription
                  description={product.description ?? null}
                />
              </div>
            </div>
          </section>
        </DeferMount>
      </main>

      <Footer />
    </>
  );
}
