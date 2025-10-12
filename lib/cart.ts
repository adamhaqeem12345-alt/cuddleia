
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, products } from './products';

interface CartState {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
}

const bundleProduct = products.find(p => p.id === '010');
const bundleItemIds = bundleProduct?.bundleIncludes || [];

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      addToCart: (product) => {
        set((state) => {
            let currentItems = [...state.items];

            // If the added product is the bundle
            if (product.id === bundleProduct?.id) {
                // Remove individual items that are in the bundle
                currentItems = currentItems.filter(item => !bundleItemIds.includes(item.id));
            }
            
            // Add the new product
            if (!currentItems.some(item => item.id === product.id)) {
                 currentItems.push(product);
            }

            // Check if all individual bundle items are now in the cart
            const hasAllBundleItems = bundleItemIds.every(id => currentItems.some(item => item.id === id));

            if (bundleProduct && hasAllBundleItems) {
                // Remove individual items
                currentItems = currentItems.filter(item => !bundleItemIds.includes(item.id));
                // Add the bundle if it's not already there
                if (!currentItems.some(item => item.id === bundleProduct.id)) {
                    currentItems.push(bundleProduct);
                }
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
            const newSubtotal = state.items.reduce((acc, item) => acc + item.price, 0);
            state.subtotal = newSubtotal;
        }
      }
    }
  )
);
