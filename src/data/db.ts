import fs from 'fs';
import path from 'path';
import { Product, Category, OrderDetails, CustomerReview } from '@/types';
import { products as initialProducts } from './products';
import { categories as initialCategories } from './categories';
import { customerReviews as initialReviews } from './reviews';

const STORE_FILE = path.join(process.cwd(), 'src', 'data', 'store.json');

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

// Ensure store.json exists
export function getStoreData(): StoreData {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      const initialData: StoreData = {
        products: initialProducts,
        categories: initialCategories,
        orders: [
          {
            orderId: 'GT-982314',
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
                image: 'https://genuinetask.com.bd/wp-content/uploads/2026/07/df22dd6878b688b871860f01e0537f47_67a337a6-7950-491c-bf04-0b964eb43912-300x225.webp',
                price: 1250,
                regularPrice: 1650,
                quantity: 1,
                selectedSize: 'Small (Set of 3: 13″ x 9″ each)',
                selectedFrameColor: 'Matte Black',
              }
            ],
            subtotal: 1250,
            total: 1320,
            orderDate: 'February 12, 2026',
            notes: 'Please call before delivering parcel',
          }
        ],
        reviews: initialReviews,
        settings: defaultSettings,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }

    const fileContent = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading store.json:', error);
    return {
      products: initialProducts,
      categories: initialCategories,
      orders: [],
      reviews: initialReviews,
      settings: defaultSettings,
    };
  }
}

export function saveStoreData(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to store.json:', error);
    throw error;
  }
}

// Product helpers
export function getAllProducts(): Product[] {
  return getStoreData().products;
}

export function getProductByIdOrSlug(idOrSlug: string): Product | undefined {
  const products = getAllProducts();
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export function saveProduct(productData: Partial<Product>): Product {
  const store = getStoreData();
  const index = store.products.findIndex(p => p.id === productData.id || p.slug === productData.slug);

  if (index >= 0) {
    // Update existing
    const updated: Product = {
      ...store.products[index],
      ...productData,
      id: store.products[index].id,
      slug: productData.slug || store.products[index].slug,
    } as Product;
    store.products[index] = updated;
    saveStoreData(store);
    return updated;
  } else {
    // Create new
    const slug = productData.slug || (productData.title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const newProduct: Product = {
      id: productData.id || `prod_${slug}_${Date.now()}`,
      title: productData.title || 'New Wall Frame',
      slug,
      category: productData.category || 'Best Selling',
      categorySlug: productData.categorySlug || 'best-selling',
      price: productData.price || 1250,
      regularPrice: productData.regularPrice || Math.round((productData.price || 1250) * 1.3),
      priceRange: productData.priceRange || `৳ ${(productData.price || 1250).toLocaleString()}`,
      image: productData.image || 'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg',
      galleryImages: productData.galleryImages || [productData.image || 'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg'],
      sale: productData.sale ?? true,
      featured: productData.featured ?? false,
      bestSeller: productData.bestSeller ?? false,
      shortDescription: productData.shortDescription || 'Handcrafted luxury wall art with UV matte finish.',
      description: productData.description || '<p>Transform any blank wall into a sophisticated statement.</p>',
      specifications: productData.specifications || {
        material: 'High-grade Korean Synthetic Wood Composite',
        finish: 'Anti-glare UV Textured Matte Lamination',
        mounting: 'Pre-installed heavy-duty sawtooth hanger + wall hooks included',
        frameColorOptions: ['Matte Black', 'Luxury Gold', 'Natural Walnut Wood', 'Minimalist White'],
        dimensions: 'Small: 13″ x 9″ | Medium: 17″ x 13″ | Large: 25″ x 17″',
        weight: '1.2 kg - 2.8 kg',
      },
      variations: productData.variations || [
        { size: 'Small: 13″ x 9″ (Set of 3)', label: 'Small: 13″ x 9″ (each) – Set of 3', price: productData.price || 1250, regularPrice: Math.round((productData.price || 1250) * 1.3), inStock: true },
        { size: 'Medium: 17″ x 13″ (Set of 3)', label: 'Medium: 17″ x 13″ (each) – Set of 3', price: Math.round((productData.price || 1250) * 1.8), regularPrice: Math.round((productData.price || 1250) * 2.3), inStock: true },
        { size: 'Large: 25″ x 17″ (Set of 3)', label: 'Large: 25″ x 17″ (each) – Set of 3', price: Math.round((productData.price || 1250) * 2.8), regularPrice: Math.round((productData.price || 1250) * 3.5), inStock: true },
      ],
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 12,
      tags: productData.tags || ['wall art', 'frame', 'bangladesh'],
    };

    store.products.unshift(newProduct);
    saveStoreData(store);
    return newProduct;
  }
}

export function deleteProduct(idOrSlug: string): boolean {
  const store = getStoreData();
  const initialLength = store.products.length;
  store.products = store.products.filter(p => p.id !== idOrSlug && p.slug !== idOrSlug);
  if (store.products.length !== initialLength) {
    saveStoreData(store);
    return true;
  }
  return false;
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
  const order = store.orders.find(o => o.orderId === orderId);
  if (order) {
    // Attach status or notes
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

  const existingIndex = store.reviews.findIndex(r => r.id === reviewData.id);
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
      date: reviewData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
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
  store.reviews = store.reviews.filter(r => r.id !== id);
  if (store.reviews.length !== initialLength) {
    saveStoreData(store);
    return true;
  }
  return false;
}

