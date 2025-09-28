
import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    console.log("WEBHOOK: Received PayPal webhook. Verifying...");
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("WEBHOOK: Verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`WEBHOOK: Received and verified event: ${eventType}`);

    // This webhook now acts as a failsafe for order fulfillment.
    if (eventType === 'CHECKOUT.ORDER.COMPLETED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer?.email_address || '[email not available]';
       console.log(`WEBHOOK: Processing 'CHECKOUT.ORDER.COMPLETED' for order ${orderData.id} from ${payerEmail}.`);
       
       // Call the centralized fulfillment function.
       // This ensures that even if the primary capture flow fails to send an email,
       // this webhook will attempt to do so.
       await fulfillOrder(orderData);
    } else {
        console.log(`WEBHOOK: Ignoring event type '${eventType}' as no action is defined for it.`);
    }

    // Acknowledge receipt of the webhook to PayPal.
    return NextResponse.json({ status: "success" });

  } catch (error) DANGEROUS_CONTENT,
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
})
```

or

```ts
const prompt = ai.definePrompt({
  name: 'myPrompt',
  prompt: '...',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      // ...
    ],
  },
});
```

`category` and `threshold` can be passed in as strings. Supported values:

```
  category:
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_CIVIC_INTEGRITY';

  threshold:
    | 'BLOCK_LOW_AND_ABOVE'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_NONE';
```

### Video Generation (Veo) Models

The Google Generative AI plugin provides access to video generation capabilities through the Veo models. These models can generate videos from text prompts or manipulate existing images to create dynamic video content.

#### Basic Usage: Text-to-Video Generation

```ts
import { googleAI } from '@genkit-ai/googleai';
import * as fs from 'fs';
import { Readable } from 'stream';
import { MediaPart } from 'genkit';
import { genkit } from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
});

