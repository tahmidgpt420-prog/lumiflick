import React from 'react';
import CategoryContent from './CategoryContent';
import { getProductsPage } from '@/lib/catalogServer';

export const dynamic = 'force-dynamic';

// First page of products is rendered on the server, so the grid is in the
// HTML instead of behind a client-side API call.
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = decodeURIComponent(slug).toLowerCase().trim();
  const initialPage = await getProductsPage({ category, limit: 16 }).catch(() => undefined);
  return <CategoryContent initialPage={initialPage} />;
}
