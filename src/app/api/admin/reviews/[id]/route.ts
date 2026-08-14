import { NextResponse } from 'next/server';
import { saveReview, deleteReview } from '@/data/db';
import { saveReviewToFirestore, deleteReviewFromFirestore } from '@/lib/firestoreReviews';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';

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

    try {
      await ensureFirebaseAdminAuth();
      await saveReviewToFirestore(updated);
    } catch (firestoreErr) {
      console.warn('Firestore review sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('PUT /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    deleteReview(params.id);

    try {
      await ensureFirebaseAdminAuth();
      await deleteReviewFromFirestore(params.id);
    } catch (firestoreErr) {
      console.warn('Firestore review delete sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
