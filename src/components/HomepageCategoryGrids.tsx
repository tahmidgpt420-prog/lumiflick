'use client';

/**
 * Renders the admin-controlled category product grid sections.
 * These appear BELOW the CategorySlider, matching the original layout order:
 * Hero → Best Selling → FrameEffect → CategorySlider → [category grids]
 */
import React, { useEffect, useState } from 'react';
import ProductGridSection from '@/components/ProductGridSection';
import { useProducts } from '@/context/ProductContext';
import { fetchProductsPage } from '@/lib/products';
import { Category, Product } from '@/types';

export default function HomepageCategoryGrids() {
  const { categories } = useProducts();
  const [sections, setSections] = useState<{ category: Category; products: Product[] }[]>([]);

  // Homepage category sections are admin-controlled (Categories page ->
  // "Show this category as a section on the homepage"), not hardcoded —
  // so a deleted or untoggled category never shows here.
  const homepageCategories = categories.filter((c) => c.showOnHomepage);

  useEffect(() => {
    if (homepageCategories.length === 0) {
      setSections([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      homepageCategories.map(async (category) => {
        const page = await fetchProductsPage({ category: category.slug, limit: 8 });
        return { category, products: page.products };
      })
    ).then((results) => {
      if (cancelled) return;
      setSections(results.filter((entry) => entry.products.length > 0));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ category, products }) => (
        <ProductGridSection
          key={category.slug}
          title={category.name.toUpperCase()}
          products={products}
          categorySlug={category.slug}
        />
      ))}
    </>
  );
}
