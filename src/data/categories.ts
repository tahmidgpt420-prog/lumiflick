import { Category } from '@/types';
import storeData from './store.json';

export const categories: Category[] = (storeData.categories || []) as Category[];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
