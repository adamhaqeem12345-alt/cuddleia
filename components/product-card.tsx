import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Eye, Info, ShoppingCart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

interface Product {
    id: string;
    name: string;
    price: number;
    priceMYR: string;
    image: string;
    description: string;
    note: string;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="h-full">
        <Card className="group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                </div>
            </Link>
            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
                            {product.name}
                        </h3>
                        <p className="text-sm font-body text-foreground/70 line-clamp-3 mb-4">
                            {product.description}
                        </p>
                    </Link>
                     <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{product.note}</span>
                    </div>
                </div>
                 <div className="flex items-center justify-between gap-4 pt-6">
                    <div>
                        <p className="text-xl font-headline font-bold text-primary">${product.price.toFixed(2)} USD</p>
                        <p className="text-xs text-muted-foreground">(Approx. RM{product.priceMYR})</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="icon" className="rounded-full">
                             <Link href={`/products/${product.id}`}>
                                <Eye />
                                <span className="sr-only">View Product</span>
                            </Link>
                        </Button>
                        <Button className="shadow-lg transition-transform hover:scale-105 active:scale-95">
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
}
