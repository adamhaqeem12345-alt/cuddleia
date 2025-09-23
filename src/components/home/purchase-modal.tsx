
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/app/actions';
import { Product } from '@/lib/products';

interface PurchaseModalProps {
  product: Product;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type Step = 'details' | 'processing';

export function PurchaseModal({ product, isOpen, setIsOpen }: PurchaseModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const { toast } = useToast();

  const startCheckout = async () => {
     if (!customerName.trim() || !customerEmail.trim() || !/\S+@\S+\.\S+/.test(customerEmail)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Information',
        description: 'Please enter a valid name and email address.',
      });
      return;
    }

    setStep('processing');
    
    const result = await createOrder(product, customerName, customerEmail);

    if (result.url) {
      toast({
        title: 'Redirecting to Payment...',
        description: 'Please wait while we prepare your secure payment page.',
      });
      // Redirect on the client-side
      window.location.href = result.url;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not process your order. Please try again.',
      });
      setStep('details'); // Go back to details step on error
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    // Add a delay to allow the closing animation to finish before resetting state
    setTimeout(() => {
        setStep('details');
        setCustomerName('');
        setCustomerEmail('');
    }, 300);
  }

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Complete Your Purchase</DialogTitle>
              <DialogDescription>
                Enter your details below to proceed to payment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" placeholder="Your Name" className="pl-10" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Your Email" className="pl-10" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={startCheckout} className="w-full rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                  Buy Now for {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                </Button>
            </div>
          </motion.div>
        );
      case 'processing':
        return (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-headline">Processing Your Order</h2>
                <p className="text-muted-foreground text-center">Please wait... we're preparing everything for you.</p>
            </motion.div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
