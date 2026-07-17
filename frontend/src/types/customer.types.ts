import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'BLOCKED';

export interface CustomerContact extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
}

export interface Customer extends BaseEntity {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  status: CustomerStatus;
  creditLimit?: number;
  contacts: CustomerContact[];
}

export interface CreateCustomerRequest {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  status: CustomerStatus;
  creditLimit?: number;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {}

export interface CustomerFilters extends QueryParams {
  search?: string;
  status?: CustomerStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export type CustomersResponse = PaginatedResponse<Customer>;
