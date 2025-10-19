
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, products } from '@/lib/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isProductInCart: (productId: string) => boolean;
  discountCode: string;
  appliedDiscount: number;
  discountMessage: { success?: string; error?: string };
  applyDiscount: (code: string) => void;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState<{ success?: string; error?: string }>({});

  const loadFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedDiscountCode = localStorage.getItem('discountCode');
      if (savedDiscountCode) setDiscountCode(savedDiscountCode);

      const savedAppliedDiscount = localStorage.getItem('appliedDiscount');
      if (savedAppliedDiscount) setAppliedDiscount(JSON.parse(savedAppliedDiscount));

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
    setIsInitialLoad(false);
  };

  // Load state from localStorage on initial client-side render
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('discountCode', discountCode);
      localStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
    }
  }, [cart, discountCode, appliedDiscount, isInitialLoad]);

  // Effect to clear discount when cart becomes empty
  useEffect(() => {
    if (!isInitialLoad && cart.length === 0) {
      removeDiscount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, isInitialLoad]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      let newCart = [...prevCart];
      
      // If the added product is a bundle
      if (product.bundleIncludes && product.bundleIncludes.length > 0) {
        // Remove individual items that are part of the bundle
        newCart = newCart.filter(item => !product.bundleIncludes!.includes(item.id));
      }

      const existingItemIndex = newCart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        // If item already exists, update its quantity
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1,
        };
      } else {
        // Otherwise, add the new product
        newCart.push({ ...product, quantity: 1 });
      }

      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
    setCart([]);
    // The useEffect hook will take care of resetting the discount
  }

  const applyDiscount = (code: string) => {
    setDiscountMessage({});
    if (code.toUpperCase() === 'CUDDLE10') {
      setAppliedDiscount(0.10);
      setDiscountCode(code);
      setDiscountMessage({ success: 'Discount code applied! You get 10% off.' });
    } else {
      setAppliedDiscount(0);
      setDiscountCode('');
      setDiscountMessage({ error: 'Invalid discount code. Please try again.' });
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(0);
    setDiscountCode('');
    setDiscountMessage({});
  };

  const isProductInCart = (productId: string): boolean => {
    // Is the product directly in the cart?
    if (cart.some(item => item.id === productId)) {
      return true;
    }
    
    // Is the product part of a bundle that's in the cart?
    const parentBundle = products.find(p => p.bundleIncludes?.includes(productId));
    if (parentBundle && cart.some(item => item.id === parentBundle.id)) {
      return true;
    }

    return false;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isProductInCart, discountCode, appliedDiscount, discountMessage, applyDiscount, removeDiscount }}>
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
