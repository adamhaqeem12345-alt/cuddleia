'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
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
                    <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
        </div>
        <div>
            <h2 className="font-headline text-3xl md:text-4xl text-foreground mb-8 font-bold">Payment</h2>
            <div className="border rounded-2xl shadow-sm bg-card p-8">
                <h3 className="font-headline text-xl font-bold mb-6">Choose Payment Method</h3>
                <div className="space-y-4 mb-8">
                    {/* Payment method options will go here */}
                    <div 
                        onClick={() => setPaymentMethod('paypal')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                        <p className="font-bold text-lg">PayPal</p>
                        <p className="text-sm text-muted-foreground">Pay with your PayPal balance or credit/debit card.</p>
                    </div>
                     <div 
                        onClick={() => setPaymentMethod('stripe')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                        <p className="font-bold text-lg">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">Securely pay with your card.</p>
                    </div>
                </div>

                <div className="mt-8">
                    {/* Placeholder for payment button */}
                     <Button size="lg" className="w-full font-bold rounded-full h-12 text-lg">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ${subtotal.toFixed(2)}
                    </Button>
                </div>
                 <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Secure payment powered by trusted providers.</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
