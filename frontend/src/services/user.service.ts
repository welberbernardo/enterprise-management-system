import { http } from './api';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UsersResponse,
} from '../types/user.types';

export const userService = {
  async getAll(filters?: UserFilters): Promise<UsersResponse> {
    return http.get<UsersResponse>('/users', filters);
  },
  async getById(id: string): Promise<User> {
    return http.get<User>(`/users/${id}`);
  },
  async create(payload: CreateUserRequest): Promise<User> {
    return http.post<User>('/users', payload);
  },
  async update(id: string, payload: UpdateUserRequest): Promise<User> {
    return http.put<User>(`/users/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/users/${id}`);
  },
  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    return http.post<User>(`/users/${id}/roles`, { roleIds });
  },
  async updateStatus(id: string, status: string): Promise<User> {
    return http.patch<User>(`/users/${id}/status`, { status });
  },
};
