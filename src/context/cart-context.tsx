
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/lib/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  discountCode: string;
  appliedDiscount: number;
  discountMessage: { success?: string; error?: string };
  applyDiscount: (code: string) => void;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState<{ success?: string; error?: string }>({});

  const loadFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedDiscountCode = localStorage.getItem('discountCode');
      if (savedDiscountCode) setDiscountCode(savedDiscountCode);

      const savedAppliedDiscount = localStorage.getItem('appliedDiscount');
      if (savedAppliedDiscount) setAppliedDiscount(JSON.parse(savedAppliedDiscount));

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
    setIsInitialLoad(false);
  };

  // Load state from localStorage on initial client-side render
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('discountCode', discountCode);
      localStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
    }
  }, [cart, discountCode, appliedDiscount, isInitialLoad]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setAppliedDiscount(0);
    setDiscountMessage({});
    localStorage.removeItem('cart');
    localStorage.removeItem('discountCode');
    localStorage.removeItem('appliedDiscount');
  }

  const applyDiscount = (code: string) => {
    setDiscountMessage({});
    if (code.toUpperCase() === 'CUDDLE10') {
      setAppliedDiscount(0.10);
      setDiscountCode(code);
      setDiscountMessage({ success: 'Discount code applied! You get 10% off.' });
    } else {
      setAppliedDiscount(0);
      setDiscountCode('');
      setDiscountMessage({ error: 'Invalid discount code. Please try again.' });
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(0);
    setDiscountCode('');
    setDiscountMessage({});
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, discountCode, appliedDiscount, discountMessage, applyDiscount, removeDiscount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
