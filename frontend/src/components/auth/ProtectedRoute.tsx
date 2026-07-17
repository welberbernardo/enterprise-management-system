import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../ui/Spinner';
import { hasPermission as checkPermission } from '../../utils/permissions';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string | string[];
  requiredRoles?: string | string[];
}

export function ProtectedRoute({ children, requiredPermissions, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions && !checkPermission(user?.permissions ?? [], requiredPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  void hasPermission;

  return <>{children}</>;
}
