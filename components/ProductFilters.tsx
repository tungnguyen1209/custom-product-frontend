"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TaxonomyTerm, ProductSort } from "@/lib/api";

interface CommonProps {
  collections: TaxonomyTerm[];
  tags: TaxonomyTerm[];
}

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

/* ─── Shared hook: read + write URL filter params ──────────────── */

function useFilterParams() {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedCollections = useMemo(
    () =>
      (search.get("collections") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [search],
  );
  const selectedTags = useMemo(
    () =>
      (search.get("tags") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [search],
  );

  const minPriceParam = search.get("minPrice") ?? "";
  const maxPriceParam = search.get("maxPrice") ?? "";
  const sortParam = (search.get("sort") ?? "newest") as ProductSort;
  const searchTerm = search.get("q") ?? "";

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      // Any filter change resets pagination.
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `/products?${qs}` : "/products");
      });
    },
    [router, search],
  );

  const toggleSlug = useCallback(
    (key: "collections" | "tags", slug: string) => {
      const current = key === "collections" ? selectedCollections : selectedTags;
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      push({ [key]: next.length ? next.join(",") : null });
    },
    [push, selectedCollections, selectedTags],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/products?${qs}` : "/products");
    });
  }, [router, searchTerm]);

  const activeCount =
    selectedCollections.length +
    selectedTags.length +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (sortParam !== "newest" ? 1 : 0);

  return {
    selectedCollections,
    selectedTags,
    minPriceParam,
    maxPriceParam,
    sortParam,
    activeCount,
    pending,
    push,
    toggleSlug,
    clearAll,
  };
}

/* ─── Filter panel body (shared by sidebar + drawer) ───────────── */

function FilterPanel({ collections, tags }: CommonProps) {
  const {
    selectedCollections,
    selectedTags,
    minPriceParam,
    maxPriceParam,
    sortParam,
    activeCount,
    pending,
    push,
    toggleSlug,
    clearAll,
  } = useFilterParams();

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sort: true,
    collections: true,
    tags: true,
    price: true,
  });
  const toggleSection = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const applyPrice = () => {
    push({
      minPrice: minPrice.trim() || null,
      maxPrice: maxPrice.trim() || null,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
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
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection
        title="Sort"
        expanded={expanded.sort}
        onToggle={() => toggleSection("sort")}
      >
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                checked={sortParam === opt.value}
                onChange={() =>
                  push({ sort: opt.value === "newest" ? null : opt.value })
                }
                className="w-4 h-4 border-gray-300 accent-[#ff6b6b] cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {collections.length > 0 && (
        <FilterSection
          title={`Collections (${collections.length})`}
          expanded={expanded.collections}
          onToggle={() => toggleSection("collections")}
        >
          <FacetList
            terms={collections}
            selected={selectedCollections}
            onToggle={(slug) => toggleSlug("collections", slug)}
          />
        </FilterSection>
      )}

      {tags.length > 0 && (
        <FilterSection
          title={`Tags (${tags.length})`}
          expanded={expanded.tags}
          onToggle={() => toggleSection("tags")}
        >
          <FacetList
            terms={tags}
            selected={selectedTags}
            onToggle={(slug) => toggleSlug("tags", slug)}
          />
        </FilterSection>
      )}

      <FilterSection
        title="Price Range"
        expanded={expanded.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="flex items-center gap-2">
          <PriceInput value={minPrice} onChange={setMinPrice} placeholder="Min" />
          <span className="text-gray-400 text-sm flex-shrink-0">–</span>
          <PriceInput value={maxPrice} onChange={setMaxPrice} placeholder="Max" />
        </div>
        <button
          onClick={applyPrice}
          className="mt-2.5 w-full py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
        >
          Apply
        </button>
      </FilterSection>

      {pending && (
        <p className="mt-3 text-[11px] text-gray-400 text-center">
          Updating…
        </p>
      )}
    </div>
  );
}

/* ─── Desktop sidebar (rendered as flex sibling of grid) ───────── */

export default function ProductFilters({ collections, tags }: CommonProps) {
  return (
    <aside className="hidden lg:block w-60 flex-shrink-0">
      <div className="sticky top-24">
        <FilterPanel collections={collections} tags={tags} />
      </div>
    </aside>
  );
}

/* ─── In-grid bar: mobile trigger + active chips + mobile drawer
 * Rendered inside the main content column so it sits within the
 * grid's width (not stretched across the sidebar+grid flex row).
 */
export function ProductFilterBar({ collections, tags }: CommonProps) {
  const {
    selectedCollections,
    selectedTags,
    minPriceParam,
    maxPriceParam,
    sortParam,
    activeCount,
    push,
    toggleSlug,
    clearAll,
  } = useFilterParams();

  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowDrawer(true)}
          className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {selectedCollections.map((slug) => {
          const term = collections.find((c) => c.slug === slug);
          return (
            <Chip
              key={`c-${slug}`}
              label={term?.name ?? slug}
              onRemove={() => toggleSlug("collections", slug)}
            />
          );
        })}
        {selectedTags.map((slug) => {
          const term = tags.find((t) => t.slug === slug);
          return (
            <Chip
              key={`t-${slug}`}
              label={term?.name ?? slug}
              onRemove={() => toggleSlug("tags", slug)}
            />
          );
        })}
        {(minPriceParam || maxPriceParam) && (
          <Chip
            label={`$${minPriceParam || "0"} – $${maxPriceParam || "∞"}`}
            onRemove={() => push({ minPrice: null, maxPrice: null })}
          />
        )}
        {sortParam !== "newest" && (
          <Chip
            label={
              SORT_OPTIONS.find((o) => o.value === sortParam)?.label ?? sortParam
            }
            onRemove={() => push({ sort: null })}
          />
        )}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2 ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {showDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white flex flex-col shadow-2xl ml-auto">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff6b6b]" />
                Filters
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel collections={collections} tags={tags} />
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full py-3 rounded-2xl bg-[#ff6b6b] text-white font-semibold text-sm hover:bg-[#ee5253] transition-colors"
              >
                Show products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Small pieces ─────────────────────────────────────────────── */

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
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 hover:text-[#ff6b6b] transition-colors"
      >
        {title}
        {expanded ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        )}
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FacetList({
  terms,
  selected,
  onToggle,
}: {
  terms: TaxonomyTerm[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const MAX_VISIBLE = 12;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? terms : terms.slice(0, MAX_VISIBLE);

  return (
    <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
      {visible.map((term) => (
        <li key={term.slug}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(term.slug)}
              onChange={() => onToggle(term.slug)}
              className="w-4 h-4 rounded border-gray-300 text-[#ff6b6b] accent-[#ff6b6b] cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1 truncate">
              {term.name}
            </span>
            <span className="text-[11px] text-gray-400 tabular-nums">
              {term.productCount}
            </span>
          </label>
        </li>
      ))}
      {terms.length > MAX_VISIBLE && (
        <li>
          <button
            onClick={() => setShowAll((p) => !p)}
            className="text-xs text-[#ff6b6b] hover:underline mt-1"
          >
            {showAll ? "Show less" : `Show all (${terms.length})`}
          </button>
        </li>
      )}
    </ul>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        $
      </span>
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-6 pr-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent"
      />
    </div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
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
