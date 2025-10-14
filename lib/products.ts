
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
    price: 0.00,
    imageUrl: 'https://i.postimg.cc/Dw8v8XB3/Barakah-Business-Blueprint-Vol-I.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1-v2_zgCQDfpNjByZgD3IzzCla5XbO_lz/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
    includedInBundle: ['010'],
  },
];
