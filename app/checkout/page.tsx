'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout-form';

function CheckoutPageContent() {
    const { getPrice, cart, isCartReady } = useCart();
    
    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading Your Order...</p>
            </div>
        )
    }

    if (cart.length === 0) {
        return (
             <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                 <p className="text-muted-foreground mt-4">
                    Please add products to your cart before proceeding to checkout.
                </p>
                 <Button asChild className="mt-8">
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        )
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const subtotalPrice = getPrice(subtotal);

    return (
        <AnimateIn>
            <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
                <div className="bg-card p-8 rounded-2xl border shadow-lg">
                    <h1 className="text-2xl font-headline font-semibold text-foreground mb-6 text-center">
                        Order summary
                    </h1>
                    
                    <div className="space-y-4 font-body">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Subtotal (USD)</p>
                            <p className="font-medium text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Approx. MYR</p>
                            <p>{subtotalPrice.myr.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 font-bold text-lg">
                            <p className="text-foreground font-headline">Final Order Total</p>
                            <p className="text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                    </div>
                    
                    <div className="my-8 border-t"></div>

                    <div className="flex justify-center items-center space-x-3 mb-4">
                        <svg className="h-6" viewBox="0 0 79 20"><path fill="#003087" d="M23 19.3V.3h-4.6l-6.8 13.1-2.9-13.1H.5L5.8 19.3h4.8l7-13.4 3.4 13.4z"></path><path fill="#009cde" d="M78.1.3h-4.4c-2 0-3.5 1.1-3.5 2.8 0 1.5 1.2 2.3 2.9 2.3h1.5v-1.6h-1.5c-.8 0-1.4-.4-1.4-1.2 0-.7.7-.9 1.5-.9h2.9v14.6h4.3V.3z"></path><path fill="#003087" d="M68.5 19.3h-4.3l-1.3-3.1h-5l-1.3 3.1h-4.3l7-19h4.3l2.6 19zm-5.4-7.3l-2-5.1-2 5.1h4zM49.6 5.6c0-2.3 2.1-3.2 4.6-3.2 1.9 0 3.2.4 4 .7l-.7 3.2c-.6-.3-1.6-.6-2.9-.6-1.1 0-1.8.5-1.8 1.4 0 .9.8 1.2 2.1 1.7 2.4.9 3.9 2.1 3.9 4.6 0 2.5-2.2 3.6-4.9 3.6-2.1 0-3.9-.5-4.8-1l.8-3.2c.8.4 2.1.8 3.5.8 1.3 0 2.1-.6 2.1-1.6 0-1-.8-1.4-2.3-1.9-2.2-.9-3.7-2.1-3.7-4.5z"></path></svg>
                        <div className="border-l h-6"></div>
                        <div className="flex items-center space-x-2">
                             <svg className="h-5" viewBox="0 0 24 16"><path fill="#142688" d="M23.6,10.6,24,10.5l-.2-1.2-2.5-9.3H16.8l2.7,9.3c.1.4.2.8.3,1.2l-.3-1.2-.1-.5-.1-.4-2.8-9.2H12.2l-3,10.5h4.1l.6-2.3c0-.1.1-.3.1-.4l.3,1.3c.1.4.2.8.3,1.2l.1.4h3.3l.1-.4.1-.5.3-1.1.1-.4c0-.1.1-.3.1-.4L21,2.8,22.8,9c.1.2.1.4.2.6l-.1-.6c0-.2.1-.4.1-.6l.1-.5.2-1V6.2L23.6,10.6Z M10.2,1.3,7.5,10.8,4.8,1.3H.6L3.9,15.2H8.1L11.5,1.3Z"></path></svg>
                             <svg className="h-5" viewBox="0 0 24 16"><path fill="#000" d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12,12-5.4,12-12S18.6,0,12,0Z" transform="translate(0 -4)"></path><path fill="#F9A000" d="M23,12c0,6.1-4.9,11-11,11S1,18.1,1,12,5.9,1,12,1s11,4.9,11,11Z" transform="translate(0 -4)"></path><path fill="none" stroke="#FFF" strokeMiterlimit="10" strokeWidth="1.3" d="M12,1A11,11,0,0,1,23,12,11,11,0,0,1,12,23,11,11,0,0,1,1,12,11,11,0,0,1,12,1Z" transform="translate(0 -4)"></path><path fill="#D00" d="M12,1c3,0,5.8,1.2,7.8,3.2a11,11,0,0,0-7.8-2.1A11,11,0,0,0,4.2,4.2,11,11,0,0,1,12,1Z" transform="translate(0 -4)"></path><path fill="#F9A000" d="M12,23a11,11,0,0,1-7.8-3.2A11,11,0,0,0,12,22a11,11,0,0,0,7.8-1.9A11,11,0,0,1,12,23Z" transform="translate(0 -4)"></path></svg>
                             <svg className="h-5" viewBox="0 0 24 16"><path fill="#016FD0" d="M24,14.2a1.8,1.8,0,0,1-1.8,1.8H1.8A1.8,1.8,0,0,1,0,14.2V1.8A1.8,1.8,0,0,1,1.8,0H22.2A1.8,1.8,0,0,1,24,1.8ZM15.9,9.5l-.2-.3-.1-.1-1.1-1-1-1.1c-.2-.2-.5-.3-.7-.3h-.1l-.1.1c-.2.2-.3.5-.3.7v.1l.1.1.2.3.9,1,1,1.1v.2l-1.3,1.4h-.1c-.2,0-.5-.1-.7-.3l-1.9-1.9c-.2-.2-.5-.3-.7-.3-.3,0-.5.1-.7.3l-1.9,1.9h-.1l-.1.1c-.2.2-.3.5-.3.7v.1l.1.1.2.3.5.5h.1c.2,0,.5-.1.7-.3l1.9-1.9,1.9,1.9h.1c.2.2.5.3.7.3h.1c.3,0,.5-.1.7-.3l2-1.9h.2c.2,0,.3-.1.5-.2V9.6ZM8,4.7H9.2v.3c0,.2-.1.3-.2.5l-.9,1.1V6.2h.9Zm4,0h1.2v.3c0,.2,0,.3-.2.5l-.9,1.1V6.2h.9ZM6.9,4.7H5.7V4.4H8.2V3.4H4.5V4.7h.9v2.5L4.5,8.2V9.1h3c.3,0,.5-.1.7-.3l.7-.7V4.7ZM9.5,9.1h1.3V3.4H9.5Zm2.6,0h2.5c.3,0,.5,0,.7-.2l.7-.7V6.9L15.1,6V4.7H13.8V6l.9.9v.3c0,.2,0,.3-.2.5l-.5.5h-.3V3.4H12.1Z"></path></svg>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mb-6 max-w-sm mx-auto">
                        You'll be redirected to a secure gateway to complete your payment using your PayPal account or any major credit/debit card.
                    </p>

                    <CheckoutForm cart={cart} />

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
