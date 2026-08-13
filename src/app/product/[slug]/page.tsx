'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { products as initialProducts } from '@/data/products';
import { Product } from '@/types';
import ProductDetailView from '@/components/ProductDetailView';
import { ArrowLeft, Loader2, PackageX } from 'lucide-react';
import { getCustomProducts, mergeWithCustomProducts } from '@/utils/productStorage';
import { getProductBySlugFromFirestore, getAllProductsFromFirestore } from '@/lib/firestoreProducts';

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
      // 1. Check Firestore first — universal source of truth for admin-uploaded products
      try {
        const firestoreProduct = await getProductBySlugFromFirestore(normalizedSlug);
        if (firestoreProduct) {
          // Also save to localStorage as cache for this browser
          const { saveCustomProduct } = await import('@/utils/productStorage');
          saveCustomProduct(firestoreProduct);

          const allFirestore = await getAllProductsFromFirestore();
          const merged = [...allFirestore, ...initialProducts as Product[]].filter(
            (p, i, arr) => arr.findIndex(x => x.slug === p.slug) === i
          );
          setProduct(firestoreProduct);
          setAllProducts(merged);
          setLoading(false);
          return;
        }
      } catch (fsErr) {
        console.warn('Firestore lookup failed, falling back:', fsErr);
      }

      // 2. Check localStorage (local cache / offline fallback)
      const localProducts = getCustomProducts();
      const localFound = findInList(localProducts, normalizedSlug);
      if (localFound) {
        const merged = mergeWithCustomProducts(initialProducts as Product[]);
        setProduct(localFound);
        setAllProducts(merged);
        setLoading(false);
        return;
      }

      // 3. Check static bundled products
      const staticFound = findInList(initialProducts as Product[], normalizedSlug);
      if (staticFound) {
        setProduct(staticFound);
        const merged = mergeWithCustomProducts(initialProducts as Product[]);
        setAllProducts(merged);
        setLoading(false);
        return;
      }

      setLoading(false);
    }

    loadProduct();

    // Listen for live admin updates
    const handleUpdate = () => {
      const localProducts = getCustomProducts();
      const localFound = findInList(localProducts, normalizedSlug);
      if (localFound) setProduct(localFound);
    };
    window.addEventListener('lumiflick_products_updated', handleUpdate);
    return () => window.removeEventListener('lumiflick_products_updated', handleUpdate);
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
