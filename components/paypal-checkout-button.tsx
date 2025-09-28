
'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalButtonsComponent() {

  if (!PAYPAL_CLIENT_ID) {
    console.error("PayPal Client ID is not configured. Checkout will not be available.");
    return <div className="text-center text-red-500 font-semibold">Checkout is currently unavailable.</div>;
  }
  
  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
        <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
            const res = await fetch("/api/paypal/create-order", { method: "POST" });
            const data = await res.json();
            return data.id; // 🔑 this must be only the string order ID
        }}
        onApprove={async (data) => {
            const res = await fetch(`/api/paypal/capture-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID })
            });
            const details = await res.json();
            // This is where you would handle the post-purchase flow,
            // like redirecting to a thank you page.
            // For now, we'll just alert.
            alert("Transaction completed by " + details.payer.name.given_name);
        }}
        />
    </PayPalScriptProvider>
  );
}
