
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20"
      className={cn('w-auto', className)}
      fill="currentColor"
    >
      <text
        x="0"
        y="15"
        fontFamily="var(--font-belleza), sans-serif"
        fontSize="16"
      >
        cuddleia
      </text>
    </svg>
  );
}
