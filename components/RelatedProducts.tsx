import { Heart } from "lucide-react";
import StarRating from "./StarRating";

const related = [
  {
    id: 1,
    name: "Personalised Graduation Frame",
    price: "AU$49.00",
    rating: 4.9,
    reviews: 23,
    bg: "from-purple-100 to-pink-100",
    emoji: "🖼️",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Custom Graduation Bear Plush",
    price: "AU$42.00",
    rating: 4.7,
    reviews: 15,
    bg: "from-yellow-100 to-amber-100",
    emoji: "🧸",
    badge: null,
  },
  {
    id: 3,
    name: "Engraved Graduation Medal",
    price: "AU$55.00",
    rating: 5.0,
    reviews: 8,
    bg: "from-teal-100 to-cyan-100",
    emoji: "🏅",
    badge: "New",
  },
  {
    id: 4,
    name: "Graduation Cap Charm Bracelet",
    price: "AU$32.00",
    rating: 4.8,
    reviews: 41,
    bg: "from-rose-100 to-pink-100",
    emoji: "📿",
    badge: null,
  },
];

export default function RelatedProducts() {
  return (
    <section className="py-12 bg-[#f7f7f7] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You might also like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {related.map((product) => (
            <a
              key={product.id}
              href="#"
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="relative">
                <div
                  className={`aspect-square bg-gradient-to-br ${product.bg} flex items-center justify-center`}
                >
                  <span className="text-5xl">{product.emoji}</span>
                </div>
                {product.badge && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      product.badge === "Bestseller"
                        ? "bg-[#2a9d8f] text-white"
                        : "bg-orange-400 text-white"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <Heart className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1.5">
                  {product.name}
                </p>
                <StarRating rating={product.rating} count={product.reviews} />
                <p className="mt-2 font-bold text-gray-900 text-sm">
                  {product.price}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
