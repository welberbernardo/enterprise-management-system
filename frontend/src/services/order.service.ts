import { http } from './api';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters,
  OrdersResponse,
} from '../types/order.types';

export const orderService = {
  async getAll(filters?: OrderFilters): Promise<OrdersResponse> {
    return http.get<OrdersResponse>('/orders', filters);
  },
  async getById(id: string): Promise<Order> {
    return http.get<Order>(`/orders/${id}`);
  },
  async create(payload: CreateOrderRequest): Promise<Order> {
    return http.post<Order>('/orders', payload);
  },
  async update(id: string, payload: UpdateOrderRequest): Promise<Order> {
    return http.put<Order>(`/orders/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    return http.del<void>(`/orders/${id}`);
  },
  async changeStatus(id: string, status: string): Promise<Order> {
    return http.patch<Order>(`/orders/${id}/status`, { status });
  },
};
