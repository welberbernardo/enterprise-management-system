import { ROLES } from './constants';

export function hasPermission(
  userPermissions: string[],
  required: string | string[],
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;
  if (userPermissions.includes('*')) return true;
  const requiredArray = Array.isArray(required) ? required : [required];
  return requiredArray.some((p) => userPermissions.includes(p));
}

export function hasRole(userRoles: string[], required: string | string[]): boolean {
  if (!userRoles) return false;
  const requiredArray = Array.isArray(required) ? required : [required];
  return requiredArray.some((r) => userRoles.includes(r));
}

export function isSuperAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);
}

export function canManageUsers(userPermissions: string[]): boolean {
  return hasPermission(userPermissions, ['users.manage', '*']);
}

export const PERMISSION_GROUPS: { group: string; label: string }[] = [
  { group: 'users', label: 'Users' },
  { group: 'roles', label: 'Roles' },
  { group: 'permissions', label: 'Permissions' },
  { group: 'customers', label: 'Customers' },
  { group: 'suppliers', label: 'Suppliers' },
  { group: 'categories', label: 'Categories' },
  { group: 'products', label: 'Products' },
  { group: 'orders', label: 'Orders' },
  { group: 'invoices', label: 'Invoices' },
  { group: 'inventory', label: 'Inventory' },
  { group: 'finance', label: 'Finance' },
  { group: 'reports', label: 'Reports' },
  { group: 'settings', label: 'Settings' },
  { group: 'audit', label: 'Audit' },
];

export const COMMON_PERMISSIONS = [
  'view',
  'create',
  'update',
  'delete',
  'manage',
  'export',
];
