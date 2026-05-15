import { apiRequest } from './api';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export interface AdminOrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customization: any;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  previewImageUrl: string | null;
}

export interface AdminOrderUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  userId: number | null;
  user: AdminOrderUser | null;
  status: OrderStatus;
  paymentMethod: string | null;
  paymentStatus: string;
  transactionId: string | null;
  shippingMethod: 'standard' | 'express';
  subtotal: number | string;
  shippingCost: number | string;
  total: number | string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
    email: string;
  };
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAdminOrders {
  items: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminOrderListFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: string;
  search?: string;
}

export const ordersAdminApi = {
  list(filters: AdminOrderListFilters = {}): Promise<PaginatedAdminOrders> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.status) qs.set('status', filters.status);
    if (filters.paymentStatus) qs.set('paymentStatus', filters.paymentStatus);
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/orders${suffix}`);
  },

  get(id: number): Promise<AdminOrder> {
    return apiRequest(`/admin/orders/${id}`);
  },

  updateStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
    return apiRequest(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Download a CSV export of orders matching the given filters. Triggers a
   * browser-native save dialog. Returns when the file has been handed off to
   * the browser; doesn't track post-download state.
   */
  async exportCsv(filters: AdminOrderListFilters = {}): Promise<void> {
    const { downloadCsv } = await import('./download-csv');
    const qs = new URLSearchParams();
    if (filters.status) qs.set('status', filters.status);
    if (filters.paymentStatus) qs.set('paymentStatus', filters.paymentStatus);
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    await downloadCsv(`/admin/orders/export.csv${suffix}`, 'orders.csv');
  },
};
