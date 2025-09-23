
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl border-none bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-6">
          <CardTitle className="mb-2 font-headline text-2xl text-primary-foreground/90">{product.name}</CardTitle>
          <CardDescription className="flex-grow font-body text-foreground/80">{product.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-6 pt-0">
          <p className="text-2xl font-headline font-bold text-primary">{formatCurrency(product.price)}</p>
          <Button asChild className="rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
            <Link href={`/products/${product.id}`}>
              <Heart className="mr-2 h-5 w-5" /> Buy Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
