
'use client';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-background border-t">
      <div className="container mx-auto flex h-20 items-center justify-center px-4">
        <p className="flex items-center gap-2 text-center text-sm font-body text-muted-foreground">
          Made with <Heart className="h-4 w-4 text-primary" /> by the Cuddleia team.
        </p>
      </div>
    </footer>
  );
}
