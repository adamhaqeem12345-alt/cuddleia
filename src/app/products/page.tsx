'use client'
import { Eye, ShoppingCart, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart, selectedCountry } = useCart();
    const price = selectedCountry === 'MY' ? `RM${product.price.toFixed(2)}` : `$${product.priceUSD.toFixed(2)}`;

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
                    <Link href={`/products/${product.id}`} className="flex-grow">
                        <div className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</div>
                        <div className="text-sm font-body text-foreground/70 line-clamp-3">{product.description}</div>
                    </Link>
                </div>
                <div className="flex items-center justify-between gap-4 p-6 pt-0">
                    <p className="text-2xl font-headline font-bold text-primary">{price}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10" asChild>
                            <Link href={`/products/${product.id}`}>
                                <Eye />
                                <span className="sr-only">View Product</span>
                            </Link>
                        </Button>
                        <Button className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" onClick={() => addToCart(product)}>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
};


export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });


  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:py-16">
        <AnimateIn>
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground">Our Digital Creations</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-foreground/80">Browse our collection of cozy wallpapers and insightful booklets.</p>
            </div>
        </AnimateIn>

        <AnimateIn className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search products..."
                        className="w-full rounded-full bg-card pl-12 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map(category => (
                        <Button 
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            className="rounded-full transition-all duration-300"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, i) => (
                <AnimateIn key={product.id} delay={i * 150} start="opacity-0 scale-95">
                    <ProductCard product={product} />
                </AnimateIn>
                ))}
            </div>
        </AnimateIn>
    </div>
  );
}
