import { http } from './api';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  InvoicesResponse,
} from '../types/invoice.types';

export const invoiceService = {
  async getAll(filters?: InvoiceFilters): Promise<InvoicesResponse> {
    return http.get<InvoicesResponse>('/invoices', filters);
  },
  async getById(id: string): Promise<Invoice> {
    return http.get<Invoice>(`/invoices/${id}`);
  },
  async create(payload: CreateInvoiceRequest): Promise<Invoice> {
    return http.post<Invoice>('/invoices', payload);
  },
  async update(id: string, payload: UpdateInvoiceRequest): Promise<Invoice> {
    return http.put<Invoice>(`/invoices/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/invoices/${id}`);
  },
  async changeStatus(id: string, status: string): Promise<Invoice> {
    return http.patch<Invoice>(`/invoices/${id}/status`, { status });
  },
  async createFromOrder(orderId: string): Promise<Invoice> {
    return http.post<Invoice>('/invoices/from-order', { orderId });
  },
  async recordPayment(id: string, amount: number): Promise<Invoice> {
    return http.post<Invoice>(`/invoices/${id}/payment`, { amount });
  },
};
