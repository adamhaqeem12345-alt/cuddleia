'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHasHydrated } from '@/lib/hooks';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";


export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasHydrated = useHasHydrated();

  const USD_TO_MYR = 4.21;
  const totalMYR = subtotal * USD_TO_MYR;

  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.push('/products');
    }
  }, [items, router, hasHydrated]);


  useEffect(() => {
    const handlePageShow = () => {
      setIsProcessing(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleToyyibPay = async () => {
    setIsProcessing(true);
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
      }
    } catch (err) {
      console.error('ToyyibPay fetch error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };


  if (!hasHydrated || items.length === 0) {
    // Show a loading or placeholder state until hydration is complete
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }
  
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!PAYPAL_CLIENT_ID) {
      return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
            <p className="text-destructive">PayPal client ID is not configured. Payment is disabled.</p>
        </div>
      );
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
              <h2 className="font-headline text-2xl font-bold border-b pb-4 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: 1
                      </p>
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
              <h2 className="font-headline text-2xl font-bold mb-6">
                Payment Method
              </h2>

              {error && (
                <div
                  className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 mb-6 rounded-md"
                  role="alert"
                >
                  <p className="font-bold">Payment Error</p>
                  <p>{error}</p>
                </div>
              )}

              {isProcessing ? (
                <div className="text-center p-8">
                  <div className="flex items-center justify-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-semibold text-muted-foreground">
                      Processing your payment...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">
                      Malaysian Customers (FPX)
                    </p>
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
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-sm text-muted-foreground">
                        OR
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">
                      International Customers (PayPal or Card)
                    </p>
                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                        <PayPalButtons
                            style={{ layout: 'vertical', shape: 'rect' }}
                            createOrder={(data, actions) => {
                                console.log('Creating order with subtotal:', subtotal);
                                return actions.order.create({
                                    purchase_units: [{
                                        amount: {
                                            value: subtotal.toFixed(2),
                                            currency_code: 'USD'
                                        }
                                    }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                console.log('Payment Approved:', data);
                                setIsProcessing(true);
                                // In a real app, you would now capture the order on the server.
                                // For this example, we'll just simulate success.
                                // const details = await actions.order.capture();
                                // await fetch('/api/paypal/capture-order', { body: JSON.stringify({ orderId: data.orderID }) });
                                clearCart();
                                router.push('/order-success'); // Redirect to a success page
                            }}
                            onError={(err) => {
                                console.error("PayPal onError:", err);
                                setError("An error occurred with the PayPal transaction. Please try again.");
                                setIsProcessing(false);
                            }}
                            onCancel={() => {
                                setIsProcessing(false);
                            }}
                        />
                    </PayPalScriptProvider>
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
  );
}
