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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
          About LUMIFLICK
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Pioneering premium wall art decor and handcrafted frames in Bangladesh.
        </p>
      </div>

      {/* Main Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 p-6 sm:p-10 rounded-3xl border border-gray-200">
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Elevating Living Spaces Across Bangladesh
          </h2>
          <p>
            At <strong>LUMIFLICK</strong>, we believe every bare wall holds infinite storytelling potential. Our vision is to bring luxury, sophistication, and personality to residential homes, luxury apartments, and modern executive offices.
          </p>
          <p>
            We use specialized 12-color pigment archival printing, non-glare UV matte textures, and lightweight engineered Korean synthetic wood framing to deliver pieces that stay vivid for over a decade.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Explore Our Collection
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
          <Image
            src="/logo.png"
            alt="LUMIFLICK Craftsmanship"
            fill
            className="object-contain p-4 bg-white"
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
            Anti-glare UV textured matte lamination without brittle glass hazard.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Korean Synthetic Framing</h3>
          <p className="text-xs text-gray-500">
            Engineered polymer composite that is ultra-lightweight, termite-proof & warp-free.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Transit Damage Warranty</h3>
          <p className="text-xs text-gray-500">
            Instant free replacement if courier mishandling causes any damage.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">100% Cash On Delivery</h3>
          <p className="text-xs text-gray-500">
            Check your package upon delivery and pay only when satisfied.
          </p>
        </div>
      </div>
    </div>
  );
}
