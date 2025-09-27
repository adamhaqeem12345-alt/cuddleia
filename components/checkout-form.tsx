'use client';

import { useState, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from '@/context/cart-context';
import type { OnApproveData, CreateOrderData } from '@paypal/paypal-js';
import { Loader2 } from 'lucide-react';

export function CheckoutForm() {
    const { cart, clearCart } = useCart();
    const [orderID, setOrderID] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(true);

    useEffect(() => {
        if (cart.length > 0) {
            setError(null);
            setIsCreating(true);
            fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Failed to create order'); });
                }
                return res.json();
            })
            .then(order => {
                setOrderID(order.id);
            })
            .catch(err => {
                console.error("Failed to create PayPal order:", err);
                setError(err.message || "Could not connect to PayPal. Please try again.");
            })
            .finally(() => {
                setIsCreating(false);
            });
        }
    }, [cart]);


    const onApprove = async (data: OnApproveData): Promise<void> => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            const capturedData = await response.json();
            if (!response.ok) {
                throw new Error(capturedData.error || 'Failed to capture payment.');
            }
            clearCart();
            window.location.href = `/checkout/success?orderId=${capturedData.id}`;
        } catch (err: any) {
            console.error("OnApprove Error:", err);
            setError(err.message || 'An error occurred while finalizing your payment.');
        }
    };
    
    const onError = (err: any) => {
        console.error("PayPal Buttons Error:", err);
        setError('An error occurred with your payment. Please try again or contact support.');
    };

    if (isCreating) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-semibold">Connecting to PayPal...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-destructive font-medium p-4">{error}</div>
    }

    if (!orderID) {
        return <div className="text-center text-muted-foreground font-medium p-4">Could not load payment options.</div>
    }

    return (
        <PayPalButtons
            key={orderID} // This is CRITICAL to force re-render on orderID change
            createOrder={(data, actions) => {
                return orderID; // The order is already created, just return the ID
            }}
            onApprove={onApprove}
            onError={onError}
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        />
    );
}