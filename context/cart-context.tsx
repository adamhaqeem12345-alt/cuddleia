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

// Helper function to safely get initial cart state from localStorage
const getInitialCartState = (): CartItem[] => {
    // This function will only run on the client
    try {
        const storedCart = localStorage.getItem('cuddleia-cart');
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
    }
};


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    // This effect runs once on the client to load the cart from localStorage.
    // It sets the initial state and marks the cart as ready.
    setCart(getInitialCartState());
    setIsCartReady(true);
  }, []);

  useEffect(() => {
    // This effect runs whenever the cart changes, to save it to localStorage.
    // We only run this if the cart is ready, to avoid overwriting the stored cart
    // with an empty array on initial load.
    if (isCartReady) {
      localStorage.setItem('cuddleia-cart', JSON.stringify(cart));
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
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('cuddleia-cart');
    }
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
