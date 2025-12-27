import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile } from '@/types/user';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/types/api';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password, rememberMe });
          // Token is already set in apiClient by authApi.login, but ensure sync
          if (response.token && typeof window !== 'undefined') {
            const { apiClient } = await import('../api/client');
            apiClient.setToken(response.token);
          }
          set({
            user: response.user,
            profile: response.profile,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, password, confirmPassword: password });
          // Token is already set in apiClient by authApi.register, but ensure sync
          if (response.token && typeof window !== 'undefined') {
            const { apiClient } = await import('../api/client');
            apiClient.setToken(response.token);
          }
          set({
            user: response.user,
            profile: response.profile,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        // Also clear from apiClient
        if (typeof window !== 'undefined') {
          import('../api/client').then(({ apiClient }) => {
            apiClient.removeToken();
          });
        }
        set({
          user: null,
          profile: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        // Sync token to apiClient to ensure it's available for requests
        if (token && typeof window !== 'undefined') {
          const { apiClient } = await import('../api/client');
          apiClient.setToken(token);
        }

        set({ isLoading: true });
        try {
          const { user, profile } = await authApi.getCurrentUser();
          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          set({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          // Also clear from apiClient
          if (typeof window !== 'undefined') {
            const { apiClient } = await import('../api/client');
            apiClient.removeToken();
          }
        }
      },

      refreshUser: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const { user, profile } = await authApi.getCurrentUser();
          set({ user, profile });
        } catch (error) {
          // If refresh fails, user might be logged out
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

