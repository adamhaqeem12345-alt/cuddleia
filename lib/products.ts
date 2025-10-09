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
    name: 'Barakah Business Blueprint: Halal Business Guide',
    description: `A beginner-friendly guide for Muslims starting a halal online business from scratch. This is a clear starting point that highlights the essentials, avoids common pitfalls, and helps you take your first steps with confidence.

What you'll learn:
• Business Models: Digital products, dropshipping, or physical goods.
• Platforms: Best platforms to use without wasting money (Shopify, Gumroad, Etsy, Shopee, and more).
• Halal Payments: Guidance on gateways like Toyyibpay, Stripe, and PayPal.
• Branding: Why your own domain builds long-term trust.
• Automation & AI: How tools like n8n and Canva AI can save you hours.
• Marketing: How to effectively market on TikTok, Instagram, and Pinterest.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'All content is AI-generated and all designs are created by me.',
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
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
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
• Orientation: Optimized for landscape lock screen use with a normal clock and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
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
• Orientation: Works best as a landscape lock screen with a normal clock display and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
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
