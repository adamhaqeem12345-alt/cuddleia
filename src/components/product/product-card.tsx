
'use client';

import Image from 'next/image';
import Link from 'next/link';
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
      <Link href={`/products/${product.id}`} className="block">
        <CardHeader className="p-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-1 flex-col p-6">
        <Link href={`/products/${product.id}`} className="flex-grow">
            <CardTitle className="mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</CardTitle>
            <CardDescription className="font-body text-foreground/70 line-clamp-3">{product.description}</CardDescription>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 p-6 pt-0">
        <p className="text-2xl font-headline font-bold text-primary">{formatCurrency(product.price)}</p>
        <Button onClick={() => addToCart(product)} className="rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
            <ShoppingCart className="mr-2 h-5 w-5" /> Select
        </Button>
      </CardFooter>
    </Card>
  );
}
