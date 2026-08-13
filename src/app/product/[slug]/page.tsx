'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { products as initialProducts } from '@/data/products';
import { Product } from '@/types';
import ProductDetailView from '@/components/ProductDetailView';
import { ArrowLeft, Loader2, PackageX } from 'lucide-react';
import {
  getProductBySlugFromFirestore,
  getAllProductsFromFirestore,
  getDeletedProductIdsFromFirestore,
} from '@/lib/firestoreProducts';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

function findInList(list: Product[], normalizedSlug: string): Product | null {
  return (
    list.find(
      (p) =>
        p.slug?.toLowerCase() === normalizedSlug ||
        p.id?.toLowerCase() === normalizedSlug ||
        (p.title &&
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ===
            normalizedSlug)
    ) || null
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const rawSlug = decodeURIComponent(params.slug).trim();
  const normalizedSlug = rawSlug.toLowerCase();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const [firestoreProduct, allFirestore, deletedIds] = await Promise.all([
          getProductBySlugFromFirestore(normalizedSlug),
          getAllProductsFromFirestore(),
          getDeletedProductIdsFromFirestore(),
        ]);

        const activeStatic = (initialProducts as Product[]).filter(
          (p) => !deletedIds.has(p.id) && !deletedIds.has(p.slug)
        );

        const mergedAll = [...allFirestore, ...activeStatic].filter(
          (p, i, arr) => arr.findIndex((x) => x.slug === p.slug || (x.id && x.id === p.id)) === i
        );

        let currentProduct = firestoreProduct || findInList(allFirestore, normalizedSlug);
        if (!currentProduct) {
          currentProduct = findInList(activeStatic, normalizedSlug);
        }

        setProduct(currentProduct || null);
        setAllProducts(mergedAll);
      } catch (err) {
        console.error('Error loading product:', err);
        const staticFound = findInList(initialProducts as Product[], normalizedSlug);
        setProduct(staticFound || null);
        setAllProducts(initialProducts as Product[]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [normalizedSlug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-xs text-gray-500 font-medium">Loading frame details...</p>
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
  const matching = allProducts.filter(
    (p) =>
      p.slug !== product.slug &&
      (p.categorySlug === categorySlug || p.category === product.category)
  );
  const others = allProducts.filter(
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
