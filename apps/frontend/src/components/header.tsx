'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zen-light/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-5xl">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">Z</span>
          </div>
          <span className="font-medium text-xl text-zinc-800 dark:text-zinc-100">
            Zennote
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="" asChild>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
