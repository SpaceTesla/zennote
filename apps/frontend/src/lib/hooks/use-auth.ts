import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuth() {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    clearError,
  } = useAuthStore();

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    clearError,
  };
}

