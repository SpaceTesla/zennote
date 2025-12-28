import Link from 'next/link';
import { Github, Linkedin, Instagram, BookOpen } from '@/components/ui/hugeicons';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col gap-8 py-12 px-4 md:flex-row md:py-16 max-w-7xl">
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-primary-foreground text-xs font-semibold">ZN</span>
            </div>
            <span className="font-semibold text-lg">Zennote</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Beautiful markdown notes, crafted for focus. Turn messy ideas into polished, shareable knowledge.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:flex-1">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link href="/notes" className="hover:text-foreground transition-colors">
                  Notes
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/SpaceTesla/zennote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/SpaceTesla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/SpaceTesla"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/shivansh-karan/"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://medium.com/@SpaceTesla"
                aria-label="Medium"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com/shivanshk.dev"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 px-4 md:flex-row max-w-7xl">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{' '}
            <Link
              href="https://github.com/SpaceTesla"
              className="font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              SpaceTesla
            </Link>
            . All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted for calm, beautiful writing.
          </p>
        </div>
      </div>
    </footer>
  );
}
