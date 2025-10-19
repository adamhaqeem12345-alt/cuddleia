
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
    downloadUrl?: string;
    disclaimer: string;
    includedInBundle?: string[];
    bundleIncludes?: string[];
}

export const products: Product[] = [
  {
    id: "001",
    name: "Barakah Business Blueprint Vol. 1 (The Gentle Beginning)",
    description: "Start your halal business journey with peace and purpose. Volume I of the Barakah Business Blueprint guides you through the gentle beginning — learning how to build with sincerity, clarity, and calm direction. You’ll explore the right business models for Muslims, choose halal payment gateways, and understand how to use automation and AI ethically to simplify your workflow.\\n\\nThis volume turns hesitation into movement, helping you take your first steady steps toward a business that grows with integrity and barakah. It also includes the 7-Day Launch Challenge, a guided plan to help you move from intention to real action — one small, sincere step at a time.\\n\\nWhat you’ll learn:\\n• The best halal business models to begin with\\n• The platforms and payment options most suitable for your first launch\\n• Ethical automation and AI tools for calm productivity\\n• Halal marketing and community-based branding principles\\n• The 7-Day Launch Challenge to start with focus and sincerity",
    price: 0,
    imageUrl: "https://i.postimg.cc/Dw8v8XB3/Barakah-Business-Blueprint-Vol-I.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/file/d/1-v2_zgCQDfpNjByZgD3IzzCla5XbO_lz/view?usp=drivesdk",
    disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    includedInBundle: ["010"],
  },
  {
    id: "006",
    name: "Barakah Business Blueprint Vol. 2 (Building The Base)",
    description: "In this second volume of the Barakah Business Blueprint, you’ll learn how to build your calm foundation — a digital home that reflects order, ease, and sincerity. We’ll walk together through setting up your ecosystem, shaping your visual identity, and crafting a workspace that keeps your effort peaceful and your intentions pure.\\n\\nYou’ll also explore how to organize your files, protect your data, and maintain your business flow with barakah. With guided system pages and structured walkthroughs, this volume helps you move from scattered effort to steady rhythm — where your work becomes a space of focus, beauty, and calm direction.\\n\\nWhat you’ll learn:\\n• How to create a well-structured, peaceful digital workspace\\n• The essential apps and systems for smooth daily management\\n• How to build your brand’s visual and organizational identity\\n• Methods to protect, back up, and maintain your business data\\n• System Companion Pages for sustainable, barakah-filled workflow",
    price: 20,
    imageUrl: "https://i.postimg.cc/KzXpt6bQ/Barakah-Business-Blueprint-Vol-II-by-Cuddleia.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/file/d/1BHSSOioZWeoQS3sOCL6f8E-EP2rHwPyF/view?usp=drivesdk",
    disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    includedInBundle: ["010"],
  },
  {
    id: "007",
    name: "Barakah Business Blueprint Vol. 3 (Creating, Marketing & Selling With Soul)",
    description: "In this third volume of the Barakah Business Blueprint, your digital home begins to speak. You’ll learn how to express your message with calm confidence — through words, visuals, and systems that reflect sincerity instead of noise. This volume guides you in creating content that carries meaning, building trust through rhythm and honesty, and sharing your business as a form of da’wah, not performance.\\n\\nYou’ll explore how to plan your content, design with intention, and craft communication that builds gentle connection with your audience. Every chapter helps you create from a place of purpose — where storytelling becomes service, and growth happens with peace.\\n\\nWhat you’ll learn:\\n• How to craft meaningful content that reflects sincerity and purpose\\n• Ways to use social media and storytelling as tools for calm connection\\n• How to design visuals and captions that align with your brand’s values\\n• Building trust through honest communication and rhythm-based posting\\n• Transforming your business into a voice of da’wah and quiet influence",
    price: 20,
    imageUrl: "https://i.postimg.cc/SsDZHJ8r/Barakah-Business-Blueprint-Vol-III.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/file/d/1oC5qtfRb2m52frSve9vGBOX2NLoDQZX4/view?usp=drivesdk",
    disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    includedInBundle: ["010"],
  },
  {
    id: "008",
    name: "Barakah Business Blueprint Vol. 4 (Nurturing, Scaling & Sustaining With Barakah)",
    description: "In this fourth volume of the Barakah Business Blueprint, you’ll learn how to sustain and grow your business without losing your calm. It’s about scaling with structure — building systems that work even when you rest, and letting automation, delegation, and discipline bring balance to your effort.\\n\\nYou’ll explore how to manage your time, organize your team, and plan your finances with barakah at the center. This volume teaches you how to maintain consistency, track performance gently, and build resilience in both workflow and faith. Growth becomes not a chase, but a steady rhythm of effort guided by trust.\\n\\nWhat you’ll learn:\\n• How to organize your systems for long-term sustainability\\n• Practical ways to automate and delegate while keeping control\\n• Time and financial management guided by simplicity and purpose\\n• How to review progress and adjust strategies without burnout\\n• Building consistency and peace through stable, faith-rooted growth",
    price: 25,
    imageUrl: "https://i.postimg.cc/KzDzbyvC/Barakah-Business-Blueprint-Vol-IV.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/file/d/1TDWKNxGadHRsBqAtmxegr7GpU7HxEIHK/view?usp=drivesdk",
    disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    includedInBundle: ["010"],
  },
  {
    id: "009",
    name: "Barakah Business Blueprint Vol. 5 (Legacy, Leadership & Wealth)",
    description: "The final volume of the Barakah Business Blueprint brings your journey to completion — transforming success into service, and profit into purpose. Here, you’ll learn how to lead with adab, manage wealth responsibly, and build systems that continue to benefit others long after your work is done.\\n\\nThis volume helps you view leadership as amanah (trust), wealth as a tool for khidmah (service), and business as a legacy of sincerity. You’ll discover how to nurture teams, reinvest with wisdom, and ensure every decision you make carries both integrity and barakah.\\n\\nWhat you’ll learn:\\n• How to lead with adab and emotional balance\\n• Principles of halal wealth management and mindful reinvestment\\n• Building a brand culture rooted in sincerity and service\\n• Turning profit into sadaqah jariyah through purposeful systems\\n• Sustaining your business as a lasting legacy of good",
    price: 15,
    imageUrl: "https://i.postimg.cc/sftVLXJn/Barakah-Business-Blueprint-Vol-V.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/file/d/16m54EeuJkE96uo5uYXD036KRXBcYqewq/view?usp=drivesdk",
disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    includedInBundle: ["010"],
  },
  {
    id: "010",
    name: "Barakah Business Blueprint — The Complete Collection (Vol. 1-5)",
    description: "Build your business with integrity, grow it with clarity, and sustain it with barakah. The Barakah Business Blueprint Complete Collection gathers all five volumes into one seamless journey — guiding you from your first intention to your lasting legacy.\\n\\nEach volume is written to help you balance faith and structure, sincerity and strategy. From understanding halal business models and setting up calm digital systems, to expressing your message with honesty, sustaining growth with peace, and leading with adab — this series is your full manual for business done with heart.\\n\\nPerfect for entrepreneurs, creatives, and dreamers who wish to earn with purpose, this collection walks beside you as both teacher and companion — helping you build, automate, and grow with peace, not pressure.\\n\\nWhat you’ll receive:\\n• All five volumes (I–V) of the Barakah Business Blueprint series\\n• Step-by-step guidance from intention to legacy\\n• Technical walkthroughs blended with calm, faith-based reflection\\n• Templates, companion pages, and challenges for practical action\\n• A complete framework to build your halal business ecosystem",
    price: 70,
    originalPrice: 80,
    imageUrl: "https://i.postimg.cc/rsqhc9sF/The-complete-collection-Vol-I.png",
    imageWidth: 1080,
    imageHeight: 1350,
    category: "Booklets",
    downloadUrl: "https://drive.google.com/drive/folders/1ZSw8l2E9gFBD6sUyyok0S2VtKgMhoeNn",
    disclaimer: "Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.",
    bundleIncludes: ["001", "006", "007", "008", "009"],
  },
  {
    id: "002",
    name: "iPad Wallpaper (Maroon Series)",
    description: "A digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.”\\n\\nKey Features:\\n• Design: High-resolution floral art with a powerful Islamic reminder.\\n• Resolution: 2048 × 2732 pixels, ensuring a sharp and clear image.\\n• Orientation: Best for landscape lock screen with a normal clock display and no widgets.\\n\\nCompatibility:\\n• iPad Pro 12.9\\\" (3rd Gen+), iPad Air 10.9\\\", iPad 10th Gen, and other 4:3 tablets.\\n• Scaled fit for iPad Mini 6.",
    price: 6,
    imageUrl: "https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: "Wallpapers",
    downloadUrl: "https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk",
    disclaimer: "All wallpaper designs are 100% my work.",
  },
  {
    id: "003",
    name: "iPad Wallpaper (Minimalist Series)",
    description: "A digital Islamic wallpaper featuring a minimalist floral background, Arabic calligraphy of Allah and Muhammad ﷺ, and the gentle reminder ‘Allah Loves You.'\\n\\nKey Features:\\n• Design: Elegant, high-resolution minimalist design.\\n• Resolution: 2048 × 2732 pixels for a crisp and clear display.\\n• Orientation: Optimized for landscape lock screen use with a normal clock and no widgets.",
    price: 5,
    imageUrl: "https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: "Wallpapers",
    downloadUrl: "https://drive.google.com/file/d/17I5xYCRP4wItUYWtGJfWSyusxCoI3FAY/view?usp=drivesdk",
    disclaimer: "All wallpaper designs are 100% my work.",
  },
  {
    id: "004",
    name: "iPad Wallpaper (Pink series)",
    description: "A digital iPad wallpaper featuring a beautiful pink floral background, calligraphy of Allah (SWT) and Muhammad (SAW), and a reminder of \\\"Allah Loves you.\\\"\\n\\nKey Features:\\n• Design: A warm and inviting pink floral aesthetic.\\n• Resolution: 2048 × 2732 pixels, delivering a high-quality, sharp image.\\n• Orientation: Works best as a landscape lock screen with a normal clock display and no widgets.",
    price: 5,
    imageUrl: "https://i.postimg.cc/CL9yrDkT/Islamic-i-Pad-Wallpaper-zip-4.png",
    imageWidth: 2732,
    imageHeight: 2048,
    category: "Wallpapers",
    downloadUrl: "https://drive.google.com/file/d/1LTR13t8qBa3js0n01cQq8197tGRDAnTw/view?usp=drivesdk",
    disclaimer: "All wallpaper designs are 100% my work.",
  },
  {
    id: "005",
    name: "Cuddleia Test product",
    description: "This is a test product for the Cuddleia store.\\n    \\nKey Features:\\n• Use: Intended for testing the purchase and delivery flow.\\n• Price: Set to a minimal amount for transaction testing.\\n• Content: A placeholder image and download link.",
    price: 0.24,
    imageUrl: "https://i.postimg.cc/MTBtTMXR/Heading.png",
    imageWidth: 1920,
    imageHeight: 1080,
    category: "Wallpapers",
    downloadUrl: "https://drive.google.com/file/d/1Kf9NdBI6T7rAow-D5Pf4F_5--Em5cjr0/view?usp=drivesdk",
    disclaimer: "All wallpaper designs are 100% my work.",
  }
];

// Helper function to find a product by its ID
export const getProductById = (id: string): Product | undefined => {
    const product = products.find(p => p.id === id);

    if (product?.bundleIncludes) {
        const includedProducts = product.bundleIncludes
            .map(bundleId => products.find(p => p.id === bundleId))
            .filter((p): p is Product => p !== undefined);
        return {
            ...product,
            bundleProducts: includedProducts,
        };
    }
    return product;
}

// Extend Product interface to include resolved bundle products
export interface ProductWithBundled extends Product {
    bundleProducts?: Product[];
}

    
