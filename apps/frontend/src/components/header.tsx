'use client';

import Link from 'next/link';
import { Github } from '@/components/ui/hugeicons';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-semibold text-lg tracking-tight text-foreground">
            Zennote
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            render={
              <Link
                href="https://github.com/SpaceTesla/zennote"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            }
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
