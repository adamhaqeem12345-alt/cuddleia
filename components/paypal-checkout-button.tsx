
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';
import { useCart } from '@/context/cart-context';
import { Loader2 } from 'lucide-react';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalButtonsComponent() {
  const { cart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!PAYPAL_CLIENT_ID) {
    console.error("PayPal Client ID is not configured. Checkout will not be available.");
    return <div className="text-center text-red-500 font-semibold">Checkout is currently unavailable.</div>;
  }
  
  if (isProcessing) {
      return (
        <div className="flex items-center justify-center w-full bg-muted/80 p-2 rounded-lg">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Processing your order...</span>
        </div>
      )
  }

  const createOrder = async (data: CreateOrderData, actions: any) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart }),
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Failed to create order.");
      }

      // The create-order route now returns { id: "ORDER_ID" }
      return order.id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Could not initiate checkout. ${message}`);
      setIsProcessing(false);
      return Promise.reject(error);
    }
  };

  const onApprove = async (data: OnApproveData, actions: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const orderDetails = await response.json();

       if (!response.ok) {
        throw new Error(orderDetails.error || "Failed to capture order.");
      }
      
      console.log('Order captured successfully:', orderDetails);
      // Redirect to thank you page. PayPal's return_url also handles this, but this is a reliable fallback.
      router.push(`/thank-you?token=${data.orderID}&PayerID=${data.payerID}`);

    } catch (error) {
      console.error("Error capturing PayPal order:", error);
       const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Payment failed. ${message}`);
      setIsProcessing(false);
    }
  };

   const onError = (err: any) => {
    console.error("PayPal button error:", err);
    setErrorMessage("An error occurred with PayPal. Please try again.");
    setIsProcessing(false);
  };

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      {errorMessage && (
        <div className="text-center text-red-500 text-sm mb-2 p-2 bg-red-50 rounded-md">
            {errorMessage}
        </div>
      )}
      <PayPalButtons
        style={{ layout: 'horizontal', tagline: false, height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={isProcessing}
        forceReRender={[cart]}
      />
    </PayPalScriptProvider>
  );
}
