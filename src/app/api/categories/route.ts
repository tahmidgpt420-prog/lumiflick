import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { categoryFromDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

// Public, unauthenticated. Categories are small (~20 rows) and needed on
// almost every page (nav, breadcrumbs, homepage sections, category-tree
// filtering for /api/products) — so unlike products, there's no lite/full
// split here, this is always the whole table.
export async function GET() {
  try {
    const rows = await query('SELECT * FROM categories ORDER BY display_order IS NULL, display_order, name');
    return NextResponse.json(
      { success: true, categories: rows.map(categoryFromDb) },
      { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } }
    );
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 });
  }
}
