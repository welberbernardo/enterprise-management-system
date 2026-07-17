import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type StockMovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
export type StockReason = 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'MANUAL';

export interface StockMovement extends BaseEntity {
  reference: string;
  productId: string;
  productName: string;
  productCode: string;
  type: StockMovementType;
  reason: StockReason;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  date: string;
  notes?: string;
}

export interface CreateStockMovementRequest {
  productId: string;
  type: StockMovementType;
  reason: StockReason;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface StockMovementFilters extends QueryParams {
  search?: string;
  productId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StockSummary {
  productId: string;
  productName: string;
  productCode: string;
  stock: number;
  minStock: number;
  status: 'OK' | 'LOW' | 'OUT';
}

export type StockMovementsResponse = PaginatedResponse<StockMovement>;
export type StockSummaryResponse = PaginatedResponse<StockSummary>;
