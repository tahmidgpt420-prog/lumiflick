/**
 * Renders the admin-controlled category product grid sections.
 * These appear BELOW the CategorySlider, matching the original layout order:
 * Hero → Best Selling → FrameEffect → CategorySlider → [category grids]
 *
 * Homepage sections are admin-controlled (Categories page -> "Show this
 * category as a section on the homepage"). Products are loaded on the server
 * by src/app/page.tsx; empty categories are already filtered out there.
 */
import React from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { Category, Product } from '@/types';

export default function HomepageCategoryGrids({
  sections,
}: {
  sections: { category: Category; products: Product[] }[];
}) {
  return (
    <>
      {sections.map(({ category, products }) => (
        <ProductGridSection
          key={category.id || category.slug}
          title={category.name.toUpperCase()}
          products={products}
          categorySlug={category.slug}
        />
      ))}
    </>
  );
}
