import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export interface Permission extends BaseEntity {
  name: string;
  key: string;
  group: string;
  description?: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: string[];
  userCount?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleFilters extends QueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export type RolesResponse = PaginatedResponse<Role>;
export type PermissionsResponse = PaginatedResponse<Permission>;
