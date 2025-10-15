'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '@/context/cart-context';
import type { Product } from '@/lib/products';

export const AddToCartButton = ({ product }: { product: Product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <Button
      size="lg"
      className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full"
      onClick={() => addToCart(product)}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      Add to Cart
    </Button>
  );
};
