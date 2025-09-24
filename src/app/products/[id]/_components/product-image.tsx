
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/dialog';
import type { Product } from '@/lib/products';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ProductImageProps {
  product: Product;
}

export function ProductImage({ product }: ProductImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
         <DialogTitle>
            <VisuallyHidden>
                {product.name} - Full Size
            </VisuallyHidden>
        </DialogTitle>
        <div className="relative aspect-auto w-full h-[90vh]">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
