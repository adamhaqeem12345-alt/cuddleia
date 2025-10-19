'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children }: { children: React.ReactNode }) {
    // Use the environment variable if available, otherwise fall back to PayPal's "test" client ID
    // This ensures the buttons will always render for development and layout purposes.
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";
    
    if (paypalClientId === "test") {
      console.warn("PayPal Client ID is not set. Using 'test' ID. Payments will be in sandbox mode and not linked to your account.");
    }
    
    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}
