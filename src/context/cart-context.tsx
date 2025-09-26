
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { USD_TO_MYR_RATE } from '@/lib/currency';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  getPrice: (price: number) => { formatted: string, raw: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('Other');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPrice = (price: number) => {
    if (!isClient) return { formatted: `$${price.toFixed(2)}`, raw: price };
    
    if (selectedCountry === 'MY') {
      const priceMYR = price * USD_TO_MYR_RATE;
      return { formatted: `RM${priceMYR.toFixed(2)}`, raw: priceMYR };
    }
    return { formatted: `$${price.toFixed(2)}`, raw: price };
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, selectedCountry, setSelectedCountry, getPrice }}>
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
