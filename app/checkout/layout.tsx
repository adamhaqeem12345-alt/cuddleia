
'use client';

import { PayPalProvider } from '@/context/paypal-provider';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PayPalProvider>{children}</PayPalProvider>;
}
