'use client';

import { Product } from '@/types';

export interface ProductsPageParams {
  category?: string;
  sort?: string;
  offset?: number;
  limit?: number;
  q?: string;
}

export interface ProductsPageResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}

const EMPTY_PAGE: ProductsPageResult = { products: [], total: 0, hasMore: false };

/**
 * Fetches one page of lite product rows from /api/products — category
 * browsing, homepage sections, and search all go through this rather than
 * holding the full catalog in memory. Every call is a real Supabase read
 * (behind the route's own CDN cache for non-search requests); nothing here
 * is cached client-side, since "click Load More" is supposed to mean
 * "fetch more," not "reveal more of what's already downloaded."
 */
export async function fetchProductsPage(params: ProductsPageParams = {}, signal?: AbortSignal): Promise<ProductsPageResult> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.sort) qs.set('sort', params.sort);
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);

  try {
    const res = await fetch(`/api/products?${qs.toString()}`, { signal });
    const data = await res.json();
    if (!data.success) return EMPTY_PAGE;
    return {
      products: Array.isArray(data.products) ? data.products : [],
      total: typeof data.total === 'number' ? data.total : 0,
      hasMore: Boolean(data.hasMore),
    };
  } catch (err) {
    if ((err as any)?.name === 'AbortError') throw err;
    console.error('Failed to fetch products page:', err);
    return EMPTY_PAGE;
  }
}

/**
 * Fetches one full product (description, specifications, variations,
 * gallery) by slug — only called when a visitor actually opens a product's
 * detail page.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    const data = await res.json();
    if (!data.success || !data.product) return null;
    return data.product as Product;
  } catch (err) {
    console.error('Failed to fetch product:', err);
    return null;
  }
}
