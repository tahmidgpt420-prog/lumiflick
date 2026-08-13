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

// Actual access control lives in middleware.ts, which runs on every request
// before this component ever mounts — a request without a valid session
// cookie never reaches this code. This effect is UX only: it polls the
// session endpoint so an admin sitting on a page past the 1-hour timeout
// gets redirected without needing to trigger a fresh server request first.
const SESSION_POLL_MS = 30 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === '/jw8yenjnkanhr823/login');

  useEffect(() => {
    if (pathname === '/jw8yenjnkanhr823/login') {
      setReady(true);
      return;
    }

    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!data.authenticated) {
          router.push('/jw8yenjnkanhr823/login?expired=1');
          return;
        }
        setReady(true);
      } catch {
        // Network hiccup — don't boot the admin out; middleware still guards actual requests.
        if (!cancelled) setReady(true);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, SESSION_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname, router]);

  if (pathname === '/jw8yenjnkanhr823/login') {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