ai.defineFlow('text-to-video-veo', async () => {
  let { operation } = await ai.generate({
    model: googleAI.model('veo-2.0-generate-001'),
    prompt: 'A majestic dragon soaring over a mystical forest at dawn.',
    config: {
      durationSeconds: 5,
      aspectRatio: '16:9',
    },
  });

  if (!operation) {
    throw new Error('Expected the model to return an operation');
  }

  // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
  while (!operation.done) {
    operation = await ai.checkOperation(operation);
    // Sleep for 5 seconds before checking again.
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  if (operation.error) {
    throw new Error('failed to generate video: ' + operation.error.message);
  }

  const video = operation.output?.message?.content.find((p) => !!p.media);
  if (!video) {
    throw new Error('Failed to find the generated video');
  }
  await downloadVideo(video, 'output.mp4');
});

async function downloadVideo(video: MediaPart, path: string) {
  const fetch = (await import('node-fetch')).default;
  // Add API key before fetching the video.
  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  Readable.from(videoDownloadResponse.body).pipe(fs.createWriteStream(path));
}
```

Because video generation is slow, consider increasing nextjs server action timeout to 2 minutes.

This example does not demonstrate how to transfer the video to the client. One option (if the file is not too large which usually it isn't) is to base64 encode it and return it in the response as a data uri.

The video content type is `video/mp4`. `contentType` may not be populated in the MediaPart.

NOTE: Veo models have low rate limits, so the likelihood of getting an error is high. Design the UI with retry logic in mind.

#### Video Generation from Photo Reference

To use a photo as reference for the video using the Veo model (e.g. to make a static photo move), you can provide an image as part of the prompt.

```ts
const startingImage = fs.readFileSync('photo.jpg', { encoding: 'base64' });

let { operation } = await ai.generate({
  model: googleAI.model('veo-2.0-generate-001'),
  prompt: [
    {
      text: 'make the subject in the photo move',
    },
    {
      media: {
        contentType: 'image/jpeg',
        url: `data:image/jpeg;base64,${startingImage}`,
      },
    },
  ],
  config: {
    durationSeconds: 5,
    aspectRatio: '9:16',
    personGeneration: 'allow_adult',
  },
});
```

Veo 3 (`veo-3.0-generate-preview`) is the latest Veo model and can generate videos with sound. Veo 3 uses the exact same API, just make sure you only use supported config options (see below).

```ts
let { operation } = await ai.generate({
  model: googleAI.model('veo-3.0-generate-preview'),
  prompt: 'A cinematic shot of a an old car driving down a deserted road at sunset.',
});
```

#### Veo `config` Options

- `negativePrompt`: Text string that describes anything you want to discourage the model from generating
- `aspectRatio`: Changes the aspect ratio of the generated video.
  - `"16:9"`: Supported in Veo 3 and Veo 2.
  - `"9:16"`: Supported in Veo 2 only (defaults to "16:9").
- `personGeneration`: Allow the model to generate videos of people. The following values are supported:
  - **Text-to-video generation**:
    - `"allow_all"`: Generate videos that include adults and children. Currently the only available `personGeneration` value for Veo 3.
    - `"dont_allow"`: Veo 2 only. Don't allow the inclusion of people or faces.
    - `"allow_adult"`: Veo 2 only. Generate videos that include adults, but not children.
  - **Image-to-video generation**: Veo 2 only
    - `"dont_allow"`: Don't allow the inclusion of people or faces.
    - `"allow_adult"`: Generate videos that include adults, but not children.
- `numberOfVideos`: Output videos requested
  - `1`: Supported in Veo 3 and Veo 2
  - `2`: Supported in Veo 2 only.
- `durationSeconds`: Veo 2 only. Length of each output video in seconds, between 5 and 8. Not configurable for Veo 3, default setting is 8 seconds.
- `enhancePrompt`: Veo 2 only. Enable or disable the prompt rewriter. Enabled by default. Not configurable for Veo 3, default prompt enhancer is always on.
## Current User code:

## Project Files

These files already exist in the output (target) directory. Here are their names and contents. Take them into account when designing the application or writing code.

- ai/genkit.ts:
```ts
'use server';
/**
 * @fileOverview Initializes the Genkit AI instance.
 *
 * This file sets up the global `ai` object that is used throughout the application
 * to define and run AI flows. It configures the necessary plugins, such as the
 * Google AI plugin for accessing Gemini models.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is set via the GEMINI_API_KEY environment variable
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

```
- app/about/page.tsx:
```tsx

import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { Heart, Feather, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About Cuddleia | Our Story',
  description: 'Cuddleia began with honesty, faith, and a dream to create something meaningful. Learn about our story, our values, and the heart behind our cozy digital goods.',
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Our <span className="text-primary">Story</span>
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Cuddleia began with honesty, faith, and a dream to create something meaningful.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>
      
      <AnimateIn>
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl leading-tight text-foreground">
                From a simple idea to a cozy corner of the internet.
              </h2>
              <div className="prose prose-lg mt-6 max-w-none font-body text-foreground/80 mx-auto space-y-4">
                <p>Cuddleia is born from a simple dream: to bring warmth, beauty, and faith into the digital spaces we inhabit daily. We are just starting on our journey to create a cozy corner of the internet where sincerity and creativity can flourish, beginning with our first collection of digital wallpapers and booklets.</p>
                <p>We believe in honesty, so we want to be clear about how our products are made. The foundational content, like the text in our booklets, is generated with the help of AI. Then, every piece is personally and carefully designed, refined, and given its final form by hand. This combination allows us to blend technological efficiency with a heartfelt, human touch in everything we create.</p>
                <p>Our mission is to create digital goods that uplift hearts, inspire faith, and make your screens a place of comfort and reflection.</p>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>
      
      <AnimateIn className="container mx-auto px-4 mb-24 sm:mb-32">
        <div className="relative aspect-video w-full">
            <Image
                alt="Pastel floral graphics background"
                data-ai-hint="pastel flowers"
                src="https://i.postimg.cc/0rg91k8k/IMG-0426.png"
                fill
                className="rounded-2xl object-cover shadow-lg"
            />
        </div>
      </AnimateIn>
      
      <AnimateIn>
        <section className="bg-background py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl">What We Cherish</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
                Our work is guided by these core principles.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Made with Love</h3>
                  <p className="mt-1 text-foreground/80">Every product is created with intention and care. From the words shaped with AI to the design crafted by human hands, each detail is touched by both technology and heart.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Feather />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Gentle &amp; Uplifting</h3>
                  <p className="mt-1 text-foreground/80">Our goal is to bring peace, positivity, and faith-driven encouragement into your everyday digital life.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Aesthetic &amp; Functional</h3>
                  <p className="mt-1 text-foreground/80">We believe beauty and purpose belong together. Our products are designed to look inspiring while also helping you stay organized and focused.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Built on Honesty</h3>
                  <p className="mt-1 text-foreground/80">We’re transparent about how we create. Our process combines faith, human creativity, and the support of AI in writing and ideas. Everything is refined and designed by hand, ensuring each product carries a genuine and personal touch.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>

      <AnimateIn>
        <section className="bg-accent/30 py-24 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl">Meet the Founder</h2>
            <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-40 w-40 flex-shrink-0">
                <Image
                  alt="Adam Haqeem"
                  src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png"
                  fill
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
              <div className="text-left">
                <h3 className="font-headline text-2xl">Adam Haqeem</h3>
                <p className="text-primary">Founder &amp; Creator</p>
                <p className="mt-2 text-foreground/80">Adam Haqeem is the heart and soul behind Cuddleia. With a deep love for faith, creativity, and honesty, he pours sincerity into every digital creation. Guided by the belief that digital spaces should inspire peace and purpose, Adam masterfully blends AI-generated content with his own heartfelt design to craft products that uplift, comfort, and remind us of what truly matters.</p>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}

```
- app/cart/page.tsx:
```tsx

'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, ArrowLeft, ShoppingCart, Minus, Plus, Loader2, Lock, CreditCard } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getPrice, isCartReady } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotalPrice = getPrice(subtotal);
  
  if (!isCartReady) {
    return (
        <div className="container mx-auto px-4 py-24 text-center">
             <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
             <p className="mt-4 text-lg text-muted-foreground">Loading Your Cart...</p>
        </div>
    )
  }

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-12">
          Your Shopping Cart
        </h1>
        
        {cart.length === 0 ? (
          <div className="text-center mt-16">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground/50" />
            <p className="mt-6 text-lg text-muted-foreground">Your cart is currently empty.</p>
            <Button asChild className="mt-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105" size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 xl:gap-16">
            
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px] text-right"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cart.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="hidden md:table-cell p-2">
                            <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                            />
                        </TableCell>
                        <TableCell className="font-medium">
                            <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                            {item.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{getPrice(item.price).usd.formatted}</p>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{getPrice(item.price * item.quantity).usd.formatted}</TableCell>
                        <TableCell className="text-right p-2">
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => removeFromCart(item.id)}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Remove</span>
                            </Button>                      
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                <div className="mt-8">
                    <Button asChild variant="ghost">
                        <Link href="/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
                <div className="bg-accent/30 rounded-2xl p-6 lg:p-8 sticky top-28">
                     <h2 className="font-headline text-2xl font-bold text-foreground border-b pb-4 mb-4">Order Summary</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between font-medium">
                            <span>Subtotal</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-sm">
                            <span>Taxes & Fees</span>
                            <span>Calculated at checkout</span>
                        </div>
                         <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                            <span>Order Total</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                     </div>
                     <div className="mt-8">
                        <p className="text-center text-xs text-muted-foreground mb-4">All prices in USD. (Approx. {subtotalPrice.myr.formatted})</p>
                        <Button asChild size="lg" className="w-full rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                            <Link href="/checkout">
                                Proceed to Checkout <CreditCard className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                     </div>
                      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Secure checkout by PayPal</span>
                    </div>
                </div>
            </div>

          </div>
        )}
      </div>
    </AnimateIn>
  );
}

```
- app/checkout/layout.tsx:
```tsx

'use client';

import { PayPalProvider } from '@/src/context/paypal-provider';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PayPalProvider>{children}</PayPalProvider>;
}

```
- app/checkout/page.tsx:
```tsx

'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { PayPalButtons, OnApproveData, CreateOrderData } from "@paypal/react-paypal-js";
import { AnimateIn } from '@/components/animate-in';
import { Loader2, AlertTriangle, Lock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
    const { cart, getPrice, isCartReady } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const subtotalPrice = getPrice(subtotal);

    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        )
    }
    
    if (cart.length === 0 && isCartReady) {
        return (
             <AnimateIn>
                <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
                    <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/50" />
                     <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mt-8 mb-4">
                        Your Cart is Empty
                    </h1>
                    <p className="text-center text-muted-foreground mb-12">
                        You can't proceed to checkout with an empty cart.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/products">
                           Go Shopping
                        </Link>
                    </Button>
                </div>
            </AnimateIn>
        )
    }

    // This function now runs entirely on the client
    const createOrder = (data: CreateOrderData, actions: any) => {
        console.log("CLIENT-SIDE: createOrder triggered. Creating order payload...");
        setError(null);

        // Calculate the total value from the cart.
        const totalValue = (cart.reduce((acc, item) => acc + item.price * item.quantity, 0) / 100).toFixed(2);
        
        if (parseFloat(totalValue) <= 0) {
            setError("Cannot create an order with a total value of zero.");
            return Promise.reject(new Error("Cannot create an order with a total value of zero."));
        }

        console.log(`CLIENT-SIDE: Calculated total value: $${totalValue}`);
        
        // Directly create the order with the PayPal SDK
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: totalValue,
                    currency_code: 'USD'
                }
            }],
            application_context: {
                brand_name: "Cuddleia",
                shipping_preference: "NO_SHIPPING"
            }
        });
    };

    const onApprove = async (data: OnApproveData, actions: any) => {
        console.log("CHECKOUT PAGE: onApprove triggered. Capturing order...", data);
        setLoading(true);
        setError(null);
        try {
            const details = await actions.order.capture();
            console.log("CHECKOUT PAGE: onApprove capture successful. Full details:", details);
            
            // Call server to record the transaction and send emails.
            const res = await fetch(`/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });
            
            if (!res.ok) {
                 const serverResponse = await res.json();
                 const errorMessage = serverResponse.details || serverResponse.error || "Payment was approved, but server failed to finalize order.";
                 throw new Error(errorMessage);
            }

            console.log("CHECKOUT PAGE: onApprove success! Redirecting to thank you page.");
            window.location.href = `/thank-you?token=${data.orderID}`;

        } catch (err: any) {
            console.error("CHECKOUT PAGE: CATCH BLOCK in onApprove.", err);
            const message = err.message || "Payment failed or could not be finalized.";
            setError(message);
            setLoading(false);
        }
    };
    
    const onError = (err: any) => {
        console.error("CHECKOUT PAGE: PayPalButtons onError was triggered.", err);
        const message = err.message || "An unexpected error occurred with PayPal. Please try refreshing the page.";
        setError(message);
    };

    return (
        <AnimateIn>
            <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
                 <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Secure Checkout
                </h1>
                <p className="text-center text-muted-foreground mb-12">
                    Complete your purchase using PayPal or any major credit/debit card.
                </p>

                <div className="bg-accent/30 rounded-2xl p-6 lg:p-8">
                     <div className="space-y-4 mb-8">
                        <h2 className="font-headline text-2xl font-bold text-foreground border-b pb-4">Order Summary</h2>
                        {cart.map(item => (
                             <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-medium">{getPrice(item.price * item.quantity).usd.formatted}</span>
                            </div>
                        ))}
                         <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                            <span>Order Total</span>
                            <span>{subtotalPrice.usd.formatted}</span>
                        </div>
                     </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="mt-4 text-lg text-muted-foreground">Processing your payment...</p>
                            <p className="mt-2 text-sm text-muted-foreground">Please do not close this window.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-destructive/10 text-destructive-foreground border border-destructive/20 rounded-lg p-4 text-center my-4">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h3 className="font-bold text-destructive">Payment Error</h3>
                            </div>
                            <p className="text-sm mt-2">{error}</p>
                            <Button variant="link" onClick={() => window.location.reload()} className="mt-2 text-destructive-foreground underline">
                                Please try refreshing the page.
                            </Button>
                        </div>
                    )}

                    {!loading && (
                         <div style={{ display: error ? 'none' : 'block' }}>
                            <p className="text-center text-xs text-muted-foreground mb-4">Choose your preferred payment method:</p>
                            <PayPalButtons
                                style={{ layout: "vertical", label: "pay" }}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                                forceReRender={[cart, getPrice]} // Re-render if cart or total value changes
                            />
                        </div>
                    )}
                </div>
                 <div className="mt-8 text-center">
                    <Button asChild variant="ghost">
                        <Link href="/cart">
                           Back to Cart
                        </Link>
                    </Button>
                </div>
                 <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Secure payments processed by PayPal</span>
                </div>
            </div>
        </AnimateIn>
    );
}

```
- app/globals.css:
```css

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 345 30% 97%;
    --foreground: 345 35% 25%;

    --hero-background: 345 95% 92%;

    --card: 0 0% 100%;
    --card-foreground: 345 35% 25%;

    --popover: 0 0% 100%;
    --popover-foreground: 345 35% 25%;

    --primary: 345 90% 70%;
    --primary-foreground: 345 35% 25%;

    --secondary: 345 60% 94%;
    --secondary-foreground: 345 35% 25%;

    --muted: 345 60% 94%;
    --muted-foreground: 345 25% 45%;

    --accent: 345 80% 94%;
    --accent-foreground: 345 35% 25%;

    --destructive: 0, 84%, 60%;
    --destructive-foreground: 345 100% 98%;

    --border: 345 40% 90%;
    --input: 345 40% 90%;
    --ring: 345 85% 60%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 345 12% 10%;
    --foreground: 345 100% 98%;

    --hero-background: 345 12% 12%;

    --card: 345 12% 10%;
    --card-foreground: 345 100% 98%;

    --popover: 345 12% 10%;
    --popover-foreground: 345 100% 98%;

    --primary: 345 85% 60%;
    --primary-foreground: 0 0% 100%;

    --secondary: 345 12% 20%;
    --secondary-foreground: 345 100% 98%;

    --muted: 345 12% 20%;
    --muted-foreground: 345 100% 90%;

    --accent: 345 12% 20%;
    --accent-foreground: 345 100% 98%;

    --destructive: 0, 63%, 31%;
    --destructive-foreground: 345 100% 98%;

    --border: 345 12% 20%;
    --input: 345 12% 20%;
    --ring: 345 85% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
    
```
- app/layout.tsx:
```tsx
import type { Metadata } from 'next';
import { Belleza, Alegreya } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { CartProvider } from '@/context/cart-context';


const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'Cuddleia | Cozy Digital Goods with Heart',
  description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
  keywords: 'islamic digital products,ipad wallpaper,digital booklets,muslim lifestyle,cuddleia,cozy digital goods,barakah business',
  robots: 'index, follow',
  openGraph: {
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
    url: 'https://www.cuddleia.com',
    siteName: 'Cuddleia',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.cuddleia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuddleia - Cozy Digital Goods',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuddleia | Cozy Digital Goods with Heart',
    description: 'Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.',
    images: ['https://www.cuddleia.com/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          belleza.variable,
          alegreya.variable
        )}
      >
        <CartProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
        </CartProvider>
      </body>
    </html>
  );
}

```
- app/page.tsx:
```tsx

import Image from 'next/image';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { FeaturedProducts } from '@/components/featured-products';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Where Creativity Meets Barakah
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Discover cozy wallpapers and Islamic booklets designed to bring warmth, beauty, and serenity to your digital life.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                  <Link href="/products">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105 bg-background/70">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Handpicked for you. Get started on your journey of beauty and reflection with our most popular digital goods.
            </p>
          </AnimateIn>
          <FeaturedProducts />
          <div className="mt-20 text-center">
            <Button asChild size="lg" variant="secondary" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-accent/20 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                 <Image
                    src="https://i.postimg.cc/6pCrhLbM/Heading-zip-1.png"
                    alt="Founder of Cuddleia"
                    fill
                    className="object-cover"
                />
              </div>
            </AnimateIn>
             <AnimateIn delay={150}>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Made with Heart & Soul
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Cuddleia was born from a passion for creating beautiful, meaningful digital goods that blend modern aesthetics with timeless Islamic values. Each product is crafted with love and a prayer that it brings you peace, productivity, and a little more barakah.
              </p>
              <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/about">Read Our Story <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  );
}

```
- app/products/[id]/add-to-cart-button.tsx:
```tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <Button
            size="lg"
            className="w-full rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            onClick={handleAddToCart}
            disabled={added}
        >
            {added ? (
                <>
                    <Check className="mr-2 h-5 w-5" /> Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </>
            )}
        </Button>
    );
}

```
- app/products/[id]/page.tsx:
```tsx

import { products } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Info } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import Link from 'next/link';
import { AddToCartButton } from './add-to-cart-button';
import { ProductPrice } from '@/components/product-price';

// Generate static paths for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// Generate metadata for each product page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }
  return {
    title: `${product.name} | Cuddleia`,
    description: product.description.substring(0, 160),
     openGraph: {
      title: `${product.name} | Cuddleia`,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.imageUrl,
          width: product.imageWidth,
          height: product.imageHeight,
          alt: product.name,
        }
      ],
    },
     twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Cuddleia`,
      description: product.description.substring(0, 160),
      images: [product.imageUrl],
    },
  };
}


export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-rose-50/30">
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <AnimateIn>
                <div className="mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Products
                        </Link>
                    </Button>
                </div>
            </AnimateIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
                <AnimateIn>
                    <div className="w-full h-auto rounded-2xl shadow-2xl overflow-hidden">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={product.imageWidth}
                            height={product.imageHeight}
                            className="object-cover w-full h-auto"
                            priority
                        />
                    </div>
                </AnimateIn>

                <AnimateIn delay={150}>
                    <div className="flex flex-col h-full">
                        <h1 className="font-headline text-4xl lg:text-5xl font-bold text-foreground mb-4">{product.name}</h1>
                        <div className="mb-6">
                            <ProductPrice price={product.price} />
                        </div>
                        
                        <div className="prose prose-lg max-w-none text-muted-foreground font-body whitespace-pre-wrap mb-8">
                            <p>{product.longDescription || product.description}</p>
                        </div>
                        
                        <div className="mt-auto pt-8 border-t">
                             <div className="bg-primary/10 text-primary-foreground border-l-4 border-primary rounded-r-lg p-4 mb-8">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Info className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">{product.disclaimer}</p>
                                    </div>
                                </div>
                            </div>
                           <AddToCartButton product={product} />
                        </div>
                    </div>
                </AnimateIn>
            </div>
        </div>
    </div>
  );
}

```
- app/products/page.tsx:
```tsx

import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from '@/components/animate-in';

export const metadata = {
  title: 'All Products | Cuddleia',
  description: 'Browse our full collection of cozy digital wallpapers and thoughtfully designed Islamic booklets.',
};

export default function ProductsPage() {
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                All Products
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Discover our full collection of digital goods, crafted with love to bring warmth, beauty, and barakah into your life.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 sm:py-32">
        {categories.map(category => (
            <section key={category} className="mb-20">
                <AnimateIn>
                    <h2 className="font-headline text-4xl font-bold text-foreground mb-10 border-b pb-4">{category}</h2>
                </AnimateIn>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                    {products.filter(p => p.category === category).map((product, index) => (
                    <AnimateIn key={product.id} delay={index * 150}>
                        <ProductCard product={product} />
                    </AnimateIn>
                    ))}
                </div>
            </section>
        ))}
      </div>
    </div>
  );
}

```
- app/thank-you/page.tsx:
```tsx

'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();

  // The 'token' is the PayPal Order ID, confirming a transaction was processed.
  const token = searchParams.get('token');

  useEffect(() => {
    // Clear the cart only once when the component mounts
    // and a PayPal token is present in the URL, indicating a successful payment.
    if (token) {
      clearCart();
    }
    // The dependency array ensures this effect runs only when these values change.
  }, [token, clearCart]);

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-24 sm:py-32 text-center">
        {token ? (
          <>
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
            <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You for Your Purchase!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Your order has been successfully processed. A confirmation email with your download links has been sent to your PayPal email address. Please check your inbox (and spam folder, just in case).
            </p>
             <div className="mt-4 text-sm text-muted-foreground">
                <p>Order ID: {token}</p>
            </div>
          </>
        ) : (
          <>
             <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              If you have completed a purchase, your items are on their way.
            </p>
          </>
        )}
        <div className="mt-12">
          <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </AnimateIn>
  );
}

```
- components/animate-in.tsx:
```tsx
'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  start?: string;
  end?: string;
}

export function AnimateIn({ children, className, delay = 0, start = 'opacity-0 translate-y-8', end = 'opacity-100 translate-y-0' }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setInView(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-in-out',
        inView ? end : start,
        className
      )}
    >
      {children}
    </div>
  );
}

```
- components/featured-products.tsx:
```tsx

'use client';

import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from '@/components/animate-in';

export function FeaturedProducts() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {featuredProducts.map((product, index) => (
        <AnimateIn key={product.id} delay={index * 150}>
          <ProductCard product={product} />
        </AnimateIn>
      ))}
    </div>
  );
}

```
- components/footer.tsx:
```tsx
import { Heart, Mail, Flower2 } from 'lucide-react';
import Link from 'next/link';

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
            <ul className="mt-4 flex items-center justify-center md:justify-start gap-6">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground">Connect With Us</h3>
            <div className="mt-4 flex justify-center md:justify-start items-center gap-4">
                <Link href="https://www.instagram.com/cuddleia.official" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    Instagram
                </Link>
                <Link href="https://www.tiktok.com/@cuddleia" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    TikTok
                </Link>
                 <Link href="https://t.me/+Tt1wP2OgPBE1NjU1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    Telegram
                </Link>
            </div>
             <div className="mt-6 flex justify-center md:justify-start items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <a href="mailto:hello@cuddleia.com" className="hover:text-primary transition-colors text-sm">hello@cuddleia.com</a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1.5">
                Made with <Heart className="h-4 w-4 text-primary" /> by the Cuddleia team.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

```
- components/header.tsx:
```tsx

'use client'
import Link from 'next/link';
import { Flower2, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useState } from 'react';

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
]

const Header = () => {
    const { cart, isCartReady } = useCart();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="w-full border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <div className="flex items-center gap-2">
            <Flower2 className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
              cuddleia
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">{link.label}</Link>
            ))}
          </nav>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden rounded-full h-14 w-14">
                    <Menu className="h-7 w-7 text-foreground" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                         <Flower2 className="h-8 w-8 text-primary" />
                        <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
                        cuddleia
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 mt-8">
                     {navLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary">{link.label}</Link>
                        </SheetClose>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="icon" className="relative h-14 w-14 rounded-full" asChild>
            <Link href="/cart">
                <ShoppingBag className="h-7 w-7 text-foreground" />
                <span className="sr-only">Open Shopping Cart</span>
                {isCartReady && cart.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {cart.length}
                    </span>
                )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

```
- components/product-card.tsx:
```tsx
'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, Info } from 'lucide-react';

export const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart, getPrice } = useCart();
    
    return (
        <div className="h-full">
            <div className="border text-card-foreground group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
                <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                            alt={product.name}
                            src={product.imageUrl}
                            fill
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                    </div>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                    <div className="flex-1">
                        <Link href={`/products/${product.id}`}>
                            <h3 className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</h3>
                            <p className="text-sm font-body text-foreground/70 line-clamp-3 mb-4">{product.description}</p>
                        </Link>
                         <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                             <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{product.disclaimer}</span>
                         </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-6">
                        <div>
                             <p className="text-xl font-headline font-bold text-primary">{getPrice(product.price).usd.formatted}</p>
                             <p className="text-xs text-muted-foreground">(Approx. {getPrice(product.price).myr.formatted})</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" asChild>
                                <Link href={`/products/${product.id}`}>
                                    <Eye />
                                    <span className="sr-only">View Product</span>
                                </Link>
                            </Button>
                            <Button className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" onClick={() => addToCart(product)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

```
- components/product-price.tsx:
```tsx
'use client';

import { useCart } from '@/context/cart-context';

export function ProductPrice({ price, className }: { price: number, className?: string }) {
    const { getPrice } = useCart();
    const { usd, myr } = getPrice(price);
    
    return (
        <div className={className}>
            <p className="font-headline text-3xl font-bold text-primary">{usd.formatted}</p>
            <p className="text-sm text-muted-foreground">(Approx. {myr.formatted})</p>
        </div>
    )
}

```
- components/ui/button.tsx:
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```
- components/ui/dialog.tsx:
```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 bg-white/80 text-foreground opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "Footer"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```
- components/ui/input.tsx:
```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```
- components/ui/label.tsx:
```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```
- components/ui/radio-group.tsx:
```tsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

```
- components/ui/select.tsx:
```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}

```
- components/ui/sheet.tsx:
```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```
- components/ui/table.tsx:
```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```
- components/ui/textarea.tsx:
```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

```
- context/cart-context.tsx:
```tsx

'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { USD_TO_MYR_RATE } from '@/lib/currency';

interface Price {
    usd: { formatted: string; raw: number };
    myr: { formatted: string; raw: number };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId:string, quantity: number) => void;
  clearCart: () => void;
  getPrice: (priceInCents: number) => Price;
  isCartReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  // Load cart from localStorage on initial client-side render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('cuddleia-cart');
      if (item) {
        setCart(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage cart', error);
    } finally {
      setIsCartReady(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isCartReady) {
      try {
        window.localStorage.setItem('cuddleia-cart', JSON.stringify(cart));
      } catch (error) {
        console.warn('Error writing to localStorage cart', error);
      }
    }
  }, [cart, isCartReady]);
  
  const getPrice = (priceInCents: number): Price => {
    const usdPrice = priceInCents / 100;
    const myrPrice = usdPrice * USD_TO_MYR_RATE;
    return {
        usd: {
            formatted: `$${usdPrice.toFixed(2)} USD`,
            raw: usdPrice
        },
        myr: {
            formatted: `RM${myrPrice.toFixed(2)}`,
            raw: myrPrice
        }
    };
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
     try {
        window.localStorage.removeItem('cuddleia-cart');
      } catch (error) {
        console.warn('Error clearing localStorage cart', error);
      }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getPrice, isCartReady }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

```
- firebase.json:
```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    },
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "server",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

```
- lib/currency.ts:
```ts
// This rate is for converting USD to MYR.
// Example: 1 USD = 4.21 MYR
// You can update this value periodically to reflect the latest exchange rates.
export const USD_TO_MYR_RATE = 4.21;

```
- lib/products.ts:
```ts

import type { Product } from './types';

// Prices are in USD cents (e.g., 1500 = $15.00)
// All 'description' fields are now single-line strings.
// All multi-line content has been moved to 'longDescription'.
export const products: Product[] = [
  {
    id: "001",
    name: "Barakah Business Blueprint",
    description: "A beginner-friendly guide for Muslims starting a halal online business from scratch.",
    longDescription: `A beginner-friendly guide for Muslims starting a halal online business from scratch. This is a clear starting point that highlights the essentials, avoids common pitfalls, and helps you take your first steps with confidence.

What you'll learn:
• Business Models: Digital products, dropshipping, or physical goods.
• Platforms: Best platforms to use without wasting money (Shopify, Gumroad, Etsy, Shopee, and more).
• Halal Payments: Guidance on gateways like Toyyibpay, Stripe, and PayPal.
• Branding: Why your own domain builds long-term trust.
• Automation & AI: How tools like n8n and Canva AI can save you hours.
• Marketing: How to effectively market on TikTok, Instagram, and Pinterest.`,
    price: 1500,
    imageUrl: "https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png",
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'All content is AI-generated and all designs are created by me.'
  },
  {
    id: "002",
    name: "iPad Wallpaper (Maroon Series)",
    description: "A digital Islamic wallpaper with floral art and Arabic calligraphy.",
    longDescription: `A digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.”

Key Features:
• Design: High-resolution floral art with a powerful Islamic reminder.
• Resolution: 2048 × 2732 pixels, ensuring a sharp and clear image.
• Orientation: Best for landscape lock screen with a normal clock display and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
    price: 600,
    imageUrl: "https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.'
  },
  {
    id: "003",
    name: "iPad Wallpaper (Minimalist Series)",
    description: "A digital Islamic wallpaper featuring a minimalist floral background.",
    longDescription: `A digital Islamic wallpaper featuring a minimalist floral background, Arabic calligraphy of Allah and Muhammad ﷺ, and the gentle reminder ‘Allah Loves You.'

Key Features:
• Design: Elegant, high-resolution minimalist design.
• Resolution: 2048 × 2732 pixels for a crisp and clear display.
• Orientation: Optimized for landscape lock screen use with a normal clock and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
    price: 500,
    imageUrl: "https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/17I5xYCRP4wItUYWtGJfWSyusxCoI3FAY/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.'
  },
  {
    id: "004",
    name: "iPad Wallpaper (Pink series)",
    description: "A digital iPad wallpaper featuring a beautiful pink floral background.",
    longDescription: `A digital iPad wallpaper featuring a beautiful pink floral background, calligraphy of Allah (SWT) and Muhammad (SAW), and a reminder of "Allah Loves you."

Key Features:
• Design: A warm and inviting pink floral aesthetic.
• Resolution: 2048 × 2732 pixels, delivering a high-quality, sharp image.
• Orientation: Works best as a landscape lock screen with a normal clock display and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
    price: 500,
    imageUrl: "https://i.postimg.cc/CL9yrDkT/Islamic-i-Pad-Wallpaper-zip-4.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1LTR13t8qBa3js0n01cQq8197tGRDAnTw/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.'
  },
  {
    id: "005",
    name: "Cuddleia Test product",
    description: "A placeholder item for testing the purchase and delivery flow.",
    longDescription: `This is a test product for the Cuddleia store.
    
Key Features:
• Use: Intended for testing the purchase and delivery flow.
• Price: Set to a minimal amount for transaction testing.
• Content: A placeholder image and download link.`,
    price: 25,
    imageUrl: "https://i.postimg.cc/MTBtTMXR/Heading.png",
    imageWidth: 1920,
    imageHeight: 1080,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1Kf9NdBI6T7rAow-D5Pf4F_5--Em5cjr0/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.'
  },
];

```
- lib/types.ts:
```ts
export interface Product {
    id: string;
    name: string;
    description: string;
    longDescription?: string; // Optional long description for product pages
    price: number; // Price in USD cents (e.g., 1500 = $15.00)
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: string;
    downloadUrl: string;
    disclaimer: string;
}

export interface CartItem extends Product {
  quantity: number;
}

```
- lib/utils.ts:
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```
- next-env.d.ts:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```
- next.config.js:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.postimg.cc',
                port: '',
                pathname: '/**',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'AcP9f98y69e5wW3gR4v1qoIoZejFUNxj4CF9ceA-CBbXq152xI1qnMugLF_rKs3yXN-fuyFIKuWpqeIW',
    }
};

module.exports = nextConfig;

```
- package.json:
```json
{
  "name": "cuddleia-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "@genkit-ai/ai": "^1.0.0",
    "@genkit-ai/googleai": "^1.0.0",
    "@paypal/react-paypal-js": "^8.5.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "axios": "^1.7.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "genkit": "^1.0.0",
    "lucide-react": "^0.408.0",
    "next": "15.5.3",
    "nodemailer": "^6.9.14",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20",
    "@types/nodemailer": "^6.4.15",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "15.5.3",
    "jest": "^29.7.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```
- postcss.config.js:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```
- src/app/api/paypal/capture-order/route.ts:
```ts

import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { products } from '@/lib/products';
import { sendEmail } from '@/lib/mail';

// This function constructs a basic HTML email body.
const createEmailHtml = (orderData: any, purchaseItems: any[]): string => {
    const itemsHtml = purchaseItems.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>Download Link: <a href="${item.downloadUrl}">Click here to download</a></p>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank You for Your Cuddleia Purchase!</h2>
            <p>Hello ${orderData.payer.name.given_name},</p>
            <p>We've confirmed your payment and your digital goods are ready for download. Your order ID is <strong>${orderData.id}</strong>.</p>
            <hr>
            <h3>Your Items:</h3>
            ${itemsHtml}
            <hr>
            <p>If you have any questions or need assistance, please don't hesitate to contact us by replying to this email.</p>
            <p>Warmly,<br>The Cuddleia Team</p>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                <p><strong>Terms of Use:</strong> All digital products are for personal use only. They are not to be sold, redistributed, or used for commercial purposes. Thank you for respecting the heart and effort put into these creations.</p>
            </div>
        </div>
    `;
};


export async function POST(req: Request) {
    console.log("API ROUTE: /api/paypal/capture-order received a POST request.");
    try {
        const { orderID } = await req.json();
        if (!orderID) {
            console.error("CAPTURE-ORDER API ERROR: Missing orderID in request body.");
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        console.log(`CAPTURE-ORDER: Calling captureOrder helper for orderID: ${orderID}`);
        const capturedData = await captureOrder(orderID);
        
        // Log the entire successful response for debugging.
        console.log(`CAPTURE-ORDER: Full response from PayPal captureOrder API:`, JSON.stringify(capturedData, null, 2));
        
        // Fulfill the order only if the capture is fully completed.
        if (capturedData.status === 'COMPLETED') {
            console.log(`CAPTURE-ORDER: Order ${orderID} is COMPLETED. Preparing to send email.`);
            
            const purchaseUnits = capturedData.purchase_units;
            if (purchaseUnits && purchaseUnits.length > 0) {
                // In our simplified setup, there is one purchase unit and items are not listed.
                // We need to look at the cart from the original order to know what was purchased.
                // This information isn't directly in the capture response.
                // For now, we assume the items are passed somehow or we retrieve the order details.
                // A better implementation would be to pass the cart items from the client during capture.
                
                // Let's assume we can get items from the original order `description` if it was set, or we have to find them by matching the total amount.
                // For simplicity, let's find the products based on SKU if they were passed.
                const purchasedSkus = capturedData.purchase_units[0]?.items?.map((item: { sku: any; }) => item.sku) || [];

                // Re-fetch order details to get item list if not present in capture data
                const itemsFromOrder = capturedData.purchase_units[0].items;

                let itemsWithDownloadLinks: { name: string, downloadUrl: string }[] = [];

                if (itemsFromOrder) {
                    itemsWithDownloadLinks = itemsFromOrder.map((item: { sku: string; }) => {
                        const product = products.find(p => p.id === item.sku);
                        return product ? { name: product.name, downloadUrl: product.downloadUrl } : null;
                    }).filter((item: any): item is { name: string, downloadUrl: string } => item !== null);
                }
                
                // This part is a fallback and might not be accurate if multiple item combos have the same price.
                // But since we can't get item details back from PayPal in this simplified flow, we have to make an educated guess.
                // The best approach is to pass item IDs from client to capture, which we are not doing currently.
                // Let's just assume we email links to ALL products if we can't determine which were bought. This is NOT ideal.
                // A better approach is needed for a real app.

                if (itemsWithDownloadLinks.length > 0) {
                    const recipientEmail = capturedData.payer.email_address;
                    const emailHtml = createEmailHtml(capturedData, itemsWithDownloadLinks);
                    
                    try {
                        await sendEmail({
                            to: recipientEmail,
                            subject: 'Your Cuddleia Order & Download Links',
                            html: emailHtml,
                        });
                        console.log(`CAPTURE-ORDER: Successfully sent download links to ${recipientEmail}.`);
                    } catch (emailError) {
                         console.error(`CAPTURE-ORDER: Failed to send email for order ${orderID}.`, emailError);
                         // Note: The payment was successful, but email failed. This needs manual follow-up.
                         // We still return the success response to the client.
                    }
                } else {
                     console.warn(`CAPTURE-ORDER: Could not find product details for items in order ${orderID}. This can happen if the order was created with just a total amount and no item list.`);
                     // A fallback could be to send a generic email without links and handle it manually.
                }
            }
        }
        
        // Return the full capture data to the client
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("CAPTURE-ORDER API CATCH BLOCK: An unexpected error occurred.", err);
        const errorMessage = err.message || "An unexpected error occurred during capture.";
        return NextResponse.json({ error: "Failed to capture PayPal order.", details: errorMessage }, { status: 500 });
    }
}

```
- src/app/api/paypal/webhook/route.ts:
```ts

import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    console.log("Received PayPal webhook. Verifying...");
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("Webhook verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`Received and verified webhook event: ${eventType}`);
    console.log("Webhook body:", JSON.stringify(body, null, 2));

    if (eventType === 'CHECKOUT.ORDER.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer.email_address;
       const payerName = orderData.payer.name.given_name;
       console.log(`Processing webhook for completed order ${orderData.id} from ${payerName} <${payerEmail}>.`);
       // TODO: Fulfill the order (e.g., send digital goods via email, update database).
       // Example: await sendEmailWithDownloadLinks(orderData);
    }

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Webhook processing failed.", details: errorMessage }, { status: 500 });
  }
}

```
- src/app/api/send-email/route.ts:
```ts
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      console.error("Send email failed: Missing required fields (to, subject, html).");
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
    }

    await sendEmail({ to, subject, html });

    return NextResponse.json({ message: "Email sent successfully." });

  } catch (error) {
    console.error("Error in send-email route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to send email.", details: errorMessage }, { status: 500 });
  }
}

```
- src/app/thank-you/page.tsx:
```tsx
'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();

  // The 'token' is the PayPal Order ID, confirming a transaction was processed.
  const token = searchParams.get('token');

  useEffect(() => {
    // Clear the cart only once when the component mounts
    // and a PayPal token is present in the URL, indicating a successful payment.
    if (token) {
      clearCart();
    }
    // The dependency array ensures this effect runs only when these values change.
  }, [token, clearCart]);

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-24 sm:py-32 text-center">
        {token ? (
          <>
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
            <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You for Your Purchase!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Your order has been successfully processed. A confirmation email with your download links has been sent to your PayPal email address. Please check your inbox (and spam folder, just in case).
            </p>
             <div className="mt-4 text-sm text-muted-foreground">
                <p>Order ID: {token}</p>
            </div>
          </>
        ) : (
          <>
             <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              If you have completed a purchase, your items are on their way.
            </p>
          </>
        )}
        <div className="mt-12">
          <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </AnimateIn>
  );
}

```
- src/context/paypal-provider.tsx:
```tsx
'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface PayPalProviderProps {
    children: ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
    if (!PAYPAL_CLIENT_ID) {
        console.error("PayPal Client ID is not configured. PayPal buttons will not load.");
        return (
            <div className="text-center text-destructive">
                PayPal is not configured. Payment processing is unavailable.
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            {children}
        </PayPalScriptProvider>
    );
}

```
- src/lib/mail.ts:
```ts
'use server';

import nodemailer from 'nodemailer';

const { ZOHO_MAIL_USER, ZOHO_MAIL_PASS } = process.env;

if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASS) {
  console.warn("Zoho Mail environment variables are not fully set. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, 
  auth: {
    user: ZOHO_MAIL_USER,
    pass: ZOHO_MAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASS) {
     console.error("Cannot send email because Zoho credentials are not configured in environment variables.");
     throw new Error("Email service is not configured.");
  }
  
  const mailOptions = {
    from: `"Cuddleia" <${ZOHO_MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email via Zoho:", error);
    throw new Error("Could not send email.");
  }
}

```
- src/lib/paypal-api.ts:
```ts

'use server';

import axios from 'axios';
import type { CartItem } from './types';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

/**
 * Fetches a PayPal access token.
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("FATAL: PayPal client ID or secret is not configured in environment variables.");
    throw new Error("Server is not configured for PayPal payments.");
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error fetching PayPal access token:", errorMessage);
    throw new Error(`Could not fetch PayPal access token. Details: ${errorMessage}`);
  }
}

/**
 * Creates a PayPal order for the given cart items.
 * This version sends only the total amount, not a detailed item list, to maximize compatibility.
 * @param cartItems The items in the user's shopping cart.
 */
export async function createOrder(cartItems: CartItem[]): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cannot create order with an empty cart.");
  }

  // Calculate total value from cart items
  const totalValueInCents = cartItems.reduce((acc, item) => {
    // Ensure price and quantity are valid numbers before calculation
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return acc + (price * quantity);
  }, 0);

  // Format as a string with two decimal places
  const totalValueInDollars = (totalValueInCents / 100).toFixed(2);

  // Check for zero-value total
  if (parseFloat(totalValueInDollars) <= 0) {
      throw new Error("Cannot create an order with a total value of zero.");
  }

  // Simplified payload: send only the total amount.
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalValueInDollars, // e.g., "31.00"
        }
      }
    ],
    application_context: {
        brand_name: "Cuddleia",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
    }
  };

  try {
    console.log("Attempting to create PayPal order with simplified payload:", JSON.stringify(payload, null, 2));
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `cuddleia-order-total-${Date.now()}`
        },
      }
    );
    
    console.log("Full PayPal create-order SUCCESS response:", JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error creating PayPal order. Full error response:", errorMessage);
    // CRITICAL: Re-throw as a new Error so the message is propagated.
    throw new Error(`Could not create PayPal order. Details: ${errorMessage}`);
  }
}


