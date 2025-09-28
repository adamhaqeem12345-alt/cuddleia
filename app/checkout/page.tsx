
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart, getPrice, isCartReady } = useCart();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const { usd: subtotalUSD, myr: subtotalMYR } = getPrice(subtotal);

    useEffect(() => {
        if (isCartReady) {
            if (cart.length === 0) {
                router.replace('/products');
            } else {
                setStatus('ready');
            }
        }
    }, [cart.length, isCartReady, router]);

    const handleRedirectToPayPal = async () => {
        setStatus('processing');
        setErrorMessage('');
        try {
            // Send the essential cart information including price to the backend
            const minimalCart = cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price, // price in cents
                name: item.name
            }));

            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: minimalCart }),
            });
            const order = await res.json();
            if (!res.ok) {
                // Log the full error response from the server for better debugging
                console.error('Server error response:', order);
                throw new Error(order.error || 'Failed to create PayPal order.');
            }

            if (!order.approveUrl) {
                console.error('No approveUrl in success response:', order);
                throw new Error('Could not retrieve PayPal approval URL.');
            }

            // Redirect user to PayPal
            window.location.href = order.approveUrl;
        } catch (error: any) {
            console.error('Create Order Error:', error);
            setErrorMessage(error.message || 'There was an issue initiating the payment. Please try again.');
            setStatus('error');
        }
    };

    if (status === 'loading' || !isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        );
    }
    
    if (status === 'success') {
        return (
             <div className="container mx-auto px-4 py-24 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-6 font-headline text-4xl font-bold">Payment Successful!</h1>
                <p className="mt-2 text-muted-foreground">Redirecting you to the confirmation page...</p>
                <Loader2 className="mx-auto mt-4 h-8 w-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="bg-rose-50/30">
            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                     <div className="text-center mb-12">
                        <h1 className="font-headline text-5xl font-bold text-foreground">Checkout</h1>
                        <p className="mt-2 text-muted-foreground text-lg">Please review your order and complete your purchase.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Order Summary */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border">
                             <h2 className="font-headline text-2xl font-semibold border-b pb-4 mb-6">Order Summary</h2>
                             <div className="space-y-4 mb-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.name} <span className="text-muted-foreground font-normal">x {item.quantity}</span></p>
                                            <p className="text-sm text-muted-foreground">{getPrice(item.price).usd.formatted}</p>
                                        </div>
                                        <p className="font-semibold">{getPrice(item.price * item.quantity).usd.formatted}</p>
                                    </div>
                                ))}
                             </div>
                             <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <p>Subtotal (USD)</p>
                                    <p className="font-semibold">{subtotalUSD.formatted}</p>
                                </div>
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <p>Approx. in MYR</p>
                                    <p>{subtotalMYR.formatted}</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                                    <p>Total</p>
                                    <p>{subtotalUSD.formatted}</p>
                                </div>
                             </div>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border">
                            <h2 className="font-headline text-2xl font-semibold mb-6">Payment Method</h2>
                            
                             <div className="text-center text-muted-foreground text-sm mb-4">
                                <p>You will be redirected to PayPal to complete your purchase securely.</p>
                            </div>

                            {status === 'ready' && (
                                <Button onClick={handleRedirectToPayPal} size="lg" className="w-full font-bold text-lg py-7 bg-[#0070ba] hover:bg-[#005ea6]">
                                    <Wallet className="mr-3 h-6 w-6" /> Pay with PayPal
                                </Button>
                            )}

                            {status === 'processing' && (
                                 <div className="text-center p-8 rounded-lg bg-blue-50 text-blue-800">
                                    <Loader2 className="mx-auto h-10 w-10 animate-spin" />
                                    <p className="mt-4 font-semibold text-lg">Redirecting to PayPal...</p>
                                    <p className="text-sm">Please wait.</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="text-center p-6 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                    <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
                                    <p className="mt-4 font-semibold text-lg">Payment Error</p>

                                    <p className="text-sm mt-1">{errorMessage}</p>
                                    <Button onClick={() => setStatus('ready')} className="mt-4">Try Again</Button>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="mt-12 text-center">
                        <Button asChild variant="ghost">
                            <Link href="/cart">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Return to Cart
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
