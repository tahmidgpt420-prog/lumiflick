'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatImageUrl } from '@/utils/driveUrl';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variations?.[0], 'Matte Black', 1);
  };

  const productSlug =
    product.slug ||
    product.id ||
    product.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    'frame';

  const categorySlug =
    product.categorySlug ||
    product.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    'best-selling';

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
      
      {/* Thumbnail Wrap */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Link href={`/product/${productSlug}`} className="block w-full h-full relative">
          {/* Skeleton Shimmer Placeholder */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-0 card-skeleton-shimmer transition-opacity duration-300 pointer-events-none ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <Image
            src={hasError ? '/logo.png' : formatImageUrl(product.image || '/logo.png')}
            alt={product.title || 'LUMIFLICK Frame'}
            fill
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setHasError(true);
            }}
            className={`object-cover group-hover:scale-105 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Sale Badge */}
        {product.sale && (
          <span className="badge-sale">
            Sale!
          </span>
        )}

        {/* Quick Action Button on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            className="w-10 h-10 rounded-full bg-black text-white hover:bg-amber-600 flex items-center justify-center shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0"
            aria-label={`Add ${product.title} to cart`}
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <Link
            href={`/product/${productSlug}`}
            className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-100 flex items-center justify-center shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0"
            title="View Details"
            aria-label={`View details for ${product.title}`}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Category */}
          <Link
            href={`/product-category/${categorySlug}`}
            className="text-[11px] font-semibold text-gray-500 hover:text-black uppercase tracking-wider block mb-1"
          >
            {product.category || 'Wall Frame'}
          </Link>

          {/* Title */}
          <Link
            href={`/product/${productSlug}`}
            className="text-sm sm:text-base font-semibold text-gray-900 hover:text-black line-clamp-1 block transition-colors"
          >
            {product.title}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <div>
            {product.priceRange ? (
              <span className="text-sm font-bold text-gray-900">
                {product.priceRange}
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                {product.regularPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ৳ {product.regularPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  ৳ {product.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/product/${productSlug}`}
            className="text-xs font-semibold text-gray-900 hover:text-amber-600 underline underline-offset-4"
          >
            Select Options
          </Link>
        </div>
      </div>

    </div>
  );
}
