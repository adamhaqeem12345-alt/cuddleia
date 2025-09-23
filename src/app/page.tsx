
import { Hero } from '@/components/home/hero';
import { ProductShowcase } from '@/components/home/product-showcase';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/products';
import { collection, getDocs } from 'firebase/firestore';

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
    };
  });
  return productList as Product[];
}


export default async function Home() {
  const products = await getProducts();
  
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        <ProductShowcase products={products} />
      </main>
    </div>
  );
}
