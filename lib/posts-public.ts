import { API_BASE_URL } from './api';

export interface PublicPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

export interface PublicPost extends PublicPostSummary {
  content: string;
  author: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  } | null;
  tags: { id: number; name: string; slug: string }[];
}

interface PaginatedPosts<T> {
  items: T[];
  total: number;
}

/**
 * Server-safe fetch for the public posts API. Bypasses `lib/api.ts`'s
 * browser-localStorage auth (footer renders in a React Server Component;
 * there's no localStorage and no admin token is needed for published posts).
 *
 * `next.revalidate` keeps the homepage cheap — published posts change at
 * editorial cadence, not per-request — while still picking up new content
 * within a minute.
 */
export async function listPublishedPosts(
  limit = 5,
): Promise<PublicPostSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as PaginatedPosts<PublicPostSummary>;
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

/**
 * Fetch one published post by slug. Returns null on 404 / network error so
 * the page can render its own not-found UI without a try/catch.
 */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicPost | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/posts/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicPost;
  } catch {
    return null;
  }
}
