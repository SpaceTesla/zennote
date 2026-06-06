import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useUser } from '@clerk/nextjs';

export function useAuthMe() {
  const { isSignedIn } = useUser();
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getMe(),
    enabled: !!isSignedIn,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
