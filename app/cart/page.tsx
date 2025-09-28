
'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, ArrowLeft, ShoppingCart, Minus, Plus, Loader2, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';

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
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground/50" />
            <p className="mt-6 text-lg text-muted-foreground">Your cart is currently empty.</p>
            <Button asChild className="mt-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105" size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 xl:gap-16">
            
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px] text-right"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cart.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="hidden md:table-cell p-2">
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
                            <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{getPrice(item.price * item.quantity).usd.formatted}</TableCell>
                        <TableCell className="text-right p-2">
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => removeFromCart(item.id)}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Remove</span>
                            </Button>                      
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                <div className="mt-8">
                    <Button asChild variant="ghost">
                        <Link href="/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
                <div className="bg-accent/30 rounded-2xl p-6 lg:p-8 sticky top-28">
                     <h2 className="font-headline text-2xl font-bold text-foreground border-b pb-4 mb-4">Order Summary</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between font-medium">
                            <span>Subtotal</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Taxes & Fees</span>
                            <span>Calculated at checkout</span>
                        </div>
                         <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                            <span>Order Total</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                     </div>
                     <div className="mt-8">
                        <div className="bg-destructive/10 text-destructive-foreground p-4 rounded-lg text-center">
                          <div className="flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-destructive"/>
                            <h3 className="font-bold text-destructive">Checkout Unavailable</h3>
                          </div>
                          <p className="text-sm mt-2">
                            Our payment system is currently offline. We apologize for the inconvenience.
                          </p>
                        </div>
                     </div>
                </div>
            </div>

          </div>
        )}
      </div>
    </AnimateIn>
  );
}
