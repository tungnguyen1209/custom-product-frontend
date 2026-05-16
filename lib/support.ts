import { apiRequest } from './api';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory =
  | 'order'
  | 'product'
  | 'shipping'
  | 'refund'
  | 'payment'
  | 'other';

export type MessageAuthorType = 'customer' | 'admin';

export interface SupportMessage {
  id: number;
  ticketId: number;
  authorType: MessageAuthorType;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  email: string;
  name: string;
  orderNumber: string | null;
  category: TicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface PaginatedSupportTickets {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  order: 'Order',
  product: 'Product',
  shipping: 'Shipping',
  refund: 'Refund',
  payment: 'Payment',
  other: 'Other',
};

export const supportApi = {
  track(ticketNumber: string, email: string): Promise<SupportTicket> {
    const qs = new URLSearchParams({ ticketNumber, email });
    return apiRequest(`/support/tickets/track?${qs.toString()}`);
  },
  reply(
    ticketNumber: string,
    body: { email: string; body: string },
  ): Promise<SupportTicket> {
    return apiRequest(
      `/support/tickets/${encodeURIComponent(ticketNumber)}/replies`,
      { method: 'POST', body: JSON.stringify(body) },
    );
  },
};
