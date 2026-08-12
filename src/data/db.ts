import fs from 'fs';
import path from 'path';
import { Product, Category, OrderDetails, CustomerReview } from '@/types';
import { products as initialProducts } from './products';
import { categories as initialCategories } from './categories';
import { customerReviews as initialReviews } from './reviews';

const STORE_FILE = path.join(process.cwd(), 'src', 'data', 'store.json');
const TMP_STORE_FILE = '/tmp/store.json';

// In-memory cache for serverless environments (e.g. Vercel)
let memoryStore: StoreData | null = null;

export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  insideDhakaDelivery: number;
  outsideDhakaDelivery: number;
  promoNotice: string;
  adminPin: string;
}

export interface StoreData {
  products: Product[];
  categories: Category[];
  orders: OrderDetails[];
  reviews: CustomerReview[];
  settings: StoreSettings;
}

const defaultSettings: StoreSettings = {
  storeName: 'LUMIFLICK',
  phone: '+8801886670211',
  email: 'info@lumiflick.shop',
  address: 'Matbor bari, Baunia, Uttara, Dhaka, Bangladesh',
  insideDhakaDelivery: 70,
  outsideDhakaDelivery: 130,
  promoNotice: '🎁 Upto 35% Off— Biggest Sale of the Year',
  adminPin: 'lumiflick2026',
};

