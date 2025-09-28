
'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from '@/context/cart-context';


const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalButtonsComponent() {
    const { cart } = useCart();

  if (!PAYPAL_CLIENT_ID) {
    console.error("PayPal Client ID is not configured. Checkout will not be available.");
    return <div className="text-center text-red-500 font-semibold">Checkout is currently unavailable.</div>;
  }
  
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
        <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={async () => {
                const res = await fetch("/api/paypal/create-order", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ cartItems: cart }),
                });
                const data = await res.json();
                if (!res.ok) {
                    console.error("Failed to create order:", data);
                    alert("There was an error creating your order. Please try again.");
                    return Promise.reject(new Error("Failed to create order"));
                }
                return data.id;
            }}
            onApprove={async (data) => {
                try {
                    const res = await fetch(`/api/paypal/capture-order`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderID: data.orderID })
                    });
                    const details = await res.json();
                    
                    if (res.ok && details.status === "COMPLETED") {
                        // Redirect on success, passing PayPal token for confirmation
                        window.location.href = `/thank-you?token=${data.orderID}&PayerID=${data.payerID}`;
                    } else {
                         throw new Error(details.error || "Payment could not be completed.");
                    }
                } catch (error) {
                    console.error("onApprove error:", error);
                    alert(`An error occurred during payment. Please try again or contact support. Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
