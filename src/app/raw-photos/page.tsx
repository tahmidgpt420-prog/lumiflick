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
  Camera,
  Loader2,
} from 'lucide-react';
import { RawPhoto } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';

const PAGE_SIZE = 16;

// Individual Photo Card with Skeleton Shimmer Animation
function RawPhotoCard({
  photo,
  index,
  onSelect,
}: {
  photo: RawPhoto;
  index: number;
  onSelect: (index: number) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use 800px width for Google Drive images in the raw photo section
  const imgUrl = formatImageUrl(photo.image, 800);

  if (!imgUrl) return null;

  return (
    <div
      onClick={() => onSelect(index)}
      className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group cursor-zoom-in relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative w-full min-h-[180px] bg-gray-100 flex items-center justify-center overflow-hidden">
        
        {/* Skeleton Shimmer Loading Placeholder */}
        {!imageLoaded && !hasError && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 card-skeleton-shimmer transition-opacity duration-300 pointer-events-none min-h-[220px]"
          />
        )}

        {/* Image in its TRUE Original Aspect Ratio */}
        <img
          src={hasError ? '/logo.png' : imgUrl}
          alt="LUMIFLICK Raw Glass Poster Photo"
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
          <div className="px-3.5 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <ZoomIn className="w-3.5 h-3.5" /> View Photo
          </div>
        </div>

      </div>
    </div>
  );
}

// Initial Masonry Grid Skeleton Loader
function RawPhotosSkeletonGrid() {
  const dummyHeights = [
    'h-72', 'h-96', 'h-64', 'h-80',
    'h-84', 'h-60', 'h-76', 'h-90'
  ];

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {dummyHeights.map((h, i) => (
        <div
          key={i}
          className={`break-inside-avoid bg-white rounded-2xl border border-gray-200 overflow-hidden relative ${h} card-skeleton-shimmer`}
        />
      ))}
    </div>
  );
}

export default function RawPhotosPage() {
  const [photos, setPhotos] = useState<RawPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch('/api/admin/raw-photos');
        const data = await res.json();
        if (data.success && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMorePhotos = visibleCount < photos.length;

  const activePhoto =
    activePhotoIndex !== null && photos[activePhotoIndex]
      ? photos[activePhotoIndex]
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
      setActivePhotoIndex(photos.length - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxLoaded(false);
    if (activePhotoIndex !== null && activePhotoIndex < photos.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    } else if (activePhotoIndex === photos.length - 1) {
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
          prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : null
        );
      }
      if (e.key === 'ArrowRight') {
        setLightboxLoaded(false);
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            Unfiltered Gallery Showcase
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight uppercase font-serif">
            Raw Product Photos
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Real, authentic product photos, actual glass finishes, and genuine room setups shared directly from our workshop and clients.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
            >
              Explore All Glass Posters <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Original Aspect Ratio Masonry Gallery with Skeleton Shimmer */}
      <section className="py-8 sm:py-12 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {loading ? (
          <RawPhotosSkeletonGrid />
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300 p-8 max-w-md mx-auto space-y-2">
            <Camera className="w-8 h-8 mx-auto text-gray-300" />
            <p className="font-semibold text-gray-600">No raw photos published yet.</p>
            <p className="text-gray-400">Photos added via admin will appear here in their original ratio.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {visiblePhotos.map((photo, index) => (
              <RawPhotoCard
                key={photo.id || index}
                photo={photo}
                index={index}
                onSelect={handleOpenPhoto}
              />
            ))}
          </div>
        )}

        {hasMorePhotos && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-8 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
            >
              Load More Photos
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
          {/* Close button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close photo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-mono rounded-full">
            {(activePhotoIndex ?? 0) + 1} / {photos.length}
          </div>

          {/* Prev Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Active Image in Original Aspect Ratio (High Res 1600px for lightbox) */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!lightboxLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
              </div>
            )}
            <img
              src={formatImageUrl(activePhoto.image, 'original')}
              alt="Raw Product Photo Full View"
              onLoad={() => setLightboxLoaded(true)}
              className={`max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
                lightboxLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </div>
        </div>
      )}

    </div>
  );
}
