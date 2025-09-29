import type { Metadata } from 'next';
import { Creepster, Special_Elite } from 'next/font/google';
import './globals.css';
import { cn } from '../lib/utils';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const fontHeadline = Creepster({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
});

const fontBody = Special_Elite({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'PUNISHMENT',
  description:
    'This is your punishment.',
  keywords:
    'punishment,failure,disappointment',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'PUNISHMENT',
    description:
      'This is your punishment.',
    url: 'https://www.cuddleia.com',
    siteName: 'Cuddleia',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.cuddleia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuddleia - Cozy Digital Goods',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUNISHMENT',
    description:
      'This is your punishment.',
    images: ['https://www.cuddleia.com/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <div className="relative flex min-h-dvh flex-col bg-background">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
