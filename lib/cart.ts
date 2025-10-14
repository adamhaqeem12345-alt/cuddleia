
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from './products';

interface CartState {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
}


export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      addToCart: (product) => {
        set((state) => {
            let currentItems = [...state.items];
            
            // Add the new product if it's not already in the cart
            if (!currentItems.some(item => item.id === product.id)) {
                 currentItems.push(product);
            }
            
            const newSubtotal = currentItems.reduce((acc, item) => acc + item.price, 0);
            return { items: currentItems, subtotal: newSubtotal };
        });
      },
      removeFromCart: (productId) => {
        set((state) => {
            const newItems = state.items.filter((item) => item.id !== productId);
            const newSubtotal = newItems.reduce((acc, item) => acc + item.price, 0);
            return { items: newItems, subtotal: newSubtotal };
        });
      },
      clearCart: () => {
        set({ items: [], subtotal: 0 });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            // Recalculate subtotal on rehydration, as product prices might change.
            const newSubtotal = state.items.reduce((acc, item) => acc + item.price, 0);
            state.subtotal = newSubtotal;
        }
      }
    }
  )
);
