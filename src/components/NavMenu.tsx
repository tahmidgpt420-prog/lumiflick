'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import {
  ChevronRight,
  Home,
  Sparkles,
  Star,
  Flame,
  X,
} from 'lucide-react';

interface NavMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const pathname = usePathname();
  const { categories } = useProducts();
  const scrollRef = useRef<HTMLUListElement>(null);

  // Filter out 'best-selling' from the remaining categories loop since it is pinned at position 1
  const remainingCategories = categories.filter(
    (c) => c.slug !== 'best-selling' && c.name.toLowerCase() !== 'best selling'
  );

  return (
    <>
      {/* Desktop Horizontal Navigation */}
      <nav className="hidden lg:block bg-white border-t border-gray-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center">
          
          {/* Scroll Track */}
          <ul
            ref={scrollRef}
            className="flex items-center justify-start gap-1.5 overflow-x-auto py-2 text-[13px] font-medium tracking-tight text-gray-700 no-scrollbar whitespace-nowrap w-full scroll-smooth"
          >
            {/* PINNED OPTION 1: Best Selling (Clean neutral styling) */}
            <li className="shrink-0">
              <Link
                href="/product-category/best-selling"
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                  pathname === '/product-category/best-selling'
                    ? 'font-bold text-black bg-gray-100'
                    : 'font-semibold text-gray-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-gray-700" />
                <span>Best Selling</span>
              </Link>
            </li>

            {/* PINNED OPTION 2: Customer Reviews (Clean neutral styling) */}
            <li className="shrink-0">
              <Link
                href="/reviews"
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                  pathname === '/reviews'
                    ? 'font-bold text-black bg-gray-100'
                    : 'font-semibold text-gray-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-gray-700" />
                <span>Reviews</span>
              </Link>
            </li>

            {/* PINNED OPTION 3: All Products */}
            <li className="shrink-0">
              <Link
                href="/shop"
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                  pathname === '/shop' ? 'font-bold text-black bg-gray-100' : ''
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                <span>All Products</span>
              </Link>
            </li>

            {/* Separator */}
            <li className="h-3.5 w-px bg-gray-200 shrink-0 mx-1" aria-hidden="true" />

            {/* Remaining Dynamic Categories */}
            {remainingCategories.map((cat) => {
              const href = `/product-category/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <li key={cat.slug} className="shrink-0">
                  <Link
                    href={href}
                    className={`px-3 py-1.5 rounded-full transition-all block hover:text-black hover:bg-gray-100 ${
                      isActive ? 'font-bold text-black bg-gray-100' : ''
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>

        </div>
      </nav>

      {/* Mobile Off-Canvas Slide Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-10 flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
                  <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
                </div>
                <span className="font-bold tracking-wider text-black text-sm uppercase font-serif">LUMIFLICK</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-700"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-800 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* PINNED OPTION 1: Best Selling (Mobile) */}
              <Link
                href="/product-category/best-selling"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-900 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-gray-700" />
                  <span>Best Selling</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* PINNED OPTION 2: Reviews (Mobile) */}
              <Link
                href="/reviews"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-900 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gray-700" />
                  <span>Reviews & Customer Proofs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-800 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                  <span>All Products</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                  All Collections
                </p>
              </div>

              {remainingCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/product-category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-700 font-normal text-sm"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-100 mt-4 space-y-1">
                <Link
                  href="/about-us"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black"
                >
                  About LUMIFLICK
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black"
                >
                  Contact Us
                </Link>
                <Link
                  href="/shipping-policy"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black"
                >
                  Delivery & Shipping
                </Link>
              </div>
            </div>

            {/* Bottom Support info */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              <p className="font-medium text-gray-700">Need help with an order?</p>
              <p className="mt-0.5">Hotline: +880 1886 670 211</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
