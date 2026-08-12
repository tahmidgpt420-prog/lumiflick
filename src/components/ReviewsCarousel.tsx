'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { customerReviews } from '@/data/reviews';

export default function ReviewsCarousel() {
  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs font-bold text-gray-700 ml-1.5">5.0 Star Rated Wall Art</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Our Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Get inspired by real customer feedback & photos across Bangladesh
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified Buy
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic relative">
                  <Quote className="w-4 h-4 text-gray-200 inline mr-1 -mt-1" />
                  {rev.comment}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">{rev.author}</h4>
                  {rev.location && (
                    <p className="text-[11px] text-gray-400">{rev.location}</p>
                  )}
                </div>
                {rev.productName && (
                  <span className="text-[10px] text-gray-400 max-w-[130px] truncate text-right">
                    {rev.productName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/reviews"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-black/10"
          >
            <span>Explore All 500+ Customer Reviews & Wall Photos</span>
            <span>&rarr;</span>
          </a>
        </div>

      </div>
    </section>
  );
}
