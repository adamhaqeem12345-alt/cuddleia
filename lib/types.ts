export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Price in USD
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: string;
    downloadUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}
