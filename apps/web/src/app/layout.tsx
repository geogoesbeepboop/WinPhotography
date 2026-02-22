import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/shared/providers';
import { Toaster } from 'sonner';
import { DataSourceFloat } from '@/components/shared/data-source-float';

export const metadata: Metadata = {
  title: {
    default: 'Win Photography | Wedding & Event Photography',
    template: '%s | Win Photography',
  },
  description:
    'Professional wedding and event photography. Capturing your most beautiful moments with artistry and elegance.',
  keywords: ['wedding photography', 'event photography', 'photographer', 'portrait photography'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Win Photography',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
        <DataSourceFloat />
      </body>
    </html>
  );
}
