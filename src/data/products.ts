import { Product } from '@/types';
import storeData from './store.json';

export const products: Product[] = (storeData.products || []) as Product[];

function getServerDb() {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./db');
    } catch {
      return null;
    }
  }
  return null;
}

export function getAllAvailableProducts(): Product[] {
  const db = getServerDb();
  if (db && typeof db.getAllProducts === 'function') {
    try {
      const dynamicProducts = db.getAllProducts();
      if (Array.isArray(dynamicProducts) && dynamicProducts.length > 0) {
        return dynamicProducts;
      }
    } catch {
      // fallback
    }
  }
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();

  const db = getServerDb();
  if (db && typeof db.getProductByIdOrSlug === 'function') {
    try {
      const dynamicProduct = db.getProductByIdOrSlug(normalized);
      if (dynamicProduct) return dynamicProduct;
    } catch {
      // fallback
    }
  }

  return products.find(
    (p) => p.slug.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const all = getAllAvailableProducts();
  if (!categorySlug || categorySlug === 'all') return all;

  const normalized = categorySlug.toLowerCase().trim();

  if (normalized === 'best-selling') {
    return all.filter(
      (p) =>
        p.bestSeller ||
        p.categorySlug === 'best-selling' ||
        p.category?.toLowerCase() === 'best selling'
    );
  }

  return all.filter((p) => {
    const pCatSlug = p.categorySlug?.toLowerCase();
    const pCatNameSlug = p.category
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return pCatSlug === normalized || pCatNameSlug === normalized;
  });
}

export function getFeaturedProducts(): Product[] {
  const all = getAllAvailableProducts();
  return all.filter((p) => p.featured || p.bestSeller).slice(0, 8);
}

export function getRelatedProducts(
  currentSlug: string,
  categorySlug: string,
  limit = 4
): Product[] {
  const all = getAllAvailableProducts();
  const matching = all.filter(
    (p) =>
      p.slug !== currentSlug &&
      (p.categorySlug === categorySlug || p.category === categorySlug)
  );
  if (matching.length < limit) {
    const others = all.filter(
      (p) =>
        p.slug !== currentSlug &&
        p.categorySlug !== categorySlug &&
        p.category !== categorySlug
    );
    return [...matching, ...others].slice(0, limit);
  }
  return matching.slice(0, limit);
}
