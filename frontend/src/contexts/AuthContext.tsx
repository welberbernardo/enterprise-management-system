import { createContext } from 'react';
import type { AuthUser, LoginRequest } from '../types/auth.types';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
