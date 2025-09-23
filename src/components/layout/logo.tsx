import { cn } from '@/lib/utils';
import { Flower2 } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-foreground', className)}>
      <Flower2 className="h-8 w-8 text-primary" />
      <span className="font-headline text-3xl">cuddleia</span>
    </div>
  );
}
