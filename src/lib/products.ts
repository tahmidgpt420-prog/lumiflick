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
 * Fetches one page of lite product rows from /api/products — "load more",
 * sort/category switching and search. The first page of each listing comes
 * from the server-rendered HTML instead. Nothing here is cached client-side.
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
