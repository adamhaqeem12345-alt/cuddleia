import { Heart, Mail, Flower2 } from 'lucide-react';
import Link from 'next/link';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
)

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 8.25v7.5a4.25 4.25 0 0 1-4.25 4.25H8.25a4.25 4.25 0 0 1-4.25-4.25V8.25a4.25 4.25 0 0 1 4.25-4.25h7.5A4.25 4.25 0 0 1 21 8.25Z"></path>
        <path d="M12 15.75a3.75 3.75 0 0 0 3.75-3.75V4h-3.75v11.75Z"></path>
        <path d="M12 8.25H8.25"></path>
    </svg>
)

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
)


const Footer = () => {
  return (
    <footer className="w-full bg-background border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
          <div className="flex flex-col items-center md:items-start">
             <Link href="/" className="transition-transform hover:scale-105">
              <div className="flex items-center gap-2">
                <Flower2 className="h-7 w-7 text-primary" />
                <span className="font-headline text-2xl font-bold tracking-tight text-foreground">
                  cuddleia
                </span>
              </div>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-xs text-center md:text-left">
                Cozy digital goods designed to bring warmth, beauty, and serenity to your digital life.
            </p>
          </div>

          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-3">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground">Connect With Us</h3>
            <div className="mt-4 flex justify-center md:justify-start items-center gap-4">
                <Link href="https://www.instagram.com/cuddleia.official" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <InstagramIcon className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                </Link>
                <Link href="https://www.tiktok.com/@cuddleia" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <TiktokIcon className="h-6 w-6" />
                    <span className="sr-only">TikTok</span>
                </Link>
                 <Link href="https://t.me/+Tt1wP2OgPBE1NjU1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <TelegramIcon className="h-6 w-6" />
                    <span className="sr-only">Telegram</span>
                </Link>
            </div>
             <div className="mt-6 flex justify-center md:justify-start items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <a href="mailto:hello@cuddleia.com" className="hover:text-primary transition-colors text-sm">hello@cuddleia.com</a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1.5 mt-2">
                Made with <Heart className="h-4 w-4 text-primary" /> by the Cuddleia team.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
