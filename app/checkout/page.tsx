'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  OnApproveData,
} from '@paypal/react-paypal-js';
import type { CreateOrderActions } from '@paypal/paypal-js';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [arePaymentsVisible, setArePaymentsVisible] = useState(false);
  
  const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const USD_TO_MYR = 4.71;
  const totalMYR = subtotal * USD_TO_MYR;

  useEffect(() => {
    // If the cart is empty after hydration, redirect.
    if (arePaymentsVisible && items.length === 0) {
      router.push('/products');
    }
  }, [items, router, arePaymentsVisible]);
  
  useEffect(() => {
    // Wait for 2 seconds before showing payment options
    const timer = setTimeout(() => {
      setArePaymentsVisible(true);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);


  if (items.length === 0 && arePaymentsVisible) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const handleToyyibPay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/toyyibpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total: totalMYR }),
      });
      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        clearCart();
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

  const createPayPalOrder = (data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: subtotal.toFixed(2),
            currency_code: 'USD',
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });
  };

  const onPayPalApprove = async (data: OnApproveData, actions: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        clearCart();
        router.push('/checkout/success');
      } else {
        throw new Error(responseData.error || 'Failed to finalize PayPal payment.');
      }
    } catch (err) {
      let message = 'Could not finalize your payment. Please contact support.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setIsProcessing(false);
    }
  };
  
  const onPayPalError = (err: any) => {
    console.error("PayPal button error:", err);
    setError("An error occurred with PayPal. Please try again or use a different payment method.");
    setIsProcessing(false);
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

              {!arePaymentsVisible || isProcessing ? (
                <div className="text-center p-8">
                  <div className="flex items-center justify-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-semibold text-muted-foreground">
                      {isProcessing ? 'Processing payment...' : 'Loading payment options...'}
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
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">
                      International Customers (Card / PayPal)
                    </p>
                     {paypalClientID ? (
                        <PayPalScriptProvider options={{ 'client-id': paypalClientID, currency: 'USD', intent: 'capture' }}>
                            <PayPalButtons
                                style={{ layout: "vertical" }}
                                createOrder={createPayPalOrder}
                                onApprove={onPayPalApprove}
                                onError={onPayPalError}
                                disabled={isProcessing}
                            />
                        </PayPalScriptProvider>
                      ) : (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground font-semibold">PayPal is currently unavailable.</p>
                        </div>
                      )}
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
