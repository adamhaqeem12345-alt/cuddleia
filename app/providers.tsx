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
  
  return (
    <PayPalScriptProvider options={initialOptions}>
      <CartProvider>
          {children}
      </CartProvider>
    </PayPalScriptProvider>
  );
}
