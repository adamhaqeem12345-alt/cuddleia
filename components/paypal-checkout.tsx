
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

// Define the structure of the PayPal script options
interface PayPalScriptOptions {
    'client-id': string;
    currency: string;
    intent: string;
}

// Define the structure for the data object in PayPal actions
interface CreateOrderData {
    // Define any expected properties if needed, otherwise keep as is
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
            const options: PayPalScriptOptions = {
                'client-id': PAYPAL_CLIENT_ID!,
                currency: 'USD',
                intent: 'capture',
            };
            
            const params = new URLSearchParams(options as any);
            script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
            script.type = 'text/javascript';
            script.async = true;

            script.onload = () => {
                setScriptLoaded(true);
            };
            script.onerror = () => {
                setError("Failed to load the PayPal script. Please refresh the page and try again.");
            };
            document.body.appendChild(script);
        };

        if (!(window as any).paypal) {
            addPayPalScript();
        } else {
            setScriptLoaded(true);
        }
    }, [PAYPAL_CLIENT_ID]);

    useEffect(() => {
        if (scriptLoaded && paypalRef.current) {
            if (!PAYPAL_CLIENT_ID) {
                setError("PayPal environment variables are not set.");
                return;
            }

            try {
                (window as any).paypal.Buttons({
                    // Style the buttons
                     style: {
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 55,
                    },

                    // Call your server to set up the transaction
                    createOrder: async (data: CreateOrderData, actions: CreateOrderActions) => {
                        try {
                            const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cart }),
                            });
                            const order = await res.json();
                            if (order.id) {
                                return order.id;
                            } else {
                                const errorText = order.error || 'Could not create order.';
                                setError(errorText);
                                throw new Error(errorText);
                            }
                        } catch (err: any) {
                             setError(err.message || 'An error occurred while creating the order.');
                             throw err;
                        }
                    },

                    // Call your server to finalize the transaction
                    onApprove: async (data: OnApproveData, actions: OnApproveActions) => {
                         setIsProcessing(true);
                         setError(null);
                        try {
                            const res = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderID: data.orderID }),
                            });

                            const details = await res.json();

                            if (res.ok && details.status === 'COMPLETED') {
                                router.push(`/thank-you?token=${data.orderID}`);
                            } else {
                                const errorText = details.error || 'Payment failed or was not completed.';
                                setError(errorText);
                            }
                        } catch (err: any) {
                             setError(err.message || 'An error occurred while capturing the order.');
                        } finally {
                             setIsProcessing(false);
                        }
                    },
                    
                    onError: (err: any) => {
                        console.error('PayPal Buttons onError:', err);
                        // Check for specific cancellation signals if the SDK provides them
                        // For now, we show a generic error but don't prevent retries.
                        setError("An error occurred with the PayPal transaction. Please try again.");
                    },

                    onCancel: (data: any) => {
                        console.log('PayPal payment cancelled:', data);
                        // User cancelled the payment. No error state needed.
                        // The user can simply click the button again.
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
    
    if (isProcessing) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="mt-2 font-semibold text-foreground">Processing your payment...</p>
                <p className="text-sm text-muted-foreground">Please do not close this window.</p>
            </div>
        );
    }


    return (
        <div>
            {!scriptLoaded && !error && (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="ml-2 font-semibold">Loading payment options...</p>
                </div>
            )}
            <div ref={paypalRef} className={scriptLoaded ? 'block' : 'hidden'}></div>
        </div>
    );
}
