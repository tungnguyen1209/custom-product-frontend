"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Globe, Link2, X, Music2, Gift } from "lucide-react";
import { PublicPostSummary } from "@/lib/posts-public";
import { API_BASE_URL } from "@/lib/api";

/** Footer link map. `null` href means the page isn't built yet —
 *  rendered as a non-link so we don't ship dead links in the footer. */
const links: Record<string, Array<{ label: string; href: string | null }>> = {
  "Customer Care": [
    { label: "Help Center", href: "/help-center" },
    { label: "Track Order", href: "/track-order" },
    { label: "Track Ticket", href: "/help-center/track" },
    { label: "Contact Us", href: "/blog/contact-us" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  "Company": [
    { label: "About Us", href: "/blog/about-us" },
    { label: "Shipping & Delivery", href: "/blog/shipping-delivery" },
    { label: "Returns & Exchanges", href: "/blog/returns-exchanges" },
    { label: "Refund Policy", href: "/blog/refund-policy" },
    { label: "Cancel or Change Order", href: "/blog/cancel-change-order" },
    { label: "Payment Methods", href: "/blog/payment-methods" },
  ],
  "Discover": [
    { label: "Family Gifts", href: "/products?tags=family" },
    { label: "Friends Gifts", href: "/products?tags=friends" },
    { label: "Pet Gifts", href: "/products?tags=pet" },
    { label: "Anniversary", href: "/products?tags=anniversary" },
    { label: "Birthday Gifts", href: "/products?tags=birthday" },
  ],
};

const paymentIcons = ["💳", "🔒", "✅"];

export default function Footer() {
  // Fetched client-side so the component stays compatible with every parent
  // (some pages are `"use client"` and can't render an async Server Component).
  // The endpoint is public — no auth header needed.
  const [posts, setPosts] = useState<PublicPostSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/posts?limit=5`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.items) return;
        setPosts(data.items as PublicPostSummary[]);
      })
      .catch(() => {
        // Footer renders fine without posts — silent fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-[#2d3436] text-gray-300 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-2 md:grid-cols-6 ${posts.length > 0 ? "lg:grid-cols-7" : "lg:grid-cols-6"} gap-10 mb-12`}
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff6b6b] flex items-center justify-center">
                <Gift className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Gift<span className="text-[#ff6b6b]">hub</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Every gift tells a story. Gifthub helps you send love through the most unique personalized products.
            </p>
            <div className="flex items-center gap-4 mb-8">
              {[Globe, Link2, X, Music2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#ff6b6b] hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-[13px] text-gray-400 hover:text-[#ff6b6b] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-[13px] text-gray-500 cursor-default">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Latest posts — column is omitted entirely when there's nothing
              published, so the layout collapses back to its 5-col shape. */}
          {posts.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                Latest Posts
              </h4>
              <ul className="space-y-3.5">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[13px] text-gray-400 hover:text-[#ff6b6b] transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-500">
            © 2026 Gifthub Inc. Every gift tells a story.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link
              href="/blog/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/blog/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <span className="cursor-default">Cookie Settings</span>
          </div>
          <div className="flex items-center gap-3">
            {paymentIcons.map((icon, i) => (
              <span
                key={i}
                className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-base border border-gray-700"
              >
                {icon}
              </span>
            ))}
            <span className="text-[10px] text-gray-500 ml-1 font-medium uppercase tracking-tighter">Secure Payment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
