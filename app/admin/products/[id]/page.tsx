"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { TaxonomyAdminEntry, taxonomyApi } from "@/lib/admin";
import {
  AdminProduct,
  AdminRelation,
  productsAdminApi,
} from "@/lib/products-admin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminProductDetailPage({ params }: PageProps) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr, 10);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError("Invalid product ID");
      return;
    }
    try {
      const data = await productsAdminApi.get(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </div>
    );
  }
  if (!product) {
    return <div className="text-sm text-slate-400">Loading product…</div>;
  }

  return <ProductEditor product={product} onUpdated={setProduct} />;
}

function ProductEditor({
  product,
  onUpdated,
}: {
  product: AdminProduct;
  onUpdated: (p: AdminProduct) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-500">
            #{product.id} · {product.externalId}
            {product.slug && <> · {product.slug}</>}
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          ← Back
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <BasicFieldsCard product={product} onUpdated={onUpdated} />
          <TagsCard product={product} onUpdated={onUpdated} />
          <CollectionsCard product={product} onUpdated={onUpdated} />
          <RelationsCard productId={product.id} />
        </div>
        <div className="flex flex-col gap-6">
          <PreviewCard product={product} />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ product }: { product: AdminProduct }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Gallery ({product.gallery?.length ?? 0})
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(product.gallery ?? []).slice(0, 6).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="h-24 w-full rounded border border-slate-200 object-cover"
          />
        ))}
      </div>
      {product.gallery && product.gallery.length > 6 && (
        <p className="mt-2 text-xs text-slate-400">
          +{product.gallery.length - 6} more
        </p>
      )}
      {product.shop && (
        <div className="mt-3 text-xs text-slate-500">
          Source: <code>{product.shop}</code>
        </div>
      )}
    </div>
  );
}

