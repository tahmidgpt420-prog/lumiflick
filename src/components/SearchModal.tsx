'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { formatImageUrl } from '@/utils/driveUrl';
import { Product } from '@/types';

function SearchProductCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onSelect}
      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-white"
    >
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 card-skeleton-shimmer z-0" />
        )}
        <Image
          src={formatImageUrl(product.image, 600)}
          alt={product.title}
          fill
          onLoad={() => setImgLoaded(true)}
          className={`object-cover group-hover:scale-105 transition-all duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-amber-700 font-medium truncate">
          {product.category}
        </p>
        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-black">
          {product.title}
        </h4>
        <p className="text-xs font-bold text-gray-900 mt-0.5">
          {product.priceRange || `৳ ${product.price.toLocaleString()}`}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
    </Link>
  );
}

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const { products, categories, isLoaded } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Popular search suggestions dynamically generated from active categories & collections
  const popularSearches = useMemo(() => {
    const primaryCats = categories
      .filter((c) => !c.parentSlug && !c.parentId)
      .map((c) => c.name);

    const subCats = categories
      .filter((c) => c.parentSlug || c.parentId)
      .slice(0, 4)
      .map((c) => c.name);

    return Array.from(new Set(['Best Selling', ...primaryCats, ...subCats])).slice(0, 10);
  }, [categories]);

  // Smart multi-word search filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryTokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return products
      .filter((p) => {
        const title = (p.title || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const categorySlug = (p.categorySlug || '').toLowerCase();
        const tags = (p.tags || []).join(' ').toLowerCase();
        const description = (p.description || '').toLowerCase();

        const combinedSearchable = `${title} ${category} ${categorySlug} ${tags} ${description}`;

        return queryTokens.every((token) => combinedSearchable.includes(token));
      })
      .slice(0, 12);
  }, [searchQuery, products]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-12">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Search Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
            <Search className="w-6 h-6 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products by title, anime, category, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base sm:text-lg outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-xs font-semibold uppercase tracking-wider"
            >
              ESC
            </button>
          </div>

          {/* Search Content */}
          <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6">
            {!searchQuery.trim() ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Popular Searches &amp; Categories
                </p>
                {!isLoaded && popularSearches.length === 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-7 w-24 rounded-full card-skeleton-shimmer" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag === 'Best Selling' ? 'Best' : tag)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-700 font-medium transition-colors hover:border-gray-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Found Products ({filteredProducts.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <SearchProductCard
                      key={p.id || p.slug}
                      product={p}
                      onSelect={() => setIsSearchOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <p className="text-gray-600 font-medium text-sm">
                  No products found matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <p className="text-xs text-gray-400">
                  Try checking for spelling or searching by category name like Anime, Islamic, or Dragonball.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredProducts.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <Link
                href="/shop"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-semibold text-gray-700 hover:text-black inline-flex items-center gap-1.5"
              >
                View all collection in shop <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
