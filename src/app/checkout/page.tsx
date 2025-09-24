
'use client';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActionState, useEffect } from 'react';
import { createOrder } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowLeft, Loader2, Mail, Sparkles, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const initialState = {
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full rounded-full">
      {pending ? <Loader2 className="animate-spin" /> : (
        <>
            <Sparkles className="mr-2 h-5 w-5" />
            Proceed to Payment
        </>
      )}
    </Button>
  );
}


export default function CheckoutPage() {
    const { cartItems, cartTotal, cartCount, isHydrating } = useCart();
    const [state, formAction] = useActionState(createOrder, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.error) {
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: state.error,
        });
        }
    }, [state, toast]);

    if (isHydrating) {
        return (
             <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (cartCount === 0) {
        return (
            <div className="container mx-auto max-w-2xl py-12 px-4 text-center">
                <h1 className="font-headline text-4xl mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">You can't check out with an empty cart. Go find something you like!</p>
                <Button asChild>
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <h1 className="font-headline text-4xl sm:text-5xl text-center mb-10">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Right Column: Order Summary */}
                <div className="md:order-last">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-4">
                                     <div className="relative aspect-square w-16 overflow-hidden rounded-md">
                                        <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold line-clamp-1">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-2 border-t pt-6">
                            <div className="flex justify-between text-lg font-headline">
                                <span>Total</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Left Column: Form */}
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Your Details</CardTitle>
                            <CardDescription>We need this to process your order and send your files.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={formAction} className="w-full space-y-6">
                                <input type="hidden" name="cartItems" value={JSON.stringify(cartItems.map(i => ({id: i.id, quantity: i.quantity})))} />
                                
                                <div className="space-y-4">
                                    <div>
                                    <Label htmlFor="name" className="font-headline text-base">Your Name</Label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="name" name="customerName" placeholder="e.g. Fatimah" required className="pl-12 h-12 text-base rounded-full" />
                                    </div>
                                    </div>
                                    <div>
                                    <Label htmlFor="email" className="font-headline text-base">Your Email</Label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="email" name="customerEmail" type="email" placeholder="you@example.com" required className="pl-12 h-12 text-base rounded-full" />
                                    </div>
                                    </div>
                                </div>
                                {state?.error && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <p>{state.error}</p>
                                    </div>
                                )}
                                <SubmitButton />
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
