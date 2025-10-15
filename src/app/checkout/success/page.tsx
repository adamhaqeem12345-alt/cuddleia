'use client';

import { useEffect, useState, useContext, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CartContext } from '@/context/cart-context';
import { CheckCircle, Loader, AlertTriangle, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useContext(CartContext);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderID = searchParams.get('token');
    
    if (!orderID) {
      // This can happen if the user navigates here directly.
      // We can just show success as the payment was likely handled by the time they get here,
      // and cart is cleared.
      setStatus('success');
      clearCart();
      return;
    }

    // By the time the user reaches this page, the payment has already been
    // captured by the onApprove callback in the checkout page.
    // This page is just for showing the confirmation UI.
    // We clear the cart and show the success message.
    setStatus('success');
    clearCart();

  }, [searchParams, clearCart]);

  return (
    <div className="bg-background">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center bg-card p-10 rounded-2xl shadow-xl">
          {status === 'loading' && (
            <>
              <Loader className="mx-auto h-16 w-16 animate-spin text-primary" />
              <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">Finalizing Your Order...</h1>
              <p className="mt-2 text-muted-foreground">Please wait while we confirm your transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">Payment Successful!</h1>
              <p className="mt-2 text-muted-foreground">Thank you for your purchase. A confirmation email with your download links is on its way to you!</p>
              <Button asChild size="lg" className="mt-8 rounded-full font-bold">
                <Link href="/products">
                  Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
              <h1 className="mt-6 font-headline text-3xl font-bold text-destructive">Payment Issue</h1>
              <p className="mt-2 text-muted-foreground">There was an issue confirming your payment.</p>
              <p className="mt-2 text-sm text-red-500 bg-destructive/10 p-3 rounded-md">{error}</p>
              <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full font-bold">
                <Link href="/checkout">
                  Try Again
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader className="h-16 w-16 animate-spin text-primary" /></div>}>
            <SuccessContent />
        </Suspense>
    )
}
