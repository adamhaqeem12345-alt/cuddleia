
'use client';

import { useState } from 'react';
import { Globe, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState<'Malaysia' | 'Other' | null>(null);
  const { toast } = useToast();
  const { clearCart } = useCart();

  const handleCheckout = async (country: 'Malaysia' | 'Other') => {
    // This function will need to be updated to handle the full checkout flow
    // For now, it's a placeholder.
    setIsLoading(country);
    toast({
        title: 'Coming Soon!',
        description: 'Full payment integration is under development.',
    });
    setTimeout(() => {
        setIsLoading(null);
        onOpenChange(false);
    }, 2000)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Choose Your Location</DialogTitle>
          <DialogDescription>
            This helps us provide the best payment experience for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 text-base"
            onClick={() => handleCheckout('Malaysia')}
            disabled={!!isLoading}
          >
            {isLoading === 'Malaysia' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <MapPin className="h-6 w-6 text-primary" />
                <span>Malaysia</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 text-base"
            onClick={() => handleCheckout('Other')}
            disabled={!!isLoading}
          >
            {isLoading === 'Other' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Globe className="h-6 w-6 text-accent" />
                <span>International</span>
              </>
            )}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <p className="text-xs text-muted-foreground">
            We'll select the best payment gateway based on your choice.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
