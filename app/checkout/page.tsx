
'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  if (items.length === 0) {
    return null; 
  }

  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Checkout
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                Complete your purchase.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <AnimateIn>
                <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <h2 className="font-headline text-2xl font-bold border-b pb-4 mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: 1</p>
                                </div>
                                <ProductPrice price={item.price} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <ProductPrice price={subtotal} />
                        </div>
                    </div>
                </div>
            </AnimateIn>
            <AnimateIn delay={150}>
                 <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <h2 className="font-headline text-2xl font-bold mb-6">Payment Method</h2>
                    <div className="text-center text-muted-foreground">
                        <p>PayPal integration coming soon...</p>
                    </div>
                 </div>
            </AnimateIn>
        </div>
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