function BasicFieldsCard({
  product,
  onUpdated,
}: {
  product: AdminProduct;
  onUpdated: (p: AdminProduct) => void;
}) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [comparePrice, setComparePrice] = useState(
    product.comparePrice == null ? "" : String(product.comparePrice),
  );
  const [isActive, setIsActive] = useState(product.isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== product.name ||
    slug !== (product.slug ?? "") ||
    description !== (product.description ?? "") ||
    basePrice !== String(product.basePrice) ||
    comparePrice !==
      (product.comparePrice == null ? "" : String(product.comparePrice)) ||
    isActive !== product.isActive;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await productsAdminApi.update(product.id, {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description || null,
        basePrice: Number(basePrice),
        comparePrice: comparePrice === "" ? null : Number(comparePrice),
        isActive,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Basic fields
        </h2>
        <button
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="grid gap-3">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </Field>
        <Field label="Slug">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-900 focus:outline-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base price">
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </Field>
          <Field label="Compare price (optional)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              placeholder="e.g. 49.99"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-slate-300"
          />
          Active (visible on storefront)
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TaxonomyMultiSelect({
  kind,
  title,
  current,
  onSave,
}: {
  kind: "tags" | "collections";
  title: string;
  current: TaxonomyAdminEntry[];
  onSave: (ids: number[]) => Promise<void>;
}) {
  const [all, setAll] = useState<TaxonomyAdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>(current.map((c) => c.id));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    taxonomyApi
      .list(kind)
      .then((data) => {
        if (!cancelled) setAll(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  useEffect(() => {
    setSelected(current.map((c) => c.id));
  }, [current]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q),
    );
  }, [all, search]);

  const dirty =
    selected.length !== current.length ||
    selected.some((id, i) => id !== current.map((c) => c.id).sort()[i]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {title} ({selected.length})
        </h2>
        <button
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${kind}…`}
        className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
      />
      <div className="max-h-56 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-400">
            {all.length === 0 ? (
              <>
                No {kind} yet —{" "}
                <Link href={`/admin/${kind}`} className="underline">
                  create some
                </Link>
                .
              </>
            ) : (
              "No matches."
            )}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {filtered.map((t) => {
              const on = selected.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggle(t.id)}
                    className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset transition-colors ${
                      on
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {t.name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function TagsCard({
  product,
  onUpdated,
}: {
  product: AdminProduct;
  onUpdated: (p: AdminProduct) => void;
}) {
  return (
    <TaxonomyMultiSelect
      kind="tags"
      title="Tags"
      current={product.tags}
      onSave={async (ids) => {
        const updated = await productsAdminApi.setTags(product.id, ids);
        onUpdated(updated);
      }}
    />
  );
}

function CollectionsCard({
  product,
  onUpdated,
}: {
  product: AdminProduct;
  onUpdated: (p: AdminProduct) => void;
}) {
  return (
    <TaxonomyMultiSelect
      kind="collections"
      title="Collections"
      current={product.collections}
      onSave={async (ids) => {
        const updated = await productsAdminApi.setCollections(product.id, ids);
        onUpdated(updated);
      }}
    />
  );
}

function RelationsCard({ productId }: { productId: number }) {
  const [relations, setRelations] = useState<AdminRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<AdminProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsAdminApi.listRelations(productId);
      setRelations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Debounce search so each keystroke doesn't hammer the API. 300ms is the
  // sweet spot between feeling responsive and not over-fetching.
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await productsAdminApi.list({
          search: trimmed,
          limit: 10,
        });
        setSearchResults(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const handleAdd = async (relatedProductId: number) => {
    setAddingId(relatedProductId);
    setError(null);
    try {
      const updated = await productsAdminApi.addRelation(
        productId,
        relatedProductId,
      );
      setRelations(updated);
      setSearch("");
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (relatedProductId: number) => {
    setRemovingId(relatedProductId);
    setError(null);
    try {
      await productsAdminApi.removeRelation(productId, relatedProductId);
      setRelations((prev) =>
        prev.filter((r) => r.relatedProductId !== relatedProductId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  const excludedIds = new Set<number>([
    productId,
    ...relations.map((r) => r.relatedProductId),
  ]);
  const pickable = searchResults.filter((p) => !excludedIds.has(p.id));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
        Product relations ({relations.length})
      </h2>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
          Add related product
        </label>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name (min 2 chars)…"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        {search.trim().length >= 2 && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white">
            {searching ? (
              <p className="px-3 py-2 text-xs text-slate-400">Searching…</p>
            ) : pickable.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">
                {searchResults.length === 0
                  ? "No matches."
                  : "All matches are already related (or are this product)."}
              </p>
            ) : (
              <ul>
                {pickable.map((p) => (
                  <li
                    key={p.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => void handleAdd(p.id)}
                      disabled={addingId === p.id}
                      className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-slate-50 disabled:opacity-50"
                    >
                      {p.gallery?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.gallery[0]}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded border border-slate-200 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-medium">
                          {p.name}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          #{p.id}
                          {p.slug && ` · ${p.slug}`}
                          {!p.isActive && (
                            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
                              inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="self-center text-xs text-slate-500">
                        {addingId === p.id ? "Adding…" : "+ Add"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading relations…</p>
      ) : relations.length === 0 ? (
        <p className="text-xs text-slate-400">
          No related products yet. Search above to add one.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 w-12">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2 w-20">Source</th>
              <th className="py-2 w-16">Rank</th>
              <th className="py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {relations.map((r) => (
              <tr
                key={r.relationId}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-2 font-mono text-xs text-slate-500">
                  {r.relatedProductId}
                </td>
                <td className="py-2">
                  <Link
                    href={`/admin/products/${r.relatedProductId}`}
                    className="text-sm hover:underline"
                  >
                    {r.name}
                  </Link>
                  {!r.isActive && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      inactive
                    </span>
                  )}
                </td>
                <td className="py-2 text-xs text-slate-600">{r.source}</td>
                <td className="py-2 text-xs tabular-nums">{r.rank}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => void handleRemove(r.relatedProductId)}
                    disabled={removingId === r.relatedProductId}
                    className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
