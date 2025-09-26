
'use client'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { products } from '@/lib/products'
import { useCart } from '@/context/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { AnimateIn } from '@/components/animate-in'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id)
  const { addToCart } = useCart()

  if (!product) {
    notFound()
  }

  const price = `$${product.price.toFixed(2)}`;

  return (
    <AnimateIn>
      <div className="container mx-auto max-w-6xl py-12 px-4 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="w-full">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    alt={product.name}
                    src={product.imageUrl}
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-full h-[90vh] bg-transparent border-0 shadow-none p-0 flex items-center justify-center">
                 <div className="relative w-full h-full">
                    <Image
                        alt={product.name}
                        src={product.imageUrl}
                        fill
                        className="object-contain rounded-lg"
                    />
                 </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h1 className="font-headline text-4xl lg:text-5xl font-semibold tracking-tight">{product.name}</h1>
                <p className="font-headline text-3xl lg:text-4xl font-bold text-primary pt-2">{price}</p>
              </div>
              <div className="p-6 pt-0 flex-grow space-y-6">
                <div className="prose prose-lg text-foreground/80 max-w-none whitespace-pre-line font-body">
                  {product.description}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
