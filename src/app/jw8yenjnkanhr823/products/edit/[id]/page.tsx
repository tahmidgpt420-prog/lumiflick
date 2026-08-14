'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import Link from 'next/link';

function findProduct(decodedId: string, list: Product[]): Product | null {
  return (
    list.find(
      (p) =>
        (p.id && p.id.toLowerCase() === decodedId) ||
        (p.slug && p.slug.toLowerCase() === decodedId) ||
        (p.title &&
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === decodedId)
    ) || null
  );
}

export default function EditProductPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const decodedId = decodeURIComponent(rawId).toLowerCase().trim();

  const { products: contextProducts, isLoaded } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!decodedId) {
      setError('No product ID provided.');
      setLoading(false);
      return;
    }

    async function load() {
      // 1. Check ProductContext products first (cached Firestore + static)
      const foundInContext = findProduct(decodedId, contextProducts);
      if (foundInContext) {
        setProduct(foundInContext);
        setLoading(false);
        return;
      }

      // 2. Not in the (possibly stale, 15-min cached) context yet — fetch
      // this one product directly and freshly from the admin API.
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(decodedId)}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setLoading(false);
          return;
        }

        // 3. Fall back to static bundled products
        const staticFound = findProduct(decodedId, initialProducts as Product[]);
        if (staticFound) {
          setProduct(staticFound);
          setLoading(false);
          return;
        }

        setError(`Product "${rawId}" not found in database.`);
      } catch (err: any) {
        console.error('Failed to load product for edit:', err);
        setError(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [decodedId, rawId, contextProducts]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title={product ? `Edit "${product.title}"` : 'Edit Product'}
        description="Modify frame dimensions, prices, images, descriptions, and sales settings"
      />

      <div className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Loading product details from database...
          </div>
        ) : error && !product ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex flex-col items-start gap-3">
            <span className="font-bold text-sm">⚠️ Could not load product</span>
            <span>{error}</span>
            <Link
              href="/jw8yenjnkanhr823/products"
              className="mt-1 px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              ← Back to Products List
            </Link>
          </div>
        ) : product ? (
          <ProductForm initialData={product} isEditing={true} />
        ) : null}
      </div>
    </div>
  );
}
