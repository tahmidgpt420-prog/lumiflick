import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { error, count } = await supabaseAdmin.from('banners').delete({ count: 'exact' }).eq('id', params.id);
    if (error) throw error;
    if (!count) return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/banners/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 });
  }
}
