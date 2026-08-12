'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Menu } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

interface AdminHeaderProps {
  title: string;
  description?: string;
  onOpenSidebar?: () => void;
}

export default function AdminHeader({ title, description, onOpenSidebar }: AdminHeaderProps) {
  const adminContext = useAdmin();

  const handleToggle = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    } else if (adminContext?.setSidebarOpen) {
      adminContext.setSidebarOpen(true);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 md:hidden flex items-center justify-center transition-colors"
          aria-label="Open Admin Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {description && <p className="text-[11px] sm:text-xs text-gray-500 hidden sm:block mt-0.5">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Visit Store
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-sm">
            A
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-900 leading-tight">Admin Manager</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
