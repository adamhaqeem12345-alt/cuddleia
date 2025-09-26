
'use client';

import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ThankYouStatus() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // Clear the cart once the user lands on this page after a successful transaction
  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <>
      {status === 'success' ? (
        <p className="mt-6 text-lg leading-8 text-foreground/80 font-body">
          Your payment was successful! A confirmation email with your download links will be sent to you shortly. Please check your inbox (and spam folder, just in case).
        </p>
      ) : (
        <p className="mt-6 text-lg leading-8 text-foreground/80 font-body">
          We are processing your order. If you have completed the payment, a confirmation email with your download links will be sent to you shortly. Please check your inbox (and spam folder, just in case).
        </p>
      )}
    </>
  );
}

export default function ThankYouPage() {
  return (
    <div className="bg-background">
      <AnimateIn>
        <section className="relative bg-accent/30 py-28 md:py-40">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                Thank You For Your Order!
              </h1>
              <Suspense fallback={<p className="mt-6 text-lg leading-8 text-foreground/80 font-body">Loading status...</p>}>
                <ThankYouStatus />
              </Suspense>
              <Button asChild size="lg" className="mt-10 rounded-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>
      </AnimateIn>
    </div>
  );
}
