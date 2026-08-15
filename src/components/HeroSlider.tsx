'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBanner } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';
import {
  fetchHeroBanners,
  getCachedHeroBanners,
  DEFAULT_HERO_BANNERS,
} from '@/lib/heroBanners';

export function HeroSliderSkeleton() {
  return (
    <div className="relative w-full overflow-hidden bg-white select-none">
      <div className="relative w-full h-[240px] sm:h-[380px] md:h-[480px] lg:h-[580px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse flex items-end border-b border-gray-100">
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />

        {/* Text overlay skeleton */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8 sm:pb-12 md:pb-16 w-full relative z-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            {/* Badge skeleton */}
            <div className="w-24 h-5 rounded-full bg-gray-200/90 animate-pulse" />

            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="w-3/4 h-7 sm:h-9 md:h-11 rounded-xl bg-gray-200/90 animate-pulse" />
              <div className="w-1/2 h-7 sm:h-9 md:h-11 rounded-xl bg-gray-200/80 animate-pulse" />
            </div>

            {/* Subtitle skeleton */}
            <div className="w-2/3 h-4 sm:h-5 rounded-lg bg-gray-200/70 animate-pulse pt-1" />

            {/* Button skeleton */}
            <div className="pt-2">
              <div className="w-36 sm:w-44 h-10 sm:h-12 rounded-full bg-gray-300/80 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dots skeleton */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          <div className="w-7 h-2 rounded-full bg-gray-300 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface HeroSliderProps {
  /** Pre-fetched banners from the server (SSR). When provided, slide[0] renders
   *  immediately without waiting for the client-side fetch, which is the primary
   *  fix for LCP. The client fetch still runs to refresh stale data. */
  initialBanners?: HeroBanner[];
}

export default function HeroSlider({ initialBanners }: HeroSliderProps = {}) {
  // Seed state with SSR data > localStorage cache > empty default — in that order.
  // SSR data means the first slide is in the HTML immediately, no JS needed.
  const [slides, setSlides] = useState<HeroBanner[]>(() => {
    if (initialBanners && initialBanners.length > 0) return initialBanners;
    const cached = getCachedHeroBanners();
    return cached && cached.length > 0 ? cached : DEFAULT_HERO_BANNERS;
  });

  // If we already have SSR or cached slides, we don't need to show a loading skeleton.
  const [isLoading, setIsLoading] = useState(() => {
    if (initialBanners && initialBanners.length > 0) return false;
    const cached = getCachedHeroBanners();
    return !cached || cached.length === 0;
  });

  // Track which slides have their images loaded (for fade-in)
  // If we have SSR data, mark the first image as "not yet loaded" so it fades in
  // smoothly rather than popping. The priority={true} on the Image handles preloading.
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const data = await fetchHeroBanners();
        if (isMounted) {
          if (data && data.length > 0) {
            const activeSlides = data.filter((b) => b.isActive !== false);
            if (activeSlides.length > 0) {
              setSlides(activeSlides);
            }
          }
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Error loading dynamic banners in slider:', e);
        if (isMounted) setIsLoading(false);
      }
    }
    loadBanners();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const active = e.detail.filter((b: HeroBanner) => b.isActive !== false);
        if (active.length > 0) {
          setSlides(active);
        }
        setIsLoading(false);
      }
    };
    window.addEventListener('lumiflick_banners_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lumiflick_banners_updated', handleUpdate);
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, totalSlides]);

  if (isLoading && totalSlides === 0) {
    return <HeroSliderSkeleton />;
  }

  if (totalSlides === 0) return null;

  const isFirstImageReady = Boolean(imagesLoaded[0]);

  return (
    <div
      className="relative w-full overflow-hidden bg-white group select-none touch-pan-y border-b border-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* White Skeleton Shimmer Overlay - visible until the first banner image finishes downloading.
          Skip this overlay when we have SSR slides — the image starts downloading immediately
          via the <link rel="preload"> in the <head>, so there's no blank flash. */}
      {!isFirstImageReady && !initialBanners?.length && (
        <div className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500">
          <HeroSliderSkeleton />
        </div>
      )}

      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out h-[240px] sm:h-[380px] md:h-[480px] lg:h-[580px] bg-white"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const hasText = Boolean(slide.title || slide.subtitle || slide.buttonText);

          return (
            <div key={slide.id || idx} className="relative w-full h-full shrink-0 bg-white">
              {/* Entire Banner as Link */}
              <Link
                href={slide.link || '/shop'}
                className="block relative w-full h-full cursor-pointer"
              >
                {/* Background Image
                    - idx === 0 gets priority + fetchpriority="high" (LCP element)
                    - Mobile uses 800px width, desktop uses original quality */}
                <Image
                  src={isMobile ? formatImageUrl(slide.image, 800) : formatImageUrl(slide.image, 'original')}
                  alt={slide.title || 'LUMIFLICK Banner'}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  className={`object-cover object-center transition-opacity duration-500 ease-out ${
                    imagesLoaded[idx] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImagesLoaded((prev) => ({ ...prev, [idx]: true }))}
                  sizes="100vw"
                  quality={85}
                />

                {/* Text Overlay if provided */}
                {hasText ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end">
                    <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8 sm:pb-12 md:pb-16 w-full text-white">
                      <div className="max-w-xl space-y-2 sm:space-y-3 animate-slide-up">
                        {slide.badge && (
                          <span className="inline-block px-3 py-1 bg-amber-500/95 text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm shadow-md">
                            {slide.badge}
                          </span>
                        )}
                        {slide.title && (
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg text-white leading-tight line-clamp-2 min-h-[50px] sm:min-h-[75px] md:min-h-[90px]">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 drop-shadow font-medium min-h-[36px] sm:min-h-[42px] md:min-h-[48px]">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.buttonText && (
                          <div className="pt-2">
                            <span className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black text-xs sm:text-sm font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-xl">
                              {slide.buttonText}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Subtle dark hover tint for pure image banners */
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors" />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex justify-center items-center gap-1 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(i);
                }}
                className="p-2 flex items-center justify-center focus:outline-none"
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  className={`block rounded-full transition-opacity duration-300 ${
                    currentIndex === i
                      ? 'w-7 h-2 bg-white opacity-100'
                      : 'w-2 h-2 bg-white/60 opacity-60 hover:opacity-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
