
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

declare global {
    interface Window {
        paypal: any;
    }
}

interface CreateOrderActions {
    order: {
        create: (options: any) => Promise<string>;
    };
}

interface OnApproveData {
    orderID: string;
}

interface OnApproveActions {
    order: {
        capture: () => Promise<any>;
    };
}

export function PayPalCheckout() {
    const { cart } = useCart();
    const router = useRouter();
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const paypalRef = useRef<HTMLDivElement>(null);

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    useEffect(() => {
        if (!PAYPAL_CLIENT_ID) {
            setError("PayPal Client ID is not configured.");
            return;
        }

        const addPayPalScript = () => {
            const script = document.createElement('script');
            const params = new URLSearchParams({
                'client-id': PAYPAL_CLIENT_ID!,
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
                    createOrder: async () => {
                        setError(null);
                        try {
                            const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cart }),
                            });

                            const orderData = await res.json();
                            
                            if (!res.ok) {
                                throw new Error(orderData.error || 'Failed to create order.');
                            }

                            return orderData.id;
                        } catch (err: any) {
                            console.error("CREATE_ORDER_ERROR:", err);
                            setError(err.message || "An error occurred while creating the order.");
                            throw err; // Propagate error to PayPal SDK
                        }
                    },
                    onApprove: async (data: OnApproveData) => {
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
                         } finally {
                            setIsProcessing(false);
                         }
                    },
                    onError: (err: any) => {
                        console.error('PayPal Buttons onError:', err);
                        setError("An unexpected error occurred with PayPal. Please try again.");
                    },
                    onCancel: () => {
                        console.log('PayPal payment cancelled.');
                    }
                }).render(paypalRef.current);
            } catch (err: any) {
                 setError("Failed to render PayPal buttons. Please try refreshing the page.");
                 console.error("PayPal Buttons render error:", err);
            }
        }
    }, [scriptLoaded, cart, router, PAYPAL_CLIENT_ID]);

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
            <div className="flex flex-col items-center justify-center text-center p-4 h-[55px]">
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
        <div>
            {!scriptLoaded && !error && (
                <div className="flex items-center justify-center h-[55px] bg-gray-200 rounded-md">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            )}
            <div ref={paypalRef} style={{ display: scriptLoaded && !isProcessing ? 'block' : 'none' }}></div>
        </div>
    );
}
