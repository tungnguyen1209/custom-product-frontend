"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AdminPost,
  PostStatus,
  UpsertPostPayload,
  postsAdminApi,
} from "@/lib/posts";
import {
  TaxonomyAdminEntry,
  readFileAsDataUrl,
  taxonomyApi,
  uploadAdminImage,
} from "@/lib/admin";
import RichTextEditor from "./RichTextEditor";
import { renderMarkdown } from "@/lib/render-markdown";

// Same detection used by the storefront blog renderer — keep them in sync.
// TipTap only understands HTML, so any post still authored in Markdown must
// be converted before it lands in the editor (otherwise TipTap treats the
// whole `# Heading\n\n…` blob as one plain-text paragraph and the first
// save permanently flattens the formatting).
const HTML_CONTENT_RE =
  /^\s*<(p|h[1-6]|ul|ol|blockquote|pre|figure|img|div|article|section|table|hr|details|aside)\b/i;
function ensureHtml(content: string): string {
  if (!content) return "";
  return HTML_CONTENT_RE.test(content) ? content : renderMarkdown(content);
}

interface PostFormProps {
  /** Existing post when editing; `null` for create mode. */
  initial: AdminPost | null;
}

export default function PostForm({ initial }: PostFormProps) {
  const router = useRouter();
  const isEdit = initial !== null;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(() => ensureHtml(initial?.content ?? ""));
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "draft");
  const [tagIds, setTagIds] = useState<number[]>(
    initial?.tags.map((t) => t.id) ?? [],
  );

  const [allTags, setAllTags] = useState<TaxonomyAdminEntry[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagsLoading, setTagsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTagsLoading(true);
    taxonomyApi
      .list("tags")
      .then((data) => {
        if (!cancelled) setAllTags(data);
      })
      .catch(() => {
        // Tags are optional — surface inline if needed.
      })
      .finally(() => {
        if (!cancelled) setTagsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q),
    );
  }, [allTags, tagSearch]);

  const toggleTag = (id: number) =>
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: UpsertPostPayload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content,
      coverImage: coverImage.trim() || undefined,
      status,
      tagIds,
    };
    try {
      const saved = isEdit
        ? await postsAdminApi.update(initial!.id, payload)
        : await postsAdminApi.create(payload);
      router.push(`/admin/posts/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit post" : "New post"}
          </h1>
          {isEdit && (
            <p className="mt-1 text-xs text-slate-500">
              ID {initial!.id} · created {new Date(initial!.createdAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Slug <span className="font-normal normal-case text-slate-400">(optional, auto-from-title)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-from-title"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-900 focus:outline-none"
            />
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              placeholder="Short summary shown on listing pages."
            />
          </div>

          <ContentField value={content} onChange={setContent} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {initial?.publishedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Published {new Date(initial.publishedAt).toLocaleString()}
              </p>
            )}
          </div>

          <CoverImageField value={coverImage} onChange={setCoverImage} />

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tags
              </label>
              <span className="text-xs text-slate-400">
                {tagIds.length} selected
              </span>
            </div>
            <input
              type="search"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search tags…"
              className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
            <div className="mt-3 max-h-72 overflow-y-auto">
              {tagsLoading ? (
                <p className="text-xs text-slate-400">Loading tags…</p>
              ) : filteredTags.length === 0 ? (
                <p className="text-xs text-slate-400">
                  {allTags.length === 0 ? (
                    <>
                      No tags yet —{" "}
                      <Link href="/admin/tags" className="underline">
                        create one
                      </Link>
                      .
                    </>
                  ) : (
                    "No matches."
                  )}
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {filteredTags.map((tag) => (
                    <li key={tag.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={tagIds.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          className="rounded border-slate-300"
                        />
                        <span className="flex-1">{tag.name}</span>
                        <span className="text-xs text-slate-400">
                          {tag.slug}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function ContentField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
        Content
      </label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder="Start writing your post…"
        minHeight="24rem"
      />
    </div>
  );
}

function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError("Only PNG, JPEG, or WebP images are supported");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image exceeds 8MB limit");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { url } = await uploadAdminImage(dataUrl, "post-covers");
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        Cover image
      </label>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : value ? "Replace" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
      />

      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Cover preview"
          className="mt-3 max-h-40 w-full rounded border border-slate-200 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
