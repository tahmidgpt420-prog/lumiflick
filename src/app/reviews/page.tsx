'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { CustomerReview } from '@/types';
import { customerReviews as initialReviews } from '@/data/reviews';
import { formatImageUrl } from '@/utils/driveUrl';

const PAGE_SIZE = 16;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  // Collect all valid review images
  const photoReviews = reviews.filter(
    (r) => Boolean(r.screenshotImage) || Boolean((r as any).image)
  );
  const visiblePhotoReviews = photoReviews.slice(0, visibleCount);
  const hasMorePhotos = visibleCount < photoReviews.length;

  const activePhoto =
    activePhotoIndex !== null && photoReviews[activePhotoIndex]
      ? photoReviews[activePhotoIndex]
      : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
    } else if (activePhotoIndex === 0) {
      setActivePhotoIndex(photoReviews.length - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null && activePhotoIndex < photoReviews.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    } else if (activePhotoIndex === photoReviews.length - 1) {
      setActivePhotoIndex(0);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Verified Customer Proofs & Reviews
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight uppercase font-serif">
            Customer Reviews & Proofs
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Real customer inbox reviews, unboxing screenshots, and wall setups shared by our happy clients across Bangladesh.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
            >
              Explore Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Original Aspect Ratio Masonry Gallery */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {photoReviews.length === 0 ? (
          <div className="text-center py-20 text-xs text-gray-400">
            No review photos published yet.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {visiblePhotoReviews.map((review, index) => {
              const imgUrl = review.screenshotImage || (review as any).image;
              if (!imgUrl) return null;

              return (
                <div
                  key={review.id || index}
                  onClick={() => setActivePhotoIndex(index)}
                  className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group cursor-zoom-in relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Image in its TRUE Original Aspect Ratio */}
                  <img
                    src={imgUrl}
                    alt={review.author || 'LUMIFLICK Customer Review Proof'}
                    className="w-full h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />

                  {/* Hover Overlay with Zoom Icon */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom Photo
                    </div>
                  </div>

                  {/* Optional Bottom Caption if provided */}
                  {review.author && review.author !== 'Verified Customer' && review.author !== 'LUMIFLICK Customer' && (
                    <div className="p-3 bg-white border-t border-gray-100 text-xs font-semibold text-gray-800">
                      {review.author}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasMorePhotos && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-8 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Previous */}
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Navigation Next */}
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Fullscreen Image in True Native Proportions */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={formatImageUrl(activePhoto.screenshotImage || (activePhoto as any).image, 'original')}
              alt="Customer Review Fullscreen"
              className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
            {activePhoto.author && activePhoto.author !== 'Verified Customer' && activePhoto.author !== 'LUMIFLICK Customer' && (
              <p className="text-white/80 text-xs sm:text-sm font-medium mt-3 text-center bg-black/50 px-4 py-1.5 rounded-full">
                {activePhoto.author}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
