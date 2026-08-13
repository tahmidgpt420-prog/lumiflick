'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminProvider, useAdmin } from '@/context/AdminContext';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAdmin();
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 font-sans relative overflow-x-hidden">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 Hour (3,600,000 ms)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/jw8yenjnkanhr823/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuthAndActivity = () => {
      const auth = localStorage.getItem('gt_admin_auth');
      const lastActiveStr = localStorage.getItem('gt_admin_last_active');
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
      const now = Date.now();

      if (auth !== 'true') {
        setIsAuthenticated(false);
        router.push('/jw8yenjnkanhr823/login');
        return false;
      }

      // Check if 1 hour has elapsed since last recorded activity
      if (!lastActive || now - lastActive > INACTIVITY_TIMEOUT_MS) {
        localStorage.removeItem('gt_admin_auth');
        localStorage.removeItem('gt_admin_last_active');
        setIsAuthenticated(false);
        router.push('/jw8yenjnkanhr823/login?expired=1');
        return false;
      }

      setIsAuthenticated(true);
      return true;
    };

    const isAuthed = checkAuthAndActivity();
    if (!isAuthed) return;

    // Track user activity to refresh 1-hour timer
    let lastUpdate = Date.now();
    const updateActivity = () => {
      const now = Date.now();
      // Throttle localStorage updates to once every 15 seconds
      if (now - lastUpdate > 15000) {
        lastUpdate = now;
        localStorage.setItem('gt_admin_last_active', now.toString());
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    // Periodic check every 30 seconds for inactivity expiration
    const interval = setInterval(() => {
      checkAuthAndActivity();
    }, 30000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [pathname, router]);

  if (pathname === '/jw8yenjnkanhr823/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
