'use client';

/**
 * Renders the admin-controlled category product grid sections.
 * These appear BELOW the CategorySlider, matching the original layout order:
 * Hero → Best Selling → FrameEffect → CategorySlider → [category grids]
 */
import React from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { useProducts } from '@/context/ProductContext';

export default function HomepageCategoryGrids() {
  const { categories, getProductsByCategory } = useProducts();

  // Homepage category sections are admin-controlled (Categories page ->
  // "Show this category as a section on the homepage"), not hardcoded —
  // so a deleted or untoggled category never shows here.
  const homepageCategories = categories
    .filter((c) => c.showOnHomepage)
    .map((c) => ({ category: c, products: getProductsByCategory(c.slug).slice(0, 8) }))
    .filter((entry) => entry.products.length > 0);

  if (homepageCategories.length === 0) return null;

  return (
    <>
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
