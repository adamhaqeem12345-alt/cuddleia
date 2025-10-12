
'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface ProductImageDialogProps {
  product: Product;
  children: ReactNode;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ProductImageDialog({
  product,
  children,
}: ProductImageDialogProps) {
  const images = [product.imageUrl, product.imageUrl2].filter(
    (url): url is string => !!url
  );

  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = page % images.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  if (images.length === 0) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              className="absolute w-full h-full"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
            >
              <Image
                src={images[imageIndex]}
                alt={`${product.name} - Image ${imageIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <>
            <div className="z-10 absolute top-1/2 left-4 -translate-y-1/2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full h-10 w-10 bg-black/30 hover:bg-black/50 border-none text-white"
                onClick={() => paginate(-1)}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="z-10 absolute top-1/2 right-4 -translate-y-1/2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full h-10 w-10 bg-black/30 hover:bg-black/50 border-none text-white"
                onClick={() => paginate(1)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full bg-white/50 transition-colors',
                    i === imageIndex && 'bg-white'
                  )}
                />
              ))}
            </div>
          </>
        )}

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

    