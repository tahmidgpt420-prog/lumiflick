'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';
import { ArrowLeft, Loader2, PackageX } from 'lucide-react';
import { fetchProductBySlug, fetchProductsPage } from '@/lib/products';
import { Product } from '@/types';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const rawSlug = decodeURIComponent(params.slug).trim();
  const normalizedSlug = rawSlug.toLowerCase();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // The one place a full product row (description, specifications,
  // variations, gallery) gets downloaded — fired only when this page is
  // actually opened, not as a side effect of browsing a grid.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchProductBySlug(normalizedSlug).then(async (found) => {
      if (cancelled) return;
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProduct(found);
      setLoading(false);

      // Related products — a small lite-field fetch from the same
      // category, not a slice of some full in-memory catalog. Backfill
      // from the general catalog if this category has fewer than 4
      // siblings, so a niche category doesn't show an empty section.
      const categorySlug = found.categorySlug || 'best-selling';
      const page = await fetchProductsPage({ category: categorySlug, limit: 5 });
      if (cancelled) return;
      let related = page.products.filter((p) => p.slug !== found.slug).slice(0, 4);
      if (related.length < 4) {
        const fallback = await fetchProductsPage({ limit: 4 + related.length + 1 });
        if (cancelled) return;
        const seen = new Set([found.slug, ...related.map((p) => p.slug)]);
        for (const p of fallback.products) {
          if (related.length >= 4) break;
          if (seen.has(p.slug)) continue;
          related.push(p);
          seen.add(p.slug);
        }
      }
      setRelatedProducts(related);
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedSlug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (notFound || !product) {
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

  return (
    <div className="bg-white">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
