'use client';

import { SignIn } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
          },
        }}
        redirectUrl="/notes"
        signUpUrl="/register"
      />
    </div>
  );
}
