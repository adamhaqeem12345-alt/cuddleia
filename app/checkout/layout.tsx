
'use client';

import { PayPalProvider } from '@/src/context/paypal-provider';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PayPalProvider>{children}</PayPalProvider>;
}
