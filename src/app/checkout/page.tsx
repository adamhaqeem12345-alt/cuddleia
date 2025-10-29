
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShieldCheck, Loader2, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { ProductPrice } from '@/components/product-price';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

// Custom hook to manage form state
function useCheckoutForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  return { name, setName, email, setEmail, phone, setPhone };
}

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Processing your order...</p>
        </div>
    );
}


export default function CheckoutPage() {
  const { cart, appliedDiscount } = useCart();
  const router = useRouter();
  const { name, setName, email, setEmail, phone, setPhone } = useCheckoutForm();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal - discountAmount;
  
  const handlePaymentClick = () => {
    // This handler will show the loading indicator for the card button.
    setIsCardLoading(true);
    setTimeout(() => {
        setIsCardLoading(false);
    }, 3000); // Hide after 3 seconds
  };
  
  const createPayPalOrder = (data: any, actions: any) => {
    setError('');
    if (!name || !email) {
      setError('Please fill in your Name and Email before proceeding with PayPal.');
      return Promise.reject(new Error('User details missing'));
    }
    
    // Create the order payload directly on the client.
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
        shipping_preference: 'NO_SHIPPING',
      }
    });
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
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
                // In a real-world scenario, you might have a retry mechanism here.
            }
            
            // Redirect to the success page
            router.push(`/checkout/success?source=paypal&order_id=${data.orderID}`);

        } catch (err: any) {
             // This error is for our server call, not PayPal capture.
            setError("Your payment was successful, but we had trouble confirming your order. Please contact us.");
            console.error("PayPal Server Confirmation Error:", err);
            // Even if our backend fails, redirect the user since their payment went through.
            router.push(`/checkout/success?source=paypal&order_id=${data.orderID}&confirmation_error=true`);
        }
    }).catch((err: any) => {
        // This catches errors from actions.order.capture()
        setError("An error occurred while capturing the payment. Please try again.");
        console.error("PayPal Capture Error:", err);
        setIsProcessing(false);
    });
  };
  
  const onPayPalError = (err: any) => {
    setError("An error occurred with the PayPal transaction. Please try again or use another payment method.");
    console.error("PayPal Button Error:", err);
    setIsProcessing(false);
  };


  if (cart.length === 0 && !isProcessing) {
    if (isPending) {
        return <LoadingOverlay />;
    }
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
    <>
      {isProcessing && <LoadingOverlay />}
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
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">Phone Number (Optional)</label>
                        <Input id="phone" type="text" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 60123456789" className="rounded-full"/>
                    </div>
                  </div>

                  <div className="mt-12">
                      <h3 className="font-headline text-xl text-foreground mb-4 font-bold text-center">Payment Method</h3>
                      
                      {isPending ? (
                          <div className="text-center my-4"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>
                      ) : !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                           <div className="text-center text-muted-foreground p-4 border rounded-lg bg-muted/50">
                              <CreditCard className="h-8 w-8 mx-auto mb-2"/>
                              <p>Payment provider is currently unavailable.</p>
                          </div>
                      ) : (
                          <div>
                              <div style={{ opacity: isProcessing ? 0.5 : 1 }}>
                                <PayPalButtons 
                                    key={name + email + total} // Re-render buttons when crucial data changes
                                    style={{ layout: "vertical", label: "pay" }}
                                    disabled={cart.length === 0 || !name || !email || isProcessing}
                                    onClick={(data, actions) => {
                                        // The 'card' funding source is for the black "Debit or Credit Card" button.
                                        if (data.fundingSource === 'card') {
                                            handlePaymentClick();
                                        }
                                    }}
                                    createOrder={createPayPalOrder}
                                    onApprove={onPayPalApprove}
                                    onError={onPayPalError}
                                />
                              </div>
                              {isCardLoading && (
                                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Opening secure card payment form...</span>
                                </div>
                              )}
                              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                                  <ShieldCheck className="h-4 w-4 text-green-600" />
                                  <span>Secure payment via PayPal / Credit Card.</span>
                              </div>
                          </div>
                      )}
                  </div>
                  {error && <p className="text-destructive mt-4 text-sm text-center">{error}</p>}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
