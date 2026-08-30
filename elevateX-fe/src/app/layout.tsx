import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import MotionProvider from '@/components/providers/MotionProvider';
import ToastProvider from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ElevateX — Where Freshers Connect, Chill & Create Memories',
  description:
    'A fun-filled freshers program designed to break the ice, meet new people, connect with seniors and alumni, and kick off your college journey together.',
  keywords: ['ElevateX', 'freshers program', 'ice breaker', 'college', 'alumni talk'],
  authors: [{ name: 'ElevateX Team' }],
  openGraph: {
    title: 'ElevateX — Where Freshers Connect, Chill & Create Memories',
    description:
      'A freshers program with an Alumni Talk, Fun & Games, and a Jamming Session to help you meet your batchmates and seniors.',
    type: 'website',
    // TODO: Add og:image when real branding assets are available
    // images: ['https://elevatex.in/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElevateX',
    description: 'A freshers program to connect, chill, and create memories.',
  },
  // TODO: Set canonical URL when deploying
  // alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL },
};

export const viewport: Viewport = {
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout — applies global fonts, providers, and metadata.
 *
 * Provider order (outer → inner):
 *   QueryProvider → MotionProvider → ToastProvider → children
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <MotionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </MotionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
