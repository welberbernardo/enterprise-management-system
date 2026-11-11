import { http } from './api';
import type {
  AuditFilters,
  AuditLogsResponse,
  ActivityResponse,
} from '../types/audit.types';

export const auditService = {
  async getLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    return http.get<AuditLogsResponse>('/audit/logs', filters);
  },
  async getActivity(filters?: AuditFilters): Promise<ActivityResponse> {
    return http.get<ActivityResponse>('/audit/activity', filters);
  },
};
