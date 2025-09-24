
'use client';

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/products";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();

    return (
        <Button onClick={() => addToCart(product)} size="lg" className="flex-1">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
        </Button>
    )
}
