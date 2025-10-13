
'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Clear the cart when the customer lands on this page.
  useEffect(() => {
    clearCart();
  }, [clearCart]);


  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-24 w-24 text-green-500" />
                </div>
              <h1 className="font-headline text-5xl md:text-7xl text-foreground drop-shadow-lg">
                Payment Successful!
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                Thank you for your purchase. Your digital goods are on their way to your email inbox.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>
      
      <AnimateIn>
        <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="font-headline text-3xl">What's Next?</h2>
            <div className="max-w-2xl mx-auto mt-6 space-y-4 text-muted-foreground">
                <p>
                    You will receive an email shortly containing the download links for your purchased items. If you don't see it within a few minutes, please check your spam or junk folder.
                </p>
                <p>
                    If you encounter any issues or have any questions, please don't hesitate to reply to the order email or contact us at <a href="mailto:hello@cuddleia.com" className="text-primary hover:underline">hello@cuddleia.com</a>.
                </p>
            </div>
            <div className="mt-12">
                <Button asChild size="lg" className="font-bold">
                    <Link href="/products">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>
        </div>
      </AnimateIn>
    </div>
  );
}
