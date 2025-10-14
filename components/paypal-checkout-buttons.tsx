'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FC } from 'react';

interface PayPalCheckoutButtonsProps {
  isFormValid: boolean;
  isProcessing: boolean;
  total: number;
  onApprove: (orderID: string) => Promise<void>;
  onError: (err: any) => void;
}

const PayPalCheckoutButtons: FC<PayPalCheckoutButtonsProps> = ({
  isFormValid,
  isProcessing,
  total,
  onApprove,
  onError,
}) => {
  const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  if (!paypalClientID) {
    return <div className="text-center text-destructive">PayPal is not configured.</div>;
  }

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientID, currency: 'USD', intent: 'capture' }}>
      <PayPalButtons
        style={{ layout: 'vertical', label: 'pay' }}
        disabled={!isFormValid || total <= 0 || isProcessing}
        createOrder={async (data, actions) => {
          if (total <= 0) {
            onError(new Error('PayPal does not support payments of $0.00.'));
            return '';
          }
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total.toFixed(2),
                  currency_code: 'USD',
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          await onApprove(data.orderID);
        }}
        onError={(err) => {
          console.error('PayPal Error:', err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckoutButtons;
