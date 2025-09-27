
'use client';

import { Suspense } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import { CheckoutForm } from '@/components/checkout-form';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function CheckoutPageContent() {
    const { getPrice, cart, isCartReady } = useCart();
    
    // While cart is being loaded from localStorage, show a loading state.
    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading Your Cart...</p>
            </div>
        )
    }

    // The cart should not be empty to checkout
    if (cart.length === 0) {
        return (
             <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                <p className="text-muted-foreground mt-4">
                    Please <Link href="/products" className="text-primary hover:underline">add some products</Link> to your cart before proceeding to checkout.
                </p>
            </div>
        )
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const subtotalPrice = getPrice(subtotal);

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
                            <p className="text-sm text-muted-foreground">Subtotal (USD)</p>
                            <p className="text-sm font-medium text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Approx. MYR</p>
                          <p className="text-sm font-medium text-muted-foreground">{subtotalPrice.myr.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <p className="text-base font-medium text-foreground">Final Order Total</p>
                            <p className="text-base font-medium text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                       <CheckoutForm cart={cart} />
                    </div>
                </div>
            </div>
        </AnimateIn>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}
