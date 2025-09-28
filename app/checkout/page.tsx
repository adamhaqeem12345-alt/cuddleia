
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart, getPrice, isCartReady } = useCart();
    const router = useRouter();
    const [status, setStatus] = useState<'ready' | 'loading' | 'processing' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('An unexpected error occurred. Please try again.');

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

    const handlePayment = async () => {
        setStatus('processing');
        setErrorMessage('');

        try {
            // 1. Create a PayPal order on the server
            const createOrderResponse = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cart.map(({ id, quantity }) => ({ id, quantity })) }),
            });

            const orderData = await createOrderResponse.json();

            if (!createOrderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create PayPal order.');
            }
            
            // 2. Redirect the user to PayPal to approve the payment
            if (orderData.approveUrl) {
                window.location.href = orderData.approveUrl;
            } else {
                 throw new Error('Could not retrieve PayPal approval URL.');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            const msg = error instanceof Error ? error.message : 'An unknown error occurred.';
            setErrorMessage(msg);
            setStatus('error');
        }
    };

    if (!isCartReady || status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-rose-50/30">
            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                     <div className="text-center mb-12">
                        <h1 className="font-headline text-5xl font-bold text-foreground">Checkout</h1>
                        <p className="mt-2 text-muted-foreground text-lg">Please review your order and proceed to payment.</p>
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
                        <div className="bg-white p-8 rounded-2xl shadow-lg border flex flex-col justify-center">
                            <h2 className="font-headline text-2xl font-semibold mb-6">Payment Method</h2>
                            
                            <div className='p-4 border rounded-lg bg-gray-50/70'>
                                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.png" alt="PayPal" className="h-10 mx-auto" />
                                <p className="text-center text-sm text-muted-foreground mt-2">You will be redirected to PayPal to complete your payment securely.</p>
                            </div>

                            {status === 'error' && (
                                <div className="text-center p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 my-6">
                                    <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                                    <p className="mt-2 font-semibold">Payment Error</p>
                                    <p className="text-sm mt-1">{errorMessage}</p>
                                </div>
                            )}
                            
                            <Button 
                                onClick={handlePayment}
                                disabled={status === 'processing'}
                                size="lg" 
                                className="w-full font-bold shadow-lg transition-transform hover:scale-105 mt-6"
                            >
                                {status === 'processing' ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Proceed with PayPal`
                                )}
                            </Button>
                        </div>
                    </div>
                     <div className="mt-12 text-center">
                        <Button asChild variant="ghost" disabled={status === 'processing'}>
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
