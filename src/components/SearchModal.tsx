'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useCart();
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchQuery]);

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
              placeholder="Search products by title, category, style (e.g. Porsche, Ayat, Boho)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base sm:text-lg outline-none text-gray-800 placeholder-gray-400 bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Porsche 911',
                    'Ayat-ul-Qursi',
                    '5 Frames Set',
                    'Nature Inspired',
                    'Motivational Wall Frame',
                    'Religious Luxury',
                    'BOHO Theme',
                    'Floral',
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-700 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Products ({filteredProducts.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-white"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-700 font-medium truncate">
                          {p.category}
                        </p>
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-black">
                          {p.title}
                        </h4>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                          {p.priceRange || `৳ ${p.price.toLocaleString()}`}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">
                  No products found matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try checking for spelling or searching with general terms.
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
