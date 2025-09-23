import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src="https://cuddleia-logo.tiiny.site/Cuddleia-logo.svg"
        alt="Cuddleia Logo"
        width={200}
        height={64}
        className="object-contain"
        priority
      />
    </div>
  );
}
