"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Pencil, ThumbsUp } from "lucide-react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import {
  type ProductReview,
  type ProductReviewsResponse,
  type ReviewRatingBreakdownEntry,
  type ReviewSort,
  getProductReviews,
  markReviewHelpful,
} from "@/lib/api";

interface ReviewsSectionProps {
  productId: string | number;
}

const PAGE_SIZE = 30;

const EMPTY_BREAKDOWN: ReviewRatingBreakdownEntry[] = [5, 4, 3, 2, 1].map(
  (stars) => ({ stars, count: 0, pct: 0 }),
);

function initialsFromName(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatReviewDate(value: string | null, fallback: string): string {
  const iso = value || fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [helpfulPending, setHelpfulPending] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<ReviewSort>("newest");

  // Keep data visible while re-fetching after the first load — only the initial
  // `loading: true` state shows the spinner. This sidesteps cascading state
  // updates inside the effect and matches the rest of the codebase's pattern.
  useEffect(() => {
    let cancelled = false;
    getProductReviews(productId, { page: 1, limit: PAGE_SIZE, sort })
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, sort]);

  const onReviewCreated = useCallback(
    (review: ProductReview) => {
      setShowForm(false);
      setData((prev) => {
        if (!prev) return prev;
        const items = [review, ...prev.items];
        const total = prev.total + 1;
        // Recompute breakdown locally so the summary updates without a refetch.
        const counts = new Map<number, number>();
        for (const entry of prev.breakdown) {
          counts.set(entry.stars, entry.count);
        }
        counts.set(review.rating, (counts.get(review.rating) ?? 0) + 1);
        const totalCount = total;
        const breakdown: ReviewRatingBreakdownEntry[] = [5, 4, 3, 2, 1].map(
          (stars) => {
            const count = counts.get(stars) ?? 0;
            const pct =
              totalCount === 0 ? 0 : Math.round((count / totalCount) * 100);
            return { stars, count, pct };
          },
        );
        const weighted = breakdown.reduce(
          (acc, b) => acc + b.stars * b.count,
          0,
        );
        const averageRating =
          totalCount === 0 ? 0 : Math.round((weighted / totalCount) * 10) / 10;
        return {
          ...prev,
          items,
          total,
          breakdown,
          averageRating,
        };
      });
    },
    [],
  );

  const onMarkHelpful = useCallback(
    async (review: ProductReview) => {
      if (helpfulMap[review.reviewId]) return;
      if (helpfulPending.has(review.reviewId)) return;
      setHelpfulPending((prev) => {
        const next = new Set(prev);
        next.add(review.reviewId);
        return next;
      });
      try {
        const res = await markReviewHelpful(review.reviewId);
        setHelpfulMap((m) => ({ ...m, [review.reviewId]: res.helpfulCount }));
      } catch {
        // Swallow — UI stays in its previous state.
      } finally {
        setHelpfulPending((prev) => {
          const next = new Set(prev);
          next.delete(review.reviewId);
          return next;
        });
      }
    },
    [helpfulMap, helpfulPending],
  );

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const averageRating = data?.averageRating ?? 0;
  const breakdown = data?.breakdown ?? EMPTY_BREAKDOWN;

  const displayed = useMemo(
    () => (showAll ? items : items.slice(0, 3)),
    [items, showAll],
  );

  return (
    <section>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff6b6b] hover:text-[#ee5253]"
          >
            <Pencil className="w-4 h-4" />
            {showForm ? "Cancel" : "Write a review"}
          </button>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row gap-8 mb-6">
          <div className="flex flex-col items-center justify-center bg-[#fff0f0] rounded-2xl p-6 min-w-[140px]">
            <span className="text-5xl font-bold text-gray-900">
              {total === 0 ? "—" : averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} size="md" />
            <span className="text-sm text-gray-500 mt-2">
              {total} {total === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2 justify-center">
            {breakdown.map(({ stars, count, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10 text-right">
                  {stars} ★
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sort + Write-a-review (mobile) */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ReviewSort)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:border-[#ff6b6b]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
              <option value="helpful">Most helpful</option>
            </select>
          </label>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="sm:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff6b6b]"
          >
            <Pencil className="w-4 h-4" />
            {showForm ? "Cancel" : "Write a review"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <ReviewForm
              productId={productId}
              onCreated={onReviewCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* List */}
        {loading && !data ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading reviews…
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {displayed.map((review) => {
              const liked = !!helpfulMap[review.reviewId];
              const liveCount = helpfulMap[review.reviewId] ?? review.helpfulCount;
              return (
                <article
                  key={review.reviewId}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initialsFromName(review.author)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800">
                          {review.author ?? "Anonymous"}
                        </span>
                        {review.verifiedBuyer && (
                          <span className="text-xs text-[#ff6b6b] bg-[#fff0f0] px-2 py-0.5 rounded-full font-medium">
                            ✓ Verified Purchase
                          </span>
                        )}
                        {review.source === "customer" && (
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            Store review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {formatReviewDate(review.reviewedAt, review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <p className="font-semibold text-sm text-gray-900 mb-1.5">
                      {review.title}
                    </p>
                  )}
                  {review.body && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {review.body}
                    </p>
                  )}

                  {review.pictures && review.pictures.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.pictures.map((src) => (
                        <a
                          key={src}
                          href={src}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="block w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 hover:border-[#ff6b6b]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt="Customer review"
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => onMarkHelpful(review)}
                    disabled={liked || helpfulPending.has(review.reviewId)}
                    className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                      liked
                        ? "text-[#ff6b6b]"
                        : "text-gray-400 hover:text-gray-600"
                    } disabled:cursor-default`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful ({liveCount})
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {items.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-all"
          >
            {showAll
              ? "Show fewer reviews"
              : `Show all ${items.length} reviews`}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </section>
  );
}
