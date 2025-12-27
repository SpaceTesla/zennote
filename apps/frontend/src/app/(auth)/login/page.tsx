import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login | ZenNote',
  description: 'Sign in to your ZenNote account to access your notes.',
};

export default function LoginPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-200/20 blur-3xl" />
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 relative">
        <Card className="w-full max-w-md border border-border/70 bg-white/75 dark:bg-background/70 backdrop-blur-xl shadow-card-ambient">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

