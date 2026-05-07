"use client";

import { useState } from "react";
import { ThumbsUp, ChevronDown } from "lucide-react";
import StarRating from "./StarRating";

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Jessica M.",
    avatar: "JM",
    rating: 5,
    date: "12 Apr 2026",
    title: "Absolutely beautiful — my daughter cried happy tears!",
    body: "I ordered this for my daughter's university graduation and it arrived in a gorgeous gift box. The personalisation was perfect and the cartoon character looked just like her. She wore it proudly at the ceremony and everyone asked where I got it. 100% recommend!",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    author: "Thomas K.",
    avatar: "TK",
    rating: 5,
    date: "3 Apr 2026",
    title: "Great quality, fast delivery",
    body: "Ordered this as a surprise gift. The quality is much better than I expected — the material is silky and the print is vibrant. Arrived well within the estimated time and the packaging made it feel extra special. Will definitely order again for my other kids' graduations.",
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    author: "Priya S.",
    avatar: "PS",
    rating: 4,
    date: "28 Mar 2026",
    title: "Lovely keepsake",
    body: "Really pleased with this purchase. The sash is exactly as shown and the name and year are printed clearly. Took about 10 days to arrive which was fine. Only reason for 4 stars is I wished there were more cartoon character options. Otherwise perfect!",
    helpful: 9,
    verified: true,
  },
  {
    id: 4,
    author: "David L.",
    avatar: "DL",
    rating: 5,
    date: "20 Mar 2026",
    title: "Perfect graduation gift",
    body: "Bought this for my best friend's graduation. She absolutely loved it! The sash is high quality and the personalisation looks very professional. The gift box made unwrapping it feel really special. Highly recommend for any graduate.",
    helpful: 15,
    verified: true,
  },
  {
    id: 5,
    author: "Emma W.",
    avatar: "EW",
    rating: 5,
    date: "15 Mar 2026",
    title: "Exceeded expectations",
    body: "I was a bit hesitant buying online but this exceeded all my expectations. The sash is beautifully made and the colours are vivid. Came in a lovely gift box. The recipient was so touched by the personalisation. Will be ordering one for every graduation in the family going forward!",
    helpful: 31,
    verified: true,
  },
  {
    id: 6,
    author: "Rachel N.",
    avatar: "RN",
    rating: 4,
    date: "8 Mar 2026",
    title: "Cute and well made",
    body: "Really cute sash, well made and personalised beautifully. Delivery was prompt and packaging is lovely. Would give 5 stars but the year text was slightly smaller than I expected. Overall very happy with the purchase!",
    helpful: 7,
    verified: false,
  },
];

const ratingBreakdown = [
  { stars: 5, count: 7, pct: 78 },
  { stars: 4, count: 1, pct: 11 },
  { stars: 3, count: 1, pct: 11 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

export default function ReviewsSection() {
  const [helpfulMap, setHelpfulMap] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const toggleHelpful = (id: number) =>
    setHelpfulMap((m) => ({ ...m, [id]: !m[id] }));

  const displayed = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Customer Reviews
        </h2>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          <div className="flex flex-col items-center justify-center bg-[#fff0f0] rounded-2xl p-6 min-w-[140px]">
            <span className="text-5xl font-bold text-gray-900">4.8</span>
            <StarRating rating={4.8} size="md" />
            <span className="text-sm text-gray-500 mt-2">9 reviews</span>
          </div>

          <div className="flex-1 flex flex-col gap-2 justify-center">
            {ratingBreakdown.map(({ stars, count, pct }) => (
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

        {/* Review list */}
        <div className="flex flex-col gap-6">
          {displayed.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="text-xs text-[#ff6b6b] bg-[#fff0f0] px-2 py-0.5 rounded-full font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>

              <p className="font-semibold text-sm text-gray-900 mb-1.5">
                {review.title}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.body}
              </p>

              <button
                onClick={() => toggleHelpful(review.id)}
                className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                  helpfulMap[review.id]
                    ? "text-[#ff6b6b]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful (
                {review.helpful + (helpfulMap[review.id] ? 1 : 0)})
              </button>
            </div>
          ))}
        </div>

        {reviews.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-all"
          >
            {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </section>
  );
}