// Retrieve store data with serverless fallback
export function getStoreData(): StoreData {
  if (memoryStore) {
    return memoryStore;
  }

  // 1. Try reading from /tmp/store.json (written in current serverless instance)
  try {
    if (fs.existsSync(TMP_STORE_FILE)) {
      const fileContent = fs.readFileSync(TMP_STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(fileContent);
      return memoryStore!;
    }
  } catch (e) {
    // ignore
  }

  // 2. Try reading from src/data/store.json (bundled with repository)
  try {
    if (fs.existsSync(STORE_FILE)) {
      const fileContent = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(fileContent);
      return memoryStore!;
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback to initial seed data
  const initialData: StoreData = {
    products: initialProducts,
    categories: initialCategories,
    orders: [
      {
        orderId: 'LF-982314',
        customerName: 'Md. Rakib Hasan',
        phone: '01886670211',
        email: 'rakib@gmail.com',
        address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
        city: 'Dhaka',
        deliveryZone: 'inside_dhaka',
        shippingCost: 70,
        paymentMethod: 'cod',
        items: [
          {
            id: 'porsche-911-gt3-rs-edition_Small-(Set-of-3:-13″-x-9″-each)_Matte-Black',
            productId: 'prod_porsche-911-gt3-rs-edition',
            title: 'Porsche 911 GT3 RS Edition',
            slug: 'porsche-911-gt3-rs-edition',
            image: '/logo.png',
            price: 1250,
            regularPrice: 1650,
            quantity: 1,
            selectedSize: 'Small (Set of 3: 13″ x 9″ each)',
            selectedFrameColor: 'Matte Black',
          },
        ],
        subtotal: 1250,
        total: 1320,
        orderDate: 'February 12, 2026',
        notes: 'Please call before delivering parcel',
      },
    ],
    reviews: initialReviews,
    settings: defaultSettings,
  };

  memoryStore = initialData;
  return memoryStore;
}

export function saveStoreData(data: StoreData): void {
  memoryStore = data;

  // 1. Try writing to src/data/store.json (persistent local development)
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return;
  } catch (err: any) {
    // Expected on serverless hosts like Vercel (EROFS: read-only file system)
    console.warn('Cannot write to src/data/store.json (read-only filesystem). Saving to /tmp/store.json.');
  }

  // 2. Try writing to /tmp/store.json (writable on Vercel / AWS Lambda)
  try {
    fs.writeFileSync(TMP_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (tmpErr) {
    console.warn('Cannot write to /tmp/store.json, holding in memory.');
  }
}

// Product helpers
export function getAllProducts(): Product[] {
  return getStoreData().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getStoreData().products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getStoreData().products.find((p) => p.id === id);
}

export function getProductByIdOrSlug(idOrSlug: string): Product | undefined {
  return getStoreData().products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function saveProduct(productData: Partial<Product>): Product {
  const store = getStoreData();
  const existingIndex = store.products.findIndex((p) => p.id === productData.id);

  if (existingIndex >= 0) {
    const updated: Product = {
      ...store.products[existingIndex],
      ...productData,
    } as Product;
    store.products[existingIndex] = updated;
    saveStoreData(store);
    return updated;
  } else {
    const slug =
      productData.slug ||
      (productData.title || 'frame')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      id: productData.id || `prod_${slug}_${Date.now()}`,
      title: productData.title || 'Untitled Wall Frame',
      slug: slug,
      category: productData.category || 'Modern Frames',
      categorySlug:
        productData.categorySlug ||
        (productData.category || 'modern-frames')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      price: productData.price || 1250,
      regularPrice: productData.regularPrice || 1650,
      priceRange: productData.priceRange || `৳ ${productData.price || 1250}`,
      image: productData.image || '/logo.png',
      galleryImages: productData.galleryImages || [productData.image || '/logo.png'],
      sale: productData.sale ?? true,
      featured: productData.featured ?? true,
      bestSeller: productData.bestSeller ?? false,
      shortDescription: productData.shortDescription || 'Handcrafted luxury wall frame with UV matte textured finish.',
      description: productData.description || '<p>Transform any blank wall into a sophisticated statement with LUMIFLICK.</p>',
      specifications: productData.specifications || {
        material: 'High-grade Korean Synthetic Wood Composite',
        finish: 'Anti-glare UV Textured Matte Lamination',
        mounting: 'Pre-installed heavy-duty sawtooth hanger included',
        dimensions: 'Standard Set (13″ x 19″)',
        weight: '1.5 kg',
        frameColorOptions: ['Matte Black', 'Luxury Gold', 'Natural Walnut Wood'],
      },
      variations: productData.variations || [
        {
          size: 'Small (Set of 3: 13″ x 9″ each)',
          label: 'Small: 13″ x 9″ (each) – Set of 3',
          price: productData.price || 1250,
          regularPrice: productData.regularPrice || 1650,
          inStock: true,
        },
      ],
    };

    store.products.unshift(newProduct);
    saveStoreData(store);
    return newProduct;
  }
}

export function deleteProduct(id: string): boolean {
  const store = getStoreData();
  const initialLength = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  if (store.products.length !== initialLength) {
    saveStoreData(store);
    return true;
  }
  return false;
}

// Category helpers
export function getAllCategories(): Category[] {
  return getStoreData().categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getStoreData().categories.find((c) => c.slug === slug);
}

export function saveCategory(categoryData: Partial<Category>): Category {
  const store = getStoreData();
  const existingIndex = store.categories.findIndex((c) => c.slug === categoryData.slug);

  if (existingIndex >= 0) {
    const updated: Category = {
      ...store.categories[existingIndex],
      ...categoryData,
    } as Category;
    store.categories[existingIndex] = updated;
    saveStoreData(store);
    return updated;
  } else {
    const slug =
      categoryData.slug ||
      (categoryData.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCat: Category = {
      id: categoryData.id || `cat_${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug,
      image: categoryData.image || '/logo.png',
      count: 0,
      description: categoryData.description || `Explore ${categoryData.name} collection at LUMIFLICK.`,
    };

    store.categories.push(newCat);
    saveStoreData(store);
    return newCat;
  }
}

// Order helpers
export function getAllOrders(): OrderDetails[] {
  return getStoreData().orders;
}

export function createOrder(order: OrderDetails): OrderDetails {
  const store = getStoreData();
  store.orders.unshift(order);
  saveStoreData(store);
  return order;
}

export function updateOrderStatus(orderId: string, status: string): boolean {
  const store = getStoreData();
  const order = store.orders.find((o) => o.orderId === orderId);
  if (order) {
    (order as any).status = status;
    saveStoreData(store);
    return true;
  }
  return false;
}

// Review helpers
export function getAllReviews(): CustomerReview[] {
  const store = getStoreData();
  if (!store.reviews || store.reviews.length === 0) {
    return initialReviews;
  }
  return store.reviews;
}

export function saveReview(reviewData: Partial<CustomerReview>): CustomerReview {
  const store = getStoreData();
  if (!store.reviews) {
    store.reviews = [...initialReviews];
  }

  const existingIndex = store.reviews.findIndex((r) => r.id === reviewData.id);
  if (existingIndex >= 0) {
    const updated: CustomerReview = {
      ...store.reviews[existingIndex],
      ...reviewData,
    } as CustomerReview;
    store.reviews[existingIndex] = updated;
    saveStoreData(store);
    return updated;
  } else {
    const newReview: CustomerReview = {
      id: reviewData.id || `rev_${Date.now()}`,
      author: reviewData.author || 'LUMIFLICK Customer',
      rating: reviewData.rating || 5,
      date:
        reviewData.date ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      verified: reviewData.verified ?? true,
      comment: reviewData.comment || 'Outstanding frame quality and vibrant printing!',
      productName: reviewData.productName || 'Handcrafted Luxury Wall Frame',
      location: reviewData.location || 'Dhaka, Bangladesh',
      screenshotImage: reviewData.screenshotImage || '',
      featured: reviewData.featured ?? true,
    };
    store.reviews.unshift(newReview);
    saveStoreData(store);
    return newReview;
  }
}

export function deleteReview(id: string): boolean {
  const store = getStoreData();
  if (!store.reviews) return false;
  const initialLength = store.reviews.length;
  store.reviews = store.reviews.filter((r) => r.id !== id);
  if (store.reviews.length !== initialLength) {
    saveStoreData(store);
    return true;
  }
  return false;
}

// Settings helpers
export function getSettings(): StoreSettings {
  return getStoreData().settings || defaultSettings;
}

export function updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const store = getStoreData();
  store.settings = {
    ...(store.settings || defaultSettings),
    ...newSettings,
  };
  saveStoreData(store);
  return store.settings;
}
