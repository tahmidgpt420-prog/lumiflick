import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Shield, Sparkles, Heart } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="py-8 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Our Craft & Story
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          About GenuineTask
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Pioneering premium wall art decor and handcrafted frames in Bangladesh since inception.
        </p>
      </div>

      {/* Main Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 p-6 sm:p-10 rounded-3xl border border-gray-200">
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Elevating Living Spaces Across Bangladesh
          </h2>
          <p>
            At <strong>GenuineTask</strong>, we believe every bare wall holds infinite storytelling potential. Our vision is to bring luxury, sophistication, and personality to residential homes, luxury apartments, and modern executive offices.
          </p>
          <p>
            We use specialized 12-color pigment archival printing, non-glare UV matte textures, and lightweight engineered Korean synthetic wood framing to deliver pieces that stay vivid for over a decade.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800"
            >
              Explore Our Collection
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
          <Image
            src="https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg"
            alt="GenuineTask Craftsmanship"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Museum Grade Prints</h3>
          <p className="text-xs text-gray-500">
            Anti-reflective textured matte finishes with zero reflection and deep color saturation.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Zero Glass Risk</h3>
          <p className="text-xs text-gray-500">
            Engineered unbreakable composite laminate surface—completely safe around kids.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Handcrafted Framing</h3>
          <p className="text-xs text-gray-500">
            Each frame is hand-assembled with precision corner joints and durable rear backings.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">50,000+ Happy Walls</h3>
          <p className="text-xs text-gray-500">
            Trusted by interior decorators, homeowners, and car enthusiasts nationwide.
          </p>
        </div>
      </div>
    </div>
  );
}
