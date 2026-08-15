import fs from 'fs';
import path from 'path';
import { Product, Category, OrderDetails, CustomerReview, HeroBanner, RawPhoto } from '@/types';
import rawStoreData from './store.json';

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
  /** @deprecated unused — real admin auth lives in ADMIN_USERNAME/ADMIN_PASSWORD_HASH env vars */
  adminPin?: string;
  headerScripts?: string;
  bodyScripts?: string;
  footerScripts?: string;
  /** Homepage "Frame Effect" before/after slider images. */
  frameEffectBeforeImage?: string;
  frameEffectAfterImage?: string;
  /** Top scrolling announcement bar lines (emoji + text), admin add/remove/edit-able. */
  promoBarItems?: { icon: string; text: string }[];
}

export interface StoreData {
  products: Product[];
  categories: Category[];
  orders: OrderDetails[];
  reviews: CustomerReview[];
  rawPhotos?: RawPhoto[];
  settings: StoreSettings;
  banners?: HeroBanner[];
  // Tombstones so a delete sticks even for items seeded from the static
  // catalog or Firestore (which the JSON store doesn't otherwise know
  // about) — without these, deleting a Firestore/static-sourced item just
  // makes it reappear the next time the admin API merges the three sources.
  deletedProductKeys?: string[];
  deletedCategorySlugs?: string[];
  deletedBannerIds?: string[];
  deletedReviewIds?: string[];
  deletedRawPhotoIds?: string[];
}

const defaultSettings: StoreSettings = {
  storeName: 'LUMIFLICK',
  phone: '+8801400307299',
  email: 'lumiflick@gmail.com',
  address: 'PTI Mor, Khulna, Bangladesh - 9100',
  insideDhakaDelivery: 70,
  outsideDhakaDelivery: 130,
  promoNotice: '🎁 Upto 35% Off— Biggest Sale of the Year',
  adminPin: 'lumiflick2026',
  headerScripts: '',
  bodyScripts: '',
  footerScripts: '',
  frameEffectBeforeImage: '/logo.png',
  frameEffectAfterImage: '/logo.png',
  promoBarItems: [
    { icon: '🎁', text: 'Upto 35% Off— Biggest Sale of the Year' },
    { icon: '💳', text: 'Cash on Delivery Available' },
    { icon: '🚚', text: 'Fast Delivery All Over Bangladesh' },
  ],
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
    products: (rawStoreData.products || []) as Product[],
    categories: (rawStoreData.categories || []) as Category[],
    orders: [
      {
        orderId: 'LF-982314',
        customerName: 'Sample Customer',
        phone: '01000000000',
        email: 'sample@example.com',
        address: 'Sample Address, Dhaka',
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
    reviews: (rawStoreData.reviews || []) as CustomerReview[],
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
  if (!idOrSlug) return undefined;
  const decoded = decodeURIComponent(idOrSlug).toLowerCase().trim();
  const products = getStoreData().products;
  return products.find(
    (p) =>
      p.id?.toLowerCase() === decoded ||
      p.slug?.toLowerCase() === decoded ||
      (p.title &&
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === decoded)
  );
}

export function saveProduct(productData: Partial<Product>): Product {
  const store = getStoreData();

  // Un-tombstone — a save means this key is wanted again.
  if (store.deletedProductKeys?.length) {
    const keys = [productData.id, productData.slug].filter(Boolean) as string[];
    store.deletedProductKeys = store.deletedProductKeys.filter((k) => !keys.includes(k));
  }

  const existingIndex = store.products.findIndex(
    (p) =>
      (productData.id && p.id === productData.id) ||
      (productData.id && p.slug === productData.id) ||
      (productData.slug && p.slug === productData.slug)
  );

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
  const removed = store.products.find((p) => p.id === id || p.slug === id);
  store.products = store.products.filter((p) => p.id !== id && p.slug !== id);

  const tombstones = new Set(store.deletedProductKeys || []);
  tombstones.add(id);
  if (removed?.slug) tombstones.add(removed.slug);
  if (removed?.id) tombstones.add(removed.id);
  store.deletedProductKeys = Array.from(tombstones);

  if (store.products.length !== initialLength) {
    saveStoreData(store);
    return true;
  }
  // Even if nothing was in the JSON store under this key (e.g. it only
  // existed in Firestore/static), still persist the tombstone so it
  // doesn't reappear in the merged product list.
  saveStoreData(store);
  return true;
}

export function getDeletedProductKeys(): Set<string> {
  return new Set(getStoreData().deletedProductKeys || []);
}

// Category helpers
export function getAllCategories(): Category[] {
  return getStoreData().categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getStoreData().categories.find((c) => c.slug === slug);
}

export function saveCategory(categoryData: Partial<Category>, oldSlug?: string): Category {
  const store = getStoreData();

  // Un-tombstone — a save means this slug is wanted again.
  if (store.deletedCategorySlugs?.length && categoryData.slug) {
    store.deletedCategorySlugs = store.deletedCategorySlugs.filter((s) => s !== categoryData.slug);
  }

  const lookupSlug = oldSlug || categoryData.slug;
  const existingIndex = store.categories.findIndex((c) => c.slug === lookupSlug);

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
      parentSlug: categoryData.parentSlug ?? null,
      parentId: categoryData.parentId ?? null,
      showOnHomepage: categoryData.showOnHomepage ?? false,
    };

    store.categories.push(newCat);
    saveStoreData(store);
    return newCat;
  }
}

