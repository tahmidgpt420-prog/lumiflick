'use client';

import React from 'react';
import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';
import { ArrowLeft, Loader2, PackageX } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const rawSlug = decodeURIComponent(params.slug).trim();
  const normalizedSlug = rawSlug.toLowerCase();

  const { products, getProductBySlug, isLoaded } = useProducts();

  // Instant lookup from client memory cache
  const product = getProductBySlug(normalizedSlug);

  if (!product && !isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <PackageX className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          The wall frame you are looking for may have been moved or updated.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Browse All Wall Art
        </Link>
      </div>
    );
  }

  const categorySlug = product.categorySlug || 'best-selling';
  const matching = products.filter(
    (p) =>
      p.slug !== product.slug &&
      (p.categorySlug === categorySlug || p.category === product.category)
  );
  const others = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.categorySlug !== categorySlug &&
      p.category !== product.category
  );
  const relatedProducts = [...matching, ...others].slice(0, 4);

  return (
    <div className="bg-white">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
