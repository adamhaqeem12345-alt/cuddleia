
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';
import { PayPalButtons, OnApproveData } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';


export default function CheckoutPage() {
    const { cart, getPrice, isCartReady, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const { usd: subtotalUSD, myr: subtotalMYR } = getPrice(subtotal);

    useEffect(() => {
        // If the cart is ready and it's empty, redirect the user away from checkout.
        if (isCartReady && cart.length === 0) {
            router.replace('/products');
        }
    }, [cart.length, isCartReady, router]);

    const createOrder = async (): Promise<string> => {
        setIsProcessing(true);
        setErrorMessage(null);
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: cart.map(({ id, quantity }) => ({ id, quantity })) }),
            });
            const orderData = await response.json();
            if (!response.ok) {
                throw new Error(orderData.error || 'Failed to create PayPal order.');
            }
            return orderData.id;
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'An unknown error occurred creating the order.';
            setErrorMessage(msg);
            setIsProcessing(false);
            throw new Error(msg); // Throw to stop the PayPal flow
        }
    };
    
    const onApprove = async (data: OnApproveData): Promise<void> => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
            });
    
            const capturedData = await response.json();
    
            if (!response.ok) {
                throw new Error(capturedData.error || 'Failed to capture payment.');
            }
            
            clearCart(); // Clear cart after successful payment
            router.push(`/checkout/success?token=${data.orderID}&PayerID=${data.payerID}`);

        } catch (error) {
            const msg = error instanceof Error ? error.message : 'An unknown error occurred capturing the payment.';
            setErrorMessage(msg);
            setIsProcessing(false);
        }
    };

    const onError = (err: any) => {
        console.error("PayPal Buttons Error:", err);
        setErrorMessage("An error occurred with the PayPal payment. Please try again or contact support.");
        setIsProcessing(false);
    };

    // Show a loading spinner while the cart is being loaded from localStorage
    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        );
    }
    
    return (
        <AnimateIn>
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
                                <h2 className="font-headline text-2xl font-semibold mb-6 text-center">Payment Method</h2>
                                
                                {errorMessage && (
                                    <div className="text-center p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-6">
                                        <AlertTriangle className="inline-block h-5 w-5 mr-2" />
                                        <p className="inline-block align-middle font-semibold text-sm">{errorMessage}</p>
                                    </div>
                                )}

                                {(isProcessing) && (
                                     <div className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
                                        <p className="mt-2 text-muted-foreground">Processing Payment...</p>
                                     </div>
                                )}

                                <div style={{ display: isProcessing ? 'none' : 'block' }}>
                                    <PayPalButtons
                                        style={{ layout: "vertical", label: "pay" }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={onError}
                                        disabled={isProcessing}
                                    />
                                </div>

                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Payments are securely processed by PayPal. You can use your PayPal account or a debit/credit card.
                                </p>
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
        </AnimateIn>
    );
}
