
'use client';

import { PayPalButtons, PayPalScriptProvider, OnApproveData, CreateOrderData } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { Button } from "./ui/button";

interface PaypalCheckoutProps {
    total: number;
    items: Product[];
    customerName: string;
    customerEmail: string;
    orderId: string;
    disabled?: boolean;
}

export function PaypalCheckout({ total, items, customerName, customerEmail, orderId, disabled = false }: PaypalCheckoutProps) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!PAYPAL_CLIENT_ID) {
        return <div className="text-destructive text-center">PayPal Client ID not configured.</div>;
    }

    const createOrder = async (data: CreateOrderData) => {
        setError(null);
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    total: total.toFixed(2),
                    items,
                    orderId,
                }),
            });
            const order = await response.json();

            if (!response.ok) {
                throw new Error(order.error || "Failed to create order.");
            }
            
            return order.id;
        } catch (err: any) {
            console.error("Create Order Error:", err);
            setError(err.message);
            throw err; // Re-throw to let PayPal SDK handle it
        }
    };

    const onApprove = async (data: OnApproveData) => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderID: data.orderID,
                    customerName,
                    customerEmail,
                    items,
                }),
            });
            
            const capturedOrder = await response.json();

            if (!response.ok) {
                 throw new Error(capturedOrder.error || 'Failed to capture payment.');
            }
            
            // Payment successful, redirect to success page
            router.push('/checkout/success');
        } catch (err: any) {
            console.error("Capture Order Error:", err);
            setError(err.message);
            throw err; // Re-throw to let PayPal SDK handle it
        }
    };

    const onError = (err: any) => {
        console.error("PayPal Button Error:", err);
        setError("An error occurred with the PayPal transaction. Please try again or use a different payment method.");
    };

    // Custom button styles to match the desired look
    const customStyle: any = {
        label: 'pay',
        color: 'white', // This will be overridden by the custom class
        shape: 'rect',
        layout: 'vertical',
    };
    
    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            {error && <p className="text-destructive text-sm text-center mb-2">{error}</p>}
            <PayPalButtons
                style={customStyle}
                className="paypal-buttons-container"
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                disabled={disabled}
            />
            <style jsx global>{`
                .paypal-buttons-container .paypal-button {
                    background-color: #ffc439 !important; /* PayPal Gold */
                    border-radius: 0.5rem !important;
                }
                .paypal-buttons-container .paypal-button:hover {
                    filter: brightness(1.05);
                }
                .paypal-buttons-container .paypal-button-label-container {
                    color: #003087 !important; /* PayPal Blue */
                }
                .paypal-buttons-container .paypal-button-color-white:nth-child(2) {
                    background: #f0f0f0 !important; /* Custom color for Debit/Credit */
                    border: 1px solid #e0e0e0;
                }
                 .paypal-buttons-container .paypal-button-color-white:nth-child(2) .paypal-button-label-container {
                    color: #5a5a5a !important;
                }
            `}</style>
        </PayPalScriptProvider>
    );
}
