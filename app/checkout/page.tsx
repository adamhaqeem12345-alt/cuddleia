
'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';
import { Product } from '@/lib/products';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const paypalClientId = "AcP9f98y69e5wW3gR4v1qoIoZejFUNxj4CF9ceA-CBbXq152xI1qnMugLF_rKs3yXN-fuyFIKuWpqeIW";
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const USD_TO_MYR = 4.21;
  const totalMYR = subtotal * USD_TO_MYR;

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push('/products');
    }
  }, [items, router, isProcessing]);

  const sendConfirmationEmail = async (payerName: string, payerEmail: string, purchasedItems: Product[]) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: payerEmail,
          subject: 'Your Cuddleia Order Confirmation',
          name: payerName,
          items: purchasedItems,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // We don't block the user flow for this, but we log it.
    }
  };

  const createOrder = (data: CreateOrderData, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: subtotal.toFixed(2),
            currency_code: 'USD',
          },
        },
      ],
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    setIsProcessing(true); // Keep processing state while we capture and send email
    return actions.order.capture().then(function (details: any) {
      const payerName = details.payer.name.given_name;
      const payerEmail = details.payer.email_address;
      
      sendConfirmationEmail(payerName, payerEmail, items).finally(() => {
        alert('Transaction completed by ' + payerName + '! A confirmation email has been sent.');
        clearCart();
        setIsProcessing(false);
        router.push('/');
      });
    });
  };

  const handleToyyibPay = async () => {
    setIsProcessing(true);
    setIsRedirecting(false);
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
          setIsRedirecting(true);
          // This ensures the UI updates *before* the browser navigates away.
          setTimeout(() => {
            window.location.href = data.paymentUrl;
          }, 100);
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

  const onError = (err: any) => {
    setIsProcessing(false);
    console.error('PayPal Checkout Error', err);
    setError('An error occurred during the PayPal transaction. Please try again.');
  };

  const handleCardClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
    }, 3000);
  }

  if (items.length === 0 && !isRedirecting) {
    return null; 
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
                            Redirecting to payment gateway... Please wait.
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
                                  {isProcessing && !isRedirecting ? 'Processing...' : 'Pay with ToyyibPay'}
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
                              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
                                  <PayPalButtons 
                                      style={{ layout: "vertical" }}
                                      createOrder={createOrder}
                                      onApprove={onApprove}
                                      onError={onError}
                                      onClick={(data, actions) => {
                                          if(data.fundingSource === 'card') {
                                              handleCardClick();
                                          }
                                          setError(null);
                                          setIsProcessing(true);
                                          return actions.resolve();
                                      }}
                                      onCancel={() => setIsProcessing(false)}
                                      disabled={isProcessing}
                                  />
                              </PayPalScriptProvider>
                          </div>
                      </div>
                    )}

                    {isProcessing && !error && !isRedirecting && (
                        <div className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
                            <p>Connecting to payment gateway...</p>
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
