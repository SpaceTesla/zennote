'use client';

import Link from 'next/link';
import { Github } from '@/components/ui/hugeicons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="border-b border-border/60 bg-white/70 dark:bg-background/80 backdrop-blur-xl sticky top-0 z-20 shadow-card-ambient">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-amber-400 flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-semibold text-sm">ZN</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-xl tracking-tight text-foreground">
              Zennote
            </span>
            <span className="text-xs text-muted-foreground">Notes that feel premium.</span>
          </div>
        </Link>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="hover:bg-amber-500/10" render={<Link href="https://github.com/SpaceTesla/zennote" target="_blank" rel="noopener noreferrer"><Github className="h-5 w-5" /><span className="sr-only">GitHub</span></Link>} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
