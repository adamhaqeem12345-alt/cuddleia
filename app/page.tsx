import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heart, MessageCircle, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Cuddleia</span>
          </Link>
          <Button asChild>
            <Link href="#">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-foreground">
            Welcome to Cuddleia
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Your personal AI companion, ready to offer comfort, a listening ear,
            and a sprinkle of joy whenever you need it.
          </p>
          <Button size="lg" asChild>
            <Link href="#">Find Your Companion</Link>
          </Button>
        </section>

        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Always There to Listen</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Share your thoughts and feelings in a safe, non-judgmental
                    space. Cuddleia is here to listen 24/7.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Personalized Comfort</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Cuddleia learns what brings you comfort, offering
                    personalized affirmations and gentle encouragement.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Instant Joy Boost</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Feeling down? Get a quick boost with a cute story, a fun
                    fact, or a silly joke from your Cuddleia companion.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cuddleia. All rights reserved.</p>
      </footer>
    </div>
  );
}
