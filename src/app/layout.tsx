
import type { Metadata } from 'next';
import { Alegreya, Belleza } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { CartProvider } from '@/components/cart/cart-context';

const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});

const APP_URL = 'https://www.cuddleia.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Cuddleia | Cozy Digital Goods with Heart',
    template: '%s | Cuddleia',
  },
  description: 'Discover cozy digital wallpapers, planners, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
  keywords: ['islamic digital products', 'ipad wallpaper', 'digital booklets', 'muslim lifestyle', 'cuddleia', 'cozy digital goods', 'barakah business'],
  openGraph: {
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, planners, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
    url: APP_URL,
    siteName: 'Cuddleia',
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Must be an absolute URL
        width: 1200,
        height: 630,
        alt: 'Cuddleia - Cozy Digital Goods',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, planners, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
    images: [`${APP_URL}/og-image.png`], // Must be an absolute URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          belleza.variable,
          alegreya.variable
        )}
      >
        <CartProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
            <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
