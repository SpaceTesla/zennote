'use client';

import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
          },
        }}
        redirectUrl="/notes"
        signInUrl="/login"
      />
    </div>
  );
}
