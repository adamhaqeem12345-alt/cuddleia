
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: 'Booklets' | 'Wallpapers';
    downloadUrl: string;
    disclaimer: string;
}

export const products: Product[] = [
  {
    id: '001',
    name: 'Vol. 1: Barakah Business Blueprint',
    description: `The foundational guide for Muslims starting a halal online business. This volume covers essential business models (digital, dropshipping), platform selection (Shopify, Etsy), and setting up halal payment gateways.`,
    price: 0.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '006',
    name: 'Vol. 2: Branding & Identity with Iman',
    description: 'This volume guides you through creating a heart-centered brand that reflects your Islamic values. Learn to define your mission, craft a memorable brand name, and design a visual identity that connects with your audience.',
    price: 12.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk', // Placeholder
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '007',
    name: 'Vol. 3: Halal Marketing & Sales',
    description: 'Discover ethical and effective marketing strategies. This volume covers content creation, social media presence with integrity, and sales techniques that are built on honesty and trust, ensuring your methods are halal.',
    price: 12.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk', // Placeholder
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '008',
    name: 'Vol. 4: Automation & Efficiency',
    description: 'Learn to streamline your business operations to free up your time for what matters most. This volume explores tools for automating marketing, order fulfillment for digital products, and managing customer service efficiently.',
    price: 12.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk', // Placeholder
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '009',
    name: 'Vol. 5: Scaling with Barakah',
    description: 'The final volume focuses on sustainable growth. Learn how to expand your product line, manage finances according to Islamic principles (zakat, avoiding riba), and build a business that has a lasting positive impact.',
    price: 12.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk', // Placeholder
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '010',
    name: 'The Barakah Blueprint (Full 5-Volume Series)',
    description: `Get the entire 5-volume collection in one bundle! This complete series guides you through building a sincere, halal, and successful business from the ground up, covering branding, marketing, automation, and scaling with Iman.`,
    price: 45.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk', // Placeholder link
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '002',
    name: 'iPad Wallpaper (Maroon Series)',
    description: `A digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.”

Key Features:
• Design: High-resolution floral art with a powerful Islamic reminder.
• Resolution: 2048 × 2732 pixels, ensuring a sharp and clear image.
• Orientation: Best for landscape lock screen with a normal clock display and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.`,
    price: 6.00,
    imageUrl: 'https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png',
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.',
  },
  {
    id: '003',
    name: 'iPad Wallpaper (Minimalist Series)',
    description: `A digital Islamic wallpaper featuring a minimalist floral background, Arabic calligraphy of Allah and Muhammad ﷺ, and the gentle reminder ‘Allah Loves You.'

Key Features:
• Design: Elegant, high-resolution minimalist design.
• Resolution: 2048 × 2732 pixels for a crisp and clear display.
• Orientation: Optimized for landscape lock screen use with a normal clock and no widgets.`,
    price: 5.00,
    imageUrl: 'https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png',
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/17I5xYCRP4wItUYWtGJfWSyusxCoI3FAY/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.',
  },
    {
    id: '004',
    name: 'iPad Wallpaper (Pink series)',
    description: `A digital iPad wallpaper featuring a beautiful pink floral background, calligraphy of Allah (SWT) and Muhammad (SAW), and a reminder of "Allah Loves you."

Key Features:
• Design: A warm and inviting pink floral aesthetic.
• Resolution: 2048 × 2732 pixels, delivering a high-quality, sharp image.
• Orientation: Works best as a landscape lock screen with a normal clock display and no widgets.`,
    price: 5.00,
    imageUrl: 'https://i.postimg.cc/CL9yrDkT/Islamic-i-Pad-Wallpaper-zip-4.png',
    imageWidth: 2732,
    imageHeight: 2048,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1LTR13t8qBa3js0n01cQq8197tGRDAnTw/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.',
  },
  {
    id: '005',
    name: 'Cuddleia Test product',
    description: `This is a test product for the Cuddleia store.
    
Key Features:
• Use: Intended for testing the purchase and delivery flow.
• Price: Set to a minimal amount for transaction testing.
• Content: A placeholder image and download link.`,
    price: 0.24,
    imageUrl: 'https://i.postimg.cc/MTBtTMXR/Heading.png',
    imageWidth: 1920,
    imageHeight: 1080,
    category: 'Wallpapers',
    downloadUrl: 'https://drive.google.com/file/d/1Kf9NdBI6T7rAow-D5Pf4F_5--Em5cjr0/view?usp=drivesdk',
    disclaimer: 'All wallpaper designs are 100% my work.',
  },
];
