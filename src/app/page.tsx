'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import FrameEffectSlider from '@/components/FrameEffectSlider';
import CategorySlider from '@/components/CategorySlider';
import ProductGridSection from '@/components/ProductGridSection';
import { getFeaturedProducts } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

export default function HomePage() {
  const { products, categories, getProductsByCategory, isLoaded } = useProducts();

  // Best Selling products — driven by the per-product "bestSeller" toggle,
  // not a category, so it always stays first regardless of which category
  // sections below are turned on.
  const bestSellingProds = products
    .filter((p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling')
    .slice(0, 8);

  const bestSellingFinal =
    bestSellingProds.length > 0 ? bestSellingProds : getFeaturedProducts().slice(0, 8);

  // Homepage category sections are admin-controlled (Categories page ->
  // "Show this category as a section on the homepage"), not hardcoded —
  // so a deleted or untoggled category never shows here, and there's no
  // stale static-data fallback masking real deletions.
  const homepageCategories = categories
    .filter((c) => c.showOnHomepage)
    .map((c) => ({ category: c, products: getProductsByCategory(c.slug).slice(0, 8) }))
    .filter((entry) => entry.products.length > 0);

  return (
    <div className="space-y-4">
      {/* Hero Carousel */}
      <HeroSlider />

      {/* Best Selling — always shown if any product is flagged */}
      <ProductGridSection
        title="BEST SELLING"
        products={bestSellingFinal}
        categorySlug="best-selling"
        isLoading={!isLoaded && bestSellingFinal.length === 0}
      />

      {/* Interactive Before/After Splitter */}
      <FrameEffectSlider />

      {/* Explore Our Category Slider */}
      <CategorySlider />

      {/* Dynamic category sections, admin-controlled */}
      {homepageCategories.map(({ category, products: catProducts }) => (
        <ProductGridSection
          key={category.slug}
          title={category.name.toUpperCase()}
          products={catProducts}
          categorySlug={category.slug}
        />
      ))}
    </div>
  );
}
