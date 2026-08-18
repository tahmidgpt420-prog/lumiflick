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
  Loader2,
} from 'lucide-react';
import { CustomerReview } from '@/types';
import { customerReviews as initialReviews } from '@/data/reviews';
import { formatImageUrl } from '@/utils/driveUrl';

const PAGE_SIZE = 16;

// Individual Review Card with Skeleton Shimmer Animation
function ReviewPhotoCard({
  review,
  index,
  onSelect,
}: {
  review: CustomerReview;
  index: number;
  onSelect: (index: number) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const rawImgUrl = review.screenshotImage || (review as any).image;
  const imgUrl = formatImageUrl(rawImgUrl, 800);
  if (!imgUrl) return null;

  const hasCaption =
    review.author && review.author !== 'Verified Customer' && review.author !== 'LUMIFLICK Customer';

  return (
    <div
      onClick={() => onSelect(index)}
      className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group cursor-zoom-in relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative w-full min-h-[120px] sm:min-h-[180px] bg-gray-100 flex items-center justify-center overflow-hidden">
        {/* Skeleton Shimmer Loading Placeholder */}
        {!imageLoaded && !hasError && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 card-skeleton-shimmer transition-opacity duration-300 pointer-events-none min-h-[140px] sm:min-h-[220px]"
          />
        )}

        {/* Image in its TRUE Original Aspect Ratio */}
        <img
          src={hasError ? '/logo.png' : imgUrl}
          alt={review.author || 'LUMIFLICK Customer Review Proof'}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(true);
            setHasError(true);
          }}
          className={`w-full h-auto object-contain block transition-all duration-500 group-hover:scale-[1.01] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover Overlay with Zoom Icon */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
          <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <ZoomIn className="w-3.5 h-3.5" /> Zoom Photo
          </div>
        </div>
      </div>

      {/* Optional Bottom Caption if provided */}
      {hasCaption && (
        <div className="p-3 bg-white border-t border-gray-100 text-xs font-semibold text-gray-800">
          {review.author}
        </div>
      )}
    </div>
  );
}

// Initial Masonry Grid Skeleton Loader
function ReviewsSkeletonGrid({ cols }: { cols: number }) {
  const dummyHeights = [
    'h-48 sm:h-72', 'h-64 sm:h-96', 'h-40 sm:h-64', 'h-56 sm:h-80',
    'h-60 sm:h-84', 'h-36 sm:h-60', 'h-52 sm:h-76', 'h-64 sm:h-90'
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 items-start">
      {Array.from({ length: cols }).map((_, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2.5 sm:gap-4">
          {dummyHeights
            .filter((_, i) => i % cols === colIdx)
            .map((h, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden relative ${h} card-skeleton-shimmer`}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const [cols, setCols] = useState(2);

  // Same breakpoints as the raw-photos gallery — 2 columns on phone.
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 768) setCols(2);
      else if (w < 1024) setCols(3);
      else setCols(4);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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

  // Round-robin into column buckets by ORIGINAL index — same fix raw-photos
  // got: plain CSS `columns-N` reflows/redistributes every item across all
  // columns whenever the list grows, so Load More visually reshuffled
  // existing photos instead of appending new ones at the bottom. Assigning
  // each photo's column by its fixed index keeps every existing photo's
  // position stable; new photos only ever add to the end of a column.
  const columnBuckets = Array.from(
    { length: cols },
    () => [] as { review: CustomerReview; originalIndex: number }[]
  );
  visiblePhotoReviews.forEach((review, idx) => {
    columnBuckets[idx % cols].push({ review, originalIndex: idx });
  });

  const activePhoto =
    activePhotoIndex !== null && photoReviews[activePhotoIndex]
      ? photoReviews[activePhotoIndex]
      : null;

  const handleOpenPhoto = (idx: number) => {
    setLightboxLoaded(false);
    setActivePhotoIndex(idx);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxLoaded(false);
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
    } else if (activePhotoIndex === 0) {
      setActivePhotoIndex(photoReviews.length - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxLoaded(false);
    if (activePhotoIndex !== null && activePhotoIndex < photoReviews.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    } else if (activePhotoIndex === photoReviews.length - 1) {
      setActivePhotoIndex(0);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxLoaded(false);
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : photoReviews.length - 1) : null
        );
      }
      if (e.key === 'ArrowRight') {
        setLightboxLoaded(false);
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev < photoReviews.length - 1 ? prev + 1 : 0) : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photoReviews.length]);

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

      {/* Original Aspect Ratio Masonry Gallery with Skeleton Shimmer */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {loading ? (
          <ReviewsSkeletonGrid cols={cols} />
        ) : photoReviews.length === 0 ? (
          <div className="text-center py-20 text-xs text-gray-400">
            No review photos published yet.
          </div>
        ) : (
          <div
            className="grid gap-2.5 sm:gap-4 items-start"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {columnBuckets.map((bucket, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-2.5 sm:gap-4">
                {bucket.map(({ review, originalIndex }) => (
                  <ReviewPhotoCard
                    key={review.id || originalIndex}
                    review={review}
                    index={originalIndex}
                    onSelect={handleOpenPhoto}
                  />
                ))}
              </div>
            ))}
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

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-mono rounded-full">
            {(activePhotoIndex ?? 0) + 1} / {photoReviews.length}
          </div>

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
            {!lightboxLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
              </div>
            )}
            <img
              src={formatImageUrl(activePhoto.screenshotImage || (activePhoto as any).image, 'original')}
              alt="Customer Review Fullscreen"
              onLoad={() => setLightboxLoaded(true)}
              className={`max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
                lightboxLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
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
