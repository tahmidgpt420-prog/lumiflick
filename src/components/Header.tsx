'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import NavMenu from './NavMenu';

export default function Header() {
  const { totalItems, openCartDrawer, setIsSearchOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Mobile menu button & Search Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-800 flex items-center gap-2 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs text-gray-400 font-medium">Search...</span>
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-sm shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="LUMIFLICK Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black tracking-wider text-black uppercase font-serif leading-none">
                  LUMIFLICK
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-gray-500 font-semibold uppercase mt-0.5">
                  Wall Art & Frames
                </span>
              </div>
            </Link>
          </div>

          {/* Right: User Account & Cart Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/customer-login"
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
              aria-label="Customer Login"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={openCartDrawer}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-subtle">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-bar */}
      <NavMenu mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
    </header>
  );
}
