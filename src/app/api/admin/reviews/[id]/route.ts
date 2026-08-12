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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const success = deleteReview(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
