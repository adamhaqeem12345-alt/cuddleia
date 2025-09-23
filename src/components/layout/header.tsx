'use client';
import { motion } from 'framer-motion';
import { Logo } from './logo';

export function Header() {

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="container mx-auto flex h-24 items-center justify-start px-4">
        <a href="/" className="transition-transform hover:scale-105">
          <Logo className="h-16 text-foreground transition-colors hover:text-primary" />
        </a>
      </div>
    </motion.header>
  );
}
