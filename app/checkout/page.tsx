
'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { OrderResponseBody, CreateOrderData, OnApproveData } from '@paypal/paypal-js';
import { Product } from '@/lib/products';
import { useHasHydrated } from '@/lib/hooks';

// This is the PayPal part, but we will create the order and redirect manually
async function createPaypalOrder(total: number): Promise<string | null> {
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error('PayPal client ID or secret is not configured.');
        return null;
    }

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
        },
        body: 'grant_type=client_credentials'
    });
    
    const auth = await response.json();
    if (!auth.access_token) {
        console.error('Failed to get PayPal access token');
        return null;
    }

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.access_token}`
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: total.toFixed(2)
                }
            }],
            application_context: {
                return_url: `${window.location.origin}/`,
                cancel_url: `${window.location.href}`,
                brand_name: 'Cuddleia'
            }
        })
    });

    const orderData = await orderResponse.json();
    if (orderData.links) {
        const approvalLink = orderData.links.find((link: any) => link.rel === 'approve');
        return approvalLink.href;
    }
    
    return null;
}


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

  const handlePayPalRedirect = async () => {
    setIsProcessing(true);
    setIsRedirecting(true);
    setError(null);
    try {
        const approvalUrl = await createPaypalOrder(subtotal);
        if (approvalUrl) {
            window.location.href = approvalUrl;
        } else {
            setError('Could not connect to PayPal. Please try again or use another payment method.');
            setIsProcessing(false);
            setIsRedirecting(false);
        }
    } catch (err) {
        console.error('PayPal redirect error:', err);
        setError('An unexpected error occurred while connecting to PayPal.');
        setIsProcessing(false);
        setIsRedirecting(false);
    }
  }


  if (!hasHydrated || (items.length === 0 && !isRedirecting)) {
    return null; // Render nothing until hydrated or if cart is truly empty
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
                    
                    {isRedirecting ? (
                      <div className="text-center p-8">
                          <div className="animate-pulse font-semibold text-muted-foreground">
                            Redirecting to our secure payment processor... Please wait.
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
                              <Button
                                  onClick={handlePayPalRedirect}
                                  disabled={isProcessing}
                                  size="lg"
                                  className="w-full font-bold bg-[#0070BA] hover:bg-[#005ea6]"
                              >
                                  Pay with PayPal or Card
                              </Button>
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
