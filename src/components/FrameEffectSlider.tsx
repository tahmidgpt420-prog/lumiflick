'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, Sparkles, ArrowRight } from 'lucide-react';

export default function FrameEffectSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left: Interactive Splitter Slider */}
          <div className="lg:col-span-7">
            <div
              ref={containerRef}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl select-none cursor-ew-resize border-4 border-white bg-gray-200"
              onMouseDown={(e) => {
                setIsDragging(true);
                handleMove(e.clientX);
              }}
              onTouchStart={(e) => {
                setIsDragging(true);
                handleMove(e.touches[0].clientX);
              }}
            >
              {/* "After" Image (Full background - Styled room with frames) */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg"
                  alt="Room with GenuineTask Luxury Frames"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <span className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  ✨ With Frames
                </span>
              </div>

              {/* "Before" Image (Clipped overlay - Bare room wall) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <Image
                  src="https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.45.04-AM.webp"
                  alt="Empty Bare Wall"
                  fill
                  className="object-cover grayscale brightness-90 contrast-90"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  Plain Wall
                </span>
              </div>

              {/* Draggable Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Center Handle Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-800 border-2 border-gray-100 hover:scale-110 active:scale-95 transition-transform">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-2.5 flex items-center justify-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Drag slider left or right to see the transformation
            </p>
          </div>

          {/* Right: Content & CTA */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Room Transformation
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              The <span className="italic font-serif text-amber-700">Frame</span> Effect 🦋
            </h2>

            <div className="w-16 h-1 bg-amber-500 rounded-full mx-auto lg:mx-0"></div>

            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Why frames are important?
            </h3>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Your wall deserves more than blank space — give it personality, warmth, and emotion. Our handcrafted gallery frames turn ordinary rooms into luxurious conversation starters.
            </p>

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 hover:gap-3 transition-all shadow-lg shadow-black/10"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
