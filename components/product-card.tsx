
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Download, Info } from 'lucide-react';
import {
  Card
} from './ui/card';
import type { Product } from '@/lib/products';
import { ProductPrice } from './product-price';
import { AddToCartButton } from './add-to-cart-button';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group">
        <Link href={`/products/${product.id}`} className="block p-0">
            <div className={cn(
                "relative w-full overflow-hidden",
                product.category === 'Wallpapers' ? 'aspect-[4/3]' : 'aspect-[3/4]'
            )}>
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>
        </Link>
        <div className="flex flex-1 flex-col p-6">
            <div className="flex-1">
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
                    {product.name}
                    </h3>
                </Link>
                <div className="mb-4">
                    <ProductPrice price={product.price} originalPrice={product.originalPrice} />
                </div>
                <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">
                    {product.description}
                </p>
                <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{product.disclaimer}</span>
                </div>
            </div>
            <div className="pt-6">
            {product.price === 0 ? (
                <Button asChild size="rounded" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                <Link href={product.downloadUrl} target="_blank">
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                </Link>
                </Button>
            ) : (
                <AddToCartButton product={product} size="rounded" className="w-full"/>
            )}
            </div>
        </div>
    </Card>
  );
}
