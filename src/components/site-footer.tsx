import Link from "next/link";
import { Flower2, Mail, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full bg-background border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="transition-transform hover:scale-105">
              <div className="flex items-center gap-2">
                <Flower2 className="h-7 w-7 text-primary" />
                <span className="font-headline text-2xl tracking-tight text-foreground font-bold">cuddleia</span>
              </div>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-xs text-center md:text-left">
              Cozy digital goods designed to bring warmth, beauty, and serenity to your digital life.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-xl text-foreground font-bold">Quick Links</h3>
            <ul className="mt-4 flex items-center justify-center md:justify-start flex-wrap gap-x-6 gap-y-2">
              <li><Link className="text-muted-foreground hover:text-primary transition-colors" href="/">Home</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary transition-colors" href="/products">Products</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary transition-colors" href="/about">About</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary transition-colors" href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-xl text-foreground font-bold">Connect With Us</h3>
            <div className="mt-4 flex justify-center md:justify-start items-center gap-4">
              <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" href="https://www.instagram.com/cuddleia.official">Instagram</a>
              <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" href="https://www.tiktok.com/@cuddleia">TikTok</a>
              <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" href="https://t.me/+Tt1wP2OgPBE1NjU1">Telegram</a>
            </div>
            <div className="mt-6 flex justify-center md:justify-start items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <a href="mailto:hello@cuddleia.com" className="hover:text-primary transition-colors text-sm">hello@cuddleia.com</a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            Made with <Heart className="h-4 w-4 text-primary" /> by the Cuddleia team.
          </p>
        </div>
      </div>
    </footer>
  );
}
