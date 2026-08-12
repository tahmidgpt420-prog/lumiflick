export interface ProductVariation {
  size: string; // e.g. "Small: 13″ x 9″ (Set of 3)" or "13″ x 9″"
  label: string;
  price: number;
  regularPrice: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  regularPrice?: number;
  priceRange?: string;
  image: string;
  galleryImages?: string[];
  sale?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  shortDescription?: string;
  description?: string;
  specifications?: {
    material?: string;
    finish?: string;
    mounting?: string;
    frameColorOptions?: string[];
    dimensions?: string;
    weight?: string;
  };
  variations?: ProductVariation[];
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
  description?: string;
}

export interface CartItem {
  id: string; // unique combo of product slug + selected variation/size + frame color
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  regularPrice?: number;
  quantity: number;
  selectedSize?: string;
  selectedFrameColor?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  productName?: string;
  location?: string;
  screenshotImage?: string;
  featured?: boolean;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  shippingCost: number;
  paymentMethod: 'cod' | 'bkash';
  items: CartItem[];
  subtotal: number;
  total: number;
  orderDate: string;
  notes?: string;
}
