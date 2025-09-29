
'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, ArrowLeft, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import { PayPalCheckout } from '@/components/paypal-checkout';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getPrice, isCartReady } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotalPrice = getPrice(subtotal);
  
  if (!isCartReady) {
    return (
        <div className="container mx-auto px-4 py-24 text-center">
             <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
             <p className="mt-4 text-lg text-muted-foreground">Loading Your Cart...</p>
        </div>
    )
  }

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-12">
          Your Shopping Cart
        </h1>
        
        {cart.length === 0 ? (
          <div className="text-center mt-16">
            <div className="flex justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
            </div>
            <h2 className="mt-6 font-headline text-2xl text-foreground">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105" size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 xl:gap-16">
            
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="border rounded-2xl">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] hidden md:table-cell pl-6">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px] text-right pr-6"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cart.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="hidden md:table-cell p-2 pl-6">
                            <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                            />
                        </TableCell>
                        <TableCell className="font-medium">
                            <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                            {item.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{getPrice(item.price).usd.formatted}</p>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center border-border" />
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{getPrice(item.price * item.quantity).usd.formatted}</TableCell>
                        <TableCell className="text-right p-2 pr-6">
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => removeFromCart(item.id)}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Remove</span>
                            </Button>                      
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-left">
                  <Button asChild variant="link" className="text-muted-foreground">
                      <Link href="/products">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Continue Shopping
                      </Link>
                  </Button>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
                <div className="bg-accent/20 rounded-2xl p-6 lg:p-8 sticky top-28 border">
                     <h2 className="font-headline text-3xl font-bold text-foreground mb-6">Order Summary</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between font-medium text-lg">
                            <span>Subtotal</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Taxes &amp; Fees</span>
                            <span>Calculated at checkout</span>
                        </div>
                         <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl">
                            <span>Order Total</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                     </div>
                     <div className="mt-8">
                        <PayPalCheckout />
                     </div>
                </div>
            </div>

          </div>
        )}
      </div>
    </AnimateIn>
  );
}
