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
  // Piece selection: customer picks 1, 2, or 3 pieces from a set
  pieceSelectionEnabled?: boolean;
  maxPieces?: number; // default 3
  /** Set by the Firestore mirror on every save — used for newest/oldest sorting. */
  updatedAt?: number;
  /** Show size chart as the last gallery image. Defaults to true. */
  showSizeChart?: boolean;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
  count?: number;
  description?: string;
  parentId?: string | null;
  parentSlug?: string | null;
  /** Show a dedicated product section for this category on the homepage. */
  showOnHomepage?: boolean;
  /** Drag-to-reorder position, compared among siblings (same parent). Controls nav bar + homepage order. */
  order?: number;
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
  selectedPieces?: number; // how many pieces from a set
  selectedPiecesLabel?: string; // e.g. "1st and 3rd pieces"
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

export interface HeroBanner {
  id: string;
  image: string;
  link: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  badge?: string;
  order?: number;
  isActive?: boolean;
}

