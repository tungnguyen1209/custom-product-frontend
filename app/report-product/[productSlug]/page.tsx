import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProduct, type ProductBasicInfo } from "@/lib/api";
import ReportForm from "./ReportForm";

interface Props {
  params: Promise<{ productSlug: string }>;
}

export const metadata: Metadata = {
  title: "Inappropriate Content",
  robots: { index: false, follow: false },
};

function parseProductSlug(slug: string): { id: string } | null {
  if (!slug) return null;
  const match = /^(.*)-p(\d+)$/.exec(slug);
  if (!match) return null;
  return { id: match[2] };
}

async function safeGetProduct(id: string): Promise<ProductBasicInfo | null> {
  try {
    return await getProduct(id, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export default async function ReportProductPage({ params }: Props) {
  const { productSlug } = await params;
  const parsed = parseProductSlug(productSlug);
  if (!parsed) notFound();

  const product = await safeGetProduct(parsed.id);
  if (!product) notFound();

  const heroImage = product.gallery?.[0] ?? null;
  const productHref = `/${productSlug}`;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6 flex items-center gap-2 text-gray-400">
            <Link href="/" className="text-gray-900 font-semibold hover:underline">
              Home
            </Link>
            <span>/</span>
            <span>Inappropriate Content</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Product image */}
            <div className="lg:col-span-3">
              <Link
                href={productHref}
                className="block aspect-square relative rounded-xl overflow-hidden bg-gray-100"
              >
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={product.name || "Product"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🎁
                  </div>
                )}
                <span className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  Report
                </span>
              </Link>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {product.name}
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-6">
              <ReportForm productId={product.id} />
            </div>

            {/* How does this work? */}
            <aside className="lg:col-span-3">
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  How does this work?
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    When you report a concern a notification is sent to the
                    Gifthub objections team. We review the content and follow
                    up in cases where the content falls outside Gifthub&apos;s
                    guidelines.
                  </p>
                  <p>
                    Due to the volume of emails the team receives, we cannot
                    respond to every query regarding these reports but please
                    rest assured we do check every single report carefully and
                    we&apos;ll be in touch if we need any further information.
                  </p>
                  <p>Thanks again!</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
