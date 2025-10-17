'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [paypalClientId, setPaypalClientId] = useState("sb");
    
    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        
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
