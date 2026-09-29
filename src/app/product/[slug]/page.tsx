import React from 'react';
import Link from 'next/link';
import ProductDetailView from '@/components/ProductDetailView';
import { ArrowLeft, PackageX } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/catalogServer';

export const dynamic = 'force-dynamic';

// Rendered on the server: the product arrives in the HTML, with no loading
// spinner and no client-side API round-trips.
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));

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

  const relatedProducts = await getRelatedProducts(product);

  return (
    <div className="bg-white">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
