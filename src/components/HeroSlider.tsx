'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130840.png',
    title: 'Transform Your Empty Walls Into Living Art',
    subtitle: 'Handcrafted luxury canvas & textured wooden frames tailored for modern homes.',
    link: '/product-category/best-selling',
    buttonText: 'Shop Best Sellers',
  },
  {
    id: 2,
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130838.png',
    title: 'Porsche & Supercars Enthusiast Series',
    subtitle: 'High-octane automotive wall prints in museum quality matte finish.',
    link: '/product-category/cars-frame-collection',
    buttonText: 'Explore Cars Series',
  },
  {
    id: 3,
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130839.png',
    title: 'Sacred Calligraphy & Spiritual Elegance',
    subtitle: 'Ayat-ul-Kursi and 4 Quls masterworks with golden accent foil effects.',
    link: '/product-category/religious-luxury-frame',
    buttonText: 'View Religious Frames',
  },
  {
    id: 4,
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130837.png',
    title: '5 Frames Signature Gallery Sets',
    subtitle: 'Complete room transformation bundles for master bedrooms and living rooms.',
    link: '/product-category/5-frames-set',
    buttonText: 'Discover 5-Frame Sets',
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out h-[280px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {heroSlides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            {/* Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={slide.id === 1}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
              <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-8 sm:pb-12 md:pb-16 w-full text-white">
                <div className="max-w-xl space-y-2 sm:space-y-3 animate-slide-up">
                  <span className="inline-block px-3 py-1 bg-amber-500/90 text-black text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                    Premium Collection
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md text-white">
                    {slide.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 drop-shadow">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3 bg-white text-black text-xs sm:text-sm font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-lg shadow-black/30"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/80 text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/80 text-white hover:text-black backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 flex justify-center items-center gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all rounded-full ${
              currentIndex === i
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