export function deleteCategory(slug: string): boolean {
  const store = getStoreData();
  store.categories = store.categories.filter((c) => c.slug !== slug);

  const tombstones = new Set(store.deletedCategorySlugs || []);
  tombstones.add(slug);
  store.deletedCategorySlugs = Array.from(tombstones);

  // Always persist the tombstone, even if this slug only ever existed in
  // Firestore/static (not the JSON store) — otherwise it reappears in the
  // merged category list on the next read.
  saveStoreData(store);
  return true;
}

export function getDeletedCategorySlugs(): Set<string> {
  return new Set(getStoreData().deletedCategorySlugs || []);
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
    return (rawStoreData.reviews || []) as CustomerReview[];
  }
  return store.reviews;
}

export function saveReview(reviewData: Partial<CustomerReview>): CustomerReview {
  const store = getStoreData();
  if (!store.reviews) {
    store.reviews = [...((rawStoreData.reviews || []) as CustomerReview[])];
  }

  // Un-tombstone — a save means this id is wanted again.
  if (store.deletedReviewIds?.length && reviewData.id) {
    store.deletedReviewIds = store.deletedReviewIds.filter((k) => k !== reviewData.id);
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
  if (!store.reviews) store.reviews = [];
  store.reviews = store.reviews.filter((r) => r.id !== id);

  const tombstones = new Set(store.deletedReviewIds || []);
  tombstones.add(id);
  store.deletedReviewIds = Array.from(tombstones);

  // Always persist the tombstone, even if this id only ever existed in the
  // build-time seed or Firestore — otherwise it reappears on the next read
  // from an instance that never saw the JSON-store delete.
  saveStoreData(store);
  return true;
}

export function getDeletedReviewIds(): Set<string> {
  return new Set(getStoreData().deletedReviewIds || []);
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

const DEFAULT_STORE_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    image: '/logo.png',
    title: 'Transform Your Empty Walls Into Living Art',
    subtitle: 'Handcrafted luxury canvas & textured wooden frames tailored for modern homes.',
    link: '/product-category/best-selling',
    buttonText: 'Shop Best Sellers',
    badge: 'Premium Collection',
    order: 1,
    isActive: true,
  },
  {
    id: 'banner-2',
    image: '/logo.png',
    title: 'Porsche & Supercars Enthusiast Series',
    subtitle: 'High-octane automotive wall prints in museum quality matte finish.',
    link: '/product-category/cars-frame-collection',
    buttonText: 'Explore Cars Series',
    badge: 'Automotive Art',
    order: 2,
    isActive: true,
  },
  {
    id: 'banner-3',
    image: '/logo.png',
    title: 'Sacred Calligraphy & Spiritual Elegance',
    subtitle: 'Ayat-ul-Kursi and 4 Quls masterworks with golden accent foil effects.',
    link: '/product-category/religious-luxury-frame',
    buttonText: 'View Religious Frames',
    badge: 'Islamic Art',
    order: 3,
    isActive: true,
  },
  {
    id: 'banner-4',
    image: '/logo.png',
    title: '5 Frames Signature Gallery Sets',
    subtitle: 'Complete room transformation bundles for master bedrooms and living rooms.',
    link: '/product-category/5-frames-set',
    buttonText: 'Discover 5-Frame Sets',
    badge: 'Gallery Sets',
    order: 4,
    isActive: true,
  },
];

