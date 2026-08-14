import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { reviewFromDb, reviewToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

// GET is public (see middleware.ts) — the storefront's /reviews page reads it.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('reviews').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, reviews: (data || []).map(reviewFromDb) });
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || `rev_${Date.now()}`;
    const row = reviewToDb({
      author: 'LUMIFLICK Customer',
      rating: 5,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verified: true,
      comment: 'Outstanding frame quality and vibrant printing!',
      productName: 'Handcrafted Luxury Wall Frame',
      location: 'Dhaka, Bangladesh',
      featured: true,
      ...body,
      id,
    });
    const { data, error } = await supabaseAdmin.from('reviews').upsert(row, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, review: reviewFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 });
  }
}
