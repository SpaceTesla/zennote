'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { setTokenGetter } from '../api/client';

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  const { getToken } = useAuth();
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Set up the token getter for the API client
  useEffect(() => {
    setTokenGetter(async () => {
      try {
        const token = await getToken();
        return token;
      } catch (error) {
        console.error('[QueryProvider] Error getting token:', error);
        return null;
      }
    });
  }, [getToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}


