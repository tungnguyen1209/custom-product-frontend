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

export default function ProductPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
            {["Home", "Graduation", "Sashes & Accessories"].map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <a href="#" className="hover:text-[#2a9d8f] transition-colors">
                  {crumb}
                </a>
              </span>
            ))}
            <span className="flex items-center gap-1 text-gray-600">
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">
                Personalised Grad Cap Sash
              </span>
            </span>
          </nav>
        </div>

        {/* Product section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* Left – Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <TemplatePreviewLoader />
            </div>

            {/* Right – Product info */}
            <div className="flex flex-col gap-6">
              {/* Category tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#2a9d8f] bg-[#e8f5f4] px-3 py-1 rounded-full">
                  🎓 Graduation Gifts
                </span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  🔥 Popular — 48 sold this week
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                Personalised Grad Cap Cartoon Character Graduation Sash with
                Name and Year — Graduation Keepsake Gift for Class of 2026
                Graduates
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={4.8} count={9} size="md" />
                <span className="text-sm text-[#2a9d8f] font-medium hover:underline cursor-pointer">
                  See all reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  AU$37.00
                </span>
                <span className="text-sm text-gray-400 line-through">
                  AU$52.00
                </span>
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  29% OFF
                </span>
              </div>

              {/* Options & CTA */}
              <CustomizationFormLoader />

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
        <RelatedProducts />
      </main>

      <Footer />
    </>
  );
}
