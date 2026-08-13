import { NextResponse } from 'next/server';
import { saveReview, deleteReview } from '@/data/db';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const updated = saveReview({ ...body, id: params.id });
    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('PUT /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const success = deleteReview(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
