import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Notes – Zennote',
  description: 'Create, organize, and edit your notes in Zennote.',
  robots: { index: false, follow: false },
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
