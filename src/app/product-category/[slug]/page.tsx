'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Sparkles, ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { Category } from '@/types';
import {
  getSubcategories,
  getParentCategory,
  findCategoryBySlugOrName,
} from '@/utils/categoryHelpers';

const PAGE_SIZE = 16;

// Virtual category — not a real row in the categories table, driven by the
// per-product "Best Seller" toggle instead. Always valid, never deletable.
const BEST_SELLING_CATEGORY: Category = {
  name: 'Best Selling',
  slug: 'best-selling',
  image: '/logo.png',
  description: 'Our top most popular, best-selling handcrafted wall frames across Bangladesh.',
};

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = decodeURIComponent(params.slug).toLowerCase().trim();
  const { categories, isLoaded, getProductsByCategory } = useProducts();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination whenever navigating to a different category/sub-category
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [slug]);

  // Instant from client memory cache
  const categoryProducts = getProductsByCategory(slug);
  const visibleProducts = categoryProducts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryProducts.length;

  // Find category object
  const category =
    slug === 'best-selling'
      ? BEST_SELLING_CATEGORY
      : findCategoryBySlugOrName(slug, categories);

  if (!category) {
    if (!isLoaded) {
      return (
        <div className="py-24 flex items-center justify-center text-gray-400 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading category...
        </div>
      );
    }
    notFound();
  }

  // Find parent category if this is a subcategory
  const parentCategory = category.parentSlug || category.parentId
    ? getParentCategory(category, categories)
    : null;

  // If this is a parent category, find direct child sub-categories
  // If this is a sub-category, find all sibling sub-categories under the same parent
  const activeMainCat = parentCategory || (!category.parentSlug ? category : null);
  const relevantSubcategories = activeMainCat
    ? getSubcategories(activeMainCat.slug, categories)
    : [];

  const mainCategoryTotalCount = activeMainCat
    ? getProductsByCategory(activeMainCat.slug).length
    : categoryProducts.length;

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">
          Collections
        </Link>
        {parentCategory && (
          <>
            <span>/</span>
            <Link
              href={`/product-category/${parentCategory.slug}`}
              className="hover:text-black"
            >
              {parentCategory.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-semibold">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-amber-600" />{' '}
          {parentCategory ? `Sub-category of ${parentCategory.name}` : 'Collection'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400 font-medium">
          Showing {categoryProducts.length} handcrafted wall frame{categoryProducts.length === 1 ? '' : 's'}
        </p>

        {/* Sub-category Navigation Buttons */}
        {activeMainCat && relevantSubcategories.length > 0 && (
          <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* "All [Main Collection]" Button */}
            {category.slug === activeMainCat.slug ? (
              <span className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold shrink-0 shadow-sm">
                All {activeMainCat.name}
              </span>
            ) : (
              <Link
                href={`/product-category/${activeMainCat.slug}`}
                className="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-semibold shrink-0 transition-colors"
              >
                All {activeMainCat.name}
              </Link>
            )}

            {/* Sub-category Pills */}
            {relevantSubcategories.map((sub) => {
              const isCurrent = sub.slug === category.slug;

              if (isCurrent) {
                return (
                  <span
                    key={sub.slug}
                    className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold shrink-0 shadow-sm"
                  >
                    {sub.name}
                  </span>
                );
              }

              return (
                <Link
                  key={sub.slug}
                  href={`/product-category/${sub.slug}`}
                  className="px-4 py-2 rounded-full bg-white text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-semibold shrink-0 transition-colors"
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-4">
          <p className="text-gray-600 text-sm font-medium">
            No frames currently listed under &ldquo;{category.name}&rdquo; yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Explore All Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-8 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
