import { http } from './api';
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilters,
  SuppliersResponse,
} from '../types/supplier.types';

export const supplierService = {
  async getAll(filters?: SupplierFilters): Promise<SuppliersResponse> {
    return http.get<SuppliersResponse>('/suppliers', filters);
  },
  async getById(id: string): Promise<Supplier> {
    return http.get<Supplier>(`/suppliers/${id}`);
  },
  async create(payload: CreateSupplierRequest): Promise<Supplier> {
    return http.post<Supplier>('/suppliers', payload);
  },
  async update(id: string, payload: UpdateSupplierRequest): Promise<Supplier> {
    return http.put<Supplier>(`/suppliers/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/suppliers/${id}`);
  },
};
