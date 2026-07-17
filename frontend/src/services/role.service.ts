import { http } from './api';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilters,
  RolesResponse,
} from '../types/role.types';

export const roleService = {
  async getAll(filters?: RoleFilters): Promise<RolesResponse> {
    return http.get<RolesResponse>('/roles', filters);
  },
  async getById(id: string): Promise<Role> {
    return http.get<Role>(`/roles/${id}`);
  },
  async create(payload: CreateRoleRequest): Promise<Role> {
    return http.post<Role>('/roles', payload);
  },
  async update(id: string, payload: UpdateRoleRequest): Promise<Role> {
    return http.put<Role>(`/roles/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/roles/${id}`);
  },
};