/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId The ID of the PayPal order.
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      null, // No body needed for capture
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `cuddleia-capture-${Date.now()}`
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error(`Error capturing PayPal order ${orderId}:`, errorMessage);
    throw new Error(`Could not capture PayPal order. Details: ${errorMessage}`);
  }
}

/**
 * Verifies a webhook signature from PayPal.
 * @param headers The headers from the incoming webhook request.
 * @param body The raw body of the incoming webhook request.
 */
export async function verifyWebhook(headers: Headers, body: any): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID is not set. Cannot verify webhook.");
    return false;
  }
  
  const accessToken = await getPayPalAccessToken();

  try {
    const verificationPayload = {
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: body,
    };
    
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const verificationStatus = response.data.verification_status;
    return verificationStatus === 'SUCCESS';
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error verifying PayPal webhook:", errorMessage);
    return false;
  }
}

```
- src/lib/types.ts:
```ts
export interface Product {
    id: string;
    name: string;
    description: string;
    longDescription?: string; // Optional long description for product pages
    price: number; // Price in USD cents (e.g., 1500 = $15.00)
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: string;
    downloadUrl: string;
    disclaimer: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Type for product information used in order creation
export interface ProductInfo {
  id: string;
  name: string;
  price: number; // Price in USD cents
  quantity: number;
}

```
- src/types/env.d.ts:
```ts
namespace NodeJS {
  interface ProcessEnv {
    PAYPAL_API: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_SECRET: string;
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: string;
    PAYPAL_WEBHOOK_ID: string;
    ZOHO_MAIL_USER: string;
    ZOHO_MAIL_PASS: string;
    NEXT_PUBLIC_APP_URL: string;
  }
}

```
- src/types/index.ts:
```ts
// Type for product information used in the checkout process and API calls
export interface ProductInfo {
  id: string; // Corresponds to product SKU in PayPal
  name: string;
  price: number; // Price in USD cents
  quantity: number;
}

// Extends ProductInfo for use in the shopping cart UI, possibly with more details
export interface CartItem extends ProductInfo {
  imageUrl: string;
  description: string;
}

```
- tailwind.config.ts:
```ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "hero-background": "hsl(var(--hero-background))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-alegreya)", "sans-serif"],
        headline: ["var(--font-belleza)", "sans-serif"],
        body: ["var(--font-alegreya)", "serif"],
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config;

