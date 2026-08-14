import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rawPhotoFromDb, rawPhotoToDb } from '@/lib/supabaseMappers';
import { getRawPhotos, saveRawPhoto } from '@/data/db';

export const dynamic = 'force-dynamic';

// GET is public (see middleware.ts) — the storefront's /raw-photos page reads it.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('raw_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, photos: (data || []).map(rawPhotoFromDb) });
  } catch (error) {
    console.error('GET /api/admin/raw-photos error (using fallback):', error);
    try {
      const localPhotos = getRawPhotos();
      return NextResponse.json({ success: true, photos: localPhotos });
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to load raw photos' }, { status: 500 });
    }
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || `raw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const image = (body.image || '').trim();

    if (!image) {
      return NextResponse.json({ success: false, error: 'Photo URL is required' }, { status: 400 });
    }

    const row = rawPhotoToDb({
      id,
      image,
      displayOrder: body.displayOrder !== undefined ? body.displayOrder : 1,
      ...body,
    });

    try {
      const { data, error } = await supabaseAdmin
        .from('raw_photos')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, photo: rawPhotoFromDb(data) }, { status: 201 });
    } catch (dbError) {
      console.error('Supabase raw_photos save failed, falling back to local store:', dbError);
      const localSaved = saveRawPhoto({ id, image, displayOrder: body.displayOrder });
      return NextResponse.json({ success: true, photo: localSaved }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/admin/raw-photos error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save raw photo' }, { status: 500 });
  }
}
