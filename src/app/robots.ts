
import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const APP_URL = 'https://www.cuddleia.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
