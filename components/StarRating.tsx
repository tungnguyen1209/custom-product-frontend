import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}

export default function StarRating({
  rating,
  count,
  size = "sm",
}: StarRatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${starSize} ${
              s <= Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : s - 0.5 <= rating
                ? "text-yellow-400 fill-yellow-200"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500">
          {rating.toFixed(1)} ({count} reviews)
        </span>
      )}
    </div>
  );
}
