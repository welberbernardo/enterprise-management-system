import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type TransactionType = 'PAYABLE' | 'RECEIVABLE';
export type TransactionStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface FinanceTransaction extends BaseEntity {
  reference: string;
  type: TransactionType;
  partyId: string;
  partyName: string;
  amount: number;
  paidAmount: number;
  remaining: number;
  dueDate: string;
  status: TransactionStatus;
  category: string;
  description?: string;
}

export interface CashFlowEntry {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface FinanceFilters extends QueryParams {
  search?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CashFlowFilters extends QueryParams {
  startDate?: string;
  endDate?: string;
}

export type FinanceTransactionsResponse = PaginatedResponse<FinanceTransaction>;
export type CashFlowResponse = CashFlowEntry[];
