
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/products';
import Link from 'next/link';


interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, addToCart, clearCart, cartTotal, cartCount } = useCart();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Since we only allow one item at a time, we can get the product directly
  const cartProduct = cartItems.length > 0 ? products.find(p => p.id === cartItems[0].id) : null;

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
          <SheetHeader className="px-6">
            <SheetTitle className="font-headline text-2xl">Your Selection</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          {cartProduct ? (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto px-6">
                <div className="flex flex-col gap-6">
                    <div key={cartProduct.id} className="space-y-4">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                        <Image
                          src={cartProduct.imageUrl}
                          alt={cartProduct.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-headline text-xl">{cartProduct.name}</h3>
                        <p className="font-headline text-2xl font-bold text-primary">{formatCurrency(cartProduct.price)}</p>
                         <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">You can only purchase one item at a time.</p>
                            <Button variant="outline" size="icon" onClick={() => clearCart()}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove item</span>
                            </Button>
                         </div>
                      </div>
                    </div>
                </div>
              </div>

              <SheetFooter className="mt-auto border-t bg-background px-6 py-4">
                 <div className="w-full space-y-4">
                    <div className="flex justify-between font-headline text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(cartProduct.price)}</span>
                    </div>
                    <SheetClose asChild>
                      <Button asChild size="lg" className="w-full">
                          <Link href={`/products/${cartProduct.id}`}>
                              Proceed to Purchase
                          </Link>
                      </Button>
                    </SheetClose>
                 </div>
              </SheetFooter>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="font-headline text-2xl">Your cart is empty</h2>
              <p className="text-muted-foreground">Add a product to get started.</p>
              <SheetClose asChild>
                <Button>Continue Shopping</Button>
              </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
  );
}
