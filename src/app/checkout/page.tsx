'use client'

import Image from "next/image";
import { useCart, getPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateIn } from "@/components/animate-in";
import { User, Mail, Globe, Wand2, CalendarDays } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CheckoutPage() {
    const { cart, clearCart, selectedCountry, setSelectedCountry } = useCart();
    const [age, setAge] = useState<number | undefined>();
    const [paymentMethod, setPaymentMethod] = useState('toyyibpay');
    
    const subtotal = cart.reduce((acc, item) => {
        const price = getPrice(item, selectedCountry);
        return acc + price * item.quantity;
    }, 0);

    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const country = formData.get('country') as string;
        const customerAge = formData.get('age') ? parseInt(formData.get('age') as string) : 0;

        if (!name || !email || !country || !customerAge) {
            alert('Please fill in all your details, including your age.');
            setIsProcessing(false);
            return;
        }

        const usePayPal = (country !== 'MY') || (customerAge < 18) || (customerAge >= 18 && country === 'MY' && paymentMethod === 'paypal');
        const currencyForEmail = usePayPal ? 'USD' : 'MYR';
        const priceCountryForEmail = usePayPal ? 'Other' : 'MY';
        const currencyPrefixForEmail = usePayPal ? '$' : 'RM';
        
        const subtotalForEmailCalc = cart.reduce((acc, item) => acc + getPrice(item, priceCountryForEmail) * item.quantity, 0);
        const subtotalForEmail = `${currencyPrefixForEmail}${subtotalForEmailCalc.toFixed(2)}`;
        
        const cartForEmail = cart.map(item => ({
            ...item,
            price: getPrice(item, priceCountryForEmail),
            downloadUrl: item.downloadUrl,
            quantity: item.quantity,
            name: item.name,
        }));


        try {
            if (usePayPal) {
                // PayPal Flow
                const paypalBusinessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL;
                const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_cart&upload=1&business=${paypalBusinessEmail}&currency_code=USD`;

                let paypalItemsQuery = "";
                cart.forEach((item, index) => {
                    const itemNumber = index + 1;
                    const usdPrice = getPrice(item, 'Other');
                    paypalItemsQuery += `&item_name_${itemNumber}=${encodeURIComponent(item.name)}`;
                    paypalItemsQuery += `&amount_${itemNumber}=${usdPrice.toFixed(2)}`;
                    paypalItemsQuery += `&quantity_${itemNumber}=${item.quantity}`;
                });

                // Send email *before* redirecting
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: email, name: name, cart: cartForEmail, subtotal: subtotalForEmail }),
                });

                clearCart();
                window.location.href = paypalUrl + paypalItemsQuery;

            } else {
                // Malaysian customer (18+), use ToyyibPay Bill API
                const billResponse = await fetch('/api/create-bill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        billName: 'Cuddleia Order',
                        billDescription: `Your order from Cuddleia.`,
                        billAmount: subtotal * 100, // Amount in cents
                        billTo: name,
                        billEmail: email,
                    }),
                });

                if (!billResponse.ok) {
                    const errorData = await billResponse.json();
                    throw new Error(errorData.message || 'Failed to create ToyyibPay bill.');
                }
                
                const { paymentUrl } = await billResponse.json();

                // Send email *before* redirecting
                 await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: email, name: name, cart: cartForEmail, subtotal: subtotalForEmail }),
                });

                clearCart();
                window.location.href = paymentUrl;
            }

        } catch (error) {
            console.error('Checkout process failed:', error);
            alert('There was an error processing your order. Please try again.');
            setIsProcessing(false);
        }
    };

    const isMalaysianAdult = selectedCountry === 'MY' && age !== undefined && age >= 18;
    const isMalaysian = selectedCountry === 'MY';
    
    let currencyPrefix = '$';
    let countryForPrice = 'Other';

    if (isMalaysian && (!isMalaysianAdult || paymentMethod === 'toyyibpay')) {
        currencyPrefix = 'RM';
        countryForPrice = 'MY';
    }

    const finalSubtotal = cart.reduce((acc, item) => {
        return acc + getPrice(item, countryForPrice) * item.quantity;
    }, 0);

    const displaySubtotal = `${currencyPrefix}${finalSubtotal.toFixed(2)}`;

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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-body text-sm font-medium">Your Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input id="name" name="name" placeholder="e.g. Fatimah" className="pl-10" required disabled={isProcessing} />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="age" className="font-body text-sm font-medium">Age</Label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input id="age" name="age" type="number" placeholder="e.g. 25" className="pl-10" required disabled={isProcessing} onChange={(e) => setAge(parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-body text-sm font-medium">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required disabled={isProcessing} />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="country" className="font-body text-sm font-medium">Country</Label>
                                         <div className="relative">
                                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                                             <Select name="country" required disabled={isProcessing} onValueChange={(value) => { setSelectedCountry(value); setAge(undefined); (document.getElementById('age') as HTMLInputElement).value = ''; }} defaultValue={selectedCountry}>
                                                <SelectTrigger className="w-full pl-10">
                                                    <SelectValue placeholder="Select your country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="MY">Malaysia</SelectItem>
                                                  <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                        </div>
                                    </div>

                                    {isMalaysianAdult && (
                                        <div className="space-y-3 rounded-lg border bg-accent/50 p-4">
                                            <Label className="font-body text-sm font-medium">Payment Method</Label>
                                             <RadioGroup defaultValue="toyyibpay" onValueChange={setPaymentMethod}>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="toyyibpay" id="toyyibpay" />
                                                    <Label htmlFor="toyyibpay" className="font-normal">ToyyibPay (MYR)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="paypal" id="paypal" />
                                                    <Label htmlFor="paypal" className="font-normal">PayPal (USD)</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}

                                     <p className="text-xs text-muted-foreground font-body">
                                        { isMalaysian ? 
                                            (age === undefined ? "Please enter your age." : (age < 18 ? "You will be directed to PayPal (USD)." : "Malaysian customers 18+ can choose their payment method."))
                                            : "International customers will be directed to PayPal (USD)."
                                        }
                                     </p>
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
                                            <p className="font-body font-semibold">{currencyPrefix}{(getPrice(item, countryForPrice) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border pt-4 mt-4 flex justify-between font-bold text-lg">
                                    <p>Total</p>
                                    <p>{displaySubtotal}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AnimateIn>
        </div>
    )
}
