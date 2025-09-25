'use client'

import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateIn } from "@/components/animate-in";
import { User, Mail, Calendar, Wand2, Globe } from "lucide-react";
import Link from 'next/link';
import { FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const age = Number(formData.get('age'));
        const country = formData.get('country') as string;

        if (!name || !email || !age || !country) {
            alert('Please fill in all your details.');
            setIsProcessing(false);
            return;
        }

        try {
            const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    name: name,
                    cart: cart,
                    subtotal: subtotal.toFixed(2),
                }),
            });

            if (!emailResponse.ok) {
                 throw new Error('Failed to send confirmation email.');
            }
            
            // Email sent successfully, now clear cart and redirect.
            clearCart();

            if (age < 18 || country !== 'MY') {
                // Redirect to PayPal for users under 18 or international customers
                const paypalBusinessEmail = 'YOUR_PAYPAL_EMAIL'; // <-- IMPORTANT: Replace with your email
                let paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_cart&upload=1&business=${paypalBusinessEmail}&currency_code=USD`;

                cart.forEach((item, index) => {
                    const itemNumber = index + 1;
                    paypalUrl += `&item_name_${itemNumber}=${encodeURIComponent(item.name)}`;
                    paypalUrl += `&amount_${itemNumber}=${item.price.toFixed(2)}`;
                    paypalUrl += `&quantity_${itemNumber}=${item.quantity}`;
                });
                
                window.location.href = paypalUrl;
            } else {
                // Redirect to ToyyibPay for Malaysian customers 18 and over
                const toyyibpayUrl = `https://toyyibpay.com/YOUR_COLLECTION_ID`; // <-- IMPORTANT: Replace with your ToyyibPay Collection ID
                window.location.href = toyyibpayUrl;
            }

        } catch (error) {
            console.error('Checkout process failed:', error);
            alert('There was an error processing your order. Please try again.');
            setIsProcessing(false);
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
                                        <Label htmlFor="name" className="font-body text-sm font-medium">Your Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="name" name="name" placeholder="e.g. Fatimah" className="pl-10" required disabled={isProcessing} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-body text-sm font-medium">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required disabled={isProcessing} />
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="font-body text-sm font-medium">Your Age</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input id="age" name="age" type="number" placeholder="e.g. 25" className="pl-10" required disabled={isProcessing} />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="country" className="font-body text-sm font-medium">Country</Label>
                                             <Select name="country" required disabled={isProcessing}>
                                                <SelectTrigger className="w-full">
                                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                  <div className="pl-5">
                                                    <SelectValue placeholder="Select your country" />
                                                  </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="MY">Malaysia</SelectItem>
                                                  <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                        </div>
                                    </div>
                                     <p className="text-xs text-muted-foreground font-body">International customers and those under 18 will be directed to PayPal.</p>
                                    <Button type="submit" size="lg" className="w-full rounded-full text-lg py-6 shadow-lg" disabled={isProcessing}>
                                        {isProcessing ? 'Processing...' : (
                                            <>
                                                <Wand2 className="mr-2 h-5 w-5" />
                                                Proceed to Payment
                                            </>
                                        )}
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
