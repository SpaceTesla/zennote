import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { StandardResponse, ApiError } from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private etagCache = new Map<string, string>();
  private responseCache = new Map<string, StandardResponse>();

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
    // Request interceptor - attach JWT token and conditional ETag
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        const key = this.getUrlKey(config);
        if (key) {
          const etag = this.etagCache.get(key);
          if (etag && config.headers) {
            config.headers['If-None-Match'] = etag;
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and cache ETags
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        const etag = response.headers['etag'] as string | undefined;
        this.cacheResponse(response.config as InternalAxiosRequestConfig, response.data, etag);

        if (response.status === 304) {
          const key = this.getUrlKey(response.config as InternalAxiosRequestConfig);
          const cached = key ? this.responseCache.get(key) : undefined;
          return {
            ...response,
            status: 200,
            data: cached ?? response.data,
          };
        }

        return response;
      },
      (error: AxiosError<StandardResponse>) => {
        if (!error.response) {
          const networkError = new ApiError(
            'NETWORK_ERROR',
            'Network error. Please check your connection.',
            0
          );
          return Promise.reject(networkError);
        }

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

  private getUrlKey(config: InternalAxiosRequestConfig): string | null {
    if (!config.url) return null;
    const base = config.baseURL || '';
    return `${base}${config.url}`;
  }

  private cacheResponse(
    config: InternalAxiosRequestConfig,
    response: StandardResponse,
    etag?: string
  ) {
    const key = this.getUrlKey(config);
    if (!key) return;
    this.responseCache.set(key, response);
    if (etag) {
      this.etagCache.set(key, etag);
    }
  }
}

export const apiClient = new ApiClient();

