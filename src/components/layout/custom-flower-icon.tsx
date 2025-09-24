
import { cn } from "@/lib/utils";

export function CustomFlowerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M8.5 7a3 3 0 1 0 3-3" />
      <path d="M15.5 7a3 3 0 1 1-3-3" />
      <path d="M12 8c-2 0-3 1.5-3 3s1 3 3 3 3-1.5 3-3-1-3-3-3z" />
      <path d="M12 14v7" />
      <path d="M9 17h6" />
    </svg>
  );
}
