import React from 'react';
import ShopContent from './ShopContent';
import { getProductsPage } from '@/lib/catalogServer';

export const dynamic = 'force-dynamic';

// First page of products is rendered on the server, so the grid is in the
// HTML instead of behind a client-side API call.
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initialPage = await getProductsPage({ category: category || 'all', limit: 16 }).catch(() => undefined);
  return <ShopContent initialPage={initialPage} />;
}
