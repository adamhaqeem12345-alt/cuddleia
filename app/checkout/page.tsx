'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Force this page to be dynamically rendered on the server
export const dynamic = 'force-dynamic';


export default function CheckoutPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Since there are no paid items, always redirect away from checkout
    if (isClient) {
      router.push('/products');
    }
  }, [router, isClient]);

  // Show a loader while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
