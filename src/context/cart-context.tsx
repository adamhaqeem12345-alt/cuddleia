
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/interfaces/product';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  isProductInCart: (productId: string) => boolean;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('barakah-cart');
    if (savedCart) {
        try {
            const parsedCart: CartItem[] = JSON.parse(savedCart);
            // Basic validation to ensure parsed data is an array of cart items
            if (Array.isArray(parsedCart) && parsedCart.every(item => 'id' in item && 'quantity' in item)) {
                 setCart(parsedCart);
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            // If parsing fails, start with an empty cart
            setCart([]);
        }
    }
  }, []);

  useEffect(() => {
    if(cart.length > 0){
        localStorage.setItem('barakah-cart', JSON.stringify(cart));
    } else {
        localStorage.removeItem('barakah-cart');
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const isProductInCart = (productId: string) => {
    return cart.some(item => item.id === productId);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('barakah-cart');
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        isProductInCart,
        clearCart,
        cartTotal,
      }}
    >
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
