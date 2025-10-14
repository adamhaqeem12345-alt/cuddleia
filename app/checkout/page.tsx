'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

// Force this page to be dynamically rendered on the server
export const dynamic = 'force-dynamic';


export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && items.length === 0) {
      router.push('/products');
    }
  }, [items, router, isClient]);

  if (!isClient || items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // Since all items are now free, this page can be simplified or just redirect.
  // For now, let's show a message and a way back.
  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
                Checkout
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                All paid products have been removed.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <AnimateIn>
          <div className="text-center py-16">
            <h2 className="font-headline text-3xl text-foreground font-bold">No items to purchase</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Currently, only free items are available for download directly from the product pages.
            </p>
            <Button asChild size="lg" className="mt-8 font-bold">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </AnimateIn>

        <AnimateIn delay={300}>
          <div className="mt-12 text-center">
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
