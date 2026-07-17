import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export interface Permission extends BaseEntity {
  name: string;
  key: string;
  group: string;
  description?: string;
}

export interface PermissionFilters extends QueryParams {
  search?: string;
  group?: string;
  page?: number;
  limit?: number;
}

export type PermissionsResponse = PaginatedResponse<Permission>;
