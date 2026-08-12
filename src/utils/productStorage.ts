'use client';

import { Product } from '@/types';

const STORAGE_KEY = 'lumiflick_custom_products_v1';

export function getCustomProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProduct(product: Product): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomProducts();
    const index = current.findIndex(
      (p) =>
        (product.id && p.id === product.id) ||
        (product.slug && p.slug === product.slug)
    );

    if (index >= 0) {
      current[index] = { ...current[index], ...product };
    } else {
      current.unshift(product);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('lumiflick_products_updated'));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeCustomProduct(idOrSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomProducts();
    const filtered = current.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('lumiflick_products_updated'));
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export function mergeWithCustomProducts(baseProducts: Product[]): Product[] {
  const custom = getCustomProducts();
  if (!custom || custom.length === 0) return baseProducts;

  const result = [...baseProducts];
  for (const c of custom) {
    const existingIdx = result.findIndex(
      (p) => (c.id && p.id === c.id) || (c.slug && p.slug === c.slug)
    );
    if (existingIdx >= 0) {
      result[existingIdx] = { ...result[existingIdx], ...c };
    } else {
      result.unshift(c);
    }
  }

  return result;
}
