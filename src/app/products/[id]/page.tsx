
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseForm } from './_components/purchase-form';

export default function ProductPurchasePage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <Card className="overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="relative aspect-square w-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Card>

        <div className="flex flex-col h-full">
          <Card className="flex-grow flex flex-col border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="font-headline text-4xl text-primary-foreground/90">{product.name}</CardTitle>
              <p className="font-headline text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="font-body text-lg text-foreground/80">{product.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <PurchaseForm productId={product.id} />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
