import { Heart, Mail } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground">Community</h3>
            <p className="mt-2 text-muted-foreground">Join our cozy corner of the internet and stay updated.</p>
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
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground">Contact Us</h3>
            <p className="mt-2 text-muted-foreground">Have questions? We'd love to hear from you.</p>
            <div className="mt-4 flex justify-center md:justify-start items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <a href="mailto:hello@cuddleia.com" className="hover:text-primary transition-colors">hello@cuddleia.com</a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
            <p className="flex items-center justify-center gap-2 text-center text-sm font-body text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-primary" /> by the Cuddleia team.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;