import type { BaseEntity, PaginatedResponse, QueryParams } from './common.types';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface CreateOrderRequest {
  customerId: string;
  date: string;
  items: CreateOrderItemRequest[];
  discount: number;
  notes?: string;
}

export interface UpdateOrderRequest extends CreateOrderRequest {}

export interface OrderFilters extends QueryParams {
  search?: string;
  status?: OrderStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type OrdersResponse = PaginatedResponse<Order>;

export type { Customer } from './customer.types';
