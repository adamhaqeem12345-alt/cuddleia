
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
} from '@paypal/react-paypal-js';
import type {
  CreateOrderActions,
  OnApproveActions,
} from '@paypal/paypal-js';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isPayPalLoading, setIsPayPalLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');


  useEffect(() => {
    setIsClient(true);
    // Fetch the exchange rate
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((data) => {
        if (data.rate) {
          setExchangeRate(data.rate);
        }
      })
      .catch(console.error);

    // Add a pageshow event listener to reset processing state
    const handlePageShow = (event: PageTransitionEvent) => {
      // event.persisted is true if the page is from back/forward cache
      if (event.persisted) {
        setIsProcessing(false);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  const totalMYR = exchangeRate ? subtotal * exchangeRate : null;

  useEffect(() => {
    // This effect should only run if the page is not in a processing state.
    if (isClient && items.length === 0 && !isProcessing) {
      router.push('/products');
    }
  }, [items, router, isClient, isProcessing]);

  const validateForm = () => {
    if (!name.trim()) {
        setFormError('Please enter your name.');
        return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setFormError('Please enter a valid email address.');
        return false;
    }
    setFormError('');
    return true;
  }

  const handleToyyibPay = async () => {
    if (!validateForm()) return;
    
    if (!totalMYR) {
      setError(
        'Could not determine the exchange rate. Please try again in a moment.'
      );
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/toyyibpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total: totalMYR, customerName: name, customerEmail: email }),
      });
      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        // We don't clear the cart here anymore. It's cleared on the success page.
        // If the user cancels, the cart remains intact.
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

  const createPayPalOrder = (data: any, actions: CreateOrderActions) => {
    if (!validateForm()) {
        // Prevent PayPal modal from opening if form is invalid
        return Promise.reject(new Error("Form is not valid."));
    }
    if (subtotal <= 0) {
      setError('Cannot create an order with a zero subtotal.');
      return Promise.reject(new Error('Invalid subtotal'));
    }

    const purchaseAmount = subtotal.toFixed(2);

    return actions.order.create({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            value: purchaseAmount,
            currency_code: 'USD',
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });
  };

  const onPayPalApprove = async (data: any, actions: OnApproveActions) => {
    setIsProcessing(true);
    setError(null);
    try {
      if (!actions.order) {
        throw new Error('PayPal order details are not available.');
      }

      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email, // Use the email from our form
            subject: 'Your Cuddleia Order Confirmation',
            name: name, // Use the name from our form
            items: items,
          }),
        });

        clearCart();
        router.push('/checkout/success');
      } else {
        throw new Error(
          responseData.error || 'Failed to finalize PayPal payment.'
        );
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
    console.error('PayPal button error:', err);
    setError(
      'An error occurred with PayPal. Please try refreshing the page or use a different payment method.'
    );
    setIsProcessing(false);
    setIsPayPalLoading(false);
  };

  const handlePayPalClick = () => {
    if (!validateForm()) return;
    setError(null);
    setIsPayPalLoading(true);
    // Hide loading indicator after a few seconds if PayPal modal doesn't open
    setTimeout(() => {
      setIsPayPalLoading(false);
    }, 3000);
  };

  if (!isClient || (items.length === 0 && !isProcessing)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const isFormValid = name.trim() && email.trim() && /\S+@\S+\.\S+/.test(email);

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
            <div className="bg-card p-8 rounded-2xl shadow-lg space-y-8">
              <div>
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
            </div>
          </AnimateIn>
          <AnimateIn delay={150}>
            <div className="bg-card p-8 rounded-2xl shadow-lg">
              <h2 className="font-headline text-2xl font-bold mb-6">
                Your Details
              </h2>
              <div className="space-y-4 mb-8">
                  <div>
                      <Label htmlFor="name">Name</Label>
                      <Input 
                          id="name" 
                          type="text"
                          placeholder="First and Last Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                      />
                  </div>
                   <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                          id="email" 
                          type="email"
                          placeholder="Your email for product delivery"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Your digital products will be sent to this email address.
                      </p>
                  </div>
                  {formError && (
                      <p className="text-sm text-destructive">{formError}</p>
                  )}
              </div>
              
              <h2 className="font-headline text-2xl font-bold mb-6 pt-6 border-t">
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
                      disabled={isProcessing || !totalMYR || !isFormValid}
                      size="lg"
                      className="w-full font-bold"
                    >
                      {totalMYR ? (
                        'Pay with ToyyibPay'
                      ) : (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                          Loading Rate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground">
                      OR
                    </span>
                    <div className="flex-grow border-t border-muted"></div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">
                      International Customers (Card / PayPal)
                    </p>
                    {paypalClientID ? (
                      <PayPalScriptProvider
                        options={{
                          clientId: paypalClientID,
                          currency: 'USD',
                          intent: 'capture',
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: 'vertical' }}
                          createOrder={createPayPalOrder}
                          onApprove={onPayPalApprove}
                          onError={onPayPalError}
                          onClick={handlePayPalClick}
                          disabled={isProcessing || !isFormValid}
                        />
                      </PayPalScriptProvider>
                    ) : (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-muted-foreground font-semibold">
                          PayPal is currently unavailable.
                        </p>
                      </div>
                    )}
                    {isPayPalLoading && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting to PayPal...</span>
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
