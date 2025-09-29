import type { Metadata } from 'next';
import { Belleza, Alegreya_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { CartProvider } from '@/context/cart-context';
import '@/app/globals.css';

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'Cuddleia | Cozy Digital Goods with Heart',
  description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(belleza.variable, alegreya.variable)}>
      <body>
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
