'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { PayPalButtons, OnApproveData, OnApproveActions } from '@paypal/react-paypal-js';

export function CheckoutForm() {
    const { cart, clearCart } = useCart();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const createOrder = async (): Promise<string> => {
        try {
            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            });
            const order = await res.json();
            if (!res.ok) {
                throw new Error(order.error || 'Failed to create PayPal order.');
            }
            return order.id;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const onApprove = async (data: OnApproveData, actions: OnApproveActions): Promise<void> => {
        try {
            const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
            });

            const orderDetails = await res.json();
            if (!res.ok) {
                 throw new Error(orderDetails.error || 'Failed to capture order.');
            }
            
            // Payment was successful
            clearCart();
            router.push(`/checkout/success?orderId=${data.orderID}`);

        } catch (err: any) {
            setError(err.message);
            // The PayPal buttons have their own error display, but we can log it too
            console.error('Capture Error:', err);
        }
    };
    
    const onError = (err: any) => {
        // This function is called by PayPal if there's an error during the transaction
        setError('An error occurred during the transaction. Please try again.');
        console.error('PayPal Transaction Error:', err);
    };


    return (
        <div className="w-full">
            {error && <div className="text-center text-destructive font-medium p-4 mb-4 bg-destructive/10 rounded-lg">{error}</div>}
            
            <div className="mt-4">
                <PayPalButtons
                    style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay',
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    disabled={cart.length === 0}
                />
            </div>
        </div>
    );
}
