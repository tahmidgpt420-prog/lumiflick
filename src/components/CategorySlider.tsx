'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { formatImageUrl } from '@/utils/driveUrl';
import { Category } from '@/types';
import { getMainCategories } from '@/utils/categoryHelpers';

function CategoryCardItem({ category }: { category: Category }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/product-category/${category.slug}`}
      className="group flex-shrink-0 w-44 sm:w-56 bg-white/5 rounded-2xl p-3 border border-white/10 hover:border-amber-400/80 hover:bg-white/10 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1.5"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-800">
        {!imgLoaded && (
          <div className="absolute inset-0 card-skeleton-shimmer-dark z-0" />
        )}
        <Image
          src={formatImageUrl(category.image, 350)}
          alt={category.name}
          fill
          onLoad={() => setImgLoaded(true)}
          className={`object-cover group-hover:scale-105 transition-all duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 640px) 176px, 224px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors truncate">
          {category.name}
        </h3>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors shrink-0" />
      </div>
    </Link>
  );
}

export default function CategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { categories: categoriesList, isLoaded } = useProducts();

  // Filter to show ONLY real main (top-level) categories (exclude subcategories and draft/test categories)
  const displayCategories = getMainCategories(categoriesList).filter(
    (c) =>
      Boolean(c.name && c.image && c.slug) &&
      c.slug !== 'werty' &&
      c.name.toLowerCase() !== 'werty' &&
      c.name.toLowerCase() !== 'asdfghjk'
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-1">
              Curated Styles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore Our Categories
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white transition-all border border-white/15 cursor-pointer"
              aria-label="Previous categories"
              title="Previous Categories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white transition-all border border-white/15 cursor-pointer"
              aria-label="Next categories"
              title="Next Categories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Track with top and bottom clearance to prevent hover border clipping */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pt-3 pb-5 -mt-2 -mb-2 px-1"
        >
          {!isLoaded || displayCategories.length === 0 ? (
            /* Skeleton Loading State */
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-44 sm:w-56 bg-white/5 rounded-2xl p-3 border border-white/10"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3 card-skeleton-shimmer-dark" />
                <div className="h-4 w-3/4 bg-gray-800 rounded card-skeleton-shimmer-dark" />
              </div>
            ))
          ) : (
            displayCategories.map((category) => (
              <CategoryCardItem key={category.slug} category={category} />
            ))
          )}
        </div>

      </div>
    </section>
  );
}
