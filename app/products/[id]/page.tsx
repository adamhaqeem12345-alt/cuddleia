import { products } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata, ResolvingMetadata } from 'next';
import { AnimateIn } from '@/components/animate-in';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductPrice } from '@/components/product-price';

type Props = {
  params: { id: string };
};

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
            <div className="relative w-full h-auto aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
            </div>
          </AnimateIn>

          <AnimateIn delay={150}>
            <div className="flex flex-col h-full">
                <h1 className="font-headline text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {product.name}
                </h1>
                
                <div className="mb-6">
                    <ProductPrice price={product.price} />
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
                    <AddToCartButton product={product} />
                </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
