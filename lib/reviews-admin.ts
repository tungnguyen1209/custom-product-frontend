import { apiRequest } from './api';

export type ReviewSource = 'judgeme' | 'customer';

export interface AdminReview {
  reviewId: string;
  productId: number | null;
  productSlug: string | null;
  productTitle: string | null;
  shopDomain: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  author: string | null;
  pictures: string[] | null;
  verifiedBuyer: boolean;
  source: ReviewSource;
  userId: number | null;
  helpfulCount: number;
  approved: boolean;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAdminReviews {
  items: AdminReview[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminReviewListFilters {
  page?: number;
  limit?: number;
  approved?: boolean;
  productId?: number;
  source?: ReviewSource;
  search?: string;
}

export const reviewsAdminApi = {
  list(filters: AdminReviewListFilters = {}): Promise<PaginatedAdminReviews> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.approved !== undefined)
      qs.set('approved', String(filters.approved));
    if (filters.productId != null)
      qs.set('productId', String(filters.productId));
    if (filters.source) qs.set('source', filters.source);
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/reviews${suffix}`);
  },

  setApproved(reviewId: string, approved: boolean): Promise<AdminReview> {
    return apiRequest(`/admin/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    });
  },

  async delete(reviewId: string): Promise<void> {
    await apiRequest(`/admin/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
    });
  },
};
