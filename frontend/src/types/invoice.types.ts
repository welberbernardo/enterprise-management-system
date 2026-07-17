import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  orderId?: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  notes?: string;
}

export interface CreateInvoiceRequest {
  orderId?: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  tax: number;
  notes?: string;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {}

export interface InvoiceFilters extends QueryParams {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type InvoicesResponse = PaginatedResponse<Invoice>;

export type { Customer } from './customer.types';
