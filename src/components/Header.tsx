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
            <Link href="/" className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                {/* Logo Image or Authentic Stylized Logo */}
                <div className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-black text-white shadow-md">
                  <span className="font-serif font-black text-2xl tracking-tighter">GT</span>
                </div>
                <span className="text-sm font-bold tracking-widest text-black uppercase mt-1">GenuineTask</span>
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
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-800 group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <NavMenu mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
    </header>
  );
}
