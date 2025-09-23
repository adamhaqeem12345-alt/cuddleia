'use client';

import Image from 'next/image';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const imageUrl = PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl || '';
  const imageHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || '';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="flex h-full transform flex-col overflow-hidden rounded-lg border-none bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <CardTitle className="mb-2 font-headline text-xl">{product.name}</CardTitle>
        <CardDescription className="flex-grow text-foreground/80">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-xl font-headline font-bold text-primary-foreground/90">{formatCurrency(product.price)}</p>
        <Button onClick={() => addToCart(product)} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
