
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { PayPalButtons } from "@paypal/react-paypal-js";
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
        console.log("CHECKOUT PAGE: createOrderHandler triggered. Calling API...");
        setError(null);
        try {
            const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItems: cart }),
            });
            
            const data = await res.json();
            
            console.log("CHECKOUT PAGE: Response from /api/paypal/create-order:", data);

            if (res.ok && data.id) {
                console.log("CHECKOUT PAGE: createOrder API call successful. Order ID:", data.id);
                return data.id;
            } else {
                const errorDetails = data.details || data.error || "Unknown error from server.";
                console.error("CHECKOUT PAGE: createOrder API call failed.", errorDetails);
                setError(`Failed to create transaction: ${errorDetails}`);
                throw new Error(errorDetails);
            }
        } catch (err: any) {
            console.error("CHECKOUT PAGE: CATCH BLOCK in createOrderHandler.", err);
            setError(`Failed to create transaction: ${err.message}`);
            // This throw is important for PayPal to know the order creation failed and to show its own error UI.
            throw err; 
        }
    };

    const onApproveHandler = async (data: any) => {
        console.log("CHECKOUT PAGE: onApproveHandler triggered. Capturing order...", data);
        setLoading(true); // Show a loading spinner
        setError(null);
        try {
            const res = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });
            const details = await res.json();
            
            // Log the full capture details
            console.log("CHECKOUT PAGE: onApprove capture API response:", details);

            if (res.ok && details.status === "COMPLETED") {
                console.log("CHECKOUT PAGE: onApprove success! Redirecting to thank you page.");
                // Redirect to a thank you page on successful capture, passing the PayPal Order ID as a token
                window.location.href = `/thank-you?token=${details.id}`;
            } else {
                const errorMessage = details.details || details.error || "Payment could not be completed.";
                console.error("CHECKOUT PAGE: onApprove capture was not completed.", errorMessage);
                throw new Error(errorMessage);
            }
        } catch (err: any) {
            console.error("CHECKOUT PAGE: CATCH BLOCK in onApproveHandler.", err);
            setError(`Payment failed: ${err.message}`);
            setLoading(false); // Stop loading so the user can see the error
        }
    };
    
    const onErrorHandler = (err: any) => {
        // This handler catches errors from the PayPal SDK itself (e.g., pop-up failed to open)
        console.error("CHECKOUT PAGE: PayPalButtons onErrorHandler was triggered.", JSON.stringify(err, null, 2));
        setError("An unexpected error occurred with the PayPal button. Please try refreshing the page.");
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
                                createOrder={createOrderHandler}
                                onApprove={onApproveHandler}
                                onError={onErrorHandler}
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
