'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2, X } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PaymentDialog } from '@/components/checkout/payment-dialog';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, addToCart, clearCart, cartTotal, cartCount } = useCart();
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getImageUrl = (imageId: string) => {
    return PlaceHolderImages.find(img => img.id === imageId)?.imageUrl || '';
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader className="pr-6">
            <SheetTitle className="font-headline text-2xl">Shopping Cart ({cartCount})</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          {cartItems.length > 0 ? (
            <>
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-6 pr-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={getImageUrl(item.imageId)}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          data-ai-hint={PlaceHolderImages.find(img => img.id === item.imageId)?.imageHint}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addToCart(item)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4" />
              <SheetFooter className="sm:justify-between">
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between font-headline text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <Button variant="outline" onClick={clearCart}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                  </Button>
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setPaymentDialogOpen(true)}>
                    Buy Now
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="font-headline text-2xl">Your cart is empty</h2>
              <p className="text-muted-foreground">Add some products to get started.</p>
              <SheetClose asChild>
                <Button>Continue Shopping</Button>
              </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <PaymentDialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
    </>
  );
}
