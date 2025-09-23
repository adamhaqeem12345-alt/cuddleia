
'use client';

import { FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg animate-fade-in border-primary/20 rounded-2xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileQuestion className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">404 - Page Not Found</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">Oops! The page you're looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="text-muted-foreground">
                It might have been moved or deleted. Let's get you back on track.
            </p>
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
