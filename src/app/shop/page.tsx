'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { products as initialProducts } from '@/data/products';
import { categories as initialCategories } from '@/data/categories';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, Grid, ListFilter } from 'lucide-react';
import { Category, Product } from '@/types';

export default function ShopPage() {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        if (pData.success && Array.isArray(pData.products)) setProductsList(pData.products);
        if (cData.success && Array.isArray(cData.categories)) setCategoriesList(cData.categories);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.categorySlug === selectedCategory || (selectedCategory === 'best-selling' && p.bestSeller)
      );
    }

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
  }, [productsList, selectedCategory, sortBy]);

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Shop All Collections</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Shop All Collections
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Discover all handcrafted luxury wall frames, sets, and motivational artworks.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            All Designs ({productsList.length})
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200 text-xs">
          <span className="text-gray-500 font-medium">
            Showing <strong>{filteredProducts.length}</strong> results
          </span>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 outline-none focus:border-black"
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
