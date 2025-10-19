
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';
import { ProductPrice } from '@/components/product-price';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - (subtotal * appliedDiscount);

  const handleApplyDiscount = () => {
    setDiscountError('');
    setDiscountSuccess('');
    if (discountCode.toUpperCase() === 'CUDDLE10') {
      setAppliedDiscount(0.10);
      setDiscountSuccess('Discount code applied! You get 10% off.');
    } else {
      setAppliedDiscount(0);
      setDiscountError('Invalid discount code. Please try again.');
    }
  };
  
  const handleRemoveDiscount = () => {
    setAppliedDiscount(0);
    setDiscountCode('');
    setDiscountError('');
    setDiscountSuccess('');
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-12 text-center font-bold">Your Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-8">Your cart is empty.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <Button asChild variant="ghost" className='rounded-full'>
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
                <Button variant="outline" onClick={clearCart} className="rounded-full">
                    Clear Cart
                </Button>
            </div>
            <div className="border rounded-2xl shadow-sm">
              <ul className="divide-y">
                {cart.map(item => (
                  <li key={item.id} className="flex items-center gap-6 p-6">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold font-headline text-lg hover:text-primary">
                        <Link href={`/products/${item.id}`}>{item.name}</Link>
                      </h3>
                       <p className="text-sm text-muted-foreground">Price: ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <p className="font-bold text-lg text-right">${(item.price * item.quantity).toFixed(2)}</p>
                       <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                         <Trash2 className="h-4 w-4 mr-1" />
                         Remove
                       </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 border rounded-2xl shadow-sm p-8 bg-card">
                <h2 className="font-headline text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                        <span>Subtotal</span>
                        <span className="font-bold text-right">${subtotal.toFixed(2)}</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-lg text-green-600">
                        <span>Discount (10%)</span>
                        <span className="font-bold text-right">-${(subtotal * appliedDiscount).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg">
                        <span>Taxes & Fees</span>
                        <span className="font-bold text-right">$0.00</span>
                    </div>
                     <div className="border-t pt-4 mt-4 flex justify-between items-start text-2xl font-bold">
                        <span>Total</span>
                         <ProductPrice price={total} isTotal={true}/>
                    </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-headline text-lg font-bold mb-4">Discount Code</h3>
                  <div className="flex gap-2">
                    <Input 
                      type="text" 
                      placeholder="Enter code" 
                      value={discountCode} 
                      onChange={(e) => setDiscountCode(e.target.value)}
                      disabled={appliedDiscount > 0}
                      className="rounded-full"
                    />
                    <Button onClick={handleApplyDiscount} disabled={appliedDiscount > 0} className="rounded-full">Apply</Button>
                  </div>
                  {discountSuccess && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{discountSuccess}</span>
                      <button onClick={handleRemoveDiscount} className="ml-auto text-xs font-bold underline">Remove</button>
                    </div>
                  )}
                  {discountError && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span>{discountError}</span>
                    </div>
                  )}
                </div>

                <Button asChild size="lg" className="w-full mt-8 rounded-full font-bold">
                    <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
