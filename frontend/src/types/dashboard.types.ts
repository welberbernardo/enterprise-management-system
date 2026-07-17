import type { BaseEntity } from './common.types';

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  totalUsers: number;
  totalSuppliers: number;
  lowStockProducts: number;
  pendingInvoices: number;
  ordersGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface SalesPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

export interface ActivityItem extends BaseEntity {
  user: string;
  action: string;
  entity: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  salesOverTime: SalesPoint[];
  topProducts: TopProduct[];
  ordersByStatus: StatusCount[];
  recentOrders: RecentOrder[];
  recentActivity: ActivityItem[];
}
