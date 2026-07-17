import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';
import { authService } from '../services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';
import { hasPermission as checkPermission, hasRole as checkRole } from '../utils/permissions';
import type { AuthUser, LoginRequest } from '../types/auth.types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        if (active) setUser(profile);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, response.token);
    if (response.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    try {
      void authService.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: AuthUser) => {
    setUser(updated);
  }, []);

  const hasPermission = useCallback(
    (permission: string | string[]) => checkPermission(user?.permissions ?? [], permission),
    [user],
  );

  const hasRole = useCallback(
    (role: string | string[]) => checkRole(user?.roles ?? [], role),
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUser,
      hasPermission,
      hasRole,
    }),
    [user, token, isAuthenticated, isLoading, login, logout, updateUser, hasPermission, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
