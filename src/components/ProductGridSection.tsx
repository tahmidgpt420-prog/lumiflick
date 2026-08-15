'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridSectionProps {
  title: string;
  categorySlug?: string;
  products: Product[];
  viewAllLink?: string;
  isLoading?: boolean;
}

export default function ProductGridSection({
  title,
  categorySlug,
  products,
  viewAllLink,
  isLoading = false,
}: ProductGridSectionProps) {
  if (!isLoading && products.length === 0) return null;

  const targetLink = viewAllLink || (categorySlug ? `/product-category/${categorySlug}` : '/shop');

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Divider Header */}
      <div className="section-divider">
        <h2 className="section-divider-title">
          {title}
        </h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 min-h-[300px]">
        {isLoading || products.length === 0 ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 p-3 sm:p-4 space-y-3"
            >
              <div className="aspect-[4/3] w-full rounded-lg card-skeleton-shimmer" />
              <div className="h-3 w-1/3 rounded bg-gray-200 card-skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded bg-gray-200 card-skeleton-shimmer" />
              <div className="h-4 w-1/2 rounded bg-gray-200 card-skeleton-shimmer" />
            </div>
          ))
        ) : (
          products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))
        )}
      </div>

      {/* View All Button */}
      <div className="mt-8 text-center">
        <Link
          href={targetLink}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-gray-800 transition-colors shadow-sm"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