```
- tests/api/paypal-routes.test.ts:
```ts
// This is a test stub for the PayPal API routes.
// In a real-world scenario, you would use a library like `node-mocks-http` 
// or `next-test-api-route-handler` to simulate requests and mock your service functions.

describe('PayPal API Routes', () => {
  
  // Test for POST /api/paypal/create-order
  test('create-order route should handle valid cart data', () => {
    // 1. Mock the createOrder function from '@/lib/paypal-api'
    // 2. Create a mock request object with cart items.
    // 3. Call the route handler with the mock request.
    // 4. Assert that the response is successful and contains the mock order data.
    expect(true).toBe(true); // Placeholder
  });

  test('create-order route should handle an empty cart', () => {
    // 1. Create a mock request with an empty cart.
    // 2. Call the handler.
    // 3. Assert that the response status is 400.
    expect(true).toBe(true); // Placeholder
  });

  // Test for POST /api/paypal/capture-order
  test('capture-order route should handle a valid orderID', () => {
    // 1. Mock captureOrder and sendEmail functions.
    // 2. Create a mock request with an orderID.
    // 3. Call the handler.
    // 4. Assert that the response is successful and contains capture data.
    // 5. Assert that sendEmail was called.
    expect(true).toBe(true); // Placeholder
  });

  // Test for POST /api/paypal/webhook
  test('webhook route should verify and process a valid webhook event', () => {
    // 1. Mock verifyWebhook to return true.
    // 2. Create a mock request with PayPal webhook headers and body.
    // 3. Call the handler.
    // 4. Assert that the response status is 200.
    expect(true).toBe(true); // Placeholder
  });

   test('webhook route should reject an invalid webhook event', () => {
    // 1. Mock verifyWebhook to return false.
    // 2. Create a mock request.
    // 3. Call the handler.
    // 4. Assert that the response status is 403 (Forbidden).
    expect(true).toBe(true); // Placeholder
  });
});

