'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroBanner } from '@/types';
import {
  getAllBannersFromFirestore,
  DEFAULT_HERO_BANNERS,
} from '@/lib/firestoreBanners';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const data = await getAllBannersFromFirestore();
        if (isMounted && data && data.length > 0) {
          const activeSlides = data.filter((b) => b.isActive !== false);
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (e) {
        console.warn('Error loading dynamic banners in slider:', e);
      }
    }
    loadBanners();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const active = e.detail.filter((b: HeroBanner) => b.isActive !== false);
        if (active.length > 0) {
          setSlides(active);
        }
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

  if (totalSlides === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-950 group select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out h-[240px] sm:h-[380px] md:h-[480px] lg:h-[580px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const hasText = Boolean(slide.title || slide.subtitle || slide.buttonText);

          return (
            <div key={slide.id || idx} className="relative w-full h-full shrink-0">
              {/* Entire Banner as Link */}
              <Link
                href={slide.link || '/shop'}
                className="block relative w-full h-full cursor-pointer"
              >
                {/* Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title || 'LUMIFLICK Banner'}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                  sizes="100vw"
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
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg text-white leading-tight">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 drop-shadow font-medium">
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
          <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex justify-center items-center gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(i);
                }}
                className={`transition-all rounded-full ${
                  currentIndex === i
                    ? 'w-7 h-2 bg-white shadow'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
