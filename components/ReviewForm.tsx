"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createProductReview, type ProductReview } from "@/lib/api";

interface ReviewFormProps {
  productId: string | number;
  onCreated: (review: ProductReview) => void;
  onCancel?: () => void;
}

const MAX_TITLE = 200;
const MAX_BODY = 5000;
const MAX_AUTHOR = 80;

export default function ReviewForm({
  productId,
  onCreated,
  onCancel,
}: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // `null` means "not edited yet" — the input shows the derived default until
  // the user types. Once typed, their value is preserved.
  const [authorDraft, setAuthorDraft] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAuthor = useMemo(() => {
    if (!isAuthenticated || !user) return "";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return name || user.email || "";
  }, [isAuthenticated, user]);

  const author = authorDraft ?? defaultAuthor;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please pick a star rating.");
      return;
    }
    if (!isAuthenticated && !author.trim()) {
      setError("Please tell us your name.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProductReview(productId, {
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
        author: author.trim() || null,
      });
      onCreated(created);
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setBody("");
      setAuthorDraft(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Share your experience
      </h3>

      <fieldset className="mb-4">
        <legend className="block text-xs font-semibold text-gray-600 mb-1.5">
          Your rating
        </legend>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= activeRating;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                onMouseEnter={() => setHoverRating(value)}
                onFocus={() => setHoverRating(value)}
                onBlur={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                className="p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/30"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    filled
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-2 text-xs text-gray-400">
            {rating > 0 ? `${rating} / 5` : "Pick a rating"}
          </span>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Your name {isAuthenticated ? "" : "*"}
          </label>
          <input
            type="text"
            required={!isAuthenticated}
            maxLength={MAX_AUTHOR}
            value={author}
            onChange={(e) => setAuthorDraft(e.target.value)}
            placeholder="e.g. Jane D."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            maxLength={MAX_TITLE}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your review"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Your review (optional)
        </label>
        <textarea
          rows={5}
          maxLength={MAX_BODY}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you love? What could be better?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b] resize-y"
        />
        <div className="mt-1 flex justify-end text-[11px] text-gray-400">
          {body.length}/{MAX_BODY}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-bold transition-colors disabled:opacity-70"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit review
        </button>
      </div>
    </form>
  );
}
