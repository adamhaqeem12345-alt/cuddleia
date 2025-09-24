
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      viewport={{ once: true, amount: 0.1 }}
      className="h-full"
    >
        <Card className="group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="p-0">
            <Link href={`/products/${product.id}`} className="block">
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
            </Link>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-6">
                <Link href={`/products/${product.id}`} className="flex-grow">
                    <CardTitle className="mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</CardTitle>
                    <CardDescription className="font-body text-foreground/70 line-clamp-3">{product.description}</CardDescription>
                </Link>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-4 p-6 pt-0">
                <p className="text-2xl font-headline font-bold text-primary">{formatCurrency(product.price)}</p>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                         <Link href={`/products/${product.id}`}>
                            <Eye />
                            <span className="sr-only">View Product</span>
                        </Link>
                    </Button>
                    <Button onClick={() => addToCart(product)} className="rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add
                    </Button>
                </div>
            </CardFooter>
      </Card>
    </motion.div>
  );
}
