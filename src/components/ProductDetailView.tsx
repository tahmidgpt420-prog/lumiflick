'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Star,
  Plus,
  Minus,
  CheckCircle,
} from 'lucide-react';
import { Product, ProductVariation } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductGridSection from './ProductGridSection';
import { formatImageUrl } from '@/utils/driveUrl';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const variations = product.variations || [
    {
      size: 'Standard Size',
      label: 'Standard: 13″ x 19″',
      price: product.price,
      regularPrice: product.regularPrice || Math.round(product.price * 1.3),
      inStock: true,
    },
  ];

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(
    variations[0]
  );
  const [selectedPiecesSet, setSelectedPiecesSet] = useState<Set<number>>(new Set([1]));
  const [quantity, setQuantity] = useState<number>(1);
  const rawPrimaryImage = formatImageUrl(product.galleryImages?.[0] || product.image || '/logo.png');
  const [selectedImage, setSelectedImage] = useState<string>(rawPrimaryImage);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const updated = formatImageUrl(product.galleryImages?.[0] || product.image || '/logo.png');
    setSelectedImage(updated);
  }, [product.image, product.galleryImages]);

  // Sanitized client-side only, via dynamic import — isomorphic-dompurify's
  // server-side path pulls in jsdom, which pulled in an ESM-only dependency
  // that crashed every product page in production (require() of ES Module).
  // Keeping the import out of the static module graph means webpack never
  // bundles that broken chain into the server build at all. Starts empty,
  // fills in on mount — a one-frame flash, not an XSS window, since empty
  // string is what's actually in the server-rendered HTML.
  const [safeDescription, setSafeDescription] = useState('');
  useEffect(() => {
    let cancelled = false;
    import('isomorphic-dompurify').then(({ default: DOMPurify }) => {
      if (!cancelled) setSafeDescription(DOMPurify.sanitize(product.description || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [product.description]);

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatPieceSelectionDescription(piecesSet: Set<number>): string {
  const sorted = Array.from(piecesSet).sort((a, b) => a - b);
  if (sorted.length === 0) return '';
  const ordinals = sorted.map(getOrdinal);
  if (ordinals.length === 1) {
    return `${ordinals[0]} piece`;
  }
  if (ordinals.length === 2) {
    return `${ordinals[0]} and ${ordinals[1]} pieces`;
  }
  const last = ordinals[ordinals.length - 1];
  const rest = ordinals.slice(0, -1).join(', ');
  return `${rest} and ${last} pieces`;
}

  const pieceEnabled = product.pieceSelectionEnabled === true;
  const maxPieces = product.maxPieces || 3;
  const pieceOptions = Array.from({ length: maxPieces }, (_, i) => i + 1);
  const selectedPieces = selectedPiecesSet.size; // total pieces = count of selected buttons
  const piecesFormatted = formatPieceSelectionDescription(selectedPiecesSet);
  const effectivePrice = selectedVariation.price * Math.max(1, selectedPieces);
  const effectiveRegularPrice = selectedVariation.regularPrice * Math.max(1, selectedPieces);

  const togglePiece = (n: number) => {
    setSelectedPiecesSet(prev => {
      const next = new Set(prev);
      if (next.has(n)) {
        // Don't allow deselecting last piece
        if (next.size === 1) return prev;
        next.delete(n);
      } else {
        next.add(n);
      }
      return next;
    });
  };

  const images = (
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.image || '/logo.png']
  ).map((url) => formatImageUrl(url));

  const handleAddToCart = () => {
    addItem(
      product,
      selectedVariation,
      '',
      quantity,
      Math.max(1, selectedPieces),
      pieceEnabled ? piecesFormatted : undefined
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addItem(
      product,
      selectedVariation,
      '',
      quantity,
      Math.max(1, selectedPieces),
      pieceEnabled ? piecesFormatted : undefined
    );
    router.push('/checkout');
  };

  const whatsappMessage = encodeURIComponent(
    `Hello LUMIFLICK! I want to order/inquire about this frame:\n• Product: ${product.title}\n• Product Slug: ${product.slug}\n• Size: ${selectedVariation.label}${pieceEnabled && piecesFormatted ? `\n• Pieces: ${piecesFormatted}` : ''}\n• Quantity: ${quantity}\n• Price: ${(effectivePrice * quantity).toLocaleString()} BDT + Delivery Charge\n• Product URL: https://www.lumiflick.shop/product/${product.slug}`
  );

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/product-category/${product.categorySlug}`}
          className="hover:text-black"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Interactive Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Zoomable Frame Container */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
            <Image
              src={selectedImage || '/logo.png'}
              alt={product.title}
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.sale && <span className="badge-sale">Sale!</span>}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-black scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* Ratings & Stock Badge */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-1.5">5.0</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({product.reviewCount || 18} reviews)
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> In Stock
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              ৳ {effectivePrice.toLocaleString()}
            </span>
            {effectiveRegularPrice > effectivePrice && (
              <span className="text-sm sm:text-base text-gray-400 line-through">
                ৳ {effectiveRegularPrice.toLocaleString()}
              </span>
            )}
            {effectiveRegularPrice > effectivePrice && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded ml-auto">
                Save ৳ {(effectiveRegularPrice - effectivePrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variation Selector: Size */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
              Select Size & Bundle Option:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {variations.map((v) => {
                const isSelected = selectedVariation.size === v.size;
                return (
                  <button
                    key={v.size}
                    type="button"
                    onClick={() => setSelectedVariation(v)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-400 text-gray-800'
                    }`}
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">{v.label}</p>
                    </div>
                    <span className="text-xs font-bold shrink-0 ml-2">
                      ৳ {v.price.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Piece Selector — compact multi-select toggle buttons */}
          {pieceEnabled && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                Select Pieces
                <span className="ml-2 text-[11px] text-gray-500 font-medium normal-case">
                  ({piecesFormatted}) &middot; ৳ {effectivePrice.toLocaleString()} total
                </span>
              </label>
              <div className="flex gap-2">
                {pieceOptions.map((n) => {
                  const isOn = selectedPiecesSet.has(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => togglePiece(n)}
                      className={`w-12 h-12 rounded-xl border text-base font-bold transition-all ${
                        isOn
                          ? 'border-black bg-black text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-12 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 hover:bg-gray-100 text-gray-700 h-full transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 hover:bg-gray-100 text-gray-700 h-full transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 px-6 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            {/* Chat on Messenger Button */}
            <a
              href="https://www.m.me/LumiFlick"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-[#0084FF] hover:bg-[#0073E6] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0084FF]/20 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.51 3.24 7.34-.17 1.05-.62 2.7-1.78 3.84 0 0 2.5-.2 4.46-1.55.67.19 1.38.29 2.08.29 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06l-2.73-2.91-5.33 2.91 5.86-6.22 2.8 2.91 5.26-2.91-5.86 6.22z" />
              </svg>
              Chat on Messenger
            </a>

            {/* WhatsApp Order Button */}
            <a
              href={`https://wa.me/8801400307299?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Order On WhatsApp
            </a>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 text-xs text-gray-700">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-gray-900 shrink-0" />
              <span>
                <strong>Delivery:</strong> All over Bangladesh &nbsp;|&nbsp; Home delivery available
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Color Guarantee:</strong> Lifetime + water and dust proof
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-gray-900 shrink-0" />
              <span>
                <strong>Damage Replacement:</strong> Free instant replacement if damaged in transit.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Product Information Tabs */}
      <div className="mt-16 border-t border-gray-200 pt-10">
        <div className="flex items-center justify-center border-b border-gray-200 gap-6 sm:gap-10 mb-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm sm:text-base font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'desc'
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm sm:text-base font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'specs'
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Specifications
          </button>
        </div>

        {/* Tab Contents */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'desc' && (
            <div
              className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />
          )}

          {activeTab === 'specs' && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Material</span>
                  <span className="font-semibold text-gray-800">{product.specifications?.material}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Surface Finish</span>
                  <span className="font-semibold text-gray-800">{product.specifications?.finish}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Mounting</span>
                  <span className="font-semibold text-gray-800">{product.specifications?.mounting}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[11px] uppercase font-bold">Package Weight</span>
                  <span className="font-semibold text-gray-800">{product.specifications?.weight}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductGridSection
            title="You May Also Like"
            products={relatedProducts}
            viewAllLink={`/product-category/${product.categorySlug}`}
          />
        </div>
      )}
    </div>
  );
}
