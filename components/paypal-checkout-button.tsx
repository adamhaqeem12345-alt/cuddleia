
'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from '@/context/cart-context';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalButtonsComponent() {
    const { cart } = useCart();

  if (!PAYPAL_CLIENT_ID) {
    console.error("PayPal Client ID is not configured. Checkout will not be available. Make sure NEXT_PUBLIC_PAYPAL_CLIENT_ID is set in your environment.");
    return <div className="text-center text-red-500 font-semibold">Checkout is currently unavailable.</div>;
  }
  
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
        <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={async () => {
                try {
                    const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cartItems: cart }),
                    });
                    
                    const data = await res.json();
                    
                    if (!res.ok) {
                        throw new Error(data.error || "Failed to create order");
                    }

                    if (!data.id) {
                         throw new Error("Received invalid data from create-order API");
                    }

                    return data.id;
                } catch (error) {
                    console.error("PayPal createOrder error:", error);
                    alert(`Could not initiate PayPal Checkout. \n\nDetails: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    return Promise.reject(error);
                }
            }}
            onApprove={async (data) => {
                try {
                    const res = await fetch(`/api/paypal/capture-order`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderID: data.orderID })
                    });
                    
                    const details = await res.json();
                    
                    console.log("Full capture response on client:", JSON.stringify(details, null, 2));
                    
                    if (res.ok && details.status === "COMPLETED") {
                        window.location.href = `/thank-you?token=${data.orderID}&PayerID=${data.payerID}`;
                    } else {
                         throw new Error(details.error || "Payment could not be completed.");
                    }
                } catch (error) {
                    console.error("onApprove error:", error);
                    alert(`An error occurred during payment. Please try again or contact support. \n\nDetails: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }}
            onError={(err) => {
                console.error("PayPal Buttons Error:", err);
                alert("An error occurred with the PayPal buttons. Please reload the page and try again.");
            }}
        />
    </PayPalScriptProvider>
  );
}
