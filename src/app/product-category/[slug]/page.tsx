'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { categories as initialCategories, getCategoryBySlug } from '@/data/categories';
import { products as initialProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Category, Product } from '@/types';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { getAllProductsFromFirestore, getDeletedProductIdsFromFirestore } from '@/lib/firestoreProducts';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = decodeURIComponent(params.slug).toLowerCase().trim();

  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [productsList, setProductsList] = useState<Product[]>(initialProducts as Product[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [firestoreProds, deletedIds] = await Promise.all([
          getAllProductsFromFirestore(),
          getDeletedProductIdsFromFirestore(),
        ]);

        const activeFirestore = firestoreProds.filter(
          (p) => !deletedIds.has(p.id) && !deletedIds.has(p.slug)
        );
        const activeStatic = (initialProducts as Product[]).filter(
          (p) =>
            !deletedIds.has(p.id) &&
            !deletedIds.has(p.slug) &&
            !activeFirestore.some((fp) => fp.slug === p.slug || fp.id === p.id)
        );

        setProductsList([...activeFirestore, ...activeStatic]);

        try {
          const cRes = await fetch('/api/admin/categories');
          const cData = await cRes.json();
          if (cData.success && Array.isArray(cData.categories)) {
            setCategoriesList(cData.categories);
          }
        } catch { /* default categories fallback */ }
      } catch (err) {
        console.error('Failed to load dynamic category data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Find category object
  const category =
    categoriesList.find(
      (c) =>
        c.slug.toLowerCase() === slug ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
    ) ||
    getCategoryBySlug(slug) || {
      name: slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      slug,
      image: '/logo.png',
      description: `Explore our collection of handcrafted ${slug.replace(/-/g, ' ')} frames at LUMIFLICK.`,
    };

  // Filter products for this category
  const categoryProducts = productsList.filter((p) => {
    if (!p) return false;
    if (slug === 'best-selling') {
      return (
        p.bestSeller ||
        p.categorySlug?.toLowerCase() === 'best-selling' ||
        p.category?.toLowerCase() === 'best selling'
      );
    }

    const pCatSlug = (p.categorySlug || '').toLowerCase().trim();
    const pCatNameSlug = (p.category || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .trim();

    return pCatSlug === slug || pCatNameSlug === slug;
  });

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">
          Collections
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-amber-600" /> Collection
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
          {categoryProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
