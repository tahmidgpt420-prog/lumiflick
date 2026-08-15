'use client';

/**
 * Client wrapper for the product grid sections on the homepage.
 * This is a 'use client' component because it uses ProductContext hooks.
 * Kept separate from page.tsx so the homepage root can be a Server Component.
 */
import React from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { getFeaturedProducts } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

export default function ProductGridSectionClient() {
  const { products, categories, getProductsByCategory, isLoaded } = useProducts();

  // Best Selling products — driven by the per-product "bestSeller" toggle
  const bestSellingProds = products
    .filter((p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling')
    .slice(0, 8);

  const bestSellingFinal =
    bestSellingProds.length > 0 ? bestSellingProds : getFeaturedProducts().slice(0, 8);

  // Homepage category sections — admin-controlled via the "showOnHomepage" toggle
  const homepageCategories = categories
    .filter((c) => c.showOnHomepage)
    .map((c) => ({ category: c, products: getProductsByCategory(c.slug).slice(0, 8) }))
    .filter((entry) => entry.products.length > 0);

  return (
    <>
      {/* Best Selling — always shown if any product is flagged */}
      <ProductGridSection
        title="BEST SELLING"
        products={bestSellingFinal}
        categorySlug="best-selling"
        isLoading={!isLoaded && bestSellingFinal.length === 0}
      />

      {/* Dynamic category sections, admin-controlled */}
      {homepageCategories.map(({ category, products: catProducts }) => (
        <ProductGridSection
          key={category.slug}
          title={category.name.toUpperCase()}
          products={catProducts}
          categorySlug={category.slug}
        />
      ))}
    </>
  );
}
