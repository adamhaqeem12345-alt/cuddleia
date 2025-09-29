import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Sorry, the page you are looking for could not be found.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
