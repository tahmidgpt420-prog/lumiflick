'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories as initialCategories } from '@/data/categories';
import {
  ChevronRight,
  Home,
  Sparkles,
  Star,
  Flame,
  X,
  MessageSquare,
} from 'lucide-react';
import { Category } from '@/types';

interface NavMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const pathname = usePathname();
  const [catList, setCatList] = useState<Category[]>(initialCategories);

  useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCatList(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadDynamicCategories();
  }, []);

  // Filter out 'best-selling' from the remaining categories loop since it is pinned at position 1
  const remainingCategories = catList.filter(
    (c) => c.slug !== 'best-selling' && c.name.toLowerCase() !== 'best selling'
  );

  return (
    <>
      {/* Desktop Horizontal Navigation */}
      <nav className="hidden lg:block bg-white border-t border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-1.5 overflow-x-auto py-2 text-[13px] font-medium tracking-tight text-gray-700 no-scrollbar whitespace-nowrap">
            
            {/* PINNED OPTION 1: Best Selling */}
            <li>
              <Link
                href="/product-category/best-selling"
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 hover:text-black hover:bg-amber-50 ${
                  pathname === '/product-category/best-selling'
                    ? 'font-bold text-black bg-amber-100 border border-amber-300 shadow-sm'
                    : 'font-semibold text-gray-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Best Selling
              </Link>
            </li>

            {/* PINNED OPTION 2: Customer Reviews */}
            <li>
              <Link
                href="/reviews"
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 hover:text-black hover:bg-yellow-50 ${
                  pathname === '/reviews'
                    ? 'font-bold text-black bg-yellow-100 border border-yellow-300 shadow-sm'
                    : 'font-semibold text-gray-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Reviews
                <span className="text-[10px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded-full">
                  4.9★
                </span>
              </Link>
            </li>

            {/* All Collections Link */}
            <li>
              <Link
                href="/shop"
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                  pathname === '/shop' ? 'font-bold text-black bg-gray-100' : ''
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                All Products
              </Link>
            </li>

            {/* Remaining Dynamic Categories */}
            {remainingCategories.map((cat) => {
              const href = `/product-category/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <li key={cat.slug}>
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-sm">
                  GT
                </div>
                <span className="font-bold tracking-wider text-black text-sm uppercase">GenuineTask</span>
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
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-black font-bold border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Best Selling Frames</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded-full">
                  HOT
                </span>
              </Link>

              {/* PINNED OPTION 2: Reviews (Mobile) */}
              <Link
                href="/reviews"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-black font-bold border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Customer Reviews & Proofs</span>
                </div>
                <span className="text-[10px] bg-black text-white font-bold px-2 py-0.5 rounded-full">
                  4.9★
                </span>
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-800 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>All Products</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                  Categories
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
                  About GenuineTask
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
