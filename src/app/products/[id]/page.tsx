import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Download } from 'lucide-react';
import type { Metadata } from 'next';
import { AddToCartButton } from '@/components/add-to-cart-button';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    return {
      title: 'Product Not Found | Cuddleia',
    };
  }

  const title = `${product.name} | Cuddleia`;
  const description = product.description.split('\\n')[0];

  return {
    title,
    description,
    keywords: "islamic digital products,ipad wallpaper,digital booklets,muslim lifestyle,cuddleia,cozy digital goods,barakah business",
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: product.imageUrl,
          width: product.imageWidth,
          height: product.imageHeight,
          alt: product.name,
        },
        // Including the main site OG image as a fallback
        {
          url: 'https://www.cuddleia.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Cuddleia - Cozy Digital Goods',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [product.imageUrl],
    },
  };
}


const ProductPage = ({ params }: { params: { id: string } }) => {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  const isFree = product.price === 0;

  return (
    <div className="bg-rose-50/30">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mb-8">
            <Button asChild variant="ghost" className="rounded-full">
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Products
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="flex justify-center items-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={product.imageWidth}
              height={product.imageHeight}
              className="w-full max-w-md h-auto object-contain pointer-events-none"
              priority
            />
          </div>
          <div className="flex flex-col h-full">
            <h1 className="font-headline text-4xl lg:text-5xl text-foreground mb-4 font-bold">{product.name}</h1>
            
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <p className="text-xl font-headline font-bold text-primary">
                        {isFree ? "Free" : `$${product.price.toFixed(2)} USD`}
                    </p>
                    {product.originalPrice && (
                        <p className="text-lg font-headline font-bold text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)} USD
                        </p>
                    )}
                </div>
                {!isFree && <p className="text-xs text-muted-foreground">Loading conversion...</p>}
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground font-body whitespace-pre-wrap mb-8">
                <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-8 border-t">
                {product.disclaimer && (
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
                )}
                {isFree ? (
                    <Button asChild size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full">
                        <a href={product.downloadUrl} target="_blank">
                            <Download className="h-5 w-5 mr-2" />
                            Download Now
                        </a>
                    </Button>
                ) : (
                    <AddToCartButton product={product} />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

export async function generateStaticParams() {
    return products.map((product) => ({
      id: product.id,
    }));
}
