'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { X, ArrowLeft, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import { PayPalButtonsComponent } from '@/components/paypal-checkout-button';

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
        <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
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
          <div className="mt-12">
            <section>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden md:table-cell">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={64}
                          height={48}
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
                        <div className="flex items-center justify-center gap-2">
                           <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                           <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                           <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{getPrice(item.price * item.quantity).usd.formatted}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <X className="h-5 w-5" />
                          <span className="sr-only">Remove</span>
                        </Button>                      
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-left font-bold text-lg">Subtotal</TableCell>
                        <TableCell colSpan={2} className="text-right font-bold text-lg">{subtotalPrice.usd.formatted}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
               <div className="mt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                <Button asChild variant="ghost">
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
                <div className='w-full md:w-auto md:max-w-xs'>
                   <PayPalButtonsComponent />
                   <p className="text-center mt-2 text-xs text-muted-foreground">(Approx. {subtotalPrice.myr.formatted})</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AnimateIn>
  );
}
