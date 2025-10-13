
'use client';

import { useState } from 'react';
import { Product } from '@/lib/products';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Download, Loader2, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { buttonVariants } from './ui/button';
import { handleFreeDownload } from '@/app/actions';

interface FreeDownloadDialogProps extends VariantProps<typeof buttonVariants> {
  product: Product;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'rounded';
}

export function FreeDownloadDialog({
  product,
  className,
  variant,
  size,
}: FreeDownloadDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in both your name and email.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await handleFreeDownload({ name, email, productId: product.id });

      if (!result.success) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not process your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset state when dialog is closed
    if (!open) {
        setTimeout(() => {
            setName('');
            setEmail('');
            setError('');
            setIsProcessing(false);
            setIsSuccess(false);
        }, 300); // Delay to allow closing animation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
            size={size || "lg"}
            variant={variant}
            className={cn("w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95", className)}
        >
          <Download className="mr-2 h-5 w-5" />
          Download Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!isSuccess ? (
            <>
                <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                    Get Your Free Download!
                </DialogTitle>
                <DialogDescription>
                    Enter your name and email to receive the download link for "{product.name}".
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="Your Name"
                            disabled={isProcessing}
                        />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="your.email@example.com"
                            disabled={isProcessing}
                        />
                        </div>
                        {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isProcessing} className="w-full">
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait</>
                        ) : (
                            'Get Download Link'
                        )}
                        </Button>
                    </DialogFooter>
                </form>
            </>
        ) : (
            <div className="text-center p-8">
                <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4"/>
                <DialogTitle className="font-headline text-2xl mb-2">Success!</DialogTitle>
                <p className="text-muted-foreground mb-6">Your download link has been sent to your email. Check your inbox (and spam folder)!</p>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Close
                    </Button>
                </DialogClose>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
