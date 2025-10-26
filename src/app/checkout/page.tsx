
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
import { PayPalButtons, usePayPalScriptReducer, OnApproveData, CreateOrderData, OnApproveActions, CreateOrderActions } from '@paypal/react-paypal-js';

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
  
  const createPayPalOrder = (data: CreateOrderData, actions: CreateOrderActions) => {
    setError('');
    if (!name || !email) {
      setError('Please fill in your Name and Email before proceeding with PayPal.');
      return Promise.reject(new Error('User details missing'));
    }

    const cartDetails = cart.map(item => ({ id: item.id, quantity: item.quantity }));
    const customIdPayload = {
      cart: cartDetails,
      name,
      email,
      phone,
    };

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2), // CRITICAL: Must be a string with 2 decimal places in USD.
            currency_code: 'USD',
          },
          custom_id: JSON.stringify(customIdPayload),
        },
      ],
      application_context: {
        brand_name: 'Cuddleia',
        return_url: `${window.location.origin}/checkout/success?source=paypal`,
        cancel_url: `${window.location.origin}/checkout`,
      }
    });
  };

  const onPayPalApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID }),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error || 'Failed to capture payment.');
      }
      
      console.log('Payment captured successfully:', result);
      
      clearCart();
      router.push(`/checkout/success?source=paypal&order_id=${data.orderID}`);
      return Promise.resolve();

    } catch (err: any) {
        let errorMessage = "An error occurred while capturing the payment. Please try again.";
        if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("PayPal Capture Error:", err);
        setIsLoading(false);
        if (actions.order) {
           // Instructs paypal to show an error message to the user.
           return actions.order.restart();
        }
        return Promise.reject(err);
    }
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
                                  key={name + email + total} // Add key to re-render buttons when crucial data changes
                                  style={{ layout: "vertical", label: "pay" }}
                                  disabled={isPending || isLoading || cart.length === 0 || !name || !email}
                                  createOrder={createPayPalOrder}
                                  onApprove={onPayPalApprove}
                                  onError={(err) => {
                                      setError("An error occurred with the PayPal transaction. Please try again.");
                                      console.error("PayPal Error:", err);
                                      setIsLoading(false);
                                  }}
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

    