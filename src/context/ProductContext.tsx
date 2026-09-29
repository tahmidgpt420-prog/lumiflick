'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Category } from '@/types';
import { categories as staticCategories } from '@/data/categories';

// Categories are small (~30 rows) and nearly every page needs them (nav,
// breadcrumbs, homepage sections), so the root layout loads them on the
// server and passes them in. The client only re-fetches after an admin edit.

interface ProductContextType {
  categories: Category[];
  isLoaded: boolean;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({
  children,
  initialCategories,
}: {
  children: React.ReactNode;
  initialCategories?: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? staticCategories);
  const [isLoaded, setIsLoaded] = useState<boolean>(Boolean(initialCategories));

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Only when the server couldn't provide them (database error during render).
  useEffect(() => {
    if (!initialCategories) fetchCategories();
  }, [initialCategories, fetchCategories]);

  return (
    <ProductContext.Provider
      value={{
        categories,
        isLoaded,
        refreshCategories: fetchCategories,
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
