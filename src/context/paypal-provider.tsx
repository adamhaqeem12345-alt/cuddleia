'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface PayPalProviderProps {
    children: ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
    if (!PAYPAL_CLIENT_ID) {
        console.error("PayPal Client ID is not configured. PayPal buttons will not load.");
        return (
            <div className="text-center text-destructive">
                PayPal is not configured. Payment processing is unavailable.
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            {children}
        </PayPalScriptProvider>
    );
}
