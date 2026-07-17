import { http } from './api';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductsResponse,
} from '../types/product.types';

export const productService = {
  async getAll(filters?: ProductFilters): Promise<ProductsResponse> {
    return http.get<ProductsResponse>('/products', filters);
  },
  async getById(id: string): Promise<Product> {
    return http.get<Product>(`/products/${id}`);
  },
  async create(payload: CreateProductRequest): Promise<Product> {
    return http.post<Product>('/products', payload);
  },
  async update(id: string, payload: UpdateProductRequest): Promise<Product> {
    return http.put<Product>(`/products/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/products/${id}`);
  },
  async updateStock(id: string, quantity: number): Promise<Product> {
    return http.patch<Product>(`/products/${id}/stock`, { quantity });
  },
};
