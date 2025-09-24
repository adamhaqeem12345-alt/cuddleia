
'use client';

import React from 'react';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart } from 'lucide-react';
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
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  
  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
          <SheetHeader className="px-6">
            <SheetTitle className="font-headline text-2xl flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Your Cart ({cartCount})
            </SheetTitle>
          </SheetHeader>
          
          {cartItems.length > 0 ? (
            <>
            <div className="flex items-center justify-between px-6 mt-4">
                <p className="text-sm text-muted-foreground">{cartItems.length} unique item(s)</p>
                <Button variant="outline" size="sm" onClick={() => clearCart()} className="text-xs">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear Cart
                </Button>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col gap-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative aspect-square w-24 overflow-hidden rounded-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/products/${item.id}`} className="font-headline text-base hover:underline">{item.name}</Link>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <MinusCircle className="h-4 w-4" />
                           </Button>
                           <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <PlusCircle className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Remove item</span>
                        </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            <SheetFooter className="mt-auto border-t bg-background/95 px-6 py-4">
                <div className="w-full space-y-4">
                  <div className="flex justify-between font-headline text-lg">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <SheetClose asChild>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/checkout">
                            Proceed to Checkout
                        </Link>
                    </Button>
                  </SheetClose>
                </div>
            </SheetFooter>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h2 className="font-headline text-2xl">Your cart is empty</h2>
              <p className="text-muted-foreground">Add a product to get started.</p>
              <SheetClose asChild>
                <Button asChild>
                    <Link href="/products">
                        Continue Shopping
                    </Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
  );
}
