import Link from 'next/link';
import { Github, Linkedin, BookOpen, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-500 max-w-5xl">
        <p>
          © {new Date().getFullYear()}{' '}
          <Link
            href="https://github.com/SpaceTesla"
            className="text-primary font-bold hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            SpaceTesla
          </Link>
          . Designed with tranquility in mind.
        </p>
        <div className="mt-4 flex font-bold justify-center items-center gap-4">
          <Link
            href="https://github.com/SpaceTesla"
            aria-label="GitHub"
            className="text-zinc-500 hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={20} strokeWidth={2.5} />
          </Link>
          <Link
            href="https://linkedin.com/in/your-username"
            aria-label="LinkedIn"
            className="text-zinc-500 hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin size={20} strokeWidth={2.5} />
          </Link>
          <Link
            href="https://medium.com/@your-username"
            aria-label="Medium"
            className="text-zinc-500 hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen size={20} strokeWidth={2.5} />
          </Link>
          <Link
            href="https://instagram.com/your-username"
            aria-label="Instagram"
            className="text-zinc-500 hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
