import { http } from './api';
import type { DashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    return http.get<DashboardData>('/dashboard');
  },
};
