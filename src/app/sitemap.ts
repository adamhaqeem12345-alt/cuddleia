
import { MetadataRoute } from 'next'
import { products } from '@/lib/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const APP_URL = 'https://www.cuddleia.com';

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${APP_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${APP_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Dynamic product pages
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${APP_URL}/products/${product.id}`,
    lastModified: new Date(), // In a real app, you might have a `updatedAt` field on your product
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes]
}
