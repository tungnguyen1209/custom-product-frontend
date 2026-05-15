"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  TaxonomyAdminEntry,
  TaxonomyKind,
  taxonomyApi,
} from "@/lib/admin";

interface TaxonomyAdminProps {
  kind: TaxonomyKind;
  singular: string;
  plural: string;
}

interface EditState {
  id: number;
  name: string;
  slug: string;
}

export default function TaxonomyAdmin({
  kind,
  singular,
  plural,
}: TaxonomyAdminProps) {
  const [rows, setRows] = useState<TaxonomyAdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taxonomyApi.list(kind);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await taxonomyApi.create(kind, {
        name: newName.trim(),
        slug: newSlug.trim() || undefined,
      });
      setRows((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewName("");
      setNewSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (row: EditState) => {
    setSavingId(row.id);
    setError(null);
    try {
      const updated = await taxonomyApi.update(kind, row.id, {
        name: row.name.trim(),
        slug: row.slug.trim() || undefined,
      });
      setRows((prev) =>
        prev
          .map((r) => (r.id === updated.id ? updated : r))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(`Delete ${singular} "${name}"? Product associations will be removed.`)
    ) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await taxonomyApi.delete(kind, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{plural}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? singular.toLowerCase() : plural.toLowerCase()} •
            slug auto-derived from name when blank.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`New ${singular.toLowerCase()} name`}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            Slug <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="auto-from-name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? "Creating…" : "+ Create"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${plural.toLowerCase()}…`}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 w-16">ID</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5 w-32 text-right">Products</th>
              <th className="px-4 py-2.5 w-48 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  {rows.length === 0
                    ? `No ${plural.toLowerCase()} yet — create the first one above.`
                    : `No matches for "${search}".`}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const isEditing = edit?.id === row.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                      {row.id}
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={edit.name}
                          onChange={(e) =>
                            setEdit({ ...edit, name: e.target.value })
                          }
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-900 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{row.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={edit.slug}
                          onChange={(e) =>
                            setEdit({ ...edit, slug: e.target.value })
                          }
                          placeholder="auto-from-name"
                          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm font-mono focus:border-slate-900 focus:outline-none"
                        />
                      ) : (
                        <code className="text-xs text-slate-600">
                          {row.slug}
                        </code>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                      {row.productCount}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEdit(null)}
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => void handleSave(edit)}
                            disabled={savingId === row.id || !edit.name.trim()}
                            className="rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white disabled:opacity-50"
                          >
                            {savingId === row.id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setEdit({
                                id: row.id,
                                name: row.name,
                                slug: row.slug,
                              })
                            }
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDelete(row.id, row.name)}
                            disabled={deletingId === row.id}
                            className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === row.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
