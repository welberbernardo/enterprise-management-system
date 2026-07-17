export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: string;
  permissions: string[];
  lastLoginAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
  accessTokenExpiry: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
