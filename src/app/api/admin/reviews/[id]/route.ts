import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { reviewFromDb, reviewToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const row = reviewToDb({ ...body, id: params.id });
    const { data, error } = await supabaseAdmin.from('reviews').update(row).eq('id', params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, review: reviewFromDb(data) });
  } catch (error) {
    console.error('PUT /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { error, count } = await supabaseAdmin.from('reviews').delete({ count: 'exact' }).eq('id', params.id);
    if (error) throw error;
    if (!count) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
