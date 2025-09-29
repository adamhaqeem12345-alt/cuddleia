'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHasHydrated } from '@/lib/hooks';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderActions } from "@paypal/react-paypal-js";


export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasHydrated = useHasHydrated();

  const USD_TO_MYR = 4.71;
  const totalMYR = subtotal * USD_TO_MYR;
  const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";


  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.push('/products');
    }
  }, [items, router, hasHydrated]);

  useEffect(() => {
    // This effect runs when the user is redirected back from PayPal.
    const token = searchParams.get('token'); // PayPal's orderID is in the 'token' parameter
    if (token) {
      setIsProcessing(true);
      setError(null);

      const capturePayment = async (orderID: string) => {
        try {
          const response = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID }),
          });

          const responseData = await response.json();

          if (response.ok && responseData.success) {
            console.log('Payment successful!');
            clearCart();
            // Redirect to a clean success URL without PayPal's query params
            router.push('/checkout/success');
          } else {
            throw new Error(responseData.error || 'Failed to finalize PayPal payment.');
          }
        } catch (err) {
          console.error("Capture payment error:", err);
          let errorMessage = 'Could not finalize your payment. Please contact support.';
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setIsProcessing(false);
        }
      };

      capturePayment(token);
    }
  }, [searchParams, clearCart, router]);


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
  
  if (!hasHydrated || (items.length === 0 && !isProcessing) ) {
    // Show a loading or placeholder state until hydration is complete
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  const createPayPalOrder = async (data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total: subtotal, currency: 'USD' }),
      });

      const orderData = await response.json();

      if (response.ok && orderData.orderID) {
        return orderData.orderID;
      } else {
        throw new Error(orderData.error || 'Could not create PayPal order.');
      }
    } catch (err) {
      console.error("createOrder error:", err);
      let errorMessage = 'Could not initiate PayPal checkout. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsProcessing(false);
      throw new Error(errorMessage); // Throw error to stop PayPal flow
    }
  };

  const onPayPalApprove = async (data: OnApproveData, actions: any) => {
      // This function now redirects to PayPal instead of handling capture here.
      setIsProcessing(true); // Keep processing state while redirecting
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: subtotal, currency: 'USD' }),
      });
      const orderData = await response.json();
      if(orderData.approveLink) {
          window.location.href = orderData.approveLink;
      } else {
          setError('Could not get PayPal approval link. Please try again.');
          setIsProcessing(false);
      }
  };


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
                      Processing payment...
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
                      <PayPalScriptProvider options={{ "client-id": paypalClientID, currency: "USD", intent: "capture" }}>
                        <PayPalButtons
                              style={{ layout: "vertical", shape: 'rect' }}
                              createOrder={createPayPalOrder}
                              onApprove={onPayPalApprove}
                              onError={(err: any) => {
                                  console.error("PayPal Buttons onError:", err);
                                  setError("An unexpected error occurred with PayPal. Please try again or contact support.");
                                  setIsProcessing(false);
                              }}
                              onCancel={() => {
                                  setIsProcessing(false);
                              }}
                              disabled={isProcessing}
                          />
                      </PayPalScriptProvider>
                    ) : (
                       <p className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-md">PayPal is not configured. Missing client ID.</p>
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
