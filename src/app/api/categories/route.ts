import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categoryFromDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

// Public, unauthenticated. Categories are small (~20 rows) and needed on
// almost every page (nav, breadcrumbs, homepage sections, category-tree
// filtering for /api/products) — so unlike products, there's no lite/full
// split here, this is always the whole table.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('display_order')
      .order('name');
    if (error) throw error;
    return NextResponse.json(
      { success: true, categories: (data || []).map(categoryFromDb) },
      { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } }
    );
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 });
  }
}
