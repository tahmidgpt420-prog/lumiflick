'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';
import { getCustomProducts } from '@/utils/productStorage';

function findProduct(decodedId: string, list: Product[]): Product | null {
  return (
    list.find(
      (p) =>
        p.id?.toLowerCase() === decodedId ||
        p.slug?.toLowerCase() === decodedId ||
        (p.title &&
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === decodedId)
    ) || null
  );
}

export default function EditProductPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const decodedId = decodeURIComponent(rawId).toLowerCase().trim();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!decodedId) {
      setError('No product ID provided.');
      setLoading(false);
      return;
    }

    // 1. Immediately check localStorage (client-uploaded products)
    const localProducts = getCustomProducts();
    const localFound = findProduct(decodedId, localProducts);
    if (localFound) {
      setProduct(localFound);
      setLoading(false);
      return; // Found in localStorage, no need to call API
    }

    // 2. Check bundled static products
    const staticFound = findProduct(decodedId, initialProducts as Product[]);
    if (staticFound) {
      setProduct(staticFound);
      setLoading(false);
      return;
    }

    // 3. Fall back to API (for server-side saved products)
    async function fetchFromAPI() {
      try {
        // Try direct lookup first
        const res = await fetch(`/api/admin/products/${encodeURIComponent(rawId)}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setError('');
          setLoading(false);
          return;
        }

        // Try fetching all products and searching
        const allRes = await fetch('/api/admin/products');
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.products)) {
          const match = findProduct(decodedId, allData.products);
          if (match) {
            setProduct(match);
            setError('');
            setLoading(false);
            return;
          }
        }

        setError('Product not found. It may have been uploaded in a different browser session. Please re-upload it.');
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchFromAPI();
  }, [decodedId, rawId]);

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
            Loading product details...
          </div>
        ) : error && !product ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex flex-col items-start gap-3">
            <span className="font-bold text-sm">⚠️ Could not load product</span>
            <span>{error}</span>
            <p className="text-red-500 text-[11px] leading-relaxed">
              <strong>Why this happens:</strong> Products you upload via the admin panel are stored in your browser's local storage. 
              If you open the admin in a different browser or device, those products won't be visible to edit from there.
            </p>
            <a
              href="/admin/products"
              className="mt-1 px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              ← Back to Products List
            </a>
          </div>
        ) : product ? (
          <ProductForm initialData={product} isEditing={true} />
        ) : null}
      </div>
    </div>
  );
}
