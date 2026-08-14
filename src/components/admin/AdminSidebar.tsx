'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Star,
  Settings,
  ExternalLink,
  LogOut,
  PlusCircle,
  X,
  Sliders,
  Camera,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/jw8yenjnkanhr823', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/jw8yenjnkanhr823/products', icon: Package },
    { label: 'Orders', href: '/jw8yenjnkanhr823/orders', icon: ShoppingBag },
    { label: 'Banners', href: '/jw8yenjnkanhr823/banners', icon: Sliders },
    { label: 'Reviews & Proofs', href: '/jw8yenjnkanhr823/reviews', icon: Star },
    { label: 'Raw Photos', href: '/jw8yenjnkanhr823/raw-photos', icon: Camera },
    { label: 'Categories', href: '/jw8yenjnkanhr823/categories', icon: Layers },
    { label: 'Store Settings', href: '/jw8yenjnkanhr823/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } finally {
      router.push('/jw8yenjnkanhr823/login');
      router.refresh();
    }
  };

  const handleItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-gray-950 text-gray-300 flex flex-col shrink-0 min-h-screen border-r border-gray-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <Link href="/jw8yenjnkanhr823" onClick={handleItemClick} className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-700">
              <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xs tracking-wider uppercase font-serif">LUMIFLICK</h1>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action */}
        <div className="px-4 pt-4">
          <Link
            href="/jw8yenjnkanhr823/products/new"
            onClick={handleItemClick}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Shortcuts & Logout */}
        <div className="p-4 border-t border-gray-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Live Store
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
