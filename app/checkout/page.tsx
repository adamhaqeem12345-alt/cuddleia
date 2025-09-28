
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
        console.log("CLIENT-SIDE: createOrder triggered. Creating order payload...");
        setError(null);

        const totalValue = (cart.reduce((acc, item) => acc + item.price * item.quantity, 0) / 100).toFixed(2);

        if (parseFloat(totalValue) <= 0) {
            setError("Cannot create an order with a total value of zero.");
            return Promise.reject(new Error("Cannot create an order with a total value of zero."));
        }

        console.log(`CLIENT-SIDE: Calculated total value: $${totalValue}`);
        
        const purchaseItems = cart.map(item => ({
            name: item.name,
            unit_amount: {
                currency_code: 'USD',
                value: (item.price / 100).toFixed(2)
            },
            quantity: item.quantity.toString(),
            sku: item.id,
            category: 'DIGITAL_GOODS'
        }));
        
        const purchase_units = [{
            amount: {
                currency_code: 'USD',
                value: totalValue,
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: totalValue
                    }
                }
            },
            items: purchaseItems
        }];
        
        console.log("CLIENT-SIDE: Full order payload:", JSON.stringify({ purchase_units }, null, 2));

        return actions.order.create({
            purchase_units,
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
            const details = await actions.order.capture();
            console.log("CHECKOUT PAGE: onApprove capture successful. Full details:", details);
            
            const res = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });
            
            if (!res.ok) {
                 const serverResponse = await res.json();
                 const errorMessage = serverResponse.details || serverResponse.error || "Payment was approved, but server failed to finalize order.";
                 throw new Error(errorMessage);
            }

            console.log("CHECKOUT PAGE: onApprove success! Redirecting to thank you page.");
            window.location.href = `/thank-you?token=${data.orderID}`;

        } catch (err: any) {
            console.error("CHECKOUT PAGE: CATCH BLOCK in onApprove.", err);
            const message = err.message || "Payment failed or could not be finalized.";
            setError(message);
            setLoading(false);
        }
    };
    
    const onCancel = () => {
        console.log("CHECKOUT PAGE: User cancelled the payment flow.");
        // We don't set an error here because this is a normal user action.
        // The user can simply click the PayPal button again if they wish.
    };

    const onError = (err: any) => {
        console.error("CHECKOUT PAGE: PayPalButtons onError was triggered.", err);

        // PayPal's SDK sometimes throws an error when the popup is closed.
        // We check for a specific string to avoid showing an error message on user cancellation.
        // This is a common pattern for handling the PayPal SDK's behavior.
        const isCancellation = err && err.message && err.message.includes('Window closed');
        
        if (isCancellation) {
            console.warn("CHECKOUT PAGE: Payment window was closed by the user. Treating as cancellation.");
            return; // Do not set an error state for cancellations
        }

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
                                onCancel={onCancel}
                                forceReRender={[cart, getPrice]} // Re-render if cart or total value changes
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
