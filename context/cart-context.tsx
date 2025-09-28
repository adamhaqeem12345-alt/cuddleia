
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { USD_TO_MYR_RATE } from '@/lib/currency';

interface Price {
    usd: { formatted: string; raw: number };
    myr: { formatted: string; raw: number };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId:string, quantity: number) => void;
  clearCart: () => void;
  getPrice: (priceInCents: number) => Price;
  isCartReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  // Load cart from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('cuddleia-cart');
      if (item) {
        setCart(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage cart', error);
    } finally {
      setIsCartReady(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isCartReady) {
      try {
        window.localStorage.setItem('cuddleia-cart', JSON.stringify(cart));
      } catch (error) {
        console.warn('Error writing to localStorage cart', error);
      }
    }
  }, [cart, isCartReady]);
  
  const getPrice = (priceInCents: number): Price => {
    const usdPrice = priceInCents / 100;
    const myrPrice = usdPrice * USD_TO_MYR_RATE;
    return {
        usd: {
            formatted: `$${usdPrice.toFixed(2)} USD`,
            raw: usdPrice
        },
        myr: {
            formatted: `RM${myrPrice.toFixed(2)}`,
            raw: myrPrice
        }
    };
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getPrice, isCartReady }}>
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
