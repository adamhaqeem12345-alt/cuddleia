'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { PayPalButtons, OnApproveData, OnApproveActions } from "@paypal/react-paypal-js";
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';

export default function CheckoutPage() {
    const { cart, getPrice, clearCart, isCartReady } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const subtotalPrice = getPrice(subtotal);

    useEffect(() => {
        // Redirect to cart if it's empty after it has loaded
        if (isCartReady && cart.length === 0) {
            router.replace('/cart');
        }
    }, [cart, isCartReady, router]);

    const createOrder = async (): Promise<string> => {
        setIsProcessing(true);
        setError(null);
        try {
            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create PayPal order.');
            }
            return data.orderId;
        } catch (err: any) {
            console.error('Create Order Error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setIsProcessing(false);
            throw err; // Propagate error to PayPal SDK
        }
    };

    const onApprove = async (data: OnApproveData, actions: OnApproveActions): Promise<void> => {
        setIsProcessing(true);
        setError(null);
        if (!actions.order) {
            setError("Something went wrong with the PayPal flow. Please try again.");
            setIsProcessing(false);
            return;
        }

        try {
            const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Payment capture failed. Please contact support.');
            }

            // Payment was successful
            clearCart();
            router.push(`/checkout/success?orderId=${data.orderID}`);

        } catch (err: any) {
            console.error('Capture Order Error:', err);
            setError(err.message);
            setIsProcessing(false);
        }
    };
    
    const onPaymentError = (err: any) => {
        console.error('PayPal Button Error:', err);
        setError('An error occurred with the PayPal payment. Please check your details and try again.');
        setIsProcessing(false);
    };

    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Preparing Your Checkout...</p>
            </div>
        );
    }
    
    if (cart.length === 0) {
        // This is a fallback while redirecting
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <p className="text-lg text-muted-foreground">Your cart is empty. Redirecting...</p>
            </div>
        )
    }

    return (
        <AnimateIn>
            <div className="bg-rose-50/20">
                <div className="container mx-auto px-4 py-16 sm:py-24">
                     <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                             <h1 className="font-headline text-5xl font-bold text-foreground">
                                Complete Your Order
                            </h1>
                            <p className="mt-3 text-lg text-muted-foreground">
                                You're just a few clicks away from your cozy digital goods.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                            {/* Order Summary */}
                            <div className="bg-background/80 p-8 rounded-2xl border shadow-sm order-last lg:order-first">
                                <h2 className="text-2xl font-headline font-semibold text-foreground border-b pb-4 mb-6">Your Order</h2>
                                <div className="space-y-4 mb-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover" />
                                            <div>
                                                <p className="font-semibold text-foreground">{item.name} <span className="text-sm text-muted-foreground">x{item.quantity}</span></p>
                                                <p className="text-sm text-primary font-medium">{getPrice(item.price).usd.formatted}</p>
                                            </div>
                                        </div>
                                         <p className="font-semibold text-foreground">{getPrice(item.price * item.quantity).usd.formatted}</p>
                                    </div>
                                ))}
                                </div>
                                <div className="border-t pt-6 space-y-4 text-lg">
                                    <div className="flex items-center justify-between font-bold">
                                        <p>Order Total (USD)</p>
                                        <p>{subtotalPrice.usd.formatted}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground text-base">
                                        <p>Approximate (MYR)</p>
                                        <p>{subtotalPrice.myr.formatted}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Section */}
                            <div className="flex flex-col items-center justify-center p-8">
                                {isProcessing ? (
                                    <div className="text-center">
                                        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                                        <p className="mt-4 text-lg text-muted-foreground font-semibold">Verifying Your Payment...</p>
                                        <p className="text-sm text-muted-foreground mt-2">Please do not close this window or refresh the page.</p>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                         {error && (
                                            <div className="mb-6 bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium">{error}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-center text-muted-foreground mb-6">Please choose your preferred payment method below. You will be able to pay with your PayPal balance or a debit/credit card.</p>
                                        
                                        <div className="w-full">
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: 'rect', label: 'pay', height: 55 }}
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                onError={onPaymentError}
                                                disabled={isProcessing}
                                            />
                                        </div>

                                        <div className="mt-8 text-center">
                                            <Button asChild variant="ghost">
                                                <Link href="/cart">
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Return to Cart
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimateIn>
    );
}
