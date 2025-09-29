import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Eye, Info, ShoppingCart } from 'lucide-react';
import {
  Card
} from './ui/card';
import type { Product } from '@/lib/products';
import { ProductPrice } from './product-price';
import { AddToCartButton } from './add-to-cart-button';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="h-full">
        <Card className="group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
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
                        <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">
                            {product.description}
                        </p>
                    </Link>
                     <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{product.disclaimer}</span>
                    </div>
                </div>
                 <div className="flex items-center justify-between gap-4 pt-6">
                    <ProductPrice price={product.price} />
                    <div className="flex gap-2">
                         <Button asChild size="default" className="font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                             <Link href={`/products/${product.id}`}>
                                <Eye className="mr-2 h-5 w-5" />
                                View
                            </Link>
                        </Button>
                        <AddToCartButton product={product} variant="outline" className="w-auto" />
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
}
