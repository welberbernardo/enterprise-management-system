import { http } from './api';
import type {
  Permission,
  PermissionFilters,
  PermissionsResponse,
} from '../types/permission.types';

export const permissionService = {
  async getAll(filters?: PermissionFilters): Promise<PermissionsResponse> {
    return http.get<PermissionsResponse>('/permissions', filters);
  },
  async getById(id: string): Promise<Permission> {
    return http.get<Permission>(`/permissions/${id}`);
  },
  async create(payload: Partial<Permission>): Promise<Permission> {
    return http.post<Permission>('/permissions', payload);
  },
  async update(id: string, payload: Partial<Permission>): Promise<Permission> {
    return http.put<Permission>(`/permissions/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/permissions/${id}`);
  },
  async getGroups(): Promise<Record<string, Permission[]>> {
    return http.get<Record<string, Permission[]>>('/permissions/groups');
  },
};
