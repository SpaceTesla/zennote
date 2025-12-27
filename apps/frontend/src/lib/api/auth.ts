import { apiClient } from './client';
import { config } from '@/config';
import { StandardResponse, PaginatedResponse } from '@/types/api';
import { AuthResponse, LoginInput, RegisterInput, User, UserProfile } from '@/types/user';

export const authApi = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      config.api.endpoints.auth.register,
      {
        email: input.email,
        password: input.password,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed');
    }

    // Store token
    apiClient.setToken(response.data.token);

    return response.data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      config.api.endpoints.auth.login,
      {
        email: input.email,
        password: input.password,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    // Store token
    apiClient.setToken(response.data.token);

    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User; profile: UserProfile | null }> {
    const response = await apiClient.get<{ user: User; profile: UserProfile | null }>(
      config.api.endpoints.auth.me
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get current user');
    }

    // Validate that user has required fields
    if (!response.data.user || !response.data.user.id) {
      throw new Error('Invalid user data received');
    }

    return response.data;
  },

  logout(): void {
    apiClient.removeToken();
  },
};

