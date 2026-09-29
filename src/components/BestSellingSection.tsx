/**
 * Renders ONLY the Best Selling product grid. Products are loaded on the
 * server by src/app/page.tsx; falls back to the static featured list.
 */
import React from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { getFeaturedProducts } from '@/data/products';
import { Product } from '@/types';

export default function BestSellingSection({ products }: { products: Product[] }) {
  return (
    <ProductGridSection
      title="BEST SELLING"
      products={products.length > 0 ? products : getFeaturedProducts().slice(0, 8)}
      categorySlug="best-selling"
    />
  );
}
