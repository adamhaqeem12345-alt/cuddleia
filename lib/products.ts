
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: 'Booklets' | 'Wallpapers';
    downloadUrl: string;
    disclaimer: string;
    bundleIncludes?: string[];
    includedInBundle?: string[];
}

export const products: Product[] = [
  {
    id: '001',
    name: 'Barakah Business Blueprint Vol. 1 (The Gentle Beginning)',
    description: `Start your halal business journey with peace and purpose. Volume I of the Barakah Business Blueprint guides you through the gentle beginning — learning how to build with sincerity, clarity, and calm direction. You’ll explore the right business models for Muslims, choose halal payment gateways, and understand how to use automation and AI ethically to simplify your workflow.

This volume turns hesitation into movement, helping you take your first steady steps toward a business that grows with integrity and barakah. It also includes the 7-Day Launch Challenge, a guided plan to help you move from intention to real action — one small, sincere step at a time.

What you’ll learn:
• The best halal business models to begin with
• The platforms and payment options most suitable for your first launch
• Ethical automation and AI tools for calm productivity
• Halal marketing and community-based branding principles
• The 7-Day Launch Challenge to start with focus and sincerity`,
    price: 0,
    imageUrl: 'https://i.postimg.cc/Dw8v8XB3/Barakah-Business-Blueprint-Vol-I.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1-v2_zgCQDfpNjByZgD3IzzCla5XbO_lz/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
  },
   {
    id: '002',
    name: 'Blush & Bloom Series',
    description: 'A set of three beautifully designed digital wallpapers in soft blush tones, created to bring a sense of calm and elegance to your phone. Perfect for those who love minimalist aesthetics and a touch of warmth.',
    price: 0,
    originalPrice: 3.00,
    imageUrl: 'https://i.postimg.cc/j5P14fS4/Blush-Bloom-Series.png',
    imageWidth: 1080,
    imageHeight: 1920,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/drive/folders/1-H-M_G1gqVd-NSS4gMXCTsNP42ca2C0L?usp=sharing',
    disclaimer: 'This is a digital product. You will receive a link to download the files after purchase. Colors may vary slightly depending on your screen settings.',
    bundleIncludes: ['003', '004', '005'],
  },
  {
    id: '003',
    name: 'Wallpaper: Peony Whisper',
    description: 'A single, delicate peony wallpaper in a soft, elegant design. Perfect for bringing a touch of nature and tranquility to your phone screen.',
    price: 0,
    imageUrl: 'https://i.postimg.cc/k471w0d7/Peony-Whisper.png',
    imageWidth: 1080,
    imageHeight: 1920,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/drive/folders/1-H-M_G1gqVd-NSS4gMXCTsNP42ca2C0L?usp=sharing',
    disclaimer: 'This is a digital product. You will receive a link to download the files after purchase.',
    includedInBundle: ['002'],
  },
  {
    id: '004',
    name: 'Wallpaper: Rose Dust',
    description: 'A subtle and romantic rose-themed wallpaper. Its dusty pink tones add a vintage and cozy feel to your digital space.',
    price: 0,
    imageUrl: 'https://i.postimg.cc/Jz3xG5YV/Rose-Dust.png',
    imageWidth: 1080,
    imageHeight: 1920,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/drive/folders/1-H-M_G1gqVd-NSS4gMXCTsNP42ca2C0L?usp=sharing',
    disclaimer: 'This is a digital product. You will receive a link to download the files after purchase.',
    includedInBundle: ['002'],
  },
  {
    id: '005',
    name: 'Wallpaper: Gentle Growth',
    description: 'An inspiring wallpaper featuring gentle floral illustrations, symbolizing growth and new beginnings. A perfect daily reminder of your journey.',
    price: 0,
    imageUrl: 'https://i.postimg.cc/T3s70h6z/Gentle-Growth.png',
    imageWidth: 1080,
    imageHeight: 1920,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/drive/folders/1-H-M_G1gqVd-NSS4gMXCTsNP42ca_2C0L?usp=sharing',
    disclaimer: 'This is a digital product. You will receive a link to download the files after purchase.',
    includedInBundle: ['002'],
  }
];
