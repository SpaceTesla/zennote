import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | ZenNote',
  description: 'Create a new ZenNote account to start taking notes.',
};

export default function RegisterPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/25 via-transparent to-primary/15 blur-3xl" />
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 relative">
        <Card className="w-full max-w-md border border-border/70 bg-white/75 dark:bg-background/70 backdrop-blur-xl shadow-card-ambient">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-base">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

