'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadProduct();
    }
  }, [id]);

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
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs">
            {error}
          </div>
        ) : product ? (
          <ProductForm initialData={product} isEditing={true} />
        ) : null}
      </div>
    </div>
  );
}
