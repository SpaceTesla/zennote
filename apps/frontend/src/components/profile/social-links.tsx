'use client';

import { SocialLink } from '@/types/profile';
import { Github, Twitter, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';
import Link from 'next/link';

interface SocialLinksProps {
  socialLinks: SocialLink[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
  other: Globe,
};

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  return (
    <div className="flex gap-2">
      {socialLinks.map((link) => {
        const Icon = iconMap[link.platform] || Globe;
        return (
          <Link
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={link.platform}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </div>
  );
}

