import { Product } from '@/types';
import storeData from './store.json';

export const products: Product[] = storeData.products as Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug || p.id === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  if (!categorySlug || categorySlug === 'all') return products;
  if (categorySlug === 'best-selling') return products.filter(p => p.bestSeller || p.categorySlug === 'best-selling');
  return products.filter(p => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured || p.bestSeller).slice(0, 8);
}

export function getRelatedProducts(currentSlug: string, categorySlug: string, limit = 4): Product[] {
  const matching = products.filter(p => p.slug !== currentSlug && p.categorySlug === categorySlug);
  if (matching.length < limit) {
    const others = products.filter(p => p.slug !== currentSlug && p.categorySlug !== categorySlug);
    return [...matching, ...others].slice(0, limit);
  }
  return matching.slice(0, limit);
}
