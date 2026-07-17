export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Enterprise Management System';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api';
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'ems_token';
export const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'ems_refresh_token';

export const STORAGE_KEYS = {
  theme: 'ems_theme',
  sidebarCollapsed: 'ems_sidebar_collapsed',
  preferences: 'ems_preferences',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  PENDING: 'warning',
  SUSPENDED: 'danger',
  BLOCKED: 'danger',
  LEAD: 'info',
  CONFIRMED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  DRAFT: 'secondary',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  PARTIAL: 'warning',
  ENTRY: 'success',
  EXIT: 'danger',
  ADJUSTMENT: 'warning',
  DISCONTINUED: 'secondary',
  LOW: 'warning',
  OUT: 'danger',
  OK: 'success',
};

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
};

export const NAV_GROUPS = [
  { label: 'General', group: 'general' },
  { label: 'Management', group: 'management' },
  { label: 'Operations', group: 'operations' },
  { label: 'Finance', group: 'finance' },
  { label: 'System', group: 'system' },
];
