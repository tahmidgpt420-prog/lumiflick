'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'LUMIFLICK35' || couponCode.toUpperCase() === 'SALE35') {
      setDiscount(Math.round(subtotal * 0.35));
      setCouponApplied(true);
      setCouponError('');
    } else if (couponCode.toUpperCase() === 'WELCOME10') {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try "LUMIFLICK35"');
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">
        Your Cart ({totalItems} items)
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is currently empty</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Explore our handcrafted luxury frameless glass posters, Islamic calligraphy sets, and anime series.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white text-xs sm:text-sm font-bold rounded-full hover:bg-gray-800 transition-all shadow-md"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-base font-bold text-gray-900 hover:underline block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.selectedSize}
                      {item.selectedFrameColor ? ` • Frame: ${item.selectedFrameColor}` : ''}
                    </p>
                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      Unit Price: ৳ {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9 bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 hover:bg-gray-100 text-gray-700 h-full transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 hover:bg-gray-100 text-gray-700 h-full transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-base font-extrabold text-gray-900 block">
                        ৳ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Back to Shopping */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Browsing
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳ {subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Applied</span>
                    <span>- ৳ {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span>Inside Dhaka: ৳70 / Outside: ৳130</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-base sm:text-lg font-extrabold text-gray-900">
                  <span>Estimated Total</span>
                  <span>৳ {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Have a Promo Code? (Try &ldquo;LUMIFLICK35&rdquo;)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-black uppercase font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 35% Discount Applied Successfully!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>
                )}
              </form>

              {/* Checkout CTA */}
              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-black text-white rounded-xl text-center text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-[0.98]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-[11px] text-gray-400 text-center space-y-1 pt-1">
                <p>✓ Cash on delivery available across all 64 districts</p>
                <p>✓ Instant replacement for broken/transit damage</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
