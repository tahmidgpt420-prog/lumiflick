import { Category } from '@/types';
import storeData from './store.json';

export const categories: Category[] = (storeData.categories || []) as Category[];

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

export function getCategoryBySlug(slug: string): Category | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();

  // Special handle for pinned Best Selling collection
  if (normalized === 'best-selling') {
    return {
      name: 'Best Selling',
      slug: 'best-selling',
      image: '/logo.png',
      description: 'Our top most popular, best-selling handcrafted glass posters across Bangladesh.',
    };
  }

  const db = getServerDb();
  if (db && typeof db.getCategoryBySlug === 'function') {
    try {
      const dynamicCat = db.getCategoryBySlug(normalized);
      if (dynamicCat) return dynamicCat;
    } catch {
      // fallback
    }
  }

  return categories.find(
    (c) =>
      c.slug.toLowerCase() === normalized ||
      c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalized
  );
}
