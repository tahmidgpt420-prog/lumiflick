'use client';

import React, { useEffect, useState } from 'react';
import HeroSlider from '@/components/HeroSlider';
import FrameEffectSlider from '@/components/FrameEffectSlider';
import CategorySlider from '@/components/CategorySlider';
import ProductGridSection from '@/components/ProductGridSection';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import { products as staticProducts, getFeaturedProducts, getProductsByCategory } from '@/data/products';
import { Product } from '@/types';
import { getAllProductsFromFirestore, getDeletedProductIdsFromFirestore } from '@/lib/firestoreProducts';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts as Product[]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [firestoreProds, deletedIds] = await Promise.all([
          getAllProductsFromFirestore(),
          getDeletedProductIdsFromFirestore(),
        ]);

        const activeFirestore = firestoreProds.filter(
          (p) => !deletedIds.has(p.id) && !deletedIds.has(p.slug)
        );
        const activeStatic = (staticProducts as Product[]).filter(
          (p) =>
            !deletedIds.has(p.id) &&
            !deletedIds.has(p.slug) &&
            !activeFirestore.some((fp) => fp.slug === p.slug || fp.id === p.id)
        );

        setAllProducts([...activeFirestore, ...activeStatic]);
      } catch (err) {
        console.error('Failed to load home page products:', err);
      }
    }
    loadProducts();
  }, []);

  // Filter helper for categories
  const filterByCat = (catSlug: string) => {
    return allProducts
      .filter((p) => {
        const norm = catSlug.toLowerCase();
        return (
          p.categorySlug?.toLowerCase() === norm ||
          p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === norm
        );
      })
      .slice(0, 8);
  };

  // Best Selling products
  const bestSellingProds = allProducts
    .filter((p) => p.bestSeller || p.categorySlug === 'best-selling' || p.category === 'Best Selling')
    .slice(0, 8);

  const bestSellingFinal =
    bestSellingProds.length > 0 ? bestSellingProds : getFeaturedProducts().slice(0, 8);

  const religiousProds = filterByCat('religious-luxury-frame');
  const natureProds = filterByCat('nature-inspired-frame');
  const bohoProds = filterByCat('boho-theme-frame');
  const floralProds = filterByCat('floral-frame');
  const motivationalProds = filterByCat('motivational-wall-frame');
  const carProds = filterByCat('cars-frame-collection');
  const fiveFramesProds = filterByCat('5-frames-set');

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
        products={religiousProds.length > 0 ? religiousProds : getProductsByCategory('religious-luxury-frame').slice(0, 8)}
        categorySlug="religious-luxury-frame"
      />

      {/* Section 5: NATURE INSPIRED FRAME */}
      <ProductGridSection
        title="NATURE INSPIRED FRAME"
        products={natureProds.length > 0 ? natureProds : getProductsByCategory('nature-inspired-frame').slice(0, 8)}
        categorySlug="nature-inspired-frame"
      />

      {/* Section 6: BOHO THEME FRAME */}
      <ProductGridSection
        title="BOHO THEME FRAME"
        products={bohoProds.length > 0 ? bohoProds : getProductsByCategory('boho-theme-frame').slice(0, 8)}
        categorySlug="boho-theme-frame"
      />

      {/* Section 7: FLORAL FRAME */}
      <ProductGridSection
        title="FLORAL FRAME"
        products={floralProds.length > 0 ? floralProds : getProductsByCategory('floral-frame').slice(0, 8)}
        categorySlug="floral-frame"
      />

      {/* Section 8: MOTIVATIONAL WALL FRAME */}
      <ProductGridSection
        title="MOTIVATIONAL WALL FRAME"
        products={motivationalProds.length > 0 ? motivationalProds : getProductsByCategory('motivational-wall-frame').slice(0, 8)}
        categorySlug="motivational-wall-frame"
      />

      {/* Section 9: CAR’S FRAME COLLECTION */}
      <ProductGridSection
        title="CAR’S FRAME COLLECTION"
        products={carProds.length > 0 ? carProds : getProductsByCategory('cars-frame-collection').slice(0, 8)}
        categorySlug="cars-frame-collection"
      />

      {/* Section 10: 5 FRAMES SET */}
      <ProductGridSection
        title="5 FRAMES SET"
        products={fiveFramesProds.length > 0 ? fiveFramesProds : getProductsByCategory('5-frames-set').slice(0, 8)}
        categorySlug="5-frames-set"
      />

      {/* Section 11: Customer Reviews */}
      <ReviewsCarousel />
    </div>
  );
}
