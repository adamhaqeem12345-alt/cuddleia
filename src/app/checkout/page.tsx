'use client';

import { useState } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, getPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return <div className="text-center p-8">Error: PayPal Client ID is not configured.</div>
  }

  const handleCreateOrder = async () => {
    setErrorMessage(null);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart: cart.map(item => ({ id: item.id, quantity: item.quantity })) }),
      });
      const order = await response.json();

      if (!response.ok || order.error) {
        throw new Error(order.error || 'Failed to create PayPal order.');
      }

      if (order.id) {
        return order.id;
      } else {
        console.error("Order ID is missing from create-order response:", order);
        throw new Error('Unexpected error: Order ID is missing.');
      }
    } catch (error: any) {
      console.error("PayPal createOrder error:", error.message);
      setErrorMessage(error.message);
      throw new Error(error.message);
    }
  };

  const onApprove = async (data: any) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const orderDetails = await response.json();
      
      if (!response.ok || orderDetails.error) {
         throw new Error(orderDetails.error || 'Failed to capture payment.');
      }
      
      const purchaseUnit = orderDetails.purchase_units?.[0] || orderDetails;
      const capture = purchaseUnit.payments?.captures?.[0];

      if (orderDetails.status !== 'COMPLETED' && capture?.status !== 'COMPLETED') {
        throw new Error(`Payment not completed. Status: ${orderDetails.status || capture?.status}`);
      }
      
      clearCart();
      router.push(`/thank-you?status=success&orderID=${data.orderID}`);

    } catch (error: any) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      router.push(`/thank-you?status=error&orderID=${data.orderID}&message=${encodeURIComponent(error.message)}`);
    }
  };
  
  const onError = (err: any) => {
     setErrorMessage("An error occurred with the PayPal payment. Please try again.");
     console.error("PayPal Buttons onError:", err);
  }

  const isFormValid = customerName !== '' && customerEmail !== '' && /^\S+@\S+\.\S+$/.test(customerEmail);

  return (
    <PayPalScriptProvider options={{ "clientId": paypalClientId, currency: "USD", intent: "capture" }}>
      <div className="bg-background min-h-[80vh]">
        <AnimateIn>
          <section className="bg-accent/30 py-16 text-center">
            <h1 className="font-headline text-5xl font-bold text-foreground">
              Checkout
            </h1>
          </section>
        </AnimateIn>

        <AnimateIn className="py-16">
          <div className="container mx-auto px-4">
            {cart.length === 0 ? (
              <div className="text-center">
                <p className="text-xl font-body text-foreground/80 mb-8">
                  Your cart is empty. There is nothing to check out.
                </p>
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6 md:order-2">
                  <h2 className="font-headline text-3xl font-bold border-b pb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-headline text-lg">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-body font-semibold">
                          {getPrice(item.price * item.quantity).formatted}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex justify-between font-body text-lg">
                      <span>Subtotal</span>
                      <span>{getPrice(subtotal).formatted}</span>
                    </div>
                    <div className="flex justify-between font-body text-xl font-bold">
                      <span>Total</span>
                      <span>{getPrice(subtotal).formatted}</span>
                    </div>
                  </div>
                </div>

                <div className="md:order-1">
                  <div className="bg-card p-8 rounded-2xl shadow-lg space-y-8">
                    <div>
                      <h2 className="font-headline text-3xl font-bold border-b pb-4">
                        Your Details
                      </h2>
                       <p className="text-muted-foreground mt-4 font-body">
                          Enter your details below to proceed with the payment. Download links will be emailed after successful payment.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-lg font-headline">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-lg font-headline">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="pt-4 space-y-4">
                       {isProcessing ? (
                        <div className='text-center font-body'>
                          <p>Processing your order...</p>
                        </div>
                       ) : (
                          <>
                            <div style={{ opacity: isFormValid ? 1 : 0.5, pointerEvents: isFormValid ? 'auto' : 'none' }}>
                                <PayPalButtons
                                  style={{ layout: "vertical", shape: 'pill' }}
                                  createOrder={handleCreateOrder}
                                  onApprove={onApprove}
                                  onError={onError}
                                />
                            </div>
                            {!isFormValid && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Please fill in your name and a valid email to proceed.
                                </p>
                            )}
                          </>
                       )}
                       {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AnimateIn>
      </div>
    </PayPalScriptProvider>
  );
}
