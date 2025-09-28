'use client';

import { Suspense } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout-form';
import Image from 'next/image';


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

                    <div className="flex justify-center items-center space-x-4 mb-4">
                        <div className="border rounded-md px-3 py-2 flex items-center justify-center h-[40px] w-[100px]">
                           <Image src="https://i.postimg.cc/NMyyV4S4/paypal.png" alt="PayPal" width={80} height={20} className="object-contain" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="border rounded-md p-1.5 flex items-center justify-center h-[40px] w-[50px]">
                                <Image src="https://i.postimg.cc/mg2m3Dsf/visa.png" alt="Visa" width={40} height={25} className="object-contain" />
                            </div>
                            <div className="border rounded-md p-1.5 flex items-center justify-center h-[40px] w-[50px]">
                                <Image src="https://i.postimg.cc/RhX3Y2Xp/mastercard.png" alt="Mastercard" width={40} height={25} className="object-contain" />
                            </div>
                            <div className="border rounded-md p-1.5 flex items-center justify-center h-[40px] w-[50px]">
                               <Image src="https://i.postimg.cc/tJ0BvX8n/amex.png" alt="American Express" width={40} height={25} className="object-contain" />
                            </div>
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
