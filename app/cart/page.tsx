'use client'
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateIn } from "@/components/animate-in";
import { X, Minus, Plus } from "lucide-react";
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getPrice } = useCart();
    
    const subtotal = cart.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    return (
        <div className="bg-background min-h-[80vh]">
            <AnimateIn>
                <section className="relative bg-accent/30 py-28">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                                Your <span className="text-primary">Cart</span>
                            </h1>
                        </div>
                    </div>
                </section>
            </AnimateIn>

            <AnimateIn className="py-16">
                <div className="container mx-auto px-4">
                    {cart.length === 0 ? (
                        <div className="text-center">
                            <p className="text-xl font-body text-foreground/80 mb-8">Your cart is empty.</p>
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                            <div className="md:col-span-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="hidden md:table-cell">
                                                     <div className="relative h-20 w-20 rounded-md overflow-hidden">
                                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium font-headline text-lg">{item.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                                        <Input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value))} className="w-16 h-8 text-center" />
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-body font-semibold">{getPrice(item.price * item.quantity).formatted}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="rounded-full">
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                                <h2 className="font-headline text-3xl font-bold">Summary</h2>
                                <div className="flex justify-between font-body text-lg">
                                    <span>Subtotal</span>
                                    <span>{getPrice(subtotal).formatted}</span>
                                </div>
                                <div className="flex justify-between font-body text-lg font-bold">
                                    <span>Total</span>
                                    <span>{getPrice(subtotal).formatted}</span>
                                </div>
                                <Button size="lg" className="w-full rounded-full text-lg py-6" asChild>
                                    <Link href="/checkout">
                                        Proceed to Checkout
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </AnimateIn>
        </div>
    )
}
