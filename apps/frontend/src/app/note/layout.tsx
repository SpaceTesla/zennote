import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Note – Zennote',
  description: 'View note details.',
  robots: { index: false, follow: false },
};

export default function NoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
