import { http } from './api';
import type { DashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const response = await http.get<any>('/dashboard');
    const data = response.data ?? response;
    return {
      stats: {
        totalOrders: data.stats?.totalOrders ?? 0,
        totalCustomers: data.stats?.totalCustomers ?? 0,
        totalProducts: data.stats?.totalProducts ?? 0,
        totalRevenue: data.stats?.monthlyRevenue ?? 0,
        totalUsers: data.stats?.totalCustomers ?? 0,
        totalSuppliers: data.stats?.totalSuppliers ?? 0,
        lowStockProducts: data.stats?.lowStockProducts ?? 0,
        pendingInvoices: 0,
        ordersGrowth: 0,
        revenueGrowth: 0,
        customersGrowth: 0,
        productsGrowth: 0,
      },
      salesOverTime: (data.charts?.monthlySales ?? []).map((item: any) => ({
        date: item.label ?? '',
        sales: Number(item.value ?? 0),
        orders: 0,
      })),
      topProducts: (data.charts?.topProducts ?? []).map((item: any) => ({
        productId: String(item.label ?? item.productName ?? ''),
        productName: String(item.label ?? item.productName ?? ''),
        quantity: Number(item.value ?? 0),
        revenue: Number(item.value ?? 0),
      })),
      ordersByStatus: [],
      recentOrders: [],
      recentActivity: (data.recentActivity ?? []).map((item: any) => ({
        id: String(item.id ?? ''),
        user: item.userName ?? 'System',
        action: item.action ?? '',
        entity: item.entityType ?? '',
        description: `${item.action} ${item.entityType}`,
        timestamp: item.createdAt ?? new Date().toISOString(),
      })),
    };
  },
};
