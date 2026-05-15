import { apiRequest } from './api';
import type { TaxonomyAdminEntry } from './admin';

export interface AdminProduct {
  id: number;
  externalId: string;
  name: string;
  description: string | null;
  basePrice: number | string;
  comparePrice: number | string | null;
  sizeChartHtml: string | null;
  gallery: string[] | null;
  slug: string | null;
  shop: string | null;
  isActive: boolean;
  tags: TaxonomyAdminEntry[];
  collections: TaxonomyAdminEntry[];
  /** Present on list endpoint, omitted on single-product GET. */
  tagIds?: number[];
  collectionIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAdminProducts {
  items: AdminProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminProductListFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  tagId?: number;
  collectionId?: number;
}

export interface AdminUpdateProductPayload {
  name?: string;
  description?: string | null;
  basePrice?: number;
  comparePrice?: number | null;
  sizeChartHtml?: string | null;
  slug?: string;
  isActive?: boolean;
}

export interface AdminRelation {
  relationId: number;
  relatedProductId: number;
  name: string;
  slug: string | null;
  isActive: boolean;
  source: string;
  rank: number;
}

export const productsAdminApi = {
  list(filters: AdminProductListFilters = {}): Promise<PaginatedAdminProducts> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.search) qs.set('search', filters.search);
    if (filters.active !== undefined) qs.set('active', String(filters.active));
    if (filters.tagId != null) qs.set('tagId', String(filters.tagId));
    if (filters.collectionId != null)
      qs.set('collectionId', String(filters.collectionId));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/products${suffix}`);
  },

  get(id: number): Promise<AdminProduct> {
    return apiRequest(`/admin/products/${id}`);
  },

  update(id: number, payload: AdminUpdateProductPayload): Promise<AdminProduct> {
    return apiRequest(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  setTags(id: number, tagIds: number[]): Promise<AdminProduct> {
    return apiRequest(`/admin/products/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tagIds }),
    });
  },

  setCollections(id: number, collectionIds: number[]): Promise<AdminProduct> {
    return apiRequest(`/admin/products/${id}/collections`, {
      method: 'PATCH',
      body: JSON.stringify({ collectionIds }),
    });
  },

  listRelations(id: number): Promise<AdminRelation[]> {
    return apiRequest(`/admin/products/${id}/relations`);
  },

  addRelation(
    id: number,
    relatedProductId: number,
    rank = 0,
  ): Promise<AdminRelation[]> {
    return apiRequest(`/admin/products/${id}/relations`, {
      method: 'POST',
      body: JSON.stringify({ relatedProductId, rank }),
    });
  },

  async removeRelation(id: number, relatedProductId: number): Promise<void> {
    await apiRequest(
      `/admin/products/${id}/relations/${relatedProductId}`,
      { method: 'DELETE' },
    );
  },

  bulkSetActive(
    ids: number[],
    isActive: boolean,
  ): Promise<{ affected: number }> {
    return apiRequest('/admin/products/bulk-active', {
      method: 'PATCH',
      body: JSON.stringify({ ids, isActive }),
    });
  },
};
