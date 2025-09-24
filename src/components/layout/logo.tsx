
import { cn } from '@/lib/utils';
import { CustomFlowerIcon } from './custom-flower-icon';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span 
        className="font-logo text-4xl font-semibold tracking-wider text-primary" 
        style={{ textShadow: '2px 2px 0px hsla(var(--foreground), 0.15)' }}
      >
        CUDDLE
      </span>
      <div className="flex flex-col items-center justify-center -ml-3 -mr-2 mt-1">
        <CustomFlowerIcon className="h-8 w-8 text-primary/80" />
        <span 
          className="font-logo text-4xl font-semibold tracking-wider text-primary" 
          style={{ textShadow: '2px 2px 0px hsla(var(--foreground), 0.15)' }}
        >
          A
        </span>
      </div>
    </div>
  );
}
