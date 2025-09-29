'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Loader2, XCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token'); // PayPal's orderID is in the 'token' parameter
    const payerId = searchParams.get('PayerID');

    if (token && payerId) {
      const capturePayment = async (orderID: string) => {
        try {
          const response = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID }),
          });

          const responseData = await response.json();

          if (response.ok && responseData.success) {
            console.log('Payment captured successfully!');
            clearCart();
            setStatus('success');
            // Clean the URL
            router.replace('/checkout/success');
          } else {
            throw new Error(responseData.error || 'Failed to finalize PayPal payment.');
          }
        } catch (err) {
          console.error("Capture payment error:", err);
          let message = 'Could not finalize your payment. Please contact support.';
          if (err instanceof Error) {
            message = err.message;
          }
          setErrorMessage(message);
          setStatus('error');
        }
      };

      capturePayment(token);
    } else {
        // This handles direct navigation or other payment methods like ToyyibPay
        clearCart();
        setStatus('success');
    }
  }, [searchParams, clearCart, router]);


  if (status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground font-semibold">Finalizing your payment...</p>
      </div>
    )
  }

  if (status === 'error') {
     return (
        <div className="bg-background">
            <section className="bg-destructive/10 py-20 md:py-28 flex items-center justify-center">
                <div className="container mx-auto px-4">
                <AnimateIn>
                    <div className="relative z-10 text-center">
                        <div className="flex justify-center mb-4">
                            <XCircle className="h-24 w-24 text-destructive" />
                        </div>
                    <h1 className="font-headline text-5xl md:text-7xl font-bold text-destructive drop-shadow-lg">
                        Payment Failed
                    </h1>
                    <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-destructive-foreground">
                        There was a problem processing your payment.
                    </p>
                    </div>
                </AnimateIn>
                </div>
            </section>
            
            <AnimateIn>
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="max-w-2xl mx-auto mt-6 space-y-4 text-muted-foreground bg-card p-8 rounded-2xl shadow-lg">
                        <p className="font-bold text-lg">Error Details:</p>
                        <p className="text-destructive">{errorMessage}</p>
                        <p>
                            Please try the checkout process again. If the problem persists, contact us at <a href="mailto:hello@cuddleia.com" className="text-primary hover:underline">hello@cuddleia.com</a> for assistance.
                        </p>
                    </div>
                    <div className="mt-12">
                        <Button asChild size="lg" className="font-bold">
                            <Link href="/checkout">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Try Again
                            </Link>
                        </Button>
                    </div>
                </div>
            </AnimateIn>
        </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-24 w-24 text-green-500" />
                </div>
              <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg">
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
            <h2 className="font-headline text-3xl font-bold">What's Next?</h2>
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
