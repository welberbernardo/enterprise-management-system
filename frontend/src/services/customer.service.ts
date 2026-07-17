import { http } from './api';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomersResponse,
  CustomerContact,
} from '../types/customer.types';

export const customerService = {
  async getAll(filters?: CustomerFilters): Promise<CustomersResponse> {
    return http.get<CustomersResponse>('/customers', filters);
  },
  async getById(id: string): Promise<Customer> {
    return http.get<Customer>(`/customers/${id}`);
  },
  async create(payload: CreateCustomerRequest): Promise<Customer> {
    return http.post<Customer>('/customers', payload);
  },
  async update(id: string, payload: UpdateCustomerRequest): Promise<Customer> {
    return http.put<Customer>(`/customers/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/customers/${id}`);
  },
  async getContacts(id: string): Promise<CustomerContact[]> {
    return http.get<CustomerContact[]>(`/customers/${id}/contacts`);
  },
  async addContact(id: string, contact: Partial<CustomerContact>): Promise<CustomerContact> {
    return http.post<CustomerContact>(`/customers/${id}/contacts`, contact);
  },
  async removeContact(customerId: string, contactId: string): Promise<void> {
    return http.del<void>(`/customers/${customerId}/contacts/${contactId}`);
  },
};
