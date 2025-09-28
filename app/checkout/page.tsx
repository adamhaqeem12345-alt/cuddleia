
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { PayPalButtons, OnApproveData, CreateOrderData } from "@paypal/react-paypal-js";
import { AnimateIn } from '@/components/animate-in';
import { Loader2, AlertTriangle, Lock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
    const { cart, getPrice, isCartReady } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const subtotalPrice = getPrice(subtotal);
    const totalValue = (subtotal / 100).toFixed(2); // The total value as a string with two decimals

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

    const createOrder = (data: CreateOrderData, actions: any) => {
        console.log("CHECKOUT PAGE: createOrder triggered. Creating order on client-side.");
        setError(null);
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: totalValue,
                    currency_code: 'USD'
                }
            }],
            application_context: {
                brand_name: "Cuddleia",
                shipping_preference: "NO_SHIPPING"
            }
        });
    };

    const onApprove = async (data: OnApproveData, actions: any) => {
        console.log("CHECKOUT PAGE: onApprove triggered. Capturing order...", data);
        setLoading(true);
        setError(null);
        try {
            // This captures the funds from the transaction.
            const details = await actions.order.capture();
            console.log("CHECKOUT PAGE: onApprove capture successful. Full details:", details);
            
            // Now, we can optionally call our server to record the transaction and send emails.
            const res = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });
            const serverResponse = await res.json();
             console.log("CHECKOUT PAGE: Server capture response:", serverResponse);

            if (res.ok) {
                console.log("CHECKOUT PAGE: onApprove success! Redirecting to thank you page.");
                window.location.href = `/thank-you?token=${data.orderID}`;
            } else {
                 const errorMessage = serverResponse.details || serverResponse.error || "Payment was approved, but server failed to finalize order.";
                 throw new Error(errorMessage);
            }
        } catch (err: any) {
            console.error("CHECKOUT PAGE: CATCH BLOCK in onApprove.", err);
            setError(`Payment failed or could not be finalized: ${err.message}`);
            setLoading(false);
        }
    };
    
    const onError = (err: any) => {
        console.error("CHECKOUT PAGE: PayPalButtons onError was triggered.", err);
        const message = err.message || "An unexpected error occurred with PayPal. Please try refreshing the page.";
        setError(message);
    };

    return (
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
                            <p className="mt-2 text-sm text-muted-foreground">Please do not close this window.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-destructive/10 text-destructive-foreground border border-destructive/20 rounded-lg p-4 text-center my-4">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h3 className="font-bold text-destructive">Payment Error</h3>
                            </div>
                            <p className="text-sm mt-2">{error}</p>
                            <Button variant="link" onClick={() => window.location.reload()} className="mt-2 text-destructive-foreground underline">
                                Please try refreshing the page.
                            </Button>
                        </div>
                    )}

                    {!loading && (
                         <div style={{ display: error ? 'none' : 'block' }}>
                            <p className="text-center text-xs text-muted-foreground mb-4">Choose your preferred payment method:</p>
                            <PayPalButtons
                                style={{ layout: "vertical", label: "pay" }}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                                forceReRender={[cart]} // Re-render buttons if cart changes
                            />
                        </div>
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
    );
}
