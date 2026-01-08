import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import Footer from '@/components/footer';
import { Header } from '@/components/layout/header';
import { QueryProvider } from '@/lib/providers/query-provider';
import { BASE_URL } from '@/config';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Zennote – Calm, Focused Note-Taking',
  description: 'Zennote turns messy markdown into polished, shareable notes.',
  openGraph: {
    title: 'Zennote – Calm, Focused Note-Taking',
    description: 'Zennote turns messy markdown into polished, shareable notes.',
    url: BASE_URL,
    siteName: 'Zennote',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zennote – Calm, Focused Note-Taking',
    description: 'Zennote turns messy markdown into polished, shareable notes.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
