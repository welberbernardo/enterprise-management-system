import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  contactName?: string;
  status: SupplierStatus;
  paymentTerms?: number;
}

export interface CreateSupplierRequest {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  contactName?: string;
  status: SupplierStatus;
  paymentTerms?: number;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {}

export interface SupplierFilters extends QueryParams {
  search?: string;
  status?: SupplierStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export type SuppliersResponse = PaginatedResponse<Supplier>;
