import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { bannerFromDb, bannerToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('banners').select('*').order('display_order');
    if (error) throw error;
    return NextResponse.json({ success: true, banners: (data || []).map(bannerFromDb) });
  } catch (error) {
    console.error('GET /api/admin/banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || `banner-${Date.now()}`;
    const row = bannerToDb({ ...body, id });
    const { data, error } = await supabaseAdmin.from('banners').upsert(row, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, banner: bannerFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save banner' }, { status: 500 });
  }
}
