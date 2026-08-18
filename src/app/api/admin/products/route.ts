import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, productToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  // created_at, not updated_at — the latter bumps on every edit, so
  // "newest first" used to reorder any time an old product got touched.
  newest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  'name-asc': { column: 'title', ascending: true },
  'name-desc': { column: 'title', ascending: false },
  category: { column: 'category', ascending: true },
};
const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  if (mode === 'page') {
    try {
      const sortKey = searchParams.get('sort') || 'newest';
      const sort = SORT_MAP[sortKey] || SORT_MAP.newest;
      const category = searchParams.get('category') || 'all';
      const search = searchParams.get('search')?.trim() || '';
      const page = Number(searchParams.get('page') || '0');
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

      if (category !== 'all') {
        // Fetch sub-categories if this is a parent category
        const { data: subCats } = await supabaseAdmin
          .from('categories')
          .select('slug, name')
          .ilike('parent_slug', category);

        const matchingSlugs = Array.from(
          new Set([category, ...(subCats || []).map((c) => c.slug)].filter(Boolean))
        );
        const matchingNames = Array.from(
          new Set((subCats || []).map((c) => c.name).filter(Boolean))
        );

        const orParts: string[] = [];
        for (const s of matchingSlugs) {
          orParts.push(`category_slug.ilike."${s}"`);
          orParts.push(`category.ilike."${s}"`);
        }
        for (const n of matchingNames) {
          orParts.push(`category.ilike."${n}"`);
        }

        if (orParts.length > 0) {
          query = query.or(orParts.join(','));
        }
      }

      if (search) query = query.or(`title.ilike."%${search}%",category.ilike."%${search}%"`);
      query = query.order(sort.column, { ascending: sort.ascending }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const products = (data || []).map(productFromDb);
      const hasMore = count !== null && from + products.length < count;

      return NextResponse.json({ success: true, products, totalCount: count, hasMore, nextPage: page + 1 });
    } catch (error) {
      console.error('GET /api/admin/products?mode=page error:', error);
      return NextResponse.json({ success: false, error: 'Failed to load products page' }, { status: 500 });
    }
  }

  // Full list — cheap on Postgres even at hundreds of rows, unlike Firestore's
  // per-document billing. Used by the dashboard's stat cards.
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, products: (data || []).map(productFromDb) });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Product title is required' }, { status: 400 });
    }

    const slug =
      body.slug ||
      String(body.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = body.id || `prod_${slug}_${Date.now()}`;
    const category = body.category || 'Modern Frames';
    const categorySlug =
      body.categorySlug ||
      category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = body.image || '/logo.png';

    const row = productToDb({
      shortDescription: 'Handcrafted luxury wall frame with UV matte textured finish.',
      description: '<p>Transform any blank wall into a sophisticated statement with LUMIFLICK.</p>',
      regularPrice: body.price || 1250,
      galleryImages: [image],
      ...body,
      id,
      slug,
      category,
      categorySlug,
      image,
    });
    const { data, error } = await supabaseAdmin.from('products').upsert(row, { onConflict: 'id' }).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, product: productFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save product' }, { status: 500 });
  }
}
