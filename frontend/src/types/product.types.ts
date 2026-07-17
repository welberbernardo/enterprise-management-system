import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface Product extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  barcode?: string;
  image?: string;
  status: ProductStatus;
  unit: string;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  barcode?: string;
  image?: string;
  status: ProductStatus;
  unit: string;
}

export interface UpdateProductRequest extends CreateProductRequest {}

export interface ProductFilters extends QueryParams {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  page?: number;
  limit?: number;
}

export type ProductsResponse = PaginatedResponse<Product>;
