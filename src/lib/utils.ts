
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { motion } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
