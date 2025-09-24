
'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Product } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { CategoryFilters } from '@/components/product/category-filters';
import { ProductGrid } from './product-grid';

interface ProductPageContentProps {
  products: Product[];
  categories: string[];
}

export function ProductPageContent({ products, categories }: ProductPageContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        selectedCategory === 'All' ? true : product.category === selectedCategory
      )
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-full bg-card pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CategoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
