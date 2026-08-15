/**
 * Homepage — Server Component.
 *
 * force-dynamic: re-rendered on every request so admin banner changes
 * are reflected immediately without a rebuild.
 */
export const dynamic = 'force-dynamic';

import React from 'react';
import lazyLoad from 'next/dynamic';
import HeroSlider from '@/components/HeroSlider';
import BestSellingSection from '@/components/BestSellingSection';
import HomepageCategoryGrids from '@/components/HomepageCategoryGrids';
import { getHeroBannersServer } from '@/lib/heroBannersServer';
import type { HeroBanner } from '@/types';

// Lazy-load below-the-fold components — excluded from initial bundle
const FrameEffectSlider = lazyLoad(() => import('@/components/FrameEffectSlider'), {
  ssr: false,
  loading: () => (
    <div className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse max-w-2xl" />
      </div>
    </div>
  ),
});

const CategorySlider = lazyLoad(() => import('@/components/CategorySlider'), {
  ssr: false,
  loading: () => (
    <div className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 sm:w-56 aspect-square rounded-2xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  ),
});

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
