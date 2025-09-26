'use client'

import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { useCart, getPrice } from '@/context/cart-context';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
    const { cart, selectedCountry } = useCart();
    const subtotal = cart.reduce((acc, item) => {
        const price = getPrice(item, selectedCountry);
        return acc + price * item.quantity;
    }, 0);
    const currencyPrefix = selectedCountry === 'MY' ? 'RM' : '$';

    return (
        <div className="bg-background min-h-[80vh]">
            <AnimateIn>
                <section className="bg-accent/30 py-16 text-center">
                    <h1 className="font-headline text-5xl font-bold text-foreground">Checkout</h1>
                </section>
            </AnimateIn>

            <AnimateIn className="py-16">
                <div className="container mx-auto px-4">
                    {cart.length === 0 ? (
                         <div className="text-center">
                            <p className="text-xl font-body text-foreground/80 mb-8">
                                Your cart is empty. There is nothing to check out.
                            </p>
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                             <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                                <h2 className="font-headline text-3xl font-bold border-b pb-4">Order Summary</h2>
                                <div className="space-y-4">
                                    {cart.map(item => {
                                         const price = getPrice(item, selectedCountry);
                                        return (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="font-headline text-lg">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-body font-semibold">{currencyPrefix}{(price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    )})}
                                </div>
                                <div className="border-t pt-6 space-y-4">
                                     <div className="flex justify-between font-body text-lg">
                                        <span>Subtotal</span>
                                        <span>{currencyPrefix}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-body text-xl font-bold">
                                        <span>Total</span>
                                        <span>{currencyPrefix}{subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="text-center pt-6">
                                     <p className="text-lg font-body text-foreground/80 mb-8">
                                        The checkout is currently unavailable. Please check back later.
                                    </p>
                                    <Button asChild size="lg" className="rounded-full">
                                        <Link href="/products">Continue Shopping</Link>
                                    </Button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </AnimateIn>
        </div>
    )
}
