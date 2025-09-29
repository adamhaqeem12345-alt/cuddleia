
'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import type { OrderResponseBody, CreateOrderData, OnApproveData } from '@paypal/paypal-js';
import { useHasHydrated } from '@/lib/hooks';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useHasHydrated();


  const USD_TO_MYR = 4.21;
  const totalMYR = subtotal * USD_TO_MYR;

  useEffect(() => {
    // Only redirect if hydration is complete and the cart is truly empty.
    if (hasHydrated && items.length === 0 && !isProcessing && !isRedirecting) {
      router.push('/products');
    }
  }, [items, router, isProcessing, isRedirecting, hasHydrated]);

  // This effect handles the case where the user navigates back from the payment gateway.
  useEffect(() => {
    const handlePageShow = () => {
      // When the page is shown again (e.g., via the back button), reset the state.
      setIsProcessing(false);
      setIsRedirecting(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleToyyibPay = async () => {
    setIsProcessing(true);
    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch('/api/toyyibpay', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items, total: totalMYR }),
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
          window.location.href = data.paymentUrl;
      } else {
          setError(data.error || 'Could not initiate ToyyibPay payment.');
          setIsProcessing(false);
          setIsRedirecting(false);
      }
    } catch (err) {
      console.error('ToyyibPay fetch error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
      setIsRedirecting(false);
    }
  };
    
    const createOrder = (data: CreateOrderData, actions: any) => {
        // IMPORTANT: The amount must be a string with two decimal places.
        // This is a strict requirement from the PayPal API.
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: subtotal.toFixed(2),
                    currency_code: 'USD'
                }
            }]
        });
    };

    const onApprove = async (data: OnApproveData, actions: any): Promise<void> => {
        setIsProcessing(true); // Show processing state AFTER approval
        try {
            if (actions.order) {
                const details: OrderResponseBody = await actions.order.capture();
                
                if (details && details.payer) {
                    const payerName = details.payer.name?.given_name;
                    const payerEmail = details.payer.email_address;

                    if (payerName && payerEmail) {
                        await fetch('/api/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: payerEmail,
                                subject: 'Your Cuddleia Order Confirmation',
                                name: payerName,
                                items: items,
                            }),
                        });
                    }
                }
            }

            clearCart();
            router.push('/');
        } catch (error) {
            console.error('PayPal capture or email sending failed', error);
            setError('There was an issue processing your payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const onCancel = () => {
       // User cancelled the payment, reset state if needed
       setIsProcessing(false);
    }

    const onError = (err: any) => {
        console.error('PayPal Error:', err);
        setError('An error occurred with the PayPal transaction. Please try again.');
        setIsProcessing(false);
    };


  if (!hasHydrated || (items.length === 0 && !isRedirecting)) {
    return null; // Render nothing until hydrated or if cart is truly empty
  }
  
  return (
    <PayPalScriptProvider options={{ 'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', currency: 'USD', intent: 'capture' }}>
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
                        
                        {error && (
                            <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 mb-6 rounded-md" role="alert">
                                <p className="font-bold">Payment Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {isRedirecting || isProcessing ? (
                        <div className="text-center p-8">
                            <div className="animate-pulse font-semibold text-muted-foreground">
                                {isRedirecting ? 'Redirecting to our secure payment processor...' : 'Processing your payment...'}
                            </div>
                        </div>
                        ) : (
                        <div className="space-y-6">
                            <div>
                                <p className="text-muted-foreground mb-4 text-sm font-semibold">Malaysian Customers (FPX)</p>
                                <Button
                                    onClick={handleToyyibPay}
                                    disabled={isProcessing}
                                    size="lg"
                                    className="w-full font-bold"
                                >
                                    Pay with ToyyibPay
                                </Button>
                            </div>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-card px-2 text-sm text-muted-foreground">OR</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-4 text-sm font-semibold">International Customers</p>
                                <div className="space-y-4">
                                     <PayPalButtons
                                        style={{ layout: 'vertical', label: 'pay', color: 'blue', shape: 'pill', tagline: false }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onCancel={onCancel}
                                        onError={onError}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        )}

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
    </PayPalScriptProvider>
  );
}
