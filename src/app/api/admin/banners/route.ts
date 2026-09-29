import { NextResponse } from 'next/server';
import { query, queryOne, upsert } from '@/lib/db';
import { bannerFromDb, bannerToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM banners ORDER BY display_order IS NULL, display_order');
    return NextResponse.json({ success: true, banners: rows.map(bannerFromDb) });
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
    await upsert('banners', 'id', row);
    const data = await queryOne('SELECT * FROM banners WHERE id = ?', [id]);
    return NextResponse.json({ success: true, banner: bannerFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save banner' }, { status: 500 });
  }
}
