'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, Category } from '@/types';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';
import {
  getAllProductsFromFirestore,
  getDeletedProductIdsFromFirestore,
} from '@/lib/firestoreProducts';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  isLoaded: boolean;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getBestSellingProducts: () => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  // Start with static products immediately for instant 0ms first paint
  const [products, setProducts] = useState<Product[]>(staticProducts as Product[]);
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchUniversalProducts = useCallback(async () => {
    try {
      const [firestoreProds, deletedIds, catRes] = await Promise.all([
        getAllProductsFromFirestore(),
        getDeletedProductIdsFromFirestore(),
        fetch('/api/admin/categories').catch(() => null),
      ]);

      // Filter active Firestore products
      const activeFirestore = firestoreProds.filter(
        (p) => !deletedIds.has(p.id) && !deletedIds.has(p.slug)
      );

      // Filter active Static products
      const activeStatic = (staticProducts as Product[]).filter(
        (p) =>
          !deletedIds.has(p.id) &&
          !deletedIds.has(p.slug) &&
          !activeFirestore.some((fp) => fp.slug === p.slug || (fp.id && fp.id === p.id))
      );

      // Merge Firestore + Static
      const mergedProducts = [...activeFirestore, ...activeStatic];
      setProducts(mergedProducts);

      // Update categories if API returned fresh list
      if (catRes && catRes.ok) {
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      }
    } catch (err) {
      console.error('Error prefetching products:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Fetch from database ONCE on website load
  useEffect(() => {
    fetchUniversalProducts();
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
      return products.filter((p) => {
        const pCatSlug = p.categorySlug?.toLowerCase();
        const pCatName = p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return pCatSlug === norm || pCatName === norm;
      });
    },
    [products]
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
        refreshProducts: fetchUniversalProducts,
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
