'use client';

// Below-the-fold homepage sections, lazy-loaded and client-only so they stay
// out of the initial bundle. Lives in a Client Component because Next 15
// rejects `ssr: false` inside Server Components (src/app/page.tsx).
import lazyLoad from 'next/dynamic';

export const FrameEffectSlider = lazyLoad(() => import('@/components/FrameEffectSlider'), {
  ssr: false,
  loading: () => (
    <div className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse max-w-2xl" />
      </div>
    </div>
  ),
});

export const CategorySlider = lazyLoad(() => import('@/components/CategorySlider'), {
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
