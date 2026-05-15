import { apiRequest } from './api';

export interface AdminStats {
  products: { total: number; active: number; inactive: number };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    pendingPayment: number;
  };
  reviews: { total: number; pending: number; approved: number };
  posts: { total: number; drafts: number; published: number };
  tags: number;
  collections: number;
}

export function getAdminStats(): Promise<AdminStats> {
  return apiRequest('/admin/stats');
}
