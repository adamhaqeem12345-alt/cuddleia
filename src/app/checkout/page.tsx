'use client'

import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart } = useCart();

    return (
        <div className="bg-background min-h-[80vh]">
            <AnimateIn>
                <section className="bg-accent/30 py-16 text-center">
                    <h1 className="font-headline text-5xl font-bold text-foreground">Checkout</h1>
                </section>
            </AnimateIn>

            <AnimateIn className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <p className="text-xl font-body text-foreground/80 mb-8">
                            {cart.length === 0 
                                ? "Your cart is empty. There is nothing to check out."
                                : "The checkout is currently unavailable. Please check back later."}
                        </p>
                        <Button asChild size="lg" className="rounded-full">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </AnimateIn>
        </div>
    )
}
