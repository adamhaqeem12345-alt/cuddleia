
'use client';

import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export type CartItem = {
  id: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
};

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isHydrating: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load cart from localStorage on initial render, only on the client
    try {
      const localData = window.localStorage.getItem('cuddleia-cart');
      if (localData) {
        setCartItems(JSON.parse(localData));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    } finally {
        setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes, only on the client
    if (!isHydrating) {
        try {
            window.localStorage.setItem('cuddleia-cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }
  }, [cartItems, isHydrating]);

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { ...product, quantity }];
      });
      
      toast({
        title: 'Added to Cart',
        description: `${product.name} has been added to your cart.`,
      });
    },
    [toast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
    toast({
        title: 'Item Removed',
        description: 'The item has been removed from your cart.',
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    setCartItems(prevItems => prevItems.map(item => item.id === productId ? {...item, quantity} : item))
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
        title: 'Cart Cleared',
        description: 'Your shopping cart has been cleared.',
    });
  }, [toast]);

  const cartCount = useMemo(() => {
    if (isHydrating) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems, isHydrating]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isHydrating,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isHydrating]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
