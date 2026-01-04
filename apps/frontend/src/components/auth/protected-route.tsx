'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col flex-1 h-full">{children}</div>
      </SignedIn>
    </>
  );
}

