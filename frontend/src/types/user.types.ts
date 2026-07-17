import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  roleId: string;
  roleName: string;
  roles: Role[];
  lastLogin?: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: string[];
  userCount?: number;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roleId: string;
  status: UserStatus;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  status: UserStatus;
}

export interface UserFilters extends QueryParams {
  search?: string;
  roleId?: string;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export type UsersResponse = PaginatedResponse<User>;
