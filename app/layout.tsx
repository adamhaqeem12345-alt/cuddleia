
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { CartProvider } from '@/context/cart-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Cuddleia | Cozy Digital Goods with Heart',
  description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
  keywords: 'islamic digital products,ipad wallpaper,digital booklets,muslim lifestyle,cuddleia,cozy digital goods,barakah business',
  robots: 'index, follow',
  openGraph: {
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
    url: 'https://www.cuddleia.com',
    siteName: 'Cuddleia',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.cuddleia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuddleia - Cozy Digital Goods',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
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
      <head>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <CartProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
        </CartProvider>
      </body>
    </html>
  );
}
