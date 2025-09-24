
import { cn } from "@/lib/utils";

export function CustomFlowerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      <path d="M12 21.5c.3-1 .5-2.4.5-4 0-1.5-.3-3.2-.8-4.8" />
      <path d="M11.7 12.7a22.5 22.5 0 0 1-4.7-5.3" />
      <path d="M12.3 12.7a22.5 22.5 0 0 0 4.7-5.3" />
      <path d="M16 8.8c-1.3 1.3-2.6 2.5-3.8 3.7" />
      <path d="M8.2 8.8c1.3 1.3 2.6 2.5 3.8 3.7" />
      <path d="M12.2 2.2A5.6 5.6 0 0 0 8 4.5 3.3 3.3 0 0 0 6 7.2c0 1.2.8 2.3 2 2.8" />
      <path d="M11.8 2.2A5.6 5.6 0 0 1 16 4.5a3.3 3.3 0 0 1 2 2.7c0 1.2-.8 2.3-2 2.8" />
      <path d="M12 2.5a3 3 0 0 1 2.3 1.2" />
      <path d="M12 2.5a3 3 0 0 0-2.3 1.2" />
      <path d="M13.8 4.2c.4 1 .7 2.2.7 3.3 0 1-.2 2-.5 2.8" />
      <path d="M10.2 4.2C9.8 5.1 9.5 6.3 9.5 7.5c0 1 .2 2 .5 2.8" />
      <path d="M9.5 7.5c.5.5 1.4 1 2.5 1s2-.5 2.5-1" />
    </svg>
  );
}
