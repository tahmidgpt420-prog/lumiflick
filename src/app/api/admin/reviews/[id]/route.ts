import { NextResponse } from 'next/server';
import { execute, queryOne, toRow } from '@/lib/db';
import { reviewFromDb, reviewToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const row = reviewToDb({ ...body, id: params.id });
    const matched = await execute('UPDATE reviews SET ? WHERE id = ?', [toRow(row), params.id]);
    const data = matched ? await queryOne('SELECT * FROM reviews WHERE id = ?', [params.id]) : null;
    if (!data) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, review: reviewFromDb(data) });
  } catch (error) {
    console.error('PUT /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const count = await execute('DELETE FROM reviews WHERE id = ?', [params.id]);
    if (!count) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
