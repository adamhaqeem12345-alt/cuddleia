
'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Product } from '@/lib/products';
import { Button } from './ui/button';

interface ProductImageDialogProps {
  product: Product;
  children: ReactNode;
}

export function ProductImageDialog({
  product,
  children,
}: ProductImageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>
        <DialogClose asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 border-none text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
    