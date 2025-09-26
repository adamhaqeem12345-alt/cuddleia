
'use client'

import { useState } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cart } = useCart();
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const subtotal = cart.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);
    const currencyPrefix = '$';

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate a delay for processing a PayPal payment
        setTimeout(() => {
            // Redirect to thank you page on success
            // In a real app, this would be after a successful PayPal API response
            router.push('/thank-you?status=success');
        }, 1500);
    };

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {/* Order Summary */}
                            <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6 md:order-2">
                                <h2 className="font-headline text-3xl font-bold border-b pb-4">Order Summary</h2>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {cart.map(item => (
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
                                            <p className="font-body font-semibold">{currencyPrefix}{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
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
                            </div>
                            
                            {/* Checkout Form */}
                             <div className="md:order-1">
                                <form onSubmit={handleCheckout} className="bg-card p-8 rounded-2xl shadow-lg space-y-8">
                                    <div>
                                         <h2 className="font-headline text-3xl font-bold border-b pb-4">Your Details</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-lg font-headline">Full Name</Label>
                                        <Input 
                                            id="name" 
                                            type="text" 
                                            placeholder="Your full name"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            required 
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-lg font-headline">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="you@example.com"
                                            value={customerEmail}
                                            onChange={e => setCustomerEmail(e.target.value)}
                                            required 
                                            className="h-12"
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full rounded-full text-lg py-7 bg-[#00457C] hover:bg-[#003057]" disabled={isLoading}>
                                        {isLoading ? 'Processing...' : `Pay with PayPal (${currencyPrefix}${subtotal.toFixed(2)})`}
                                    </Button>

                                     <p className="text-xs text-muted-foreground text-center pt-4">
                                        By clicking "Pay", you agree to our Terms of Service and Privacy Policy. All payments are processed securely via PayPal.
                                    </p>
                                </form>
                             </div>
                        </div>
                    )}
                </div>
            </AnimateIn>
        </div>
    )
}
