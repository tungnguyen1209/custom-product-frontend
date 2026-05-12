"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, ZoomIn } from "lucide-react";
import Header from "@/components/Header";
import TemplatePreviewLoader from "@/components/TemplatePreviewLoader";
import CustomizationFormLoader from "@/components/CustomizationFormLoader";
import DynamicPrice from "@/components/DynamicPrice";
import ShippingInfo from "@/components/ShippingInfo";
import ProductDescription from "@/components/ProductDescription";
import ReviewsSection from "@/components/ReviewsSection";
import RelatedProducts from "@/components/RelatedProducts";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import StickyPreviewWrapper from "@/components/StickyPreviewWrapper";
import {
  getProduct,
  getProductCustomization,
  ProductBasicInfo,
  ProductCustomizationData,
} from "@/lib/api";

interface Props {
  params: Promise<{ productSlug: string }>;
}

function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(num)) return "";
  return `$${num.toFixed(2)}`;
}

export default function ProductPage({ params }: Props) {
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductBasicInfo | null>(null);
  const [customization, setCustomization] =
    useState<ProductCustomizationData | null>(null);
  const [productError, setProductError] = useState(false);
  const [customizationError, setCustomizationError] = useState(false);

  useEffect(() => {
    params.then((p) => {
      const id = p.productSlug.slice(3);
      setProductId(id);
    });
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    // Two parallel requests: basic info + customization (options/templates)
    getProduct(productId)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setProductError(true);
      });

    getProductCustomization(productId)
      .then((data) => {
        if (!cancelled) setCustomization(data);
      })
      .catch(() => {
        if (!cancelled) setCustomizationError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleZoom = () => {
    window.dispatchEvent(new CustomEvent("wm-request-preview"));
  };

  if (productId === null) return null;
  if (!productId) notFound();
  // Backend filters isActive: true in findByExternalId, so an inactive (or
  // missing) product surfaces as a 404 here. Redirect to the not-found page
  // instead of rendering fallback placeholders.
  if (productError) notFound();

  const productName = product?.name ?? `Product ${productId}`;
  const galleryImages = product?.gallery ?? [];

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
            {["Gifthub", "Meaningful Gifts"].map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <a href="#" className="hover:text-[#ff6b6b] transition-colors">
                  {crumb}
                </a>
              </span>
            ))}
            <span className="flex items-center gap-1 text-gray-600">
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{productName}</span>
            </span>
          </nav>
        </div>

        {/* Product section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
            {/* Left – Gallery (Sticky) */}
            <StickyPreviewWrapper
              onClick={handleZoom}
              className="sticky top-24 lg:top-32 z-40 bg-white lg:bg-transparent -mx-4 lg:mx-0 shadow-md lg:shadow-none cursor-pointer group"
            >
              <TemplatePreviewLoader gallery={galleryImages} alt={productName} />

              {/* Desktop zoom hint */}
              <div className="hidden lg:group-hover:flex absolute inset-0 items-center justify-center bg-black/5 transition-colors rounded-2xl pointer-events-none">
                 <div className="bg-white/90 p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    <ZoomIn className="w-6 h-6 text-[#ff6b6b]" />
                 </div>
              </div>

              {/* Mobile Live + Zoom hint */}
              <div className="lg:hidden absolute top-4 right-6 flex items-center gap-2">
                <span className="bg-[#ff6b6b] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                  Live
                </span>
                <div className="bg-white/90 p-1.5 rounded-full shadow-md text-[#ff6b6b]">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
            </StickyPreviewWrapper>

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
                {productError ? `Product ${productId}` : productName}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={4.8} count={9} size="md" />
                <span className="text-sm text-[#ff6b6b] font-medium hover:underline cursor-pointer">
                  See all reviews
                </span>
              </div>

              <DynamicPrice
                basePrice={product ? Number(product.basePrice) : 0}
                baseComparePrice={
                  product?.comparePrice != null
                    ? Number(product.comparePrice)
                    : null
                }
              />

              <CustomizationFormLoader
                productId={productId}
                productName={productName}
                basePrice={product ? Number(product.basePrice) : 0}
                customization={customization}
                customizationError={customizationError}
              />
            </div>
          </div>
        </section>

        <RelatedProducts productId={productId} />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-12">
              <ReviewsSection />
            </div>
            <div className="flex flex-col gap-12">
              <ShippingInfo />
              <ProductDescription description={product?.description ?? null} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
