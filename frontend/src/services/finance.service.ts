import { http } from './api';
import type {
  FinanceTransaction,
  FinanceFilters,
  FinanceTransactionsResponse,
  CashFlowResponse,
  CashFlowFilters,
} from '../types/finance.types';

export const financeService = {
  async getPayables(filters?: FinanceFilters): Promise<FinanceTransactionsResponse> {
    return http.get<FinanceTransactionsResponse>('/finance/payables', filters);
  },
  async getReceivables(filters?: FinanceFilters): Promise<FinanceTransactionsResponse> {
    return http.get<FinanceTransactionsResponse>('/finance/receivables', filters);
  },
  async getCashFlow(filters?: CashFlowFilters): Promise<CashFlowResponse> {
    return http.get<CashFlowResponse>('/finance/cash-flow', filters);
  },
  async recordPayment(id: string, amount: number): Promise<FinanceTransaction> {
    return http.post<FinanceTransaction>(`/finance/transactions/${id}/payment`, { amount });
  },
};
