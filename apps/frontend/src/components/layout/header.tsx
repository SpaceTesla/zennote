'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileText } from '@/components/ui/hugeicons';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/notes', label: 'Notes', requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-primary-foreground text-xs font-semibold">ZN</span>
            </div>
            <span className="font-semibold text-lg">Zennote</span>
          </Link>
          
          <SignedIn>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                if (item.requiresAuth && !user?.id) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      pathname === item.href
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SignedIn>
        </div>

        <div className="flex items-center gap-2">
          <SignedIn>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              render={<Link href="/notes"><FileText className="mr-2 h-4 w-4" />Notes</Link>}
            />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { userButtonAvatarBox: 'h-9 w-9' },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </SignedOut>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
