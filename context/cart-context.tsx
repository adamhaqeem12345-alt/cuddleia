
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
  getPrice: (price: number) => Price;
  isCartReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getInitialCart = (): CartItem[] => {
  // This function only runs on the client-side
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem('cuddleia-cart');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.warn('Error reading localStorage cart', error);
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart());
  const [isCartReady, setIsCartReady] = useState(false);

  // This effect runs once on the client to confirm cart is loaded.
  useEffect(() => {
    setIsCartReady(true);
  }, []);

  // This effect runs whenever the cart changes, to save it to localStorage.
  useEffect(() => {
    // Only save to localStorage on the client-side
    if (typeof window !== 'undefined' && isCartReady) {
      window.localStorage.setItem('cuddleia-cart', JSON.stringify(cart));
    }
  }, [cart, isCartReady]);
  
  const getPrice = (price: number): Price => {
    const usdPrice = price;
    const myrPrice = price * USD_TO_MYR_RATE;
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
