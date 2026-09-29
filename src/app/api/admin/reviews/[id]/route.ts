import { NextResponse } from 'next/server';
import { execute, queryOne, toRow } from '@/lib/db';
import { reviewFromDb, reviewToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {
    const body = await request.json();
    const row = reviewToDb({ ...body, id });
    const matched = await execute('UPDATE reviews SET ? WHERE id = ?', [toRow(row), id]);
    const data = matched ? await queryOne('SELECT * FROM reviews WHERE id = ?', [id]) : null;
    if (!data) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, review: reviewFromDb(data) });
  } catch (error) {
    console.error('PUT /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const { id } = await params;
  try {
    const count = await execute('DELETE FROM reviews WHERE id = ?', [id]);
    if (!count) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
