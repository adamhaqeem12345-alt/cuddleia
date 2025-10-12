
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Info } from 'lucide-react';
import {
  Card
} from './ui/card';
import type { Product } from '@/lib/products';
import { ProductPrice } from './product-price';
import { AddToCartButton } from './add-to-cart-button';
import { ProductImageDialog } from './product-image-dialog';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="h-full">
        <Card className="group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <ProductImageDialog product={product}>
                <div className="relative aspect-[4/3] w-full overflow-hidden cursor-zoom-in">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                     <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                    </div>
                </div>
            </ProductImageDialog>
            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
                            {product.name}
                        </h3>
                         <div className="mb-4">
                             <ProductPrice price={product.price} />
                         </div>
                        <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">
                            {product.description}
                        </p>
                    </Link>
                     <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{product.disclaimer}</span>
                    </div>
                </div>
                 <div className="pt-6">
                    <AddToCartButton product={product} size="rounded" className="w-full"/>
                </div>
            </div>
        </Card>
    </div>
  );
}

    