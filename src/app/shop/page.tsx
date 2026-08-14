'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductContext';
import {
  getMainCategories,
  getSubcategories,
  findCategoryBySlugOrName,
  getParentCategory,
  matchesCategory,
  normalizeCategorySlug,
} from '@/utils/categoryHelpers';
import { Layers, Sparkles, SlidersHorizontal } from 'lucide-react';

const PAGE_SIZE = 16;

function ShopContent() {
  const { products, categories, isLoaded } = useProducts();
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [sortBy, setSortBy] = useState<string>('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync state if URL search params change
  useEffect(() => {
    const param = searchParams.get('category');
    if (param) {
      setSelectedCategory(param);
      setVisibleCount(PAGE_SIZE);
    }
  }, [searchParams]);

  // Main (top-level) categories
  const mainCategories = useMemo(() => getMainCategories(categories), [categories]);

  // Identify active category and its position in the hierarchy
  const activeCatObj = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === 'best-selling') return null;
    return findCategoryBySlugOrName(selectedCategory, categories);
  }, [selectedCategory, categories]);

  // Parent category if active category is a sub-category
  const parentCatObj = useMemo(() => {
    if (!activeCatObj) return null;
    return getParentCategory(activeCatObj, categories);
  }, [activeCatObj, categories]);

  // Relevant main category (either the active category itself or its parent)
  const activeMainCat = parentCatObj || (activeCatObj && !activeCatObj.parentSlug ? activeCatObj : null);

  // Sub-categories to display in the sub-navigation bar
  const activeSubcategories = useMemo(() => {
    if (!activeMainCat) return [];
    return getSubcategories(activeMainCat.slug, categories);
  }, [activeMainCat, categories]);

  // Hierarchical product filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => matchesCategory(p, selectedCategory, categories));

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [products, selectedCategory, sortBy, categories]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className={activeMainCat ? 'hover:text-black cursor-pointer' : 'text-gray-900 font-semibold'} onClick={() => handleCategorySelect('all')}>
          Shop All Collections
        </span>
        {activeMainCat && (
          <>
            <span>/</span>
            <span
              className={activeCatObj && activeCatObj.slug !== activeMainCat.slug ? 'hover:text-black cursor-pointer' : 'text-gray-900 font-semibold'}
              onClick={() => handleCategorySelect(activeMainCat.slug)}
            >
              {activeMainCat.name}
            </span>
          </>
        )}
        {activeCatObj && activeCatObj.slug !== activeMainCat?.slug && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{activeCatObj.name}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {activeCatObj ? activeCatObj.name : 'Shop All Collections'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {activeCatObj?.description || 'Discover all handcrafted luxury wall frames, sets, and motivational artworks.'}
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 mb-8 space-y-3.5 shadow-sm">
        {/* Main Category Pills */}
        <div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              All Designs ({products.length})
            </button>
            {mainCategories.map((cat) => {
              const isDirectlySelected = selectedCategory === cat.slug;
              const isChildSelected = activeMainCat?.slug === cat.slug;
              const isCatActive = isDirectlySelected || isChildSelected;

              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isCatActive
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Sub-Category Navigation Bar (Appears when active main category has subcategories) */}
        {activeMainCat && activeSubcategories.length > 0 && (
          <div className="pt-3 border-t border-gray-200/80">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {/* "All [Main Category]" Button */}
              {(() => {
                const isAllInMainSelected =
                  normalizeCategorySlug(selectedCategory) === normalizeCategorySlug(activeMainCat.slug);

                return (
                  <button
                    onClick={() => handleCategorySelect(activeMainCat.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isAllInMainSelected
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    All {activeMainCat.name}
                  </button>
                );
              })()}

              {/* Sub-Category Pills */}
              {activeSubcategories.map((sub) => {
                const isSubSelected =
                  normalizeCategorySlug(selectedCategory) === normalizeCategorySlug(sub.slug);

                return (
                  <button
                    key={sub.slug}
                    onClick={() => handleCategorySelect(sub.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isSubSelected
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-gray-200 text-xs">
          <span className="text-gray-500 font-medium">
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'frame' : 'frames'}
            {activeCatObj && (
              <span className="text-gray-700"> in <strong>{activeCatObj.name}</strong></span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 outline-none focus:border-black shadow-sm"
            >
              <option value="default">Featured / Default</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-4">
          <p className="text-gray-600 text-sm font-medium">
            No frames currently found matching this filter.
          </p>
          <button
            onClick={() => handleCategorySelect('all')}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> View All Designs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-gray-400">
          Loading catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

