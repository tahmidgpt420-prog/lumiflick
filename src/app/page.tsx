/**
 * Homepage — Server Component.
 *
 * force-dynamic: re-rendered on every request so admin banner changes
 * are reflected immediately without a rebuild.
 */
export const dynamic = 'force-dynamic';

import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import BestSellingSection from '@/components/BestSellingSection';
import HomepageCategoryGrids from '@/components/HomepageCategoryGrids';
import { FrameEffectSlider, CategorySlider } from '@/components/LazyHomeSections';
import { getHeroBannersServer } from '@/lib/heroBannersServer';
import type { HeroBanner } from '@/types';

export default async function HomePage() {
  // Fetch banners server-side — the first slide is in the HTML immediately,
  // fixing the 10.5 s LCP by eliminating JS-gated image URL discovery.
  let initialBanners: HeroBanner[] = [];
  try {
    initialBanners = await getHeroBannersServer();
  } catch {
    // Graceful fallback — HeroSlider will fetch client-side
  }

  return (
    <div className="space-y-4">
      {/* 1. Hero Carousel — SSR first slide for instant LCP */}
      <HeroSlider initialBanners={initialBanners} />

      {/* 2. Best Selling */}
      <BestSellingSection />

      {/* 3. Interactive Before/After Splitter — lazy loaded */}
      <FrameEffectSlider />

      {/* 4. Explore Our Category Slider — lazy loaded */}
      <CategorySlider />

      {/* 5. Admin-controlled category product grid sections */}
      <HomepageCategoryGrids />
    </div>
  );
}
