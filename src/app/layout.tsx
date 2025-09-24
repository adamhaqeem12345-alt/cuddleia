
import type { Metadata } from 'next';
import { Alegreya, Belleza, Mali } from 'next/font/google';
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

const mali = Mali({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-logo',
});


export const metadata: Metadata = {
  title: 'cuddleia',
  description: 'Cozy digital wallpapers and booklets.',
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
          alegreya.variable,
          mali.variable
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
