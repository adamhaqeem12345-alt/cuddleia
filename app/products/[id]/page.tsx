import { products } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string };
};

// A map to convert prices from USD to MYR.
// In a real application, this would be fetched from an API.
const USD_TO_MYR = 4.21;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

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
            },
            ...previousImages,
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Cuddleia`,
        description: product.description.substring(0, 160),
        images: [product.imageUrl],
    }
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }
  
  const priceMYR = (product.price * USD_TO_MYR).toFixed(2);

  return (
    <div className="bg-rose-50/30">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mb-8">
            <Button asChild variant="ghost">
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Products
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
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

          <div className="flex flex-col h-full">
            <h1 className="font-headline text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {product.name}
            </h1>
            
            <div className="mb-6">
                <div>
                    <p className="font-headline text-3xl font-bold text-primary">${product.price.toFixed(2)} USD</p>
                    <p className="text-sm text-muted-foreground">(Approx. RM{priceMYR})</p>
                </div>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground font-body whitespace-pre-wrap mb-8">
                <p>{product.description}</p>
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

                <Button size="lg" className="w-full font-bold shadow-lg transition-transform hover:scale-105">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}