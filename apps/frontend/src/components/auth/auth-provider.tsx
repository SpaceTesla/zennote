'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

