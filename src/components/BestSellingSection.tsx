'use client';

/**
 * Renders ONLY the Best Selling product grid.
 * Kept as a separate client component so page.tsx can stay a Server Component.
 */
import React from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { getFeaturedProducts } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

export default function BestSellingSection() {
  const { products, isLoaded } = useProducts();

  const bestSellingProds = products
    .filter((p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling')
    .slice(0, 8);

  const bestSellingFinal =
    bestSellingProds.length > 0 ? bestSellingProds : getFeaturedProducts().slice(0, 8);

  return (
    <ProductGridSection
      title="BEST SELLING"
      products={bestSellingFinal}
      categorySlug="best-selling"
      isLoading={!isLoaded && bestSellingFinal.length === 0}
    />
  );
}
