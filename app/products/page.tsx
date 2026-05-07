"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp,
  Star, ChevronLeft, ChevronRight, PackageSearch,
} from "lucide-react";

/* ─── Constants ────────────────────────────────────────────────────────────── */

const CATEGORIES = ["T-Shirts", "Hoodies", "Mugs", "Posters", "Phone Cases", "Tote Bags"];
const ITEMS_PER_PAGE = 16;

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "popular",    label: "Most Popular" },
  { value: "rating",     label: "Highest Rated" },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

const RATING_OPTIONS = [
  { value: 4, label: "4★ & up" },
  { value: 3, label: "3★ & up" },
  { value: 2, label: "2★ & up" },
];

/* ─── Mock product data ─────────────────────────────────────────────────────── */

const PRODUCT_NAMES = [
  "Custom Sunset Wave T-Shirt",
  "Personalized Star Map Hoodie",
  "Custom Name Coffee Mug",
  "Pet Portrait Poster",
  "Monogram Phone Case",
  "Custom Quote Tote Bag",
  "Mountain Landscape Poster",
  "Couple Anniversary Cushion",
];

const MOCK_PRODUCTS: ProductCardData[] = Array.from({ length: 48 }, (_, i) => {
  const originalPrice = Math.round((15 + ((i * 7.3 + 11) % 85)) * 100) / 100;
  const discountPct = [0, 0, 0, 10, 15, 20, 25, 30][i % 8];
  const discountPrice =
    discountPct > 0
      ? Math.round(originalPrice * (1 - discountPct / 100) * 100) / 100
      : originalPrice;
  return {
    id: i + 1,
    slug: `s-p${2497801633 + i}`,
    name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} #${i + 1}`,
    category: CATEGORIES[i % CATEGORIES.length],
    originalPrice,
    discountPrice,
    discountPercent: discountPct,
    rating: Math.round((3.2 + ((i * 0.13) % 1.8)) * 10) / 10,
    reviewCount: 5 + ((i * 31 + 7) % 495),
    image: `https://picsum.photos/seed/prod${i + 1}/480/480`,
    isNew: i < 6,
    inStock: i % 11 !== 0,
  };
});

/* ─── FilterPanel ───────────────────────────────────────────────────────────── */

