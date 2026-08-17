'use client';

/**
 * Renders ONLY the Best Selling product grid.
 * Kept as a separate client component so page.tsx can stay a Server Component.
 */
import React, { useEffect, useState } from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { getFeaturedProducts } from '@/data/products';
import { fetchProductsPage } from '@/lib/products';
import { Product } from '@/types';

export default function BestSellingSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProductsPage({ category: 'best-selling', limit: 8 }).then((page) => {
      if (cancelled) return;
      setProducts(page.products);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bestSellingFinal = products.length > 0 ? products : loaded ? getFeaturedProducts().slice(0, 8) : [];

  return (
    <ProductGridSection
      title="BEST SELLING"
      products={bestSellingFinal}
      categorySlug="best-selling"
      isLoading={!loaded}
    />
  );
}
