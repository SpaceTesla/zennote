import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Get Started – Zennote',
  description: 'Create your Zennote account to craft calm, focused notes.',
};

export const dynamic = 'force-dynamic';

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
