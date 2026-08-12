'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CustomerReview } from '@/types';
import { customerReviews as initialReviews } from '@/data/reviews';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [filter, setFilter] = useState<'all' | 'screenshots' | '5stars'>('all');
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    if (filter === 'screenshots') return Boolean(r.screenshotImage);
    if (filter === '5stars') return r.rating === 5;
    return true;
  });

  const screenshotsCount = reviews.filter((r) => Boolean(r.screenshotImage)).length;
  const fiveStarsCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-16 sm:py-20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            100% Genuine Customer Feedback
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Customer Reviews & Proofs
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            See real unboxing photos, customer wall setups, and verified feedback from homeowners across Bangladesh.
          </p>

          {/* Rating Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">4.9 / 5.0</div>
              <div className="flex justify-center text-amber-400 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">Overall Rating</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
              <p className="text-[11px] text-gray-400 mt-2">Satisfied Customers</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <p className="text-[11px] text-gray-400 mt-2">Cash on Delivery</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">0%</div>
              <p className="text-[11px] text-gray-400 mt-2">Breakage Hazard</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('screenshots')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                filter === 'screenshots'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Customer Wall Photos ({screenshotsCount})
            </button>
            <button
              onClick={() => setFilter('5stars')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                filter === '5stars'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              5 Star Only ({fiveStarsCount})
            </button>
          </div>

          <Link
            href="/shop"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-full transition-colors flex items-center gap-1 shadow-sm"
          >
            Shop Verified Frames <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Customer Wall Photo / Screenshot */}
              {review.screenshotImage && (
                <div
                  onClick={() => setActiveScreenshot(review.screenshotImage || null)}
                  className="relative aspect-[16/10] bg-gray-100 cursor-zoom-in group overflow-hidden border-b border-gray-100"
                >
                  <Image
                    src={review.screenshotImage}
                    alt={`${review.author}'s wall frame review proof`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Click to Zoom Photo
                  </div>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Customer Photo
                  </div>
                </div>
              )}

              {/* Review Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>

                  {/* Feedback Text */}
                  <blockquote className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                </div>

                {/* Author Details & Product Tag */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1">
                        {review.author}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {review.location || 'Dhaka, Bangladesh'}
                      </p>
                    </div>

                    {review.productName && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold max-w-[130px] truncate text-right">
                        {review.productName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Lightbox Modal for Photo Zoom */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveScreenshot(null)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl p-2 border border-white/10 animate-scale">
              <button
                onClick={() => setActiveScreenshot(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden">
                <Image
                  src={activeScreenshot}
                  alt="Customer Review Screenshot Full View"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your home decor?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Choose from over 57+ premium handcrafted collections with Cash On Delivery all across Bangladesh.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/product-category/best-selling"
              className="px-8 py-3.5 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Best Sellers
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-bold text-xs rounded-full hover:bg-white/10 transition-colors"
            >
              View Full Catalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
