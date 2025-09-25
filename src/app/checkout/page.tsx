'use client'

import Image from "next/image";
import { useCart, getPrice } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateIn } from "@/components/animate-in";
import { User, Mail, Globe, Wand2, CalendarDays } from "lucide-react";
import Link from 'next/link';
import { FormEvent, useState, useEffect } from "react";
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
    const [isProcessing, setIsProcessing] = useState(false);

    // Determine the country and currency to use for price calculations
    const isMalaysianAdult = selectedCountry === 'MY' && age !== undefined && age >= 18;
    const countryForPrice = (selectedCountry === 'MY' && !isMalaysianAdult) || (isMalaysianAdult && paymentMethod === 'toyyibpay') ? 'MY' : 'Other';
    const currencyPrefix = countryForPrice === 'MY' ? 'RM' : '$';

    const subtotal = cart.reduce((acc, item) => {
        return acc + getPrice(item, countryForPrice) * item.quantity;
    }, 0);

    const displaySubtotal = `${currencyPrefix}${subtotal.toFixed(2)}`;

    useEffect(() => {
        // Reset age and payment method when country changes
        setAge(undefined);
        const ageInput = document.getElementById('age') as HTMLInputElement;
        if (ageInput) ageInput.value = '';
        setPaymentMethod('toyyibpay');
    }, [selectedCountry]);
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const customerAge = age;

        if (!name || !email || !selectedCountry) {
            alert('Please fill in all your details.');
            setIsProcessing(false);
            return;
        }

        if (selectedCountry === 'MY' && (customerAge === undefined || customerAge <= 0)) {
            alert('Please enter a valid age.');
            setIsProcessing(false);
            return;
        }

        const usePayPal = selectedCountry !== 'MY' || (customerAge !== undefined && customerAge < 18) || (isMalaysianAdult && paymentMethod === 'paypal');
        
        const finalCountryForPrice = usePayPal ? 'Other' : 'MY';
        const finalCurrencyPrefix = usePayPal ? '$' : 'RM';
        
        const finalSubtotalForEmail = cart.reduce((acc, item) => acc + getPrice(item, finalCountryForPrice) * item.quantity, 0);
        const subtotalForEmailString = `${finalCurrencyPrefix}${finalSubtotalForEmail.toFixed(2)}`;
        
        const cartForEmail = cart.map(item => ({
            ...item,
            price: getPrice(item, finalCountryForPrice),
            downloadUrl: item.downloadUrl,
            quantity: item.quantity,
            name: item.name,
        }));


        try {
            // First, always send the confirmation email
             await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    to: email, 
                    name: name, 
                    cart: cartForEmail, 
                    subtotal: subtotalForEmailString 
                }),
            });

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
                
                clearCart();
                window.location.href = paypalUrl + paypalItemsQuery;

            } else {
                // Malaysian customer (18+), use ToyyibPay Bill API
                const toyyibPaySubtotal = cart.reduce((acc, item) => acc + getPrice(item, 'MY') * item.quantity, 0);

                const billResponse = await fetch('/api/create-bill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        billName: 'Cuddleia Order',
                        billDescription: `Your order from Cuddleia.`,
                        billAmount: toyyibPaySubtotal * 100, // Amount in cents
                        billTo: name,
                        billEmail: email,
                    }),
                });

                if (!billResponse.ok) {
                    const errorData = await billResponse.json();
                    throw new Error(errorData.message || 'Failed to create ToyyibPay bill.');
                }
                
                const { paymentUrl } = await billResponse.json();

                clearCart();
                window.location.href = paymentUrl;
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
                                        <Label htmlFor="country" className="font-body text-sm font-medium">Country</Label>
                                         <div className="relative">
                                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                                             <Select name="country" required disabled={isProcessing} onValueChange={setSelectedCountry} value={selectedCountry}>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-body text-sm font-medium">Your Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input id="name" name="name" placeholder="e.g. Fatimah" className="pl-10" required disabled={isProcessing} />
                                            </div>
                                        </div>
                                        {selectedCountry === 'MY' && (
                                             <div className="space-y-2">
                                                <Label htmlFor="age" className="font-body text-sm font-medium">Age</Label>
                                                <div className="relative">
                                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    <Input id="age" name="age" type="number" placeholder="e.g. 25" className="pl-10" required={selectedCountry === 'MY'} disabled={isProcessing} onChange={(e) => setAge(parseInt(e.target.value) || undefined)} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-body text-sm font-medium">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required disabled={isProcessing} />
                                        </div>
                                    </div>

                                    {isMalaysianAdult && (
                                        <div className="space-y-3 rounded-lg border bg-accent/50 p-4">
                                            <Label className="font-body text-sm font-medium">Payment Method</Label>
                                             <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
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

                                     <p className="text-xs text-muted-foreground font-body h-8 flex items-center">
                                        { selectedCountry === 'MY' ? 
                                            (age === undefined ? "Please enter your age to see payment options." : (age < 18 ? "You will be directed to PayPal (USD)." : "You can choose your preferred payment method."))
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

    