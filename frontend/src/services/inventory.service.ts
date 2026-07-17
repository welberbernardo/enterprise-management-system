import { http } from './api';
import type {
  StockMovement,
  CreateStockMovementRequest,
  StockMovementFilters,
  StockMovementsResponse,
  StockSummaryResponse,
} from '../types/inventory.types';

export const inventoryService = {
  async getMovements(filters?: StockMovementFilters): Promise<StockMovementsResponse> {
    return http.get<StockMovementsResponse>('/inventory/movements', filters);
  },
  async getSummary(filters?: StockMovementFilters): Promise<StockSummaryResponse> {
    return http.get<StockSummaryResponse>('/inventory/summary', filters);
  },
  async createMovement(payload: CreateStockMovementRequest): Promise<StockMovement> {
    return http.post<StockMovement>('/inventory/movements', payload);
  },
};
