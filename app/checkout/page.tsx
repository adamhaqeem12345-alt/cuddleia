
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { AnimateIn } from '@/components/animate-in';
import { Loader2, AlertTriangle, Lock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PayPalProvider } from '@/src/context/paypal-provider';

export default function CheckoutPage() {
    const { cart, getPrice, isCartReady } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const subtotalPrice = getPrice(subtotal);

    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        )
    }
    
    if (cart.length === 0 && isCartReady) {
        return (
             <AnimateIn>
                <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
                    <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/50" />
                     <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mt-8 mb-4">
                        Your Cart is Empty
                    </h1>
                    <p className="text-center text-muted-foreground mb-12">
                        You can't proceed to checkout with an empty cart.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/products">
                           Go Shopping
                        </Link>
                    </Button>
                </div>
            </AnimateIn>
        )
    }

    const createOrderHandler = async () => {
        console.log("PayPalButtons: createOrder triggered. Calling API...");
        setError(null);
        try {
            const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItems: cart }),
            });
            const data = await res.json();
            if (!res.ok) {
                console.error("PayPalButtons: createOrder API call failed.", data);
                throw new Error(data.details || data.error || "Failed to create order.");
            }
            console.log("PayPalButtons: createOrder API call successful. Order ID:", data.id);
            return data.id;
        } catch (err: any) {
            console.error("PayPalButtons: createOrder handler threw an error.", err);
            setError(err.message);
            throw err; // Re-throw to inform PayPal an error occurred
        }
    };

    const onApproveHandler = async (data: any) => {
        console.log("PayPalButtons: onApprove triggered. Capturing order...", data);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });
            const details = await res.json();
            console.log("PayPalButtons: onApprove capture API response:", details);

            if (res.ok && details.status === "COMPLETED") {
                console.log("PayPalButtons: onApprove success! Redirecting to thank you page.");
                // Redirect to a thank you page on successful capture
                window.location.href = `/thank-you?token=${details.id}`;
            } else {
                 console.error("PayPalButtons: onApprove capture was not completed.", details);
                throw new Error(details.details || details.error || "Payment could not be completed.");
            }
        } catch (err: any) {
            console.error("PayPalButtons: onApprove handler threw an error.", err);
            setError(err.message);
            setLoading(false);
        }
    };
    
    const onErrorHandler = (err: any) => {
        console.error("PayPalButtons: An onError event was caught.", err);
        setError("An unexpected error occurred with PayPal. Please try again or contact support.");
    };

    return (
      <PayPalProvider>
        <AnimateIn>
            <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
                 <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Secure Checkout
                </h1>
                <p className="text-center text-muted-foreground mb-12">
                    Complete your purchase using PayPal or any major credit/debit card.
                </p>

                <div className="bg-accent/30 rounded-2xl p-6 lg:p-8">
                     <div className="space-y-4 mb-8">
                        <h2 className="font-headline text-2xl font-bold text-foreground border-b pb-4">Order Summary</h2>
                        {cart.map(item => (
                             <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-medium">{getPrice(item.price * item.quantity).usd.formatted}</span>
                            </div>
                        ))}
                         <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                            <span>Order Total</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                     </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="mt-4 text-lg text-muted-foreground">Processing your payment...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-destructive/20 text-destructive-foreground border border-destructive/50 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-bold">Payment Error</h3>
                            </div>
                            <p className="text-sm mt-2">{error}</p>
                            <Button variant="link" onClick={() => window.location.reload()} className="mt-2 text-destructive-foreground underline">
                                Please try again.
                            </Button>
                        </div>
                    )}

                    {!loading && !error && (
                         <>
                            <PayPalButtons
                                style={{ layout: "vertical" }}
                                createOrder={createOrderHandler}
                                onApprove={onApproveHandler}
                                onError={onErrorHandler}
                            />
                        </>
                    )}
                </div>
                 <div className="mt-8 text-center">
                    <Button asChild variant="ghost">
                        <Link href="/cart">
                           Back to Cart
                        </Link>
                    </Button>
                </div>
                 <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Secure payments processed by PayPal</span>
                </div>
            </div>
        </AnimateIn>
      </PayPalProvider>
    );
}
