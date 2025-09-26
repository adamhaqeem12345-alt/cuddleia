'use client';

import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ThankYouStatus() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderID = searchParams.get('orderID');

  return (
    <>
      {status === 'success' ? (
        <>
        <p className="mt-6 text-lg leading-8 text-foreground/80 font-body">
          Your payment was successful! A confirmation email with your download links has been sent to you. Please check your inbox (and spam folder, just in case).
        </p>
        <p className="mt-4 text-sm text-muted-foreground font-mono">Order ID: {orderID}</p>
        </>
      ) : (
        <p className="mt-6 text-lg leading-8 text-foreground/80 font-body">
         Your order was cancelled or there was an issue. If you believe this is an error, please contact support.
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
