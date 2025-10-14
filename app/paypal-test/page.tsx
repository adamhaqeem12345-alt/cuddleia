// THIS IS A TEMPORARY DIAGNOSTIC FILE.
'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// IMPORTANT: Replace this with your actual PayPal Client ID for testing.
// This is being hardcoded to eliminate any possibility of environment variable issues during this test.
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

export default function PayPalTestPage() {
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === "test") {
        return (
            <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>
                <h1>PayPal Client ID is Missing</h1>
                <p>Please ensure your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in your `.env.local` file.</p>
            </div>
        )
    }

  return (
    <html>
      <head>
        <title>PayPal Test</title>
      </head>
      <body style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>PayPal Button Test Page</h1>
        <p>This page is isolated from the main app layout and styles to test the PayPal button rendering.</p>
        <div style={{ maxWidth: '750px', minHeight: '200px', marginTop: '40px' }}>
          <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
            <PayPalButtons
              style={{ layout: 'vertical' }}
              createOrder={async (data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '1.00', // Test amount
                    },
                  }],
                });
              }}
              onApprove={async (data, actions) => {
                alert('Transaction approved! Order ID: ' + data.orderID);
              }}
              onError={(err) => {
                console.error('PayPal Error:', err);
                alert('An error occurred with PayPal.');
              }}
            />
          </PayPalScriptProvider>
        </div>
      </body>
    </html>
  );
}
