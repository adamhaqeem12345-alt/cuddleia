
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Download, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ProductPrice } from './product-price';
import { FreebieFormDialog } from './freebie-form-dialog';

export const ProductDetails = ({ product }: { product: Product }) => {
  const { addToCart, isProductInCart } = useCart();
  const isFree = product.price === 0;
  const isInCart = isProductInCart(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="bg-rose-50/30">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mb-8">
            <Button asChild variant="ghost" className="rounded-full">
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Products
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="flex justify-center items-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={product.imageWidth}
              height={product.imageHeight}
              className="w-full max-w-md h-auto object-contain pointer-events-none"
              priority
            />
          </div>
          <div className="flex flex-col h-full">
             <h1 className="font-headline text-4xl lg:text-5xl text-foreground mb-4 font-bold pr-4">{product.name}</h1>
            <div className="mt-2">
                <ProductPrice price={product.price} priceMYR={product.priceMYR} originalPrice={product.originalPrice} />
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground font-body whitespace-pre-wrap my-8">
                <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-8 border-t">
                {product.disclaimer && (
                    <div className="bg-primary/10 text-primary-foreground border-l-4 border-primary rounded-r-lg p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{product.disclaimer}</p>
                            </div>
                        </div>
                    </div>
                )}
                {isFree ? (
                    <FreebieFormDialog product={product}>
                        <Button size="lg" className="w-full rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                        </Button>
                    </FreebieFormDialog>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
