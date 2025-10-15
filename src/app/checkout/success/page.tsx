'use client';

import { useEffect, useContext, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CartContext } from '@/context/cart-context';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    // The payment has already been verified by the backend callback (PayPal onApprove or ToyyibPay callback).
    // This page's only responsibility is to show a success message and clear the cart from local storage.
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-background">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center bg-card p-10 rounded-2xl shadow-xl">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">Payment Successful!</h1>
          <p className="mt-2 text-muted-foreground">Thank you for your purchase. A confirmation email with your download links is on its way to you!</p>
          <Button asChild size="lg" className="mt-8 rounded-full font-bold">
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
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
