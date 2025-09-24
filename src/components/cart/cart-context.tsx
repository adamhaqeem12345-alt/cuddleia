
'use client';

import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export type CartItem = Product & { quantity: number };

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = useCallback(
    (product: Product) => {
      // For this store, we only allow one product in the cart at a time.
      // So, we replace the existing item instead of adding to it.
      setCartItems([{ ...product, quantity: 1 }]);
      
      toast({
        title: 'Added to Selection',
        description: `${product.name} is ready for purchase.`,
      });
    },
    [toast]
  );

  const removeFromCart = useCallback((productId: string) => {
    // Since we only have one item, this is equivalent to clearing the cart
    setCartItems([]);
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
        title: 'Selection Cleared',
        description: 'Your selection has been cleared.',
    });
  }, [toast]);

  const cartCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return cartItems[0].price;
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [cartItems, addToCart, removeFromCart, clearCart, cartCount, cartTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
