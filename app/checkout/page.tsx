'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft, Loader2, Tags, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';

// Get the PayPal Client ID from environment variables. It's safe to expose this.
// Secrets are in .env.local — do not hardcode here.
const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';


export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  
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

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsProcessing(false);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const finalTotal = useMemo(() => subtotal - discount, [subtotal, discount]);
  const totalMYR = exchangeRate ? finalTotal * exchangeRate : null;

  useEffect(() => {
    if (isClient && items.length === 0 && !isProcessing) {
      router.push('/products');
    }
  }, [items, router, isClient, isProcessing]);
  
  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === 'CUDDLE10') {
      const discountAmount = subtotal * 0.10;
      setDiscount(discountAmount);
      setDiscountMessage('Successfully applied 10% discount!');
    } else {
      setDiscount(0);
      setDiscountMessage('Invalid or expired discount code.');
    }
  };

  const handleToyyibPay = async () => {
    if (!totalMYR) {
      setError('Could not determine the exchange rate. Please try again in a moment.');
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
  
    // This function is called when the user clicks the PayPal button.
    const createOrder = async (data: CreateOrderData) => {
        setIsProcessing(true);
        setError(null);
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total: finalTotal.toFixed(2),
                }),
            });
            const order = await response.json();
            if (order.id) {
                return order.id;
            } else {
                throw new Error(order.error || 'Failed to create PayPal order.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(message);
            setIsProcessing(false);
            throw err; // Propagate error to PayPal SDK
        }
    };
    
    // This function is called after the user approves the payment on PayPal.
    const onApprove = async (data: OnApproveData) => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderID: data.orderID,
                    customerName: name,
                    customerEmail: email,
                    items: items,
                }),
            });
    
            const details = await response.json();
    
            if (response.ok && details.success) {
                clearCart();
                router.push('/checkout/success');
            } else {
                throw new Error(details.error || 'Failed to capture payment.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    // This function handles errors from the PayPal button.
    const onError = (err: any) => {
        console.error("PayPal button error:", err);
        setError("An error occurred with PayPal. Please try again or use a different payment method.");
        setIsProcessing(false);
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
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
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
                <h2 className="font-headline text-2xl border-b pb-4 mb-6 font-bold">Order Summary</h2>
                <div className="pb-6 border-b">
                  <h3 className="font-headline text-lg mb-2 flex items-center gap-2 font-bold">
                    <Tags className="h-5 w-5"/> Have a discount code?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Please apply your discount code (if any) before entering your name and email to ensure the correct total is calculated.</p>
                  <div className="flex gap-2">
                      <Input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="flex-grow" placeholder='Enter code here' />
                      <Button onClick={handleApplyDiscount} disabled={!discountCode}>Apply</Button>
                  </div>
                  {discountMessage && <p className={`text-sm mt-2 ${discount > 0 ? 'text-green-600' : 'text-destructive'}`}>{discountMessage}</p>}
                </div>
                <div className="space-y-4 mb-6 pt-6">
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
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Subtotal</span>
                        <ProductPrice price={subtotal} simple />
                    </div>
                     {discount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                            <span>Discount (10%)</span>
                            <span>-<ProductPrice price={discount} simple /></span>
                        </div>
                    )}
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-4 mt-2">
                    <span>Total</span>
                    <ProductPrice price={finalTotal} />
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
          <AnimateIn delay={150}>
            <div className="bg-card p-8 rounded-2xl shadow-lg">
              <h2 className="font-headline text-2xl mb-6 font-bold">Your Details</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="First and Last Name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email for product delivery" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <p className="text-xs text-muted-foreground mt-2">Your digital products will be sent to this email address.</p>
                </div>
              </div>

              <h2 className="font-headline text-2xl mb-6 pt-6 border-t font-bold">Payment Method</h2>
              {error && (
                <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 mb-6 rounded-md" role="alert">
                  <p className="font-bold">Payment Error</p>
                  <p>{error}</p>
                </div>
              )}
                <div className="space-y-6">
                  <div className="relative">
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">Payment via Malaysian Online Banking (FPX)</p>
                    <Button onClick={handleToyyibPay} disabled={isProcessing || !totalMYR || !isFormValid} size="lg" className="w-full font-bold">
                      {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : (totalMYR ? 'Pay with ToyyibPay' : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Rate</>)}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">You will be redirected to complete your payment.</p>
                  </div>
                    <div className="relative flex items-center my-6">
                        <div className="flex-grow border-t border-muted"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
                        <div className="flex-grow border-t border-muted"></div>
                    </div>
                  <div>
                    <p className="text-muted-foreground mb-4 text-sm font-semibold">International Customers</p>
                    {paypalClientID ? (
                        <PayPalScriptProvider options={{ 'client-id': paypalClientID, currency: 'USD' }}>
                            <PayPalButtons
                                style={{ layout: 'vertical', color: 'blue' }}
                                disabled={isProcessing || !isFormValid || finalTotal <= 0}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                            />
                        </PayPalScriptProvider>
                    ) : (
                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                            <p className="text-muted-foreground text-sm">PayPal is currently unavailable. Please try again later.</p>
                        </div>
                    )}
                     {isProcessing && (
                         <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}
                  </div>
                </div>
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
