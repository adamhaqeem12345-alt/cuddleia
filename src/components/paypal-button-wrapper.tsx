'use client';

import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/context/cart-context';
import { PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';

export function PayPalButtonWrapper() {
  const { cartTotal, clearCart } = useContext(CartContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const createOrder = (data: CreateOrderData, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: cartTotal.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    return actions.order.capture().then((details: any) => {
      alert('Transaction completed by ' + details.payer.name.given_name);
      // Here you would typically handle the digital product delivery,
      // e.g., by sending an email with download links.
      clearCart();
    });
  };

  const onError = (err: any) => {
    console.error("PayPal Checkout onError", err);
    alert('An error occurred during the checkout process. Please try again.');
  };

  if (!isClient || cartTotal <= 0) {
    return null; // Render nothing on the server or if cart is empty
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
}
