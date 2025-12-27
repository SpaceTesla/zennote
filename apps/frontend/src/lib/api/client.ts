import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { StandardResponse, ApiError } from '@/types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - attach JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
      },
      (error: AxiosError<StandardResponse>) => {
        // Handle network errors
        if (!error.response) {
          const networkError = new ApiError(
            'NETWORK_ERROR',
            'Network error. Please check your connection.',
            0
          );
          return Promise.reject(networkError);
        }

        // Handle API errors
        const apiError = error.response.data?.error;
        if (apiError) {
          const apiErrorObj = new ApiError(
            apiError.code,
            apiError.message,
            error.response.status,
            apiError.details
          );
          return Promise.reject(apiErrorObj);
        }

        // Fallback error
        const fallbackError = new ApiError(
          'UNKNOWN_ERROR',
          error.message || 'An unexpected error occurred',
          error.response.status
        );
        return Promise.reject(fallbackError);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // First check Zustand auth store (single source of truth)
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.token) {
          return parsed.state.token;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    // Fallback to legacy localStorage key for backward compatibility
    return localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  public removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  public async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<StandardResponse<T>> {
    const response = await this.client.get<StandardResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<StandardResponse<T>> {
    const response = await this.client.post<StandardResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<StandardResponse<T>> {
    const response = await this.client.put<StandardResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<StandardResponse<T>> {
    const response = await this.client.delete<StandardResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

