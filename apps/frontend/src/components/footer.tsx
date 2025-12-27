import Link from 'next/link';
import { Github, Linkedin, Instagram, Globe, BookOpen } from '@/components/ui/hugeicons';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-white/70 dark:bg-background/70 backdrop-blur-xl py-10">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-5xl space-y-4">
        <p className="text-base text-foreground">
          © {new Date().getFullYear()}{' '}
          <Link
            href="https://github.com/SpaceTesla"
            className="text-primary font-bold hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            SpaceTesla
          </Link>{' '}
          — Crafted for calm, beautiful writing.
        </p>
        <div className="flex font-semibold justify-center items-center gap-4">
          <Link
            href="https://github.com/SpaceTesla"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://linkedin.com/in/shivansh-karan/"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link
            href="https://medium.com/@SpaceTesla"
            aria-label="Medium"
            className="text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen className="h-5 w-5" />
          </Link>
          <Link
            href="https://instagram.com/shivanshk.dev"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="h-5 w-5" />
          </Link>
        </div>
        <div className="flex justify-center gap-2 text-xs text-muted-foreground">
          <span>Privacy-first</span>
          <span>•</span>
          <span>Amber Nova theme</span>
          <span>•</span>
          <span>Made for focus</span>
        </div>
      </div>
    </footer>
  );
}
