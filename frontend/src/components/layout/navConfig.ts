import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  UserCircle,
  Truck,
  FolderTree,
  Package,
  ShoppingCart,
  FileText,
  Boxes,
  Landmark,
  BarChart3,
  Settings,
  ScrollText,
  Building2,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  group: string;
}

export interface NavSection {
  group: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    group: 'general',
    label: 'General',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, group: 'general' },
    ],
  },
  {
    group: 'management',
    label: 'Management',
    items: [
      { label: 'Users', to: '/users', icon: Users, permission: 'users.view', group: 'management' },
      { label: 'Roles', to: '/roles', icon: Shield, permission: 'roles.view', group: 'management' },
      { label: 'Permissions', to: '/permissions', icon: KeyRound, permission: 'permissions.view', group: 'management' },
      { label: 'Customers', to: '/customers', icon: UserCircle, permission: 'customers.view', group: 'management' },
      { label: 'Suppliers', to: '/suppliers', icon: Truck, permission: 'suppliers.view', group: 'management' },
      { label: 'Categories', to: '/categories', icon: FolderTree, permission: 'categories.view', group: 'management' },
      { label: 'Products', to: '/products', icon: Package, permission: 'products.view', group: 'management' },
    ],
  },
  {
    group: 'operations',
    label: 'Operations',
    items: [
      { label: 'Orders', to: '/orders', icon: ShoppingCart, permission: 'orders.view', group: 'operations' },
      { label: 'Invoices', to: '/invoices', icon: FileText, permission: 'invoices.view', group: 'operations' },
      { label: 'Inventory', to: '/inventory', icon: Boxes, permission: 'inventory.view', group: 'operations' },
    ],
  },
  {
    group: 'finance',
    label: 'Finance',
    items: [
      { label: 'Finance', to: '/finance', icon: Landmark, permission: 'finance.view', group: 'finance' },
      { label: 'Reports', to: '/reports', icon: BarChart3, permission: 'reports.view', group: 'finance' },
    ],
  },
  {
    group: 'system',
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings, permission: 'settings.view', group: 'system' },
      { label: 'Audit Logs', to: '/audit', icon: ScrollText, permission: 'audit.view', group: 'system' },
      { label: 'Company', to: '/settings/company', icon: Building2, permission: 'settings.view', group: 'system' },
    ],
  },
];
