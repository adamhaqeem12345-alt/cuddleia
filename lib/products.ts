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
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
  {
    id: '006',
    name: 'Vol. 2: The Art of Halal Branding',
    description: `Discover how to build a brand that resonates with Muslim values. This volume explores brand identity, creating a memorable logo, and establishing long-term trust with your audience through authentic storytelling.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
   {
    id: '007',
    name: 'Vol. 3: Mastering Digital Marketing',
    description: `Learn how to market your products effectively on platforms like TikTok, Instagram, and Pinterest. This volume focuses on content strategies that attract and engage your ideal customers without compromising your values.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
   {
    id: '008',
    name: 'Vol. 4: Automation & AI for Barakah',
    description: `Unlock the power of automation to save time and effort. This volume teaches you how to use tools like n8n for workflow automation and Canva AI for design, allowing you to focus on what truly matters in your business.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
    disclaimer: 'Content is AI-generated and designs are by me.',
  },
   {
    id: '009',
    name: 'Vol. 5: Scaling with Iman & Strategy',
    description: `The final volume on growing your business sustainably. Learn about financial management, customer service excellence, and long-term strategic planning, all while keeping your faith at the center of your operations.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1080,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk',
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
  // --- TEMPLATE FOR NEW PRODUCT ---
  // Copy and paste the block below to add a new product.
  // Make sure to change the 'id' to a new unique number.
  /*
  {
    id: '006', // <-- Change this to a new unique number
    name: 'Your New Product Name',
    description: `A detailed description of your product.
    
You can even use multiple lines for features.
• Feature 1
• Feature 2`,
    price: 9.99, // Set the price in USD
    imageUrl: 'https://i.postimg.cc/your-image-url.png', // URL for the product image
    imageWidth: 1080, // Width of the image
    imageHeight: 1080, // Height of the image
    category: 'Booklets', // or 'Wallpapers'
    downloadUrl: 'https://drive.google.com/your-file-link', // The Google Drive link for the download
    disclaimer: 'Your disclaimer text here.',
  },
  */
];
