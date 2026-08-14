import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-xs border-t border-gray-800">
      
      {/* Top Value Badges */}
      <div className="border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Nationwide Delivery</h4>
                <p className="text-gray-400 mt-0.5 text-[11px]">Inside & Outside Dhaka Delivery</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Premium Quality</h4>
                <p className="text-gray-400 mt-0.5 text-[11px]">Museum Grade UV Matte Art Prints</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-amber-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Cash On Delivery</h4>
                <p className="text-gray-400 mt-0.5 text-[11px]">Pay upon physical parcel receipt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-700">
                <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
              </div>
              <span className="text-xl font-bold text-white tracking-wider uppercase font-serif">
                LUMIFLICK
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Turn your wall into a statement with LumiFlick’s premium frameless glass posters. Crafted from 2.5mm real glass with vivid, fade-proof colors, a mirror-like HD finish, and a sleek modern look, our posters are waterproof, scratch-resistant, and built to last. No paper, no PVC, no bulky frames—just premium glass art designed to elevate your space.
            </p>
            <div className="space-y-2 pt-2 text-gray-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Phone : +8801400307299</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email : info@lumiflick.shop</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Location : PTI Mor, Khulna, Bangladesh - 9100</span>
              </div>
            </div>
          </div>

          {/* Column 2: Featured Collection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Featured Collection
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/product-category/religious-luxury-frame" className="hover:text-white transition-colors">
                  Religious Luxury Frame
                </Link>
              </li>
              <li>
                <Link href="/product-category/cars-frame-collection" className="hover:text-white transition-colors">
                  Car’s Frame Collection
                </Link>
              </li>
              <li>
                <Link href="/product-category/5-frames-set" className="hover:text-white transition-colors">
                  5 Frames Set
                </Link>
              </li>
              <li>
                <Link href="/product-category/motivational-wall-frame" className="hover:text-white transition-colors">
                  Motivational Wall Frame
                </Link>
              </li>
              <li>
                <Link href="/product-category/nature-inspired-frame" className="hover:text-white transition-colors">
                  Nature Inspired Frame
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-amber-400 hover:underline">
                  Shop All Collection &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Informative Links & Payment methods */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Customer Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/return-refund-policy" className="hover:text-white transition-colors">
                  Damaged Item Or Incorrect Item Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>

            <div className="pt-4">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-pink-400 font-bold">
                  bKash
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-orange-400 font-bold">
                  Nagad
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-blue-400 font-bold">
                  Bank
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800 py-6 text-center text-gray-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} LUMIFLICK. All Rights Reserved.</p>
          <p className="text-gray-600">
            Handcrafted with excellence in Dhaka, Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
}