```
- tests/api/send-email-route.test.ts:
```ts
// This is a test stub for the send-email API route.

describe('Send Email API Route', () => {
  
  test('/api/send-email should handle valid email data', () => {
    // 1. Mock the sendEmail function from '@/lib/mail'.
    // 2. Create a mock request with 'to', 'subject', and 'html'.
    // 3. Call the route handler.
    // 4. Assert that the response is successful and sendEmail was called with the correct data.
    expect(true).toBe(true);
  });

  test('/api/send-email should return 400 for missing data', () => {
    // 1. Create a mock request with missing fields.
    // 2. Call the route handler.
    // 3. Assert that the response status is 400.
    expect(true).toBe(true);
  });

});

```
- tests/lib/mail.test.ts:
```ts
// This is a test stub.
import { sendEmail } from '@/lib/mail';
import nodemailer from 'nodemailer';

// Mock the nodemailer transport
const sendMailMock = jest.fn();
jest.mock('nodemailer');
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock
});


describe('Mail Library', () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    process.env.ZOHO_MAIL_USER = 'test@zoho.com';
    process.env.ZOHO_MAIL_PASS = 'password';
  });
  
  test('sendEmail function should be defined', () => {
    expect(sendEmail).toBeDefined();
  });

  test('sendEmail should call the transporter with correct options', async () => {
    const options = { to: 'recipient@example.com', subject: 'Test', html: '<p>Hi</p>' };
    await sendEmail(options);
    
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: options.to,
      subject: options.subject,
      html: options.html,
      from: `"Cuddleia" <${process.env.ZOHO_MAIL_USER}>`
    }));
  });

  test('sendEmail should throw an error if credentials are not set', async () => {
    delete process.env.ZOHO_MAIL_USER;
    const options = { to: 'recipient@example.com', subject: 'Test', html: '<p>Hi</p>' };
    
    await expect(sendEmail(options)).rejects.toThrow("Email service is not configured.");
  });
});

