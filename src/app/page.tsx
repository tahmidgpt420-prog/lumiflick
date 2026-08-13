'use client';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import FrameEffectSlider from '@/components/FrameEffectSlider';
import CategorySlider from '@/components/CategorySlider';
import ProductGridSection from '@/components/ProductGridSection';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import { getFeaturedProducts, getProductsByCategory as getStaticProductsByCategory } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

export default function HomePage() {
  const { products, getProductsByCategory } = useProducts();

  // Filter helper for categories
  const filterByCat = (catSlug: string) => {
    const list = getProductsByCategory(catSlug);
    return list.length > 0 ? list.slice(0, 8) : getStaticProductsByCategory(catSlug).slice(0, 8);
  };

  // Best Selling products
  const bestSellingProds = products
    .filter((p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category?.toLowerCase() === 'best selling')
    .slice(0, 8);

  const bestSellingFinal =
    bestSellingProds.length > 0 ? bestSellingProds : getFeaturedProducts().slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Hero Carousel */}
      <HeroSlider />

      {/* Section 1: BEST SELLING */}
      <ProductGridSection
        title="BEST SELLING"
        products={bestSellingFinal}
        categorySlug="best-selling"
      />

      {/* Section 2: Interactive Before/After Splitter */}
      <FrameEffectSlider />

      {/* Section 3: Explore Our Category Slider */}
      <CategorySlider />

      {/* Section 4: RELIGIOUS LUXURY FRAME */}
      <ProductGridSection
        title="RELIGIOUS LUXURY FRAME"
        products={filterByCat('religious-luxury-frame')}
        categorySlug="religious-luxury-frame"
      />

      {/* Section 5: NATURE INSPIRED FRAME */}
      <ProductGridSection
        title="NATURE INSPIRED FRAME"
        products={filterByCat('nature-inspired-frame')}
        categorySlug="nature-inspired-frame"
      />

      {/* Section 6: BOHO THEME FRAME */}
      <ProductGridSection
        title="BOHO THEME FRAME"
        products={filterByCat('boho-theme-frame')}
        categorySlug="boho-theme-frame"
      />

      {/* Section 7: FLORAL FRAME */}
      <ProductGridSection
        title="FLORAL FRAME"
        products={filterByCat('floral-frame')}
        categorySlug="floral-frame"
      />

      {/* Section 8: MOTIVATIONAL WALL FRAME */}
      <ProductGridSection
        title="MOTIVATIONAL WALL FRAME"
        products={filterByCat('motivational-wall-frame')}
        categorySlug="motivational-wall-frame"
      />

      {/* Section 9: CAR’S FRAME COLLECTION */}
      <ProductGridSection
        title="CAR’S FRAME COLLECTION"
        products={filterByCat('cars-frame-collection')}
        categorySlug="cars-frame-collection"
      />

      {/* Section 10: 5 FRAMES SET */}
      <ProductGridSection
        title="5 FRAMES SET"
        products={filterByCat('5-frames-set')}
        categorySlug="5-frames-set"
      />

      {/* Section 11: Customer Reviews */}
      <ReviewsCarousel />
    </div>
  );
}
