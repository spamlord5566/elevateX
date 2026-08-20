import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import MotionProvider from '@/components/providers/MotionProvider';
import ToastProvider from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ElevateX 2.0 — Prepared to Be Amazed',
  description:
    "India's most electrifying hackathon returns. 36 hours of raw innovation, real challenges, and life-changing prizes. Register your team for ElevateX 2.0.",
  keywords: ['hackathon', 'ElevateX', 'India', 'coding competition', 'innovation'],
  authors: [{ name: 'ElevateX Team' }],
  openGraph: {
    title: 'ElevateX 2.0 — Prepared to Be Amazed',
    description: "India's most electrifying hackathon. 36 hours, ₹4,50,000 in prizes.",
    type: 'website',
    // TODO: Add og:image when real branding assets are available
    // images: ['https://elevatex.in/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElevateX 2.0',
    description: "India's most electrifying hackathon.",
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
      <body className="antialiased">
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