interface FilterPanelProps {
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  minRating: number;
  onSaleOnly: boolean;
  inStockOnly: boolean;
  expandedSections: Record<string, boolean>;
  activeCount: number;
  onToggleCategory: (cat: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onRatingChange: (v: number) => void;
  onSaleChange: (v: boolean) => void;
  onStockChange: (v: boolean) => void;
  onClear: () => void;
  onToggleSection: (s: string) => void;
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 hover:text-[#ff6b6b] transition-colors"
      >
        {title}
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" />
        }
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FilterPanel({
  selectedCategories, minPrice, maxPrice, minRating,
  onSaleOnly, inStockOnly, expandedSections, activeCount,
  onToggleCategory, onMinPriceChange, onMaxPriceChange,
  onRatingChange, onSaleChange, onStockChange, onClear, onToggleSection,
}: FilterPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#ff6b6b]" />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection
        title="Category"
        expanded={expandedSections.categories}
        onToggle={() => onToggleSection("categories")}
      >
        <ul className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="w-4 h-4 rounded border-gray-300 text-[#ff6b6b] accent-[#ff6b6b] cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {cat}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price range */}
      <FilterSection
        title="Price Range"
        expanded={expandedSections.price}
        onToggle={() => onToggleSection("price")}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full pl-6 pr-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent"
            />
          </div>
          <span className="text-gray-400 text-sm flex-shrink-0">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full pl-6 pr-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent"
            />
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Customer Rating"
        expanded={expandedSections.rating}
        onToggle={() => onToggleSection("rating")}
      >
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === opt.value}
                onChange={() => onRatingChange(minRating === opt.value ? 0 : opt.value)}
                className="w-4 h-4 border-gray-300 accent-[#ff6b6b] cursor-pointer"
              />
              <span className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < opt.value ? "fill-[#e9b44c] text-[#e9b44c]" : "fill-gray-100 text-gray-200"}`}
                  />
                ))}
                <span className="ml-0.5 text-gray-500">&amp; up</span>
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Other */}
      <FilterSection
        title="Other"
        expanded={expandedSections.other}
        onToggle={() => onToggleSection("other")}
      >
        <div className="flex flex-col gap-3">
          <Toggle label="On Sale" checked={onSaleOnly} onChange={onSaleChange} accent />
          <Toggle label="In Stock Only" checked={inStockOnly} onChange={onStockChange} />
        </div>
      </FilterSection>
    </div>
  );
}

function Toggle({
  label, checked, onChange, accent,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: boolean;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ff6b6b] ${
          checked
            ? accent ? "bg-red-500" : "bg-[#ff6b6b]"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

/* ─── Pagination helper ─────────────────────────────────────────────────────── */

function getPaginationRange(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const delta = 1;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  const range: (number | "…")[] = [1];
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push("…");
  range.push(totalPages);
  return range;
}

/* ─── Main page ─────────────────────────────────────────────────────────────── */

export default function ProductsPage() {
  /* Filter state */
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  /* Sort & pagination */
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  /* Mobile filter drawer */
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  /* Collapsible filter sections */
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    other: true,
  });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setOnSaleOnly(false);
    setInStockOnly(false);
    setPage(1);
  }, []);

  /* Derived list */
  const filteredAndSorted = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    if (min > 0 || max < Infinity) {
      list = list.filter((p) => p.discountPrice >= min && p.discountPrice <= max);
    }
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (onSaleOnly) list = list.filter((p) => p.discountPercent > 0);
    if (inStockOnly) list = list.filter((p) => p.inStock);

    switch (sortBy) {
      case "price-asc":  list.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case "price-desc": list.sort((a, b) => b.discountPrice - a.discountPrice); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "popular":    list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default:           list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [selectedCategories, minPrice, maxPrice, minRating, onSaleOnly, inStockOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = filteredAndSorted.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount =
    selectedCategories.length +
    (minPrice || maxPrice ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const filterPanelProps: FilterPanelProps = {
    selectedCategories, minPrice, maxPrice, minRating,
    onSaleOnly, inStockOnly, expandedSections, activeCount: activeFilterCount,
    onToggleCategory: toggleCategory,
    onMinPriceChange: (v) => { setMinPrice(v); setPage(1); },
    onMaxPriceChange: (v) => { setMaxPrice(v); setPage(1); },
    onRatingChange: (v) => { setMinRating(v); setPage(1); },
    onSaleChange: (v) => { setOnSaleOnly(v); setPage(1); },
    onStockChange: (v) => { setInStockOnly(v); setPage(1); },
    onClear: clearFilters,
    onToggleSection: toggleSection,
  };

  return (
    <>
      <Header />

      <main className="flex-1 bg-[#f7f7f7] min-h-screen">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <nav className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <a href="/" className="hover:text-[#ff6b6b] transition-colors">Home</a>
              <span>/</span>
              <span className="text-gray-700 font-medium">All Products</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Personalised Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Discover unique custom gifts for every occasion
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 items-start">

            {/* ── Desktop filter sidebar ──────────────────────────────── */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <FilterPanel {...filterPanelProps} />
            </aside>

            {/* ── Main content area ───────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Top bar: filter button (mobile) + results count + sort */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Mobile filter trigger */}
                  <button
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-colors shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">
                      {filteredAndSorted.length}
                    </span>{" "}
                    products
                  </span>
                </div>

                {/* Sort dropdown */}
                <div className="relative flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((cat) => (
                    <Chip key={cat} label={cat} onRemove={() => toggleCategory(cat)} />
                  ))}
                  {(minPrice || maxPrice) && (
                    <Chip
                      label={`$${minPrice || "0"} – $${maxPrice || "∞"}`}
                      onRemove={() => { setMinPrice(""); setMaxPrice(""); setPage(1); }}
                    />
                  )}
                  {minRating > 0 && (
                    <Chip
                      label={`${minRating}★ & up`}
                      onRemove={() => { setMinRating(0); setPage(1); }}
                    />
                  )}
                  {onSaleOnly && (
                    <Chip label="On Sale" onRemove={() => { setOnSaleOnly(false); setPage(1); }} />
                  )}
                  {inStockOnly && (
                    <Chip label="In Stock" onRemove={() => { setInStockOnly(false); setPage(1); }} />
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Product grid */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
              ) : (
                <EmptyState onClear={clearFilters} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1">
                    <PaginationBtn
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </PaginationBtn>

                    {getPaginationRange(safePage, totalPages).map((item, idx) =>
                      item === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
                        >
                          …
                        </span>
                      ) : (
                        <PaginationBtn
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          active={item === safePage}
                        >
                          {item}
                        </PaginationBtn>
                      ),
                    )}

                    <PaginationBtn
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </PaginationBtn>
                  </div>

                  <p className="text-xs text-gray-400">
                    Page {safePage} of {totalPages} ·{" "}
                    Showing{" "}
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(safePage * ITEMS_PER_PAGE, filteredAndSorted.length)}{" "}
                    of {filteredAndSorted.length} products
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Mobile filter drawer ──────────────────────────────────────── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff6b6b]" />
                Filters
              </h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel {...filterPanelProps} />
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-3 rounded-2xl bg-[#ff6b6b] text-white font-semibold text-sm hover:bg-[#ee5253] transition-colors"
              >
                Show {filteredAndSorted.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Small reusable pieces ─────────────────────────────────────────────────── */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-[#fff0f0] text-[#ff6b6b] text-xs font-medium rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[#ff6b6b] hover:text-white transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function PaginationBtn({
  onClick, disabled, active, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b]/30"
          : disabled
          ? "border border-gray-100 bg-white text-gray-300 cursor-not-allowed"
          : "border border-gray-200 bg-white text-gray-600 hover:border-[#ff6b6b] hover:text-[#ff6b6b]"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <PackageSearch className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-gray-600 font-semibold">No products match your filters</p>
      <p className="text-sm text-gray-400 mt-1">Try adjusting or clearing your filters</p>
      <button
        onClick={onClear}
        className="mt-4 px-5 py-2 rounded-xl bg-[#ff6b6b] text-white text-sm font-semibold hover:bg-[#ee5253] transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
