import { apiRequest } from './api';
import type {
  PaginatedSupportTickets,
  SupportTicket,
  TicketCategory,
  TicketStatus,
} from './support';

export interface AdminSupportFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
}

export const supportAdminApi = {
  list(filters: AdminSupportFilters = {}): Promise<PaginatedSupportTickets> {
    const qs = new URLSearchParams();
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    if (filters.status) qs.set('status', filters.status);
    if (filters.category) qs.set('category', filters.category);
    if (filters.search) qs.set('search', filters.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest(`/admin/support/tickets${suffix}`);
  },

  detail(id: number): Promise<SupportTicket> {
    return apiRequest(`/admin/support/tickets/${id}`);
  },

  update(
    id: number,
    body: { status?: TicketStatus; category?: TicketCategory },
  ): Promise<SupportTicket> {
    return apiRequest(`/admin/support/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  reply(id: number, body: string): Promise<SupportTicket> {
    return apiRequest(`/admin/support/tickets/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  async delete(id: number): Promise<void> {
    await apiRequest(`/admin/support/tickets/${id}`, { method: 'DELETE' });
  },
};
