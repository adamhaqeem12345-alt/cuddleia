
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
import { PayPalButtons, usePayPalScriptReducer, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';

type PaymentMethod = 'toyyibpay' | 'paypal';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('toyyibpay');

  const [{ isPending }] = usePayPalScriptReducer();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        body: JSON.stringify({ cart, name, email, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment bill.');
      }

      router.push(data.paymentUrl);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const createPayPalOrder = async (data: CreateOrderData, actions: any) => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart }),
        });

        const order = await response.json();

        if (!response.ok) {
            throw new Error(order.error || 'Failed to create PayPal order.');
        }

        if (order.orderID) {
            setError('');
            setIsLoading(false);
            return order.orderID;
        } else {
            throw new Error('Could not retrieve order ID.');
        }
    } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
        return '';
    }
  };

  const onPayPalApprove = async (data: OnApproveData, actions: any) => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderID: data.orderID }),
        });

        const capturedData = await response.json();

        if (!response.ok || !capturedData.success) {
            throw new Error(capturedData.error || 'Failed to capture payment.');
        }
        
        // Payment is successful
        clearCart();
        router.push('/checkout/success');

    } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isPending) {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-8 font-bold">Checkout</h1>
            <p className="text-muted-foreground text-lg mb-8">Your cart is empty. You can't proceed to checkout.</p>
            <Button asChild>
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
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                    <span>Taxes</span>
                    <span className="font-bold">$0.00</span>
                </div>
                 <div className="border-t pt-3 mt-3 flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <ProductPrice price={subtotal} isTotal={true}/>
                </div>
              </div>
            </div>
        </div>
        <div>
            <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-8 font-bold">Payment Details</h2>
            <div className="border rounded-2xl shadow-sm bg-card p-8">
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setSelectedPaymentMethod('toyyibpay')} className={cn("flex items-center justify-center gap-2 p-4 border rounded-lg transition-all", { "ring-2 ring-primary border-primary": selectedPaymentMethod === 'toyyibpay', "hover:bg-accent": selectedPaymentMethod !== 'toyyibpay' })}>
                       <Landmark className="h-6 w-6"/>
                       <span className="font-semibold">Online Banking</span>
                    </button>
                     <button onClick={() => setSelectedPaymentMethod('paypal')} className={cn("flex items-center justify-center gap-2 p-4 border rounded-lg transition-all", { "ring-2 ring-primary border-primary": selectedPaymentMethod === 'paypal', "hover:bg-accent": selectedPaymentMethod !== 'paypal' })}>
                       <CreditCard className="h-6 w-6"/>
                       <span className="font-semibold">PayPal / Card</span>
                    </button>
                </div>

                {selectedPaymentMethod === 'toyyibpay' ? (
                    <div>
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
                               <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 60123456789" required className="rounded-full"/>
                           </div>
                        </div>

                        <div className="mt-8">
                          <Button onClick={handleToyyibPayPayment} disabled={isLoading} size="lg" className="w-full font-bold rounded-full">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Proceed to Payment'}
                          </Button>
                        </div>
                        
                         <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>Secure payment via ToyyibPay.</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        {(isPending || isLoading) && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto my-4"/></div>}
                        <PayPalButtons 
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isPending || isLoading || cart.length === 0}
                            createOrder={createPayPalOrder}
                            onApprove={onPayPalApprove}
                        />
                         <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <span>Secure payment via PayPal.</span>
                        </div>
                    </div>
                )}
                {error && <p className="text-destructive mt-4 text-sm text-center">{error}</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
