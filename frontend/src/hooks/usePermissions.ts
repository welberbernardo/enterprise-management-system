import { useMemo } from 'react';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth();

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  const can = useMemo(
    () => (permission: string | string[]) => hasPermission(permission),
    [hasPermission],
  );

  const is = useMemo(() => (role: string | string[]) => hasRole(role), [hasRole]);

  return { permissions, can, is, roles: user?.roles ?? [] };
}
