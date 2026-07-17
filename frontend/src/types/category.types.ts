import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  productCount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export interface CategoryFilters extends QueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export type CategoriesResponse = PaginatedResponse<Category>;
