'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import { Loader2 } from 'lucide-react';

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
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Subtotal (USD)</p>
                            <p className="font-medium text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Approx. MYR</p>
                            <p>{subtotalPrice.myr.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 font-bold text-lg">
                            <p className="text-foreground">Final Order Total</p>
                            <p className="text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                    </div>
                    
                    <div className="my-8 border-t"></div>

                    <div className="flex justify-center items-center space-x-3 mb-6">
                        <Image src="https://i.ibb.co/X8X3b9Y/paypal.png" alt="PayPal" width={100} height={25} className="h-auto" />
                        <div className="border-l h-6"></div>
                        <div className="flex items-center space-x-2">
                             <Image src="https://i.ibb.co/qWpB3YJ/visa.png" alt="Visa" width={50} height={25} className="h-auto" />
                             <Image src="https://i.ibb.co/M8qqs2c/mastercard.png" alt="Mastercard" width={50} height={25} className="h-auto" />
                             <Image src="https://i.ibb.co/qphGz8x/amex.png" alt="American Express" width={50} height={25} className="h-auto" />
                        </div>
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
