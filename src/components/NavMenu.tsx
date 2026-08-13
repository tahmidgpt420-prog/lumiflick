'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Sparkles,
  Star,
  Flame,
  X,
  CornerDownRight,
} from 'lucide-react';

interface NavMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const pathname = usePathname();
  const { categories } = useProducts();
  const scrollRef = useRef<HTMLUListElement>(null);
  const [openMobileAccordions, setOpenMobileAccordions] = useState<Record<string, boolean>>({});

  const toggleMobileAccordion = (slug: string) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Main Categories (those with NO parent, excluding pinned 'best-selling')
  const mainCategories = categories.filter(
    (c) =>
      !c.parentSlug &&
      !c.parentId &&
      c.slug !== 'best-selling' &&
      c.name.toLowerCase() !== 'best selling'
  );

  // Helper to find sub-categories for a parent category
  const getSubcategories = (parentSlug: string) =>
    categories.filter((c) => c.parentSlug === parentSlug || c.parentId === parentSlug);

  return (
    <>
      {/* Desktop Horizontal Navigation */}
      <nav className="hidden lg:block bg-white border-t border-gray-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center">
          
          {/* Nav Items (Flex wrap within max container) */}
          <ul
            ref={scrollRef}
            className="flex flex-wrap items-center justify-start gap-1.5 py-2 text-[13px] font-medium tracking-tight text-gray-700 w-full"
          >
            {/* PINNED OPTION 1: Best Selling */}
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

            {/* PINNED OPTION 2: Reviews */}
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

            {/* Dynamic Main Categories with Sub-Category Dropdowns */}
            {mainCategories.map((cat) => {
              const href = `/product-category/${cat.slug}`;
              const isActive = pathname === href;
              const subs = getSubcategories(cat.slug);

              if (subs.length > 0) {
                return (
                  <li key={cat.slug} className="shrink-0 relative group">
                    <Link
                      href={href}
                      className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                        isActive ? 'font-bold text-black bg-gray-100' : ''
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-black group-hover:rotate-180 transition-transform duration-200" />
                    </Link>

                    {/* Sub-categories Dropdown Menu */}
                    <div className="absolute top-full left-0 pt-1.5 hidden group-hover:block z-50 min-w-[210px] animate-in fade-in-50 duration-150">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-0.5">
                        <Link
                          href={href}
                          className="block px-3 py-1.5 text-xs font-bold text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          All {cat.name}
                        </Link>
                        <div className="h-px bg-gray-100 my-1" />
                        {subs.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/product-category/${sub.slug}`}
                            className={`block px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                              pathname === `/product-category/${sub.slug}`
                                ? 'text-black font-bold bg-gray-100'
                                : 'text-gray-600 hover:text-black hover:bg-gray-50'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              }

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
                  <span>Reviews &amp; Customer Proofs</span>
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
                  Collections &amp; Categories
                </p>
              </div>

              {mainCategories.map((cat) => {
                const subs = getSubcategories(cat.slug);
                const isExpanded = openMobileAccordions[cat.slug];

                if (subs.length > 0) {
                  return (
                    <div key={cat.slug} className="rounded-xl overflow-hidden bg-gray-50/70 border border-gray-100">
                      <div className="flex items-center justify-between p-3">
                        <Link
                          href={`/product-category/${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex-1 text-gray-800 font-semibold text-sm hover:text-black"
                        >
                          {cat.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleMobileAccordion(cat.slug)}
                          className="p-1 rounded-lg hover:bg-gray-200 text-gray-500"
                          aria-label={`Toggle ${cat.name} sub-categories`}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-black' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-4 pr-3 pb-2 pt-1 space-y-1 bg-white border-t border-gray-100">
                          <Link
                            href={`/product-category/${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block py-1.5 px-2 text-xs font-bold text-gray-900 rounded hover:bg-gray-50"
                          >
                            All {cat.name}
                          </Link>
                          {subs.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/product-category/${sub.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-1.5 py-1.5 px-2 text-xs text-gray-600 hover:text-black rounded hover:bg-gray-50 font-medium"
                            >
                              <CornerDownRight className="w-3 h-3 text-gray-400" />
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={cat.slug}
                    href={`/product-category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-gray-700 font-normal text-sm"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                );
              })}

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
                  Delivery &amp; Shipping
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
