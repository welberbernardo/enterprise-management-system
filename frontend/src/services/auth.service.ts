import { http } from './api';
import type {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ChangePasswordRequest,
  AuthUser,
} from '../types/auth.types';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/login', payload);
  },
  async logout(): Promise<void> {
    return http.post<void>('/auth/logout');
  },
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    return http.post<void>('/auth/forgot-password', payload);
  },
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    return http.post<void>('/auth/reset-password', payload);
  },
  async getProfile(): Promise<AuthUser> {
    return http.get<AuthUser>('/auth/profile');
  },
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    return http.post<void>('/auth/change-password', payload);
  },
  async updateProfile(payload: Partial<AuthUser>): Promise<AuthUser> {
    return http.put<AuthUser>('/auth/profile', payload);
  },
};
