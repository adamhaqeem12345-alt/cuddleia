'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [paypalClientId, setPaypalClientId] = useState("sb");
    
    useEffect(() => {
        const apiEnv = process.env.NEXT_PUBLIC_PAYPAL_API_ENV || 'sandbox';
        const clientId = apiEnv === 'sandbox' 
            ? process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID
            : process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID;
        
        if (clientId) {
            setPaypalClientId(clientId);
        }
    }, []);

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}