```
- tests/lib/paypal-api.test.ts:
```ts
// This is a test stub. You can expand it with a mocking library like Jest or Vitest.
import { createOrder, captureOrder, verifyWebhook } from '@/lib/paypal-api';

// Mock the global fetch function
global.fetch = jest.fn();

describe('PayPal API Library', () => {

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (fetch as jest.Mock).mockClear();
    // Set up environment variables for all tests
    process.env.PAYPAL_CLIENT_ID = 'test_id';
    process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
    process.env.PAYPAL_API = 'https://api.sandbox.paypal.com';
    process.env.PAYPAL_WEBHOOK_ID = 'test_webhook_id';
  });

  // Test stub for createOrder
  test('createOrder should be defined and callable', () => {
    expect(createOrder).toBeDefined();
    // You would add more logic here to test its behavior with a mocked fetch
  });

  // Test stub for captureOrder
  test('captureOrder should be defined and callable', () => {
    expect(captureOrder).toBeDefined();
    // You would add more logic here to test its behavior with a mocked fetch
  });

  // Test stub for verifyWebhook
  test('verifyWebhook should be defined and callable', () => {
    expect(verifyWebhook).toBeDefined();
    // You would add more logic here to test its behavior with a mocked fetch
  });
});

```
- tsconfig.json:
```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./*"
      ],
      "@/ai/*": [
        "./ai/*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```


The following Python libraries are available:

`default_api`:
```python
def RequestFirebaseProjectWithConfig(
) -> dict:
  """
    Creates a new Firebase Project or retrieves the current project and provides a Firebase app
    config object.

    Call this function whenever the user requests Firebase or services that Firebase offers.
    Includes adding, enabling, connecting with, or integrating with Firebase and Firebase services.
    When this function is called, you must always begin by giving the user a detailed outline of
    your plan and what you are going to do on their behalf.

    For example, call this function for user requests such as "Create a Firebase Project", "Get
    a Firebase config object", "Create a Firebase App Config", "Show me my Firebase config object",
    "Can you show me my Firebase configuration?, "What value do I use in the initializeApp()
    function?", "Add Firebase Auth", "Add Firebase Remote Config", or "Add analytics".

    Calling this function does not add, connect to, or integrate services, nor deploy Firebase
    resources on the user's behalf. As such, you must not tell users that they are connected to a
    service, that an automated deployment will occur, or that the integration is set up or complete.
    You must tell users that as a next step, they will need to go to the Firebase console to
    continue setting up, adding, or enabling any services they requested.

    This function does not generate code for additional services, intergrations, or features that
    the user did not ask for.

    Important! The Firebase App Configuration object is a public configuration, meaning
    it is safe and secure to provide the user with this object as the security and access is
    enforced by the Security Rules or Firebase App Check. Once written, do not modify the
    firebaseConfig object because it is fetched from the server and does not require modifications
    under any circumstances.
    

  Args:
  """

```