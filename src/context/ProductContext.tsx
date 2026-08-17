'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Category } from '@/types';
import { categories as staticCategories } from '@/data/categories';

// This context used to hold the ENTIRE product catalog in memory (all ~700
// rows, full fields) so every page could filter/slice it client-side for
// free. That's what made every page load pull the whole catalog down —
// see /api/products and src/lib/products.ts, which pages now call directly
// for exactly the page of products they need. Categories stay here: the
// table is tiny (~20 rows) and nearly every page needs it (nav, breadcrumbs,
// homepage sections, and /api/products' own category-tree resolution).
const CACHE_KEY = 'lumiflick_categories_cache_v1';
const CACHE_TTL_MS = 30 * 1000;

interface CategoryCache {
  categories: Category[];
  savedAt: number;
}

function getInitialCache(): CategoryCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      return parsed as CategoryCache;
    }
  } catch {
    // fallback
  }
  return null;
}

interface ProductContextType {
  categories: Category[];
  isLoaded: boolean;
  refreshCategories: (force?: boolean) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    const cache = getInitialCache();
    return cache ? cache.categories : staticCategories;
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(() => getInitialCache() !== null);

  const fetchCategories = useCallback(async (force = false) => {
    if (!force) {
      const cache = getInitialCache();
      if (cache && Date.now() - cache.savedAt < CACHE_TTL_MS) {
        setCategories(cache.categories);
        setIsLoaded(true);
        return;
      }
    }

    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load categories');

      const updatedCategories: Category[] = data.categories;
      setCategories(updatedCategories);

      try {
        const cachePayload: CategoryCache = { categories: updatedCategories, savedAt: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } catch (storageErr) {
        console.warn('Unable to persist categories to localStorage cache:', storageErr);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories(false);
  }, [fetchCategories]);

  return (
    <ProductContext.Provider
      value={{
        categories,
        isLoaded,
        refreshCategories: () => fetchCategories(true),
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
