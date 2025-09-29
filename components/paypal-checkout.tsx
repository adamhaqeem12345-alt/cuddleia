'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { CartItem } from '@/lib/types';

declare global {
    interface Window {
        paypal: any;
    }
}

interface OnApproveData {
    orderID: string;
}

export function PayPalCheckout() {
    const { cart } = useCart();
    const router = useRouter();
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isButtonReady, setIsButtonReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    
    const paypalRef = useRef<HTMLDivElement>(null);
    const interactionTimer = useRef<number | null>(null);
    const cartRef = useRef<CartItem[]>(cart);

    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    useEffect(() => {
        if (!PAYPAL_CLIENT_ID) {
            setError("PayPal Client ID is not configured.");
            return;
        }

        const addPayPalScript = () => {
            const script = document.createElement('script');
            const params = new URLSearchParams({
                'client-id': PAYPAL_CLIENT_ID,
                'currency': 'USD',
                'intent': 'capture',
            });
            script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
            script.type = 'text/javascript';
            script.async = true;

            script.onload = () => setScriptLoaded(true);
            script.onerror = () => setError("Failed to load the PayPal script. Please refresh the page and try again.");
            document.body.appendChild(script);
        };

        if (window.paypal) {
            setScriptLoaded(true);
        } else {
            addPayPalScript();
        }

        return () => {
            if (interactionTimer.current) {
                clearTimeout(interactionTimer.current);
            }
        }
    }, [PAYPAL_CLIENT_ID]);

    useEffect(() => {
        if (scriptLoaded && paypalRef.current && paypalRef.current.childElementCount === 0) {
            try {
                window.paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 55,
                    },
                    onInit: () => {
                        setIsButtonReady(true);
                    },
                    onClick: () => {
                        setError(null);
                        setIsInteracting(true);
                        if (interactionTimer.current) clearTimeout(interactionTimer.current);
                        interactionTimer.current = window.setTimeout(() => {
                            setIsInteracting(false);
                        }, 3000);
                    },
                    createOrder: (_data: any, actions: any) => {
                        try {
                            const currentCart = cartRef.current;
                            const totalValue = currentCart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0).toFixed(2);
                            
                            if (parseFloat(totalValue) <= 0) {
                                setError("Cart total must be greater than zero.");
                                throw new Error("Invalid cart total.");
                            }

                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: totalValue,
                                        breakdown: {
                                            item_total: {
                                                currency_code: 'USD',
                                                value: totalValue,
                                            }
                                        }
                                    },
                                    items: currentCart.map(item => ({
                                        name: item.name,
                                        unit_amount: {
                                            currency_code: 'USD',
                                            value: (item.price / 100).toFixed(2),
                                        },
                                        quantity: item.quantity.toString()
                                    }))
                                }],
                                application_context: {
                                    shipping_preference: 'NO_SHIPPING'
                                }
                            });

                        } catch (err: any) {
                             console.error("CLIENT_CREATE_ORDER_ERROR:", err);
                             setError("An error occurred while preparing your order. Please check the cart and try again.");
                             setIsInteracting(false);
                             throw err;
                        }
                    },
                    onApprove: async (data: OnApproveData) => {
                         if (interactionTimer.current) clearTimeout(interactionTimer.current);
                         setIsInteracting(false);
                         setIsProcessing(true);
                         setError(null);
                         try {
                            const res = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderID: data.orderID }),
                            });

                            const details = await res.json();
                            
                            if (!res.ok) {
                                throw new Error(details.error || 'Payment failed or was not completed.');
                            }
                                
                            if (details.status === 'COMPLETED') {
                                router.push(`/thank-you?token=${data.orderID}`);
                            } else {
                                throw new Error('Payment not completed.');
                            }
                         } catch (err: any) {
                            console.error("CAPTURE_ORDER_ERROR:", err);
                            setError(err.message || 'An error occurred while capturing the order.');
                            setIsProcessing(false);
                         }
                    },
                    onError: (err: any) => {
                        console.error('PayPal Buttons onError:', err);
                        setError("An unexpected error occurred with PayPal. Please try again or contact support.");
                        if (interactionTimer.current) clearTimeout(interactionTimer.current);
                        setIsInteracting(false);
                        setIsProcessing(false);
                    },
                    onCancel: () => {
                        console.log('PayPal payment cancelled.');
                        if (interactionTimer.current) clearTimeout(interactionTimer.current);
                        setIsInteracting(false);
                        setIsProcessing(false);
                    }
                }).render(paypalRef.current);
            } catch (err: any) {
                 setError("Failed to render PayPal buttons. Please try refreshing the page.");
                 console.error("PayPal Buttons render error:", err);
            }
        }
    }, [scriptLoaded, router]);

    if (!PAYPAL_CLIENT_ID) {
         return (
            <div className="bg-destructive/10 text-destructive-foreground p-4 rounded-lg text-center">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive"/>
                <h3 className="font-bold text-destructive">Checkout Unavailable</h3>
              </div>
              <p className="text-sm mt-2">
                Payment system is not configured correctly.
              </p>
            </div>
        )
    }
    
    if (isProcessing) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-4 min-h-[120px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="mt-2 font-semibold text-foreground">Processing your payment...</p>
                <p className="text-sm text-muted-foreground">Please do not close this window.</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="bg-destructive/10 text-destructive-foreground p-4 rounded-lg text-center">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive"/>
                <h3 className="font-bold text-destructive">An Error Occurred</h3>
              </div>
              <p className="text-sm mt-2">
                {error}
              </p>
            </div>
        );
    }

    return (
        <div className="min-h-[120px]">
            { !isButtonReady && !isProcessing && (
                <div className="space-y-2 animate-pulse">
                    <div className="h-[55px] bg-muted/50 rounded-md"></div>
                    <div className="h-[55px] bg-muted/50 rounded-md"></div>
                </div>
            )}
            <div ref={paypalRef} style={{ opacity: isButtonReady ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}></div>
            {isInteracting && (
                <div className="flex items-center justify-center text-center mt-2">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin mr-2" />
                    <p className="text-sm text-muted-foreground">Opening secure payment form...</p>
                </div>
            )}
        </div>
    );
}
