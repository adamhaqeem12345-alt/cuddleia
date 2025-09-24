
import { cn } from '@/lib/utils';
import { CustomFlowerIcon } from './custom-flower-icon';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end', className)}>
       <span 
        className="font-logo text-4xl font-semibold tracking-wider text-primary -mr-0.5" 
        style={{ textShadow: '3px 3px 0px hsla(var(--primary), 0.25)' }}
      >
        CUDDL
      </span>
       <div className="relative w-8 h-8 mx-0">
          <CustomFlowerIcon className="absolute bottom-0 left-1/2 -translate-x-1/2 h-9 w-9 text-primary/80" />
      </div>
      <span 
        className="font-logo text-4xl font-semibold tracking-wider text-primary -ml-0.5" 
        style={{ textShadow: '3px 3px 0px hsla(var(--primary), 0.25)' }}
      >
        IA
      </span>
    </div>
  );
}
