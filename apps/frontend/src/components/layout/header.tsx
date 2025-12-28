'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/hooks/use-auth';
import { User, LogOut, Settings, FileText } from '@/components/ui/hugeicons';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, profile, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

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
          
          {isAuthenticated && (
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex"
                render={<Link href="/notes"><FileText className="mr-2 h-4 w-4" />Notes</Link>} 
              />
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium leading-none">
                      {profile?.display_name || user?.email}
                    </p>
                    {user?.email && profile?.display_name && (
                      <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {user?.id && (
                    <DropdownMenuItem render={
                      <Link href={`/profile/${user.id}`} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    } />
                  )}
                  <DropdownMenuItem render={
                    <Link href="/profile/edit" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  } />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login">Login</Link>} />
              <Button size="sm" render={<Link href="/register">Sign up</Link>} />
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
