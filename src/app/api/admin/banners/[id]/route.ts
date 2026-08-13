import { NextResponse } from 'next/server';
import { deleteBanner } from '@/data/db';
import { removeBannerFromFirestore } from '@/lib/firestoreBanners';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deleted = deleteBanner(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    try {
      await ensureFirebaseAdminAuth();
      await removeBannerFromFirestore(id);
    } catch (firestoreErr) {
      console.warn('Firestore banner delete sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/banners/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 });
  }
}
