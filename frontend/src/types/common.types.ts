export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
