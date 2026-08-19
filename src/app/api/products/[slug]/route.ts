import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb } from '@/lib/supabaseMappers';

// Public, unauthenticated. Full row — description, specifications,
// variations, gallery_images and all — for exactly one product. This is
// the only place those heavy text columns get downloaded now; the list
// endpoint (/api/products) deliberately excludes them.
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const raw = decodeURIComponent(params.slug || '').trim();
  const norm = raw.toLowerCase();
  if (!norm) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  try {
    let { data, error } = await supabaseAdmin.from('products').select('*').eq('slug', norm).maybeSingle();
    if (error) throw error;

    // Old links / admin-pasted IDs sometimes use the row id instead of the
    // slug — fall back to that before giving up.
    if (!data) {
      const byId = await supabaseAdmin.from('products').select('*').eq('id', raw).maybeSingle();
      if (byId.error) throw byId.error;
      data = byId.data;
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, product: productFromDb(data) },
      { headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15' } }
    );
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product' }, { status: 500 });
  }
}
