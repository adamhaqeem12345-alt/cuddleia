
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShieldCheck, Loader2, CreditCard, Landmark } from 'lucide-react';
import { useState } from 'react';
import { ProductPrice } from '@/components/product-price';
import { cn } from '@/lib/utils';
import { PayPalButtons, usePayPalScriptReducer, CreateOrderData } from '@paypal/react-paypal-js';

type PaymentMethod = 'toyyibpay' | 'paypal';

// Custom hook to manage form state
function useCheckoutForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  return { name, setName, email, setEmail, phone, setPhone };
}


export default function CheckoutPage() {
  const { cart, clearCart, appliedDiscount } = useCart();
  const router = useRouter();
  const { name, setName, email, setEmail, phone, setPhone } = useCheckoutForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('toyyibpay');
  const [{ isPending, options: paypalOptions }] = usePayPalScriptReducer();

  const isPayPalAvailable = paypalOptions.clientId && paypalOptions.clientId !== 'test';

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal - discountAmount;

  const handleToyyibPayPayment = async () => {
    if (!name || !email || !phone) {
      setError('Please fill in all fields: Name, Email, and Phone Number.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/toyyibpay/create-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart, name, email, phone, totalAmountUSD: total }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment bill.');
      }

      // Redirect the user to the ToyyibPay payment page
      router.push(data.paymentUrl);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const createPayPalOrder = (data: CreateOrderData, actions: any) => {
    setError('');
    if (!name || !email) {
      setError('Please fill in your Name and Email before proceeding with PayPal.');
      return Promise.reject(new Error('User details missing'));
    }
    
    // Create the order payload directly on the client.
    // This is simpler and more robust for this use case.
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            // CRITICAL: The value must be a string with two decimal places.
            value: total.toFixed(2),
            currency_code: 'USD',
          },
          // We pass all necessary details here so the webhook can use them.
          custom_id: JSON.stringify({
              cart: cart.map(item => ({ id: item.id, quantity: item.quantity })),
              name,
              email,
              phone,
              totalAmountUSD: total
          }),
        },
      ],
      application_context: {
        brand_name: 'Cuddleia',
        shipping_preference: 'NO_SHIPPING',
      }
    });
  };

  const onPayPalApprove = async (data: { orderID: string }, actions: any) => {
    setIsLoading(true);
    setError('');
    
    // This function captures the funds from the transaction.
    return actions.order.capture().then(async (details: any) => {
        try {
            // The payment is now confirmed and captured by PayPal.
            // Now, we call our server to log the sale and send the email.
            const response = await fetch('/api/paypal/confirm-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderDetails: details }),
            });

            const result = await response.json();

            if (!response.ok) {
                // The payment was captured by PayPal, but our server failed to log it.
                // We should still redirect the user to success, but log this error.
                console.error("Server-side confirmation failed:", result.error);
                // In a real-world scenario, you might want to have a retry mechanism here.
            }
            
            // Clear cart and redirect to the success page.
            clearCart();
            router.push(`/checkout/success?source=paypal&order_id=${data.orderID}`);

        } catch (err: any) {
             // This error is for our server call, not PayPal capture.
            setError("Your payment was successful, but we had trouble confirming your order. Please contact us.");
            console.error("PayPal Server Confirmation Error:", err);
            setIsLoading(false);
            // Even if our backend fails, redirect the user since their payment went through.
            router.push(`/checkout/success?source=paypal&order_id=${data.orderID}&confirmation_error=true`);
        }
    }).catch((err: any) => {
        // This catches errors from actions.order.capture()
        setError("An error occurred while capturing the payment. Please try again.");
        console.error("PayPal Capture Error:", err);
        setIsLoading(false);
    });
  };
  
  const onPayPalError = (err: any) => {
    setError("An error occurred with the PayPal transaction. Please try again or use another payment method.");
    console.error("PayPal Button Error:", err);
  };


  if (cart.length === 0 && !isPending) {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-8 font-bold">Checkout</h1>
            <p className="text-muted-foreground text-lg mb-8">Your cart is empty. You can't proceed to checkout.</p>
            <Button asChild className="rounded-full">
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
       <div className="mb-8">
            <Button asChild variant="ghost" className="rounded-full">
                <Link href="/cart">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                </Link>
            </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl text-foreground mb-8 font-bold">Order Summary</h1>
            <div className="border rounded-2xl shadow-sm bg-card">
              <ul className="divide-y">
                {cart.map(item => (
                  <li key={item.id} className="flex items-center gap-6 p-6">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold font-headline text-lg">{item.name}</h3>
                       <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                     <p className="font-bold text-lg w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t p-6 space-y-3">
                 <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <div className="text-right">
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                </div>
                {appliedDiscount > 0 && (
                    <div className="flex justify-between text-lg text-green-600">
                        <span>Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                        <div className="text-right">
                          <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                <div className="flex justify-between text-lg">
                    <span>Taxes & Fees</span>
                     <div className="text-right">
                      <span className="font-bold">$0.00</span>
                    </div>
                </div>
                 <div className="border-t pt-3 mt-3 flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <ProductPrice price={total} isTotal={true}/>
                </div>
              </div>
            </div>
        </div>
        <div>
            <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-8 font-bold">Your Details</h2>
            <div className="border rounded-2xl shadow-sm bg-card p-8">
                <div className="space-y-6">
                   <div>
                       <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                       <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" required className="rounded-full"/>
                   </div>
                   <div>
                       <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                       <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="rounded-full"/>
                   </div>
                   <div>
                       <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                       <Input id="phone" type="text" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 60123456789 (Required for ToyyibPay)" required className="rounded-full"/>
                   </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-headline text-xl text-foreground mb-4 font-bold">Select Payment Method</h3>
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={() => setSelectedPaymentMethod('toyyibpay')} className={cn("flex items-center justify-center gap-2 p-4 border rounded-lg transition-all", { "ring-2 ring-primary border-primary": selectedPaymentMethod === 'toyyibpay', "hover:bg-accent": selectedPaymentMethod !== 'toyyibpay' })}>
                           <Landmark className="h-6 w-6"/>
                           <span className="font-semibold">Online Banking (MY)</span>
                        </button>
                        {isPayPalAvailable ? (
                          <button onClick={() => setSelectedPaymentMethod('paypal')} className={cn("flex items-center justify-center gap-2 p-4 border rounded-lg transition-all", { "ring-2 ring-primary border-primary": selectedPaymentMethod === 'paypal', "hover:bg-accent": selectedPaymentMethod !== 'paypal' })}>
                            <CreditCard className="h-6 w-6"/>
                            <span className="font-semibold">PayPal / Card</span>
                          </button>
                        ) : (
                          <div className="relative flex items-center justify-center gap-2 p-4 border rounded-lg bg-muted/50 cursor-not-allowed">
                            <CreditCard className="h-6 w-6 text-muted-foreground"/>
                            <span className="font-semibold text-muted-foreground">PayPal / Card</span>
                            <span className="absolute bottom-1 right-1 text-xs text-muted-foreground">Unavailable</span>
                          </div>
                        )}
                    </div>
                </div>

                {selectedPaymentMethod === 'toyyibpay' ? (
                    <div>
                        <div className="mt-8">
                          <Button onClick={handleToyyibPayPayment} disabled={isLoading || !name || !email || !phone} size="lg" className="w-full font-bold rounded-full">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Proceed to Payment'}
                          </Button>
                        </div>
                        
                         <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>Secure payment via ToyyibPay (FPX).</span>
                        </div>
                    </div>
                ) : (
                    isPayPalAvailable && (
                        <div>
                            {(isPending || isLoading) && <div className="text-center my-4"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                            <div style={{ opacity: (isPending || isLoading) ? 0.5 : 1 }}>
                              <PayPalButtons 
                                  key={name + email + total} // Re-render buttons when crucial data changes
                                  style={{ layout: "vertical", label: "pay" }}
                                  disabled={isPending || isLoading || cart.length === 0 || !name || !email}
                                  createOrder={createPayPalOrder}
                                  onApprove={onPayPalApprove}
                                  onError={onPayPalError}
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <span>Secure payment via PayPal.</span>
                            </div>
                        </div>
                    )
                )}
                {error && <p className="text-destructive mt-4 text-sm text-center">{error}</p>}
            </div>
        </div>
      </div>
    </div>
  );
}

    