import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';
import type { ApiError, ApiResponse, QueryParams } from '../types/common.types';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function renewAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token available');

  // Use a separate Axios call so that refresh failures do not recurse into this interceptor.
  const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );
  const tokens = response.data.data;
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('Invalid refresh response');
  }
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  return tokens.accessToken;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = renewAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearSession();
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function get<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<ApiResponse<T>>(`${url}${buildQueryString(params)}`, config);
  return response.data.data;
}

async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export const http = { get, post, put, patch, del, instance: api };
export default api;
