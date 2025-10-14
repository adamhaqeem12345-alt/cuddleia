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

// Function to calculate subtotal
const calculateSubtotal = (items: Product[]) => {
  return items.reduce((total, item) => total + item.price, 0);
};

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
            
            const newSubtotal = calculateSubtotal(currentItems);
            return { items: currentItems, subtotal: newSubtotal };
        });
      },
      removeFromCart: (productId) => {
        set((state) => {
            const newItems = state.items.filter((item) => item.id !== productId);
            const newSubtotal = calculateSubtotal(newItems);
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
            // Recalculate subtotal on rehydration to ensure it's always correct
            state.subtotal = calculateSubtotal(state.items);
        }
      }
    }
  )
);
