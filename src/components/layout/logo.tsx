
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-40 h-10', className)}>
       <Image
            src="https://cuddleia-logo.tiiny.site/Cuddleia-logo.svg"
            alt="Cuddleia Logo"
            fill
            className="object-contain"
          />
    </div>
  );
}
