
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Product } from '@/lib/products';

interface ProductImageProps {
  product: Product;
}

export function ProductImage({ product }: ProductImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative aspect-square w-full cursor-zoom-in">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
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
