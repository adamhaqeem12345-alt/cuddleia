'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/lib/cart';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  useEffect(() => {
    // Redirect if cart is empty, as there's nothing to check out.
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Your cart is empty. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/30">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
            <AnimateIn>
                <div className="mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/cart">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Cart
                        </Link>
                    </Button>
                </div>
            </AnimateIn>

            <AnimateIn>
                <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <h2 className="font-headline text-3xl font-bold border-b pb-4 mb-6">Your Items</h2>
                    <div className="space-y-4 mb-6">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover"/>
                                    </div>
                                    <p className="font-bold">{item.name}</p>
                                </div>
                                <span className="font-bold text-primary">Free</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-6 text-center">
                      <p className="text-muted-foreground">All items are free and can be downloaded from their respective product pages.</p>
                      <Button asChild size="lg" className="mt-6">
                        <Link href="/products">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Products
                        </Link>
                      </Button>
                    </div>
                </div>
            </AnimateIn>
        </div>
      </div>
    </div>
  );
}
