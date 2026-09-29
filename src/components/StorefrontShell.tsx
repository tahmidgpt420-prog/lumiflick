'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PromoBar from '@/components/PromoBar';
import Header from '@/components/Header';
import SearchModal from '@/components/SearchModal';
import CartDrawer from '@/components/CartDrawer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';

export default function StorefrontShell({
  children,
  promoBarItems,
}: {
  children: React.ReactNode;
  promoBarItems?: { icon: string; text: string }[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/jw8yenjnkanhr823');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoBar initialItems={promoBarItems} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchModal />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