export function getAllBanners(): HeroBanner[] {
  const store = getStoreData();
  if (!store.banners || store.banners.length === 0) {
    store.banners = DEFAULT_STORE_BANNERS;
    saveStoreData(store);
  }
  return store.banners;
}

export function saveBanner(bannerData: HeroBanner): HeroBanner {
  const store = getStoreData();
  if (!store.banners) {
    store.banners = [...DEFAULT_STORE_BANNERS];
  }
  const id = bannerData.id || `banner-${Date.now()}`;

  // Un-tombstone — a save means this id is wanted again.
  if (store.deletedBannerIds?.length) {
    store.deletedBannerIds = store.deletedBannerIds.filter((k) => k !== id);
  }

  const banner: HeroBanner = {
    ...bannerData,
    id,
    order: bannerData.order !== undefined ? bannerData.order : store.banners.length + 1,
    isActive: bannerData.isActive !== false,
  };
  const index = store.banners.findIndex((b) => b.id === id);
  if (index >= 0) {
    store.banners[index] = banner;
  } else {
    store.banners.push(banner);
  }
  saveStoreData(store);
  return banner;
}

export function deleteBanner(id: string): boolean {
  const store = getStoreData();
  if (!store.banners) store.banners = [...DEFAULT_STORE_BANNERS];
  store.banners = store.banners.filter((b) => b.id !== id);

  const tombstones = new Set(store.deletedBannerIds || []);
  tombstones.add(id);
  store.deletedBannerIds = Array.from(tombstones);

  // Always persist the tombstone, even if this id only ever existed in the
  // hardcoded DEFAULT_STORE_BANNERS or Firestore — otherwise it reappears
  // on the next read from an instance that never saw this delete.
  saveStoreData(store);
  return true;
}

export function getDeletedBannerIds(): Set<string> {
  return new Set(getStoreData().deletedBannerIds || []);
}

// Raw Photos helpers
export function getRawPhotos(): RawPhoto[] {
  const store = getStoreData();
  return store.rawPhotos || [];
}

export function saveRawPhoto(photoData: Partial<RawPhoto>): RawPhoto {
  const store = getStoreData();
  if (!store.rawPhotos) store.rawPhotos = [];

  const id = photoData.id || `raw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  // Un-tombstone
  if (store.deletedRawPhotoIds?.length) {
    store.deletedRawPhotoIds = store.deletedRawPhotoIds.filter((k) => k !== id);
  }

  const existingIndex = store.rawPhotos.findIndex((p) => p.id === id);
  const photo: RawPhoto = {
    id,
    image: photoData.image || '',
    displayOrder: photoData.displayOrder !== undefined ? photoData.displayOrder : store.rawPhotos.length + 1,
    createdAt: photoData.createdAt || nowIso,
    updatedAt: nowIso,
  };

  if (existingIndex >= 0) {
    store.rawPhotos[existingIndex] = { ...store.rawPhotos[existingIndex], ...photo };
  } else {
    store.rawPhotos.unshift(photo);
  }

  saveStoreData(store);
  return photo;
}

export function deleteRawPhoto(id: string): boolean {
  const store = getStoreData();
  if (!store.rawPhotos) store.rawPhotos = [];
  store.rawPhotos = store.rawPhotos.filter((p) => p.id !== id);

  const tombstones = new Set(store.deletedRawPhotoIds || []);
  tombstones.add(id);
  store.deletedRawPhotoIds = Array.from(tombstones);

  saveStoreData(store);
  return true;
}

export function getDeletedRawPhotoIds(): Set<string> {
  return new Set(getStoreData().deletedRawPhotoIds || []);
}

