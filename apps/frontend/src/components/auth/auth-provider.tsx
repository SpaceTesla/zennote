'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check auth once on mount
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, []); // Empty dependency array - only run once

  return <>{children}</>;
}

