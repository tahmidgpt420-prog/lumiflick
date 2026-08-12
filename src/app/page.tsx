import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import FrameEffectSlider from '@/components/FrameEffectSlider';
import CategorySlider from '@/components/CategorySlider';
import ProductGridSection from '@/components/ProductGridSection';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import { getProductsByCategory, getFeaturedProducts } from '@/data/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const bestSellingProds = getFeaturedProducts();
  const religiousProds = getProductsByCategory('religious-luxury-frame').slice(0, 8);
  const natureProds = getProductsByCategory('nature-inspired-frame').slice(0, 8);
  const bohoProds = getProductsByCategory('boho-theme-frame').slice(0, 8);
  const floralProds = getProductsByCategory('floral-frame').slice(0, 8);
  const motivationalProds = getProductsByCategory('motivational-wall-frame').slice(0, 8);
  const carProds = getProductsByCategory('cars-frame-collection').slice(0, 8);
  const fiveFramesProds = getProductsByCategory('5-frames-set').slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Hero Carousel */}
      <HeroSlider />

      {/* Section 1: BEST SELLING */}
      <ProductGridSection
        title="BEST SELLING"
        products={bestSellingProds}
        categorySlug="best-selling"
      />

      {/* Section 2: Interactive Before/After Splitter */}
      <FrameEffectSlider />

      {/* Section 3: Explore Our Category Slider */}
      <CategorySlider />

      {/* Section 4: RELIGIOUS LUXURY FRAME */}
      <ProductGridSection
        title="RELIGIOUS LUXURY FRAME"
        products={religiousProds}
        categorySlug="religious-luxury-frame"
      />

      {/* Section 5: NATURE INSPIRED FRAME */}
      <ProductGridSection
        title="NATURE INSPIRED FRAME"
        products={natureProds}
        categorySlug="nature-inspired-frame"
      />

      {/* Section 6: BOHO THEME FRAME */}
      <ProductGridSection
        title="BOHO THEME FRAME"
        products={bohoProds}
        categorySlug="boho-theme-frame"
      />

      {/* Section 7: FLORAL FRAME */}
      <ProductGridSection
        title="FLORAL FRAME"
        products={floralProds}
        categorySlug="floral-frame"
      />

      {/* Section 8: MOTIVATIONAL WALL FRAME */}
      <ProductGridSection
        title="MOTIVATIONAL WALL FRAME"
        products={motivationalProds}
        categorySlug="motivational-wall-frame"
      />

      {/* Section 9: CAR’S FRAME COLLECTION */}
      <ProductGridSection
        title="CAR’S FRAME COLLECTION"
        products={carProds}
        categorySlug="cars-frame-collection"
      />

      {/* Section 10: 5 FRAMES SET */}
      <ProductGridSection
        title="5 FRAMES SET"
        products={fiveFramesProds}
        categorySlug="5-frames-set"
      />

      {/* Section 11: Customer Reviews */}
      <ReviewsCarousel />
    </div>
  );
}
