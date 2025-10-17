import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
            <div className="flex justify-center mb-6">
                <CheckCircle className="h-24 w-24 text-green-500" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Thank you for your purchase. You will receive an email confirmation shortly with your order details and download links.
            </p>
            <Button asChild size="lg">
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    );
}
