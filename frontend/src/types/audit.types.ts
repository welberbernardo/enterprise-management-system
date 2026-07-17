import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'VIEW';

export interface AuditLog extends BaseEntity {
  user: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityItem extends BaseEntity {
  user: string;
  action: string;
  entity: string;
  description: string;
  timestamp: string;
}

export interface AuditFilters extends QueryParams {
  search?: string;
  userId?: string;
  action?: AuditAction;
  entity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type AuditLogsResponse = PaginatedResponse<AuditLog>;
export type ActivityResponse = PaginatedResponse<ActivityItem>;
