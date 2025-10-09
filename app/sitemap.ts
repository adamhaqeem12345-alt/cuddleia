
import { products } from '@/lib/products';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = 'https://www.cuddleia.com';

  const productRoutes = products.map((product) => ({
    url: `${appUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticRoutes = [
    {
      url: `${appUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
    {
      url: `${appUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${appUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  return [
    ...staticRoutes,
    ...productRoutes,
  ];
}
