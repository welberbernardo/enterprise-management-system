import { http } from './api';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
  CategoriesResponse,
} from '../types/category.types';

export const categoryService = {
  async getAll(filters?: CategoryFilters): Promise<CategoriesResponse> {
    return http.get<CategoriesResponse>('/categories', filters);
  },
  async getById(id: string): Promise<Category> {
    return http.get<Category>(`/categories/${id}`);
  },
  async create(payload: CreateCategoryRequest): Promise<Category> {
    return http.post<Category>('/categories', payload);
  },
  async update(id: string, payload: UpdateCategoryRequest): Promise<Category> {
    return http.put<Category>(`/categories/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/categories/${id}`);
  },
};
