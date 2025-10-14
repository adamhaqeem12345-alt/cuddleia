'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/lib/cart';
import { ProductPrice } from '@/components/product-price';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import dynamicImport from 'next/dynamic';

// Force this page to be dynamically rendered on the server
export const dynamic = 'force-dynamic';

// Dynamically import the PayPal component with SSR disabled
const PaypalCheckout = dynamicImport(() => import('@/components/paypal-checkout').then(mod => mod.PaypalCheckout), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>,
});


export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const totalMYR = useMemo(() => {
    if (!exchangeRate) return null;
    return finalTotal * exchangeRate;
  }, [finalTotal, exchangeRate]);

  useEffect(() => {
    // If cart is empty and not processing, redirect
    if (items.length === 0 && !isProcessing) {
      router.push('/products');
    }
  }, [items, router, isProcessing]);
  
  useEffect(() => {
    // Fetch exchange rate on component mount
    fetch('/api/exchange-rate')
        .then(res => res.json())
        .then(data => {
            if(data.rate) {
                setExchangeRate(data.rate);
            }
        })
        .catch(console.error);
  }, []);

  useEffect(() => {
    // Basic form validation
    setIsFormValid(customerName.trim() !== '' && /.+@.+\..+/.test(customerEmail));
  }, [customerName, customerEmail]);

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === 'CUDDLE100') {
        setDiscount(subtotal);
    } else {
        alert('Invalid discount code.');
    }
  }

  const handleToyyibPay = async () => {
    if (!isFormValid || totalMYR === null) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
        const response = await fetch('/api/toyyibpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                total: totalMYR,
                customerName,
                customerEmail
            }),
        });

        const data = await response.json();

        if (response.ok && data.paymentUrl) {
            // Redirect user to the payment page
            window.location.href = data.paymentUrl;
        } else {
            throw new Error(data.error || 'Failed to create ToyyibPay bill.');
        }
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setIsProcessing(false);
    }
  }


  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Your cart is empty. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/30">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
            <AnimateIn>
                <div className="mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/cart">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Cart
                        </Link>
                    </Button>
                </div>
            </AnimateIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                <AnimateIn className="md:col-span-1">
                    <div className="bg-card p-8 rounded-2xl shadow-lg">
                        <h2 className="font-headline text-3xl font-bold border-b pb-4 mb-6">Your Order</h2>
                        <div className="space-y-4 mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover"/>
                                        </div>
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: 1</p>
                                        </div>
                                    </div>
                                    <ProductPrice price={item.price} simple={true} />
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                             {subtotal > 0 && discount > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                            )}
                             {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl">
                                <span>Total (USD)</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                            {totalMYR !== null && finalTotal > 0 && (
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <span>Est. Total (MYR)</span>
                                    <span>~RM{totalMYR.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        {subtotal > 0 && (
                           <div className="mt-6">
                                <Label htmlFor="discount" className="mb-2 block">Discount Code</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="discount"
                                        placeholder="Enter code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        disabled={discount > 0}
                                    />
                                    <Button onClick={handleApplyDiscount} disabled={discount > 0 || !discountCode}>
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </AnimateIn>

                <AnimateIn delay={150} className="md:col-span-1">
                    <div className="bg-card p-8 rounded-2xl shadow-lg">
                        <h2 className="font-headline text-3xl font-bold border-b pb-4 mb-6">Your Details</h2>
                        <div className="space-y-6">
                             <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name"
                                    placeholder="Your Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-headline text-xl font-bold mb-4">Payment Method</h3>
                             {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}
                            <div className="space-y-4">
                                {isProcessing && (
                                    <div className="flex justify-center items-center p-4">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                )}

                                {!isProcessing && finalTotal > 0 && (
                                    <>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-bold mb-2">Pay with Card / Bank Transfer (MY)</h4>
                                            <p className="text-sm text-muted-foreground mb-4">For Malaysian customers. You will be redirected to ToyyibPay.</p>
                                            <Button 
                                                onClick={handleToyyibPay} 
                                                disabled={!isFormValid || totalMYR === null}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                Pay RM{totalMYR ? totalMYR.toFixed(2) : '...'}
                                            </Button>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-bold mb-2">Pay with PayPal (International)</h4>
                                            <p className="text-sm text-muted-foreground mb-4">For customers outside of Malaysia.</p>
                                            <PaypalCheckout
                                                isFormValid={isFormValid}
                                                isProcessing={isProcessing}
                                                setIsProcessing={setIsProcessing}
                                                setError={setError}
                                                finalTotal={finalTotal}
                                                customerName={customerName}
                                                customerEmail={customerEmail}
                                                items={items}
                                                clearCart={clearCart}
                                            />
                                        </div>
                                    </>
                                )}

                                {!isProcessing && finalTotal === 0 && (
                                    <p className="text-center p-4 bg-secondary rounded-lg">Your order is free. Please click the button below to confirm.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </AnimateIn>
            </div>
        </div>
      </div>
    </div>
  );
}
