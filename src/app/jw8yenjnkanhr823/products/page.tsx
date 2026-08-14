'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Product } from '@/types';
import { categories } from '@/data/categories';
import { products as staticProducts } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

const PAGE_SIZE = 50;

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'category';

export default function AdminProductsPage() {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cursor, setCursor] = useState<string | number | null>(null);
  const [hasMoreServer, setHasMoreServer] = useState(false);

  const isSearching = search.trim() !== '';
  // "category" sort groups the whole catalog by category name, which needs
  // everything loaded to do correctly — falls back to a full fetch, same
  // as search. Every other sort/category combo stays on the real paginated
  // read (only fetches PAGE_SIZE documents from Firestore per request).
  const needsFullFetch = isSearching || sortBy === 'category';

  // Real server-side pagination — only reads PAGE_SIZE documents from
  // Firestore, not the whole products collection. This is the default
  // (no search, sort != category) browsing mode.
  const fetchPage = useCallback(
    async (reset: boolean) => {
      reset ? setLoading(true) : setLoadingMore(true);
      try {
        const params = new URLSearchParams({
          mode: 'page',
          sort: sortBy,
          category: selectedCat,
        });
        if (!reset && cursor !== null) params.set('cursor', String(cursor));

        const res = await fetch(`/api/admin/products?${params}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load products');

        setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
        setCursor(data.nextCursor);
        setHasMoreServer(Boolean(data.nextCursor));
        if (typeof data.totalCount === 'number') setTotalCount(data.totalCount);
      } catch (e) {
        console.error('Error fetching product page:', e);
        if (reset) setProducts(staticProducts as Product[]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortBy, selectedCat, cursor]
  );

  // Full merge fetch (JSON store + Firestore + static) — used for search and
  // "Category (A-Z)" sort, both of which need the whole catalog in memory.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load products');
      setProducts(data.products);
      setTotalCount(data.products.length);
    } catch (e) {
      console.error('Error fetching all products:', e);
      setProducts(staticProducts as Product[]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch fetch strategy when search is entered/cleared or sort mode
  // crosses the full-fetch boundary.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (needsFullFetch) {
      fetchAll();
    } else {
      setCursor(null);
      fetchPage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsFullFetch, sortBy, selectedCat]);

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

  const filtered = useMemo(() => {
    let result = products;

    if (isSearching) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      );
    }
    if (needsFullFetch && selectedCat !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCat);
    }
    if (sortBy === 'category') {
      result = [...result].sort(
        (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
      );
    }
    // newest/oldest/name-* are already ordered server-side when !needsFullFetch;
    // when needsFullFetch (search), re-apply the same ordering client-side.
    else if (needsFullFetch) {
      if (sortBy === 'name-asc') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      else if (sortBy === 'name-desc') result = [...result].sort((a, b) => b.title.localeCompare(a.title));
      else if (sortBy === 'newest') result = [...result].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      else if (sortBy === 'oldest') result = [...result].sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
    }

    return result;
  }, [products, search, selectedCat, sortBy, isSearching, needsFullFetch]);

  const visibleProducts = needsFullFetch ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = needsFullFetch ? visibleCount < filtered.length : hasMoreServer;

  const handleLoadMore = () => {
    if (needsFullFetch) {
      setVisibleCount((c) => c + PAGE_SIZE);
    } else {
      fetchPage(false);
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
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white"
              >
                <option value="all">All Categories {totalCount !== null ? `(${totalCount})` : ''}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
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
          ) : visibleProducts.length === 0 ? (
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
                  {visibleProducts.map((product) => (
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
              onClick={handleLoadMore}
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
