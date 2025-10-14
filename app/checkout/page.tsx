'use client';

import { useCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { ProductPrice } from '@/components/product-price';


// Dynamically import the PayPal component with SSR disabled
const PaypalCheckout = dynamic(
  () => import('@/components/paypal-checkout').then((mod) => mod.PaypalCheckout),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[44px] w-full items-center justify-center rounded-lg bg-gray-200">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    ),
  }
);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // This ensures the order ID is stable across re-renders
  const orderId = useMemo(() => uuidv4(), []);

  useEffect(() => {
    // Redirect if cart is empty, as there's nothing to check out.
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  const handleToyyibPay = async () => {
    if (!name || !email) {
      setError('Please fill in your name and email.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/toyyibpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          orderId: orderId, // Pass the stable order ID
          items: items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ToyyibPay bill.');
      }

      // Redirect user to the ToyyibPay payment URL
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin" />
          <p className="mt-4 text-muted-foreground">
            Your cart is empty. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const discount = 0; // Future use
  const finalTotal = subtotal - discount;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
          {/* Left Column: Order Summary */}
          <AnimateIn>
            <div className="rounded-lg bg-card p-8 shadow-sm">
              <h2 className="mb-6 font-headline text-3xl font-bold">
                Order Summary
              </h2>

              {/* Discount Code */}
              <div className="mb-6 space-y-3 rounded-lg bg-primary/5 p-4">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Tag className="h-5 w-5" />
                  <span>Have a discount code?</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please apply your discount code (if any) before entering your
                  name and email to ensure the correct total is calculated.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Enter code here" className="bg-background" />
                  <Button variant="default">Apply</Button>
                </div>
              </div>

              {/* Item List */}
              <div className="mb-6 space-y-4 border-t pt-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: 1
                      </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-primary">${item.price.toFixed(2)} USD</p>
                        {/* Placeholder for converted price */}
                        <p className="text-xs text-muted-foreground">(Approx. RM{(item.price * 4.7).toFixed(2)})</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between font-headline text-2xl font-bold text-foreground">
                  <span>Total</span>
                  <div className="text-right">
                    <p className="text-primary">${finalTotal.toFixed(2)} USD</p>
                    <p className="text-xs font-normal text-muted-foreground">(Approx. RM{(finalTotal * 4.7).toFixed(2)})</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Right Column: Details & Payment */}
          <AnimateIn delay={150}>
            <div className="mt-12 lg:mt-0">
              {/* Your Details */}
              <div className="mb-10">
                <h2 className="mb-6 font-headline text-3xl font-bold">
                  Your Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base">Name</Label>
                    <Input
                      id="name"
                      placeholder="First and Last Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your digital products will be sent to this email address.
                    </p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email for product delivery"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="mb-6 font-headline text-3xl font-bold">
                  Payment Method
                </h2>
                <div className="space-y-8">
                  {/* ToyyibPay */}
                  <div>
                    <h3 className="font-bold text-foreground">
                      Malaysian Customers (FPX)
                    </h3>
                    <Button
                      size="lg"
                      className="mt-3 w-full font-bold"
                      onClick={handleToyyibPay}
                      disabled={!name || !email || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay with ToyyibPay'
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center text-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="mx-4 flex-shrink text-sm uppercase text-muted-foreground">
                      Or
                    </span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>


                  {/* PayPal */}
                  <div>
                     <h3 className="font-bold text-foreground">
                      International Customers (Card / PayPal)
                    </h3>
                    <div className="mt-3">
                         <PaypalCheckout
                            customerName={name}
                            customerEmail={email}
                            items={items}
                            orderId={orderId}
                            total={finalTotal}
                            disabled={!name || !email || isProcessing}
                        />
                    </div>
                     <p className="mt-2 text-center text-xs text-muted-foreground">Powered by PayPal</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
