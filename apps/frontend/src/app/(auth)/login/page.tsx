import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Login – Zennote',
  description: 'Sign in to access your notes and stay in flow.',
  robots: { index: false, follow: false },
};

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
