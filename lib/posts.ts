import { apiRequest } from './api';
import type { TaxonomyAdminEntry } from './admin';

export type PostStatus = 'draft' | 'published';

export interface PostAuthor {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: PostStatus;
  publishedAt: string | null;
  authorId: number | null;
  author: PostAuthor | null;
  tags: TaxonomyAdminEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  items: AdminPost[];
  total: number;
  page: number;
  limit: number;
}

export interface UpsertPostPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status?: PostStatus;
  tagIds?: number[];
}

export interface AdminPostListFilters {
  page?: number;
  limit?: number;
  status?: PostStatus;
  search?: string;
}

export const postsAdminApi = {
  list(filters: AdminPostListFilters = {}): Promise<PaginatedPosts> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.status) qs.set('status', filters.status);
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/posts${suffix}`);
  },

  get(id: number): Promise<AdminPost> {
    return apiRequest(`/admin/posts/${id}`);
  },

  create(payload: UpsertPostPayload): Promise<AdminPost> {
    return apiRequest('/admin/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UpsertPostPayload): Promise<AdminPost> {
    return apiRequest(`/admin/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    await apiRequest(`/admin/posts/${id}`, { method: 'DELETE' });
  },
};
