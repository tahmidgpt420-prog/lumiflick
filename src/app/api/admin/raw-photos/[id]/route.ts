import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rawPhotoFromDb, rawPhotoToDb } from '@/lib/supabaseMappers';
import { deleteRawPhoto, saveRawPhoto } from '@/data/db';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const row = rawPhotoToDb({ ...body, id: params.id });
    try {
      const { data, error } = await supabaseAdmin
        .from('raw_photos')
        .update(row)
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) return NextResponse.json({ success: true, photo: rawPhotoFromDb(data) });
    } catch (dbError) {
      console.error('Supabase raw photo PUT fallback:', dbError);
    }
    const local = saveRawPhoto({ ...body, id: params.id });
    return NextResponse.json({ success: true, photo: local });
  } catch (error) {
    console.error('PUT /api/admin/raw-photos/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update raw photo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    try {
      const { error } = await supabaseAdmin
        .from('raw_photos')
        .delete({ count: 'exact' })
        .eq('id', params.id);

      if (error) console.error('Supabase raw photo delete error:', error);
    } catch (dbError) {
      console.error('Supabase raw photo delete fallback:', dbError);
    }

    deleteRawPhoto(params.id);
    return NextResponse.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/raw-photos/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete raw photo' }, { status: 500 });
  }
}
