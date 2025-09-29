import type { Metadata } from 'next';
import { Belleza, Alegreya } from 'next/font/google';
import { CartProviderWrapper } from '@/components/cart-provider-wrapper';
import Header from '@/components/header';
import Footer from '@/components/footer';
import '@/app/globals.css';
import { cn } from '@/lib/utils';

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya({
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
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased font-body', belleza.variable, alegreya.variable)}>
        <CartProviderWrapper>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </div>
        </CartProviderWrapper>
      </body>
    </html>
  );
}
