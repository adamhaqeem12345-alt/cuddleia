'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/context/cart-context';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export function Providers({ children }: { children: ReactNode }) {
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  };
  
  // This check prevents rendering the provider on the server or if the client ID is missing.
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    // You can render a loading state or an error message here.
    // This helps debug if the environment variable is not set.
    return (
        <CartProvider>
            {children}
        </CartProvider>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <CartProvider>
          {children}
      </CartProvider>
    </PayPalScriptProvider>
  );
}
