
'use client';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="w-full pb-8">
      <div className="container mx-auto flex h-24 items-center justify-center px-4">
        <a href="/" className="transition-transform hover:scale-105">
          <Logo />
        </a>
      </div>
    </header>
  );
}
