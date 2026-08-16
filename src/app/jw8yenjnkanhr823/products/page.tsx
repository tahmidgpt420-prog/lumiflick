'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { useProducts } from '@/context/ProductContext';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'category';

export default function AdminProductsPage() {
  const { categories: contextCategories, refreshProducts } = useProducts();
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Sync live categories from context or fetch directly from admin categories endpoint
  useEffect(() => {
    if (contextCategories && contextCategories.length > 0) {
      setCategoriesList(contextCategories);
    } else {
      fetch('/api/admin/categories')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.categories) setCategoriesList(d.categories);
        })
        .catch(() => {});
    }
  }, [contextCategories]);

  // Real server-side search + sort + category filter + pagination — one
  // query does all of it now that this is Postgres, not Firestore, so
  // there's no more need for a separate "full fetch for search" fallback.
  const fetchPage = useCallback(
    async (reset: boolean) => {
      reset ? setLoading(true) : setLoadingMore(true);
      try {
        const nextPage = reset ? 0 : page;
        const params = new URLSearchParams({
          mode: 'page',
          sort: sortBy,
          category: selectedCat,
          search,
          page: String(nextPage),
        });
        const res = await fetch(`/api/admin/products?${params}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load products');

        setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
        setPage(nextPage + 1);
      } catch (e) {
        console.error('Error fetching products:', e);
        if (reset) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, selectedCat, search]
  );

  // Debounce search so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => fetchPage(true), search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedCat, search]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);

    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      try {
        await refreshProducts();
      } catch {}
    } catch (e) {
      console.error('Error deleting product:', e);
    } finally {
      setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
      setTotalCount((c) => (c !== null ? Math.max(0, c - 1) : c));
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Product Inventory Management"
        description="Add, edit, or remove wall frame products, modify sizes, prices, and photo galleries"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white font-medium"
              >
                <option value="all">📁 All Categories {totalCount !== null ? `(${totalCount})` : ''}</option>
                {(() => {
                  const mainCats = categoriesList.filter((c) => !c.parentSlug && !c.parentId);
                  const orphanSubs = categoriesList.filter(
                    (c) =>
                      (c.parentSlug || c.parentId) &&
                      !mainCats.some(
                        (m) =>
                          m.slug === (c.parentSlug || c.parentId) ||
                          m.slug.toLowerCase() === (c.parentSlug || c.parentId || '').toLowerCase()
                      )
                  );

                  return (
                    <>
                      {mainCats.map((mainCat) => {
                        const subs = categoriesList.filter(
                          (c) =>
                            c.parentSlug === mainCat.slug ||
                            c.parentId === mainCat.slug ||
                            (c.parentSlug && c.parentSlug.toLowerCase() === mainCat.slug.toLowerCase()) ||
                            (c.parentId && c.parentId.toLowerCase() === mainCat.slug.toLowerCase())
                        );

                        if (subs.length === 0) {
                          return (
                            <option key={mainCat.id || mainCat.slug} value={mainCat.slug}>
                              📁 {mainCat.name}
                            </option>
                          );
                        }

                        return (
                          <optgroup key={mainCat.id || mainCat.slug} label={`── ${mainCat.name} ──`}>
                            <option value={mainCat.slug}>
                              📁 All {mainCat.name}
                            </option>
                            {subs.map((sub) => (
                              <option key={sub.id || sub.slug} value={sub.slug}>
                                &nbsp;&nbsp;&nbsp;↳ {sub.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}

                      {orphanSubs.length > 0 && (
                        <optgroup label="── Other Sub-Categories ──">
                          {orphanSubs.map((c) => (
                            <option key={c.id || c.slug} value={c.slug}>
                              ↳ {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  );
                })()}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="category">Category (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Add New Product Button */}
          <Link
            href="/jw8yenjnkanhr823/products/new"
            className="w-full md:w-auto px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Loading inventory...
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4">Sizes</th>
                    <th className="p-4">Badges</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product.id || product.slug}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/jw8yenjnkanhr823/products/edit/${product.slug}`}
                              className="font-bold text-gray-900 hover:underline block max-w-xs truncate"
                            >
                              {product.title}
                            </Link>
                            <span className="text-[11px] text-gray-400">
                              Slug: /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-gray-900">
                        {product.priceRange || `৳ ${product.price.toLocaleString()}`}
                      </td>

                      {/* Sizes Count */}
                      <td className="p-4 text-gray-600">
                        {product.variations?.length || 1} size option(s)
                      </td>

                      {/* Badges */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.bestSeller && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              Best Seller
                            </span>
                          )}
                          {product.sale && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Sale
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                            title="View on live store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/jw8yenjnkanhr823/products/edit/${product.slug}`}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id || product.slug, product.title)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchPage(false)}
              disabled={loadingMore}
              className="px-8 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
