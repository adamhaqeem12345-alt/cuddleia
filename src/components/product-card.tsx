
'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart } from 'lucide-react';

export const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart, getPrice } = useCart();
    
    return (
        <div className="h-full">
            <div className="border text-card-foreground group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
                <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                            alt={product.name}
                            src={product.imageUrl}
                            fill
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                    </div>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                    <div className="flex-1">
                        <Link href={`/products/${product.id}`}>
                            <h3 className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
                            <p className="text-sm font-body text-foreground/70 line-clamp-3">{product.description}</p>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-6">
                        <p className="text-xl font-headline font-bold text-primary">{getPrice(product.price).formatted}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" asChild>
                                <Link href={`/products/${product.id}`}>
                                    <Eye />
                                    <span className="sr-only">View Product</span>
                                </Link>
                            </Button>
                            <Button className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" onClick={() => addToCart(product)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
