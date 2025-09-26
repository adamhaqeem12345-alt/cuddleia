
'use client'
import { Search } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

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
