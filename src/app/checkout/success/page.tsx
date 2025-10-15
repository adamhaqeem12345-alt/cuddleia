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
      setStatus('error');
      setError('No order ID found in URL.');
      return;
    }

    const capturePayment = async () => {
      try {
        const response = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'COMPLETED') {
          setStatus('success');
          clearCart();
        } else {
          setStatus('error');
          setError(data.error || 'Failed to capture payment.');
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'An unexpected error occurred.');
      }
    };

    capturePayment();
  }, [searchParams, clearCart]);

  return (
    <div className="bg-background">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center bg-card p-10 rounded-2xl shadow-xl">
          {status === 'loading' && (
            <>
              <Loader className="mx-auto h-16 w-16 animate-spin text-primary" />
              <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">Processing Your Payment...</h1>
              <p className="mt-2 text-muted-foreground">Please wait while we confirm your transaction. Do not refresh or close this page.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">Payment Successful!</h1>
              <p className="mt-2 text-muted-foreground">Thank you for your purchase. Your digital goods are on their way to you!</p>
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
              <h1 className="mt-6 font-headline text-3xl font-bold text-destructive">Payment Failed</h1>
              <p className="mt-2 text-muted-foreground">There was an issue processing your payment.</p>
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
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
