
export interface Product {
    id: string;
    name: string;
    description: string;
    longDescription?: string; // Optional long description for product pages
    price: number; // Price in USD cents (e.g., 1500 = $15.00)
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: string;
    downloadUrl: string;
    disclaimer: string;
}

export interface CartItem extends Product {
  quantity: number;
}
