'use client'

import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateIn } from "@/components/animate-in";
import { User, Mail, Calendar, Wand2 } from "lucide-react";
import Link from 'next/link';
import { FormEvent } from "react";

export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const age = Number(formData.get('age'));
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;

        if (!name || !email || !age) {
            alert('Please fill in all your details.');
            return;
        }

        if (age < 18) {
            // Redirect to PayPal for users under 18
            const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=YOUR_PAYPAL_EMAIL&currency_code=USD&amount=${subtotal.toFixed(2)}&item_name=Cuddleia_Products`;
            window.location.href = paypalUrl;
        } else {
            // Placeholder for ToyyibPay or other gateways
            alert(`Thank you, ${name}! Proceeding to payment for $${subtotal.toFixed(2)}.`);
            // Here you would redirect to ToyyibPay or another payment gateway
            // For now, we'll just clear the cart to simulate a successful order.
            clearCart();
            window.location.href = '/'; // Redirect to home after 'payment'
        }
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
                            <p className="text-xl font-body text-foreground/80 mb-8">Your cart is empty. You can't checkout.</p>
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
                            <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                                <h2 className="font-headline text-3xl font-bold">Your Details</h2>
                                <p className="text-muted-foreground font-body">We need this to process your order and send your files.</p>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label className="font-body text-sm font-medium">Your Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" name="name" placeholder="e.g. Fatimah" className="pl-10" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-body text-sm font-medium">Your Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-body text-sm font-medium">Your Age</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="age" name="age" type="number" placeholder="e.g. 25" className="pl-10" required />
                                        </div>
                                    </div>
                                     <p className="text-xs text-muted-foreground font-body">Customers under 18 will be directed to PayPal.</p>
                                    <Button type="submit" size="lg" className="w-full rounded-full text-lg py-6 shadow-lg">
                                        <Wand2 className="mr-2 h-5 w-5" />
                                        Proceed to Payment
                                    </Button>
                                </form>
                            </div>
                             <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                                <h2 className="font-headline text-3xl font-bold">Order Summary</h2>
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-headline text-lg font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-body font-semibold">${item.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border pt-4 mt-4 flex justify-between font-bold text-lg">
                                    <p>Total</p>
                                    <p>${subtotal.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AnimateIn>
        </div>
    )
}
