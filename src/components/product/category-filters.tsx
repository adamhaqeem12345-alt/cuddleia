'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          className={cn(
            'rounded-full transition-all duration-300',
            selectedCategory === category && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
