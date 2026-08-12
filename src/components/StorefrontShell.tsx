'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PromoBar from '@/components/PromoBar';
import Header from '@/components/Header';
import SearchModal from '@/components/SearchModal';
import CartDrawer from '@/components/CartDrawer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchModal />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
