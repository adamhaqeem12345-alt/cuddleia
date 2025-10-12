
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
  },
  {
    id: '006',
    name: 'Barakah Business Blueprint Vol. 2 (Building The Base)',
    description: `In this second volume of the Barakah Business Blueprint, you’ll learn how to build your calm foundation — a digital home that reflects order, ease, and sincerity. We’ll walk together through setting up your ecosystem, shaping your visual identity, and crafting a workspace that keeps your effort peaceful and your intentions pure.

You’ll also explore how to organize your files, protect your data, and maintain your business flow with barakah. With guided system pages and structured walkthroughs, this volume helps you move from scattered effort to steady rhythm — where your work becomes a space of focus, beauty, and calm direction.

What you’ll learn:
• How to create a well-structured, peaceful digital workspace
• The essential apps and systems for smooth daily management
• How to build your brand’s visual and organizational identity
• Methods to protect, back up, and maintain your business data
• System Companion Pages for sustainable, barakah-filled workflow`,
    price: 20.00,
    imageUrl: 'https://i.postimg.cc/KzXpt6bQ/Barakah-Business-Blueprint-Vol-II-by-Cuddleia.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1BHSSOioZWeoQS3sOCL6f8E-EP2rHwPyF/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
  },
  {
    id: '007',
    name: 'Barakah Business Blueprint Vol. 3 (Creating, Marketing & Selling With Soul)',
    description: `In this third volume of the Barakah Business Blueprint, your digital home begins to speak. You’ll learn how to express your message with calm confidence — through words, visuals, and systems that reflect sincerity instead of noise. This volume guides you in creating content that carries meaning, building trust through rhythm and honesty, and sharing your business as a form of da’wah, not performance.

You’ll explore how to plan your content, design with intention, and craft communication that builds gentle connection with your audience. Every chapter helps you create from a place of purpose — where storytelling becomes service, and growth happens with peace.

What you’ll learn:
• How to craft meaningful content that reflects sincerity and purpose
• Ways to use social media and storytelling as tools for calm connection
• How to design visuals and captions that align with your brand’s values
• Building trust through honest communication and rhythm-based posting
• Transforming your business into a voice of da’wah and quiet influence`,
    price: 20.00,
    imageUrl: 'https://i.postimg.cc/SsDZHJ8r/Barakah-Business-Blueprint-Vol-III.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1oC5qtfRb2m52frSve9vGBOX2NLoDQZX4/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
  },
  {
    id: '008',
    name: 'Barakah Business Blueprint Vol. 4 (Nurturing, Scaling & Sustaining With Barakah)',
    description: `In this fourth volume of the Barakah Business Blueprint, you’ll learn how to sustain and grow your business without losing your calm. It’s about scaling with structure — building systems that work even when you rest, and letting automation, delegation, and discipline bring balance to your effort.

You’ll explore how to manage your time, organize your team, and plan your finances with barakah at the center. This volume teaches you how to maintain consistency, track performance gently, and build resilience in both workflow and faith. Growth becomes not a chase, but a steady rhythm of effort guided by trust.

What you’ll learn:
• How to organize your systems for long-term sustainability
• Practical ways to automate and delegate while keeping control
• Time and financial management guided by simplicity and purpose
• How to review progress and adjust strategies without burnout
• Building consistency and peace through stable, faith-rooted growth`,
    price: 25.00,
    imageUrl: 'https://i.postimg.cc/KzDzbyvC/Barakah-Business-Blueprint-Vol-IV.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/1TDWKNxGadHRsBqAtmxegr7GpU7HxEIHK/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
  },
  {
    id: '009',
    name: 'Barakah Business Blueprint Vol. 5 (Legacy, Leadership & Wealth)',
    description: `In this fifth and final volume of the Barakah Business Blueprint, you will learn how to lead with heart and sustain with wisdom. This is the stage where your work begins to impact others — where your systems, people, and community start to rely on your calm guidance. Inside, we’ll explore how to lead ethically, manage wealth with purpose, and build a legacy that outlives your name. Each page reminds you that leadership in Islam is not power, but amanah — and true wealth is not in ownership, but in what you leave behind in others.`,
    price: 15.00,
    imageUrl: 'https://i.postimg.cc/sftVLXJn/Barakah-Business-Blueprint-Vol-V.png',
    imageWidth: 1080,
    imageHeight: 1350,
    category: 'Booklets',
    downloadUrl: 'https://drive.google.com/file/d/16m54EeuJkE96uo5uYXD036KRXBcYqewq/view?usp=drivesdk',
    disclaimer: 'Written by AI, guided by the author’s ideas and heart, and carefully reviewed for sincerity and truth.',
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
