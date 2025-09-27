'use client';

import { Suspense } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CheckoutForm } from '@/components/checkout-form';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';

function CheckoutPageContent() {
    const { getPrice, cart } = useCart();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!PAYPAL_CLIENT_ID) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-destructive">PayPal Client ID is not configured.</h1>
                <p className="text-muted-foreground mt-4">Please set the NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable.</p>
            </div>
        );
    }

    return (
        <AnimateIn>
            <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
                <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-12">
                    Complete Your Purchase
                </h1>
                
                <div className="bg-gray-50/50 p-8 rounded-2xl border shadow-sm">
                    <h2 className="text-lg font-medium text-foreground">Order summary</h2>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Subtotal</p>
                            <p className="text-sm font-medium text-foreground">{getPrice(subtotal).formatted}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <p className="text-base font-medium text-foreground">Order total</p>
                            <p className="text-base font-medium text-foreground">{getPrice(subtotal).formatted}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                         <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
                            <CheckoutForm />
                        </PayPalScriptProvider>
                    </div>
                </div>
            </div>
        </AnimateIn>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="text-center p-24">Loading...</div>}>
            <CheckoutPageContent />
        </Suspense>
    )
}
