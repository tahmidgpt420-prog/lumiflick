'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, Category } from '@/types';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';

const CACHE_KEY = 'lumiflick_catalog_cache_v5';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache freshness

interface CatalogCache {
  products: Product[];
  categories: Category[];
  savedAt: number;
}

function getInitialCache(): CatalogCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
      return parsed as CatalogCache;
    }
  } catch {
    // fallback
  }
  return null;
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  isLoaded: boolean;
  refreshProducts: (force?: boolean) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getBestSellingProducts: () => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  // 1. Initialize immediately from browser cache if available (0 network requests on reload)
  const [products, setProducts] = useState<Product[]>(() => {
    const cache = getInitialCache();
    return cache ? cache.products : (staticProducts as Product[]);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const cache = getInitialCache();
    return cache && Array.isArray(cache.categories) ? cache.categories : staticCategories;
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    return getInitialCache() !== null;
  });

  const fetchUniversalProducts = useCallback(async (force = false) => {
    // Check if browser cache is fresh and we're not forcing a reload
    if (!force) {
      const cache = getInitialCache();
      if (cache && Date.now() - cache.savedAt < CACHE_TTL_MS) {
        // Cache is fresh — no network download needed!
        setProducts(cache.products);
        if (cache.categories) setCategories(cache.categories);
        setIsLoaded(true);
        return;
      }
    }

    try {
      // Single request to our own cached endpoint instead of 4 direct
      // Firestore reads from the browser — Firestore only actually gets
      // hit once per minute (server-side, shared across every visitor),
      // not once per page load. See src/app/api/catalog/route.ts.
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load catalog');

      const mergedProducts: Product[] = data.products;
      const updatedCategories: Category[] = data.categories;
      setProducts(mergedProducts);
      setCategories(updatedCategories);

      // Save to browser cache — a second layer on top of the server cache,
      // so a repeat visit in the same browser skips the network entirely.
      try {
        const cachePayload: CatalogCache = {
          products: mergedProducts,
          categories: updatedCategories,
          savedAt: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } catch (storageErr) {
        console.warn('Unable to persist catalog to localStorage cache:', storageErr);
      }
    } catch (err) {
      console.error('Error fetching products from catalog API:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // On page mount / reload: check cache first, only fetch if stale or missing
  useEffect(() => {
    fetchUniversalProducts(false);
  }, [fetchUniversalProducts]);

  const getProductBySlug = useCallback(
    (slug: string): Product | undefined => {
      const norm = decodeURIComponent(slug).toLowerCase().trim();
      return products.find(
        (p) =>
          p.slug?.toLowerCase() === norm ||
          p.id?.toLowerCase() === norm ||
          (p.title &&
            p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === norm)
      );
    },
    [products]
  );

  const getProductsByCategory = useCallback(
    (categorySlug: string): Product[] => {
      const norm = categorySlug.toLowerCase().trim();
      if (norm === 'all') return products;
      if (norm === 'best-selling') {
        return products.filter(
          (p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling'
        );
      }

      // Find all child subcategory slugs if this is a parent category
      const childSlugs = new Set<string>();
      categories.forEach((c) => {
        if (
          (c.parentSlug && c.parentSlug.toLowerCase() === norm) ||
          (c.parentId && c.parentId.toLowerCase() === norm)
        ) {
          childSlugs.add(c.slug.toLowerCase());
          childSlugs.add(c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        }
      });

      return products.filter((p) => {
        const pCatSlug = p.categorySlug?.toLowerCase();
        const pCatName = p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return (
          pCatSlug === norm ||
          pCatName === norm ||
          (pCatSlug && childSlugs.has(pCatSlug)) ||
          (pCatName && childSlugs.has(pCatName))
        );
      });
    },
    [products, categories]
  );

  const getBestSellingProducts = useCallback((): Product[] => {
    return products.filter(
      (p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling'
    );
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoaded,
        refreshProducts: () => fetchUniversalProducts(true),
        getProductBySlug,
        getProductsByCategory,
        getBestSellingProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
