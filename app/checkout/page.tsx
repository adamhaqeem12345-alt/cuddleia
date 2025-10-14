'use client';

import { useCart } from '@/lib/cart';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';

// Force this page to be dynamically rendered on the server
export const dynamicImport = dynamic;

// Dynamically import the PayPal component with SSR disabled
const PaypalCheckout = dynamicImport(() => import('@/components/paypal-checkout').then(mod => mod.PaypalCheckout), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>,
});


export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'toyyibpay' | null>(null);

  // This ensures the order ID is stable across re-renders
  const orderId = useMemo(() => uuidv4(), []);

  // Check for ToyyibPay status on page load
  useEffect(() => {
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');

    if (status === 'fail') {
        setError(`ToyyibPay payment failed: ${reason || 'An unknown error occurred.'}`);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if cart is empty, as there's nothing to check out.
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  const handleToyyibPay = async () => {
    if (!name || !email) {
      setError('Please fill in your name and email.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
        const response = await fetch('/api/toyyibpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: name,
                customerEmail: email,
                orderId: orderId, // Pass the stable order ID
                items: items,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create ToyyibPay bill.');
        }

        // Redirect user to the ToyyibPay payment URL
        window.location.href = data.paymentUrl;

    } catch (err: any) {
        setError(err.message);
        setIsProcessing(false);
    }
  };

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

  const discount = 0; // Future use
  const finalTotal = subtotal - discount;

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <AnimateIn>
                    <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                        <div>
                            <h2 className="font-headline text-3xl font-bold mb-4">Customer Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-headline text-3xl font-bold mb-4 border-t pt-6">Payment Method</h2>
                            <div className="space-y-4">
                                <Button 
                                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                                    className="w-full justify-start text-lg py-6"
                                    onClick={() => setPaymentMethod('paypal')}
                                >
                                    <CreditCard className="mr-4"/> PayPal
                                </Button>
                                <Button 
                                    variant={paymentMethod === 'toyyibpay' ? 'default' : 'outline'}
                                    className="w-full justify-start text-lg py-6"
                                    onClick={() => setPaymentMethod('toyyibpay')}
                                >
                                    <ShoppingBag className="mr-4"/> ToyyibPay (FPX)
                                </Button>
                            </div>
                        </div>
                    </div>
                </AnimateIn>

                <AnimateIn delay={150}>
                    <div className="bg-card p-8 rounded-2xl shadow-lg sticky top-28">
                        <h2 className="font-headline text-3xl font-bold border-b pb-4 mb-6">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="font-bold truncate pr-4">{item.name}</span>
                                    <span className="font-mono flex-shrink-0">${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                         <div className="border-t border-b py-4 space-y-2">
                             <div className="flex justify-between font-medium">
                                <span>Subtotal</span>
                                <span className="font-mono">${subtotal.toFixed(2)}</span>
                            </div>
                         </div>
                        <div className="flex justify-between font-bold text-xl pt-4 mb-8">
                            <span>Total</span>
                            <span className="font-mono">${finalTotal.toFixed(2)} USD</span>
                        </div>
                        
                        {error && (
                            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm flex items-center gap-3 mb-4">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0"/> {error}
                            </div>
                        )}

                        {paymentMethod === 'paypal' && (
                            <PaypalCheckout
                                customerName={name}
                                customerEmail={email}
                                items={items}
                                orderId={orderId}
                                total={finalTotal}
                                disabled={!name || !email || isProcessing}
                            />
                        )}
                        {paymentMethod === 'toyyibpay' && (
                             <Button size="lg" className="w-full font-bold" onClick={handleToyyibPay} disabled={!name || !email || isProcessing}>
                                {isProcessing ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                                ) : 'Pay with ToyyibPay'}
                            </Button>
                        )}
                        {!paymentMethod && (
                            <div className="text-center p-4 bg-muted rounded-lg text-muted-foreground">
                                Please select a payment method.
                            </div>
                        )}
                    </div>
                </AnimateIn>
            </div>
        </div>
      </div>
    </div>
  );
}
