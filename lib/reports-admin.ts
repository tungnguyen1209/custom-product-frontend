import { apiRequest } from './api';
import type { ProductReportReason, ProductReportStatus } from './api';

export interface AdminReport {
  id: number;
  productId: number;
  reason: ProductReportReason;
  status: ProductReportStatus;
  comments: string | null;
  name: string;
  email: string;
  attachments: string[];
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  product: {
    id: number;
    name: string | null;
    slug: string | null;
    gallery: string[] | null;
  } | null;
}

export interface PaginatedAdminReports {
  items: AdminReport[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminReportFilters {
  page?: number;
  limit?: number;
  status?: ProductReportStatus;
  reason?: ProductReportReason;
  productId?: number;
  search?: string;
}

export const reportsAdminApi = {
  list(filters: AdminReportFilters = {}): Promise<PaginatedAdminReports> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.status) qs.set('status', filters.status);
    if (filters.reason) qs.set('reason', filters.reason);
    if (filters.productId != null) qs.set('productId', String(filters.productId));
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/reports${suffix}`);
  },

  detail(id: number): Promise<AdminReport> {
    return apiRequest(`/admin/reports/${id}`);
  },

  update(
    id: number,
    body: { status?: ProductReportStatus; adminNotes?: string },
  ): Promise<AdminReport> {
    return apiRequest(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async delete(id: number): Promise<void> {
    await apiRequest(`/admin/reports/${id}`, { method: 'DELETE' });
  },
};

export const REPORT_REASON_LABELS: Record<ProductReportReason, string> = {
  trademark: 'Trademark',
  community_standards: 'Community standards',
  unsuitable_for_kids: 'Unsuitable for kids',
  other: 'Other',
};

export const REPORT_STATUS_LABELS: Record<ProductReportStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};
