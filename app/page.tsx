import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import TemplatePreviewLoader from "@/components/TemplatePreviewLoader";
import CustomizationFormLoader from "@/components/CustomizationFormLoader";
import ShippingInfo from "@/components/ShippingInfo";
import ProductDescription from "@/components/ProductDescription";
import ReviewsSection from "@/components/ReviewsSection";
import RelatedProducts from "@/components/RelatedProducts";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import StickyPreviewWrapper from "@/components/StickyPreviewWrapper";

export default function ProductPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
            {["Gifthub", "Family Gifts", "Home Decor"].map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
                <a href="#" className="hover:text-[#ff6b6b] transition-colors font-medium">
                  {crumb}
                </a>
              </span>
            ))}
            <span className="flex items-center gap-2 text-gray-600 font-semibold">
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="truncate max-w-[200px]">
                Personalized Throw Pillow
              </span>
            </span>
          </nav>
        </div>

        {/* Product section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* Left – Gallery */}
            <StickyPreviewWrapper className="lg:sticky lg:top-28 lg:self-start">
              <TemplatePreviewLoader />
            </StickyPreviewWrapper>

            {/* Right – Product info */}
            <div className="flex flex-col gap-8">
              {/* Category tag */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b6b] bg-[#fff0f0] px-4 py-1.5 rounded-full border border-[#ff6b6b]/10">
                  💝 Meaningful Gifts
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
                  🔥 Trending — 128 sold this week
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                Personalized Family Member Throw Pillow — A Warm Gift For Your Home
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating rating={4.9} count={24} size="md" />
                <span className="text-sm text-[#ff6b6b] font-bold hover:underline cursor-pointer decoration-2 underline-offset-4">
                  See all reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-gray-900">
                    $24.99
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through">
                      $35.99
                    </span>
                    <span className="text-[11px] font-bold text-white bg-[#ff6b6b] px-2.5 py-0.5 rounded-full">
                      SAVE 30%
                    </span>
                  </div>
                </div>
              </div>

              {/* Options & CTA */}
              <CustomizationFormLoader productId="2497801633" />

              {/* Shipping */}
              <ShippingInfo />

              {/* Description accordion */}
              <ProductDescription />
            </div>
          </div>
        </section>

        {/* Reviews */}
        <ReviewsSection />

        {/* Related products */}
        <RelatedProducts productId={null} />
      </main>

      <Footer />
    </>
  );
}
