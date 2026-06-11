
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Info, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ProductPrice } from "@/components/product-price";
import { FreebieFormDialog } from "@/components/freebie-form-dialog";
import { Product } from "@/interfaces/product";

export const ProductCard = ({ product }: { product: Product }) => {
  const isFree = product.price === 0;
  const { addToCart, isProductInCart } = useCart();
  const isInCart = isProductInCart(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block p-0">
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${product.imageWidth}/${product.imageHeight}`}}>
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 pointer-events-none" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <CardTitle>
            <Link href={`/products/${product.slug}`} className="font-bold tracking-tight font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
              {product.name}
            </Link>
          </CardTitle>
          <div className="mt-2">
            <ProductPrice price={product.price} originalPrice={product.originalPrice} />
          </div>
          <p className="text-sm font-body text-muted-foreground line-clamp-3 my-4">{product.description.split('\n\n')[0]}</p>
          {product.disclaimer && (
            <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{product.disclaimer}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isFree ? (
            <FreebieFormDialog product={product}>
              <Button size="lg" className="w-full rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </Button>
            </FreebieFormDialog>
        ) : product.bundleIncludes ? (
            <Button asChild size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full">
              <Link href={`/products/${product.slug}`}>
                  View Bundle
              </Link>
            </Button>
        ) : isInCart ? (
             <Button size="lg" className="w-full font-bold rounded-full" disabled>
              <Check className="h-5 w-5 mr-2" />
              Added to Cart
            </Button>
        ) : (
          <Button size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
