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
    const response = await http.post<AuthResponse>('/auth/login', payload);
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
      username: response.username,
      fullName: response.fullName,
      role: response.role,
      permissions: response.permissions ?? [],
      accessTokenExpiry: response.accessTokenExpiry,
    };
  },
  async logout(refreshToken: string): Promise<void> {
    await http.post<boolean>('/auth/revoke', { refreshToken });
  },
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    return http.post<void>('/auth/forgot-password', payload);
  },
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    return http.post<void>('/auth/reset-password', payload);
  },
  async getProfile(): Promise<AuthUser> {
    const profile = await http.get<AuthUser>('/auth/profile');
    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      phone: profile.phone,
      role: profile.role,
      permissions: profile.permissions ?? [],
      lastLoginAt: profile.lastLoginAt,
    };
  },
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    return http.post<void>('/auth/change-password', payload);
  },
  async updateProfile(payload: Partial<AuthUser>): Promise<AuthUser> {
    return http.put<AuthUser>('/auth/profile', payload);
  },
};
