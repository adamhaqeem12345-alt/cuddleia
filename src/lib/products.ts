
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  downloadUrl: string; // The link to the digital product file
};

export const products: Product[] = [
  {
    id: '001',
    name: 'Barakah Business Blueprint',
    description: 'The Barakah Business Blueprint is a beginner-friendly guidebook designed for Muslims who want to start an online business from zero while staying true to halal principles. It covers the main business models you can begin with (digital products, dropshipping, or physical goods), the best platforms to use without wasting money (Shopify, Gumroad, Etsy, Shopee, and more), and halal payment gateways like Toyyibpay, Stripe, and PayPal. You’ll also learn why having your own domain and branding builds long-term trust, how simple automation and AI tools such as n8n, Google Scripts, and Canva AI can save hours of work, and how to market effectively on TikTok, Instagram, and Pinterest. This is not a heavy textbook but a clear starting point that highlights the essentials, avoids the common pitfalls, and helps you take your first steps with confidence. Start your halal business journey today, build with integrity, earn with barakah.',
    price: 25.00,
    category: 'Booklets',
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk' // Replace with your actual download link
  },
  {
    id: '002',
    name: 'iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Maroon Series)',
    description: 'This is a digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.” ✨ It’s made for iPad A16 (2048 × 2732 pixels) and works best as a lock screen in landscape orientation with the normal clock display and no widgets. The wallpaper is high-resolution and clear, suitable for iPad Pro 12.9-inch (3rd Gen and newer), iPad Air 10.9-inch, iPad 10th Gen, iPad Mini 6 (scaled fit), and other tablets with a similar 4:3 aspect ratio. ⚠️ Please note, it’s not recommended for portrait lock screens. After purchase, you will receive a high-quality PNG file sent directly to your email. This is a digital item only (no physical shipping), and it’s for personal use only—not for resale or redistribution.',
    price: 6.00,
    category: 'Wallpapers',
    imageUrl: 'https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk'
  },
  {
    id: '003',
    name: 'iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Minimalist Series)',
    description: 'A digital Islamic wallpaper featuring floral background and Arabic calligraphy of Allah and Muhammad ﷺ, with the reminder ‘Allah Loves You\'. ✨It’s made for iPad A16 (2048 × 2732 pixels) and works best as a lock screen in landscape orientation with the normal clock display and no widgets. The wallpaper is high-resolution and clear, suitable for iPad Pro 12.9-inch (3rd Gen and newer), iPad Air 10.9-inch, iPad 10th Gen, iPad Mini 6 (scaled fit), and other tablets with a similar 4:3 aspect ratio. ⚠️ Please note, it’s not recommended for portrait lock screens. After purchase, you will receive a high-quality PNG file sent directly to your email. This is a digital item only (no physical shipping), and it’s for personal use only—not for resale or redistribution.',
    price: 5.00,
    category: 'Wallpapers',
    imageUrl: 'https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png',
    downloadUrl: 'https://drive.google.com/file/d/17I5xYCRP4wItUYWtGJfWSyusxCoI3FAY/view?usp=drivesdk'
  }
];
