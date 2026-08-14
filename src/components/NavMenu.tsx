'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Home,
  Sparkles,
  Star,
  Flame,
  Camera,
  X,
  CornerDownRight,
} from 'lucide-react';
import { Category } from '@/types';
import { getMainCategories, getSubcategories } from '@/utils/categoryHelpers';

interface NavMenuProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface ActiveDropdownState {
  slug: string;
  name: string;
  subs: Category[];
  left: number;
}

export default function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const pathname = usePathname();
  const { categories } = useProducts();
  const navRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLUListElement>(null);
  const closeTimerRef = useRef<any>(null);

  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownState | null>(null);
  const [openMobileAccordions, setOpenMobileAccordions] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseEnterCategory = (
    e: React.MouseEvent<HTMLLIElement>,
    cat: Category,
    subs: Category[]
  ) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (navRef.current) {
      const liRect = e.currentTarget.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      setActiveDropdown({
        slug: cat.slug,
        name: cat.name,
        subs,
        left: liRect.left - navRect.left,
      });
    }
  };

  const handleMouseLeaveCategory = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileAccordion = (slug: string) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Main Categories (those with NO parent, excluding pinned 'best-selling')
  const mainCategories = getMainCategories(categories);

  return (
    <>
      {/* Desktop Horizontal Navigation */}
      <nav ref={navRef} className="hidden lg:block bg-white/80 backdrop-blur-md border-t border-gray-100/80 shadow-sm relative supports-[backdrop-filter]:bg-white/75">
        <div className="max-w-7xl mx-auto px-4 relative flex items-center group/nav">
          {/* Left Scroll Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-1 z-20 p-1.5 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 transition-all opacity-0 group-hover/nav:opacity-100 focus:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scroll Track (Single-Line Horizontal Scrolling) */}
          <ul
            ref={scrollRef}
            className="flex items-center justify-start gap-1.5 overflow-x-auto py-2 text-[13px] font-medium tracking-tight text-gray-700 no-scrollbar whitespace-nowrap w-full scroll-smooth"
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

            {/* PINNED OPTION 3: Raw Photos */}
            <li className="shrink-0">
              <Link
                href="/raw-photos"
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                  pathname === '/raw-photos'
                    ? 'font-bold text-black bg-gray-100'
                    : 'font-semibold text-gray-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-gray-700" />
                <span>Raw Photos</span>
              </Link>
            </li>

            {/* PINNED OPTION 4: All Products */}
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
              const subs = getSubcategories(cat.slug, categories);
              const hasSubs = subs.length > 0;
              const isCurrentDropdown = activeDropdown?.slug === cat.slug;

              if (hasSubs) {
                return (
                  <li
                    key={cat.slug}
                    className="shrink-0"
                    onMouseEnter={(e) => handleMouseEnterCategory(e, cat, subs)}
                    onMouseLeave={handleMouseLeaveCategory}
                  >
                    <Link
                      href={href}
                      className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 hover:text-black hover:bg-gray-100 ${
                        isActive || isCurrentDropdown
                          ? 'font-bold text-black bg-gray-100'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                          isCurrentDropdown ? 'rotate-180 text-black' : ''
                        }`}
                      />
                    </Link>
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

          {/* Right Scroll Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-1 z-20 p-1.5 rounded-full bg-white/95 shadow-md border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 transition-all opacity-0 group-hover/nav:opacity-100 focus:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Desktop Floating Dropdown (Renders outside scroll container so it never gets clipped!) */}
        {activeDropdown && (
          <div
            style={{ left: Math.max(16, activeDropdown.left) }}
            className="absolute top-full z-50 pt-1 min-w-[220px]"
            onMouseEnter={() => {
              if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            }}
            onMouseLeave={() => {
              setActiveDropdown(null);
            }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-2 space-y-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150 supports-[backdrop-filter]:bg-white/85">
              <Link
                href={`/product-category/${activeDropdown.slug}`}
                onClick={() => setActiveDropdown(null)}
                className="block px-3 py-1.5 text-xs font-bold text-gray-900 rounded-xl hover:bg-black/5 transition-colors"
              >
                All {activeDropdown.name}
              </Link>
              <div className="h-px bg-gray-200/60 my-1" />
              {activeDropdown.subs.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/product-category/${sub.slug}`}
                  onClick={() => setActiveDropdown(null)}
                  className={`block px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                    pathname === `/product-category/${sub.slug}`
                      ? 'text-black font-bold bg-black/10'
                      : 'text-gray-700 hover:text-black hover:bg-black/5'
                  }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Off-Canvas Slide Drawer */}
      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${
            mobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
              mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel (Frosted Glass) */}
          <div
            className={`fixed inset-y-0 left-0 w-4/5 max-w-sm h-full bg-white/85 backdrop-blur-2xl border-r border-white/50 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-out will-change-transform supports-[backdrop-filter]:bg-white/80 ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200/60 flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                  <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
                </div>
                <span className="font-bold tracking-wider text-black text-sm uppercase font-serif">LUMIFLICK</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-800 font-medium transition-colors"
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-900 font-semibold transition-colors"
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-900 font-semibold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gray-700" />
                  <span>Reviews &amp; Customer Proofs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* PINNED OPTION 3: Raw Photos (Mobile) */}
              <Link
                href="/raw-photos"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-900 font-semibold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-gray-700" />
                  <span>Raw Product Photos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-800 font-medium transition-colors"
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
                const subs = getSubcategories(cat.slug, categories);
                const isExpanded = openMobileAccordions[cat.slug];

                if (subs.length > 0) {
                  return (
                    <div key={cat.slug} className="rounded-xl overflow-hidden bg-black/[0.03] backdrop-blur-sm border border-black/5">
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
                          className="p-1 rounded-lg hover:bg-black/5 text-gray-500"
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
                        <div className="pl-4 pr-3 pb-2 pt-1 space-y-1 bg-white/60 backdrop-blur-md border-t border-black/5">
                          <Link
                            href={`/product-category/${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block py-1.5 px-2 text-xs font-bold text-gray-900 rounded hover:bg-black/5"
                          >
                            All {cat.name}
                          </Link>
                          {subs.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/product-category/${sub.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-1.5 py-1.5 px-2 text-xs text-gray-600 hover:text-black rounded hover:bg-black/5 font-medium"
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
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 text-gray-700 font-normal text-sm transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200/60 mt-4 space-y-1">
                <Link
                  href="/about-us"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black rounded-xl hover:bg-black/5 transition-colors"
                >
                  About LUMIFLICK
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black rounded-xl hover:bg-black/5 transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  href="/shipping-policy"
                  onClick={() => setMobileOpen(false)}
                  className="block p-3 text-sm text-gray-600 hover:text-black rounded-xl hover:bg-black/5 transition-colors"
                >
                  Delivery &amp; Shipping
                </Link>
              </div>
            </div>

            {/* Bottom Support info */}
            <div className="p-4 bg-white/40 backdrop-blur-md border-t border-gray-200/60 text-xs text-gray-500 shrink-0">
              <p className="font-medium text-gray-700">Need help with an order?</p>
              <p className="mt-0.5">
                Hotline:{' '}
                <a href="tel:+8801400307299" className="hover:text-black font-semibold text-gray-800">
                  +8801400307299
                </a>
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
